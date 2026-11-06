// Météo : Open-Meteo (gratuit, sans clé). Prévisions à 16 jours + moyennes des 3 dernières années.
import { LL } from "./mapdata.js";
export const WMO = (c) => c == null ? ["", ""] : c === 0 ? ["☀️", "Grand soleil"] : c <= 2 ? ["🌤️", "Plutôt ensoleillé"] : c === 3 ? ["☁️", "Couvert"]
  : c <= 48 ? ["🌫️", "Brume"] : c <= 57 ? ["🌦️", "Bruine"] : c <= 67 ? ["🌧️", "Pluie"] : c <= 77 ? ["🌨️", "Neige"]
  : c <= 82 ? ["🌦️", "Averses"] : ["⛈️", "Orages"];

const KEY = "voyage-meteo";
export function cachedForecast() { try { return JSON.parse(localStorage.getItem(KEY)) || null; } catch { return null; } }

// Prévisions détaillées pour une liste d'étapes : 16 jours (jour par jour) + 7 jours heure par heure
export async function fetchForecast(ids, force) {
  const old = cachedForecast();
  if (!force && old && old.v === 2 && Date.now() - old.at < 3 * 3600e3 && ids.every((id) => old.data[id])) return old;
  if (!ids.length || !navigator.onLine) return old;
  const q = (i) => ids.map((id) => LL[id][i].toFixed(2)).join(",");
  const base = `https://api.open-meteo.com/v1/forecast?latitude=${q(0)}&longitude=${q(1)}&timezone=auto&wind_speed_unit=kmh`;
  const get = async (url) => { const r = await fetch(url); if (!r.ok) throw new Error("Open-Meteo " + r.status); const j = await r.json(); return Array.isArray(j) ? j : [j]; };
  const [dj, hj] = await Promise.all([
    get(base + "&forecast_days=16&daily=weather_code,temperature_2m_max,temperature_2m_min,apparent_temperature_max,precipitation_probability_max,precipitation_sum,wind_speed_10m_max,wind_gusts_10m_max,uv_index_max,sunrise,sunset"),
    get(base + "&forecast_days=7&hourly=weather_code,temperature_2m,apparent_temperature,precipitation_probability,precipitation,wind_speed_10m,wind_gusts_10m").catch(() => []),
  ]);
  const data = {};
  ids.forEach((id, k) => {
    const d = dj[k]?.daily; if (!d) return;
    const h = hj[k]?.hourly, byDay = {};
    if (h) h.time.forEach((t, i) => (byDay[t.slice(0, 10)] ||= []).push({ h: t.slice(11, 16), code: h.weather_code[i], temp: h.temperature_2m[i], feel: h.apparent_temperature[i], pp: h.precipitation_probability[i], mm: h.precipitation[i], wind: h.wind_speed_10m[i], gust: h.wind_gusts_10m[i] }));
    data[id] = d.time.map((t, i) => ({ date: t, code: d.weather_code[i], max: d.temperature_2m_max[i], min: d.temperature_2m_min[i], feel: d.apparent_temperature_max[i],
      rain: d.precipitation_probability_max[i], mm: d.precipitation_sum[i], wind: d.wind_speed_10m_max[i], gust: d.wind_gusts_10m_max[i], uv: d.uv_index_max[i],
      sunrise: (d.sunrise[i] || "").slice(11, 16), sunset: (d.sunset[i] || "").slice(11, 16), hours: byDay[t] || [] }));
  });
  const out = { v: 2, at: Date.now(), data };
  try { localStorage.setItem(KEY, JSON.stringify(out)); } catch { try { const lite = { ...out, data: Object.fromEntries(Object.entries(data).map(([k, v]) => [k, v.map((x) => ({ ...x, hours: [] }))])) }; localStorage.setItem(KEY, JSON.stringify(lite)); } catch {} }
  return out;
}

// Alertes : cyclones actifs (GDACS, ONU/Commission européenne) et avis de l'Observatoire de Hong Kong
const AKEY = "voyage-alertes";
export function cachedAlerts() { try { return JSON.parse(localStorage.getItem(AKEY)) || null; } catch { return null; } }
export async function fetchAlerts() {
  const old = cachedAlerts();
  if (old && Date.now() - old.at < 3600e3) return old;
  if (!navigator.onLine) return old;
  const out = { at: Date.now(), cyclones: [], hko: [] };
  try {
    const r = await fetch("https://www.gdacs.org/gdacsapi/api/events/geteventlist/SEARCH?eventlist=TC");
    const j = await r.json();
    out.cyclones = (j.features || []).filter((f) => String(f.properties.iscurrent) === "true").map((f) => {
      const p = f.properties, [lon, lat] = f.geometry.coordinates;
      return { name: p.eventname, level: p.alertlevel, lat, lon, wind: Math.round(p.severitydata?.severity || 0), kind: p.severitydata?.severitytext || "", until: p.todate, url: p.url?.report || "https://www.gdacs.org" };
    }).filter((c) => c.lon > 85 && c.lon < 140 && c.lat > -8 && c.lat < 38);
  } catch { out.cycErr = true; }
  try {
    const r = await fetch("https://data.weather.gov.hk/weatherAPI/opendata/weather.php?dataType=warnsum&lang=en");
    const j = await r.json();
    out.hko = Object.values(j || {}).filter((w) => w && w.code && w.actionCode !== "CANCEL").map((w) => ({ name: w.name, code: w.code, time: w.issueTime }));
  } catch { out.hkoErr = true; }
  try { localStorage.setItem(AKEY, JSON.stringify(out)); } catch {}
  return out;
}
export function kmBetween([a, b], [c, d]) {
  const r = Math.PI / 180, x = Math.sin(((c - a) * r) / 2) ** 2 + Math.cos(a * r) * Math.cos(c * r) * Math.sin(((d - b) * r) / 2) ** 2;
  return Math.round(2 * 6371 * Math.asin(Math.sqrt(x)));
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
