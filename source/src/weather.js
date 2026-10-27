// Météo : Open-Meteo (gratuit, sans clé). Prévisions à 16 jours + moyennes des 3 dernières années.
import { LL } from "./mapdata.js";
export const WMO = (c) => c == null ? ["", ""] : c === 0 ? ["☀️", "Grand soleil"] : c <= 2 ? ["🌤️", "Plutôt ensoleillé"] : c === 3 ? ["☁️", "Couvert"]
  : c <= 48 ? ["🌫️", "Brume"] : c <= 57 ? ["🌦️", "Bruine"] : c <= 67 ? ["🌧️", "Pluie"] : c <= 77 ? ["🌨️", "Neige"]
  : c <= 82 ? ["🌦️", "Averses"] : ["⛈️", "Orages"];

const KEY = "voyage-meteo";
export function cachedForecast() { try { return JSON.parse(localStorage.getItem(KEY)) || null; } catch { return null; } }

// Prévisions pour une liste d'étapes (une seule requête)
export async function fetchForecast(ids) {
  const old = cachedForecast();
  if (old && Date.now() - old.at < 3 * 3600e3 && ids.every((id) => old.data[id])) return old;
  if (!ids.length || !navigator.onLine) return old;
  const q = (i) => ids.map((id) => LL[id][i].toFixed(2)).join(",");
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${q(0)}&longitude=${q(1)}&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=auto&forecast_days=16`;
  const r = await fetch(url); if (!r.ok) throw new Error("Open-Meteo " + r.status);
  let j = await r.json(); if (!Array.isArray(j)) j = [j];
  const data = {};
  ids.forEach((id, k) => { const d = j[k]?.daily; if (d) data[id] = d.time.map((t, i) => ({ date: t, code: d.weather_code[i], max: d.temperature_2m_max[i], min: d.temperature_2m_min[i], rain: d.precipitation_probability_max[i] })); });
  const out = { at: Date.now(), data };
  try { localStorage.setItem(KEY, JSON.stringify(out)); } catch {}
  return out;
}

// Temps habituel sur les dates de chaque étape, d'après les étés 2023 à 2025 (3 requêtes groupées)
const CKEY = "voyage-climat";
export function cachedClimate() { try { return JSON.parse(localStorage.getItem(CKEY)) || null; } catch { return null; } }
export async function fetchClimateAll(stages) {
  const md = (iso, d) => { const x = new Date(iso + "T12:00:00Z"); x.setUTCDate(x.getUTCDate() + d); return x.toISOString().slice(5, 10); };
  const win = stages.map((st) => [md(st.from, -2), md(st.to, 1)]);
  const a = win.map((w) => w[0]).sort()[0], b = win.map((w) => w[1]).sort().pop();
  const lat = stages.map((st) => LL[st.id][0].toFixed(2)).join(","), lon = stages.map((st) => LL[st.id][1].toFixed(2)).join(",");
  const acc = stages.map(() => ({ n: 0, mx: 0, mn: 0, wet: 0 }));
  for (const y of [2023, 2024, 2025]) {
    const r = await fetch(`https://archive-api.open-meteo.com/v1/archive?latitude=${lat}&longitude=${lon}&start_date=${y}-${a}&end_date=${y}-${b}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=auto`);
    if (!r.ok) { if (y === 2023) throw new Error("Open-Meteo " + r.status); continue; }
    let j = await r.json(); if (!Array.isArray(j)) j = [j];
    j.forEach((loc, k) => { const d = loc.daily; if (!d) return; const [wa, wb] = win[k];
      d.time.forEach((t, i) => { const m = t.slice(5); if (m < wa || m > wb || d.temperature_2m_max[i] == null) return;
        const o = acc[k]; o.n++; o.mx += d.temperature_2m_max[i]; o.mn += d.temperature_2m_min[i]; if ((d.precipitation_sum[i] || 0) >= 1) o.wet++; }); });
  }
  const out = {};
  stages.forEach((st, k) => { const o = acc[k]; if (o.n) out[st.id] = { max: Math.round(o.mx / o.n), min: Math.round(o.mn / o.n), wet: Math.round((o.wet / o.n) * 100) }; });
  if (Object.keys(out).length) try { localStorage.setItem(CKEY, JSON.stringify(out)); } catch {}
  return out;
}
