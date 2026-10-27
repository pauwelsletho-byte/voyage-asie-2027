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
  const r = await fetch(url); if (!r.ok) return old;
  let j = await r.json(); if (!Array.isArray(j)) j = [j];
  const data = {};
  ids.forEach((id, k) => { const d = j[k]?.daily; if (d) data[id] = d.time.map((t, i) => ({ date: t, code: d.weather_code[i], max: d.temperature_2m_max[i], min: d.temperature_2m_min[i], rain: d.precipitation_probability_max[i] })); });
  const out = { at: Date.now(), data };
  try { localStorage.setItem(KEY, JSON.stringify(out)); } catch {}
  return out;
}

// Temps habituel sur les dates de l'étape, d'après 2023-2025
export async function fetchClimate(st) {
  const [lat, lon] = LL[st.id];
  const pad = (iso, d) => { const x = new Date(iso + "T12:00:00Z"); x.setUTCDate(x.getUTCDate() + d); return x.toISOString().slice(5, 10); };
  const a = pad(st.from, -2), b = pad(st.to, 1);
  const url = `https://archive-api.open-meteo.com/v1/archive?latitude=${lat}&longitude=${lon}&start_date=2023-${a}&end_date=2025-${b}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=auto`;
  const r = await fetch(url); if (!r.ok) throw new Error("climat");
  const d = (await r.json()).daily;
  let n = 0, mx = 0, mn = 0, wet = 0;
  d.time.forEach((t, i) => { const md = t.slice(5); if (md < a || md > b || d.temperature_2m_max[i] == null) return;
    n++; mx += d.temperature_2m_max[i]; mn += d.temperature_2m_min[i]; if ((d.precipitation_sum[i] || 0) >= 1) wet++; });
  return n ? { max: Math.round(mx / n), min: Math.round(mn / n), wet: Math.round((wet / n) * 100) } : null;
}
