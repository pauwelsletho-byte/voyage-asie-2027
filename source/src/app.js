import { TRIP, COUNTRIES, STAGES, DAYS, SEED_RESAS, CHECKLIST } from "./data.js";
import { initStore, store, isDemo } from "./store.js";
import { landscape, MOTIFS, TOOL_ICONS } from "./decor.js";
import { FOODS, foodId, foodsForStage } from "./food.js";
import { MAP_W, MAP_H, LAND, VISITED, PTS, LL } from "./mapdata.js";
import { TIPS, APPS } from "./tips.js";
import { LEGS, legKm } from "./stats.js";
import { WMO, cachedForecast, fetchForecast, fetchClimateAll, cachedClimate } from "./weather.js";
import { bookingFor as bkByTitle, bookingPeriod } from "./booking.js";
// retrouve les infos même si le titre a été modifié (fiches créées au départ)
const bookingFor = (r) => bkByTitle(r) || (r && String(r.id).startsWith("seed-") ? bkByTitle({ title: SEED_RESAS[+String(r.id).slice(5, 7)]?.[1] }) : null);
import { CURRENCIES, CURRENCY_OF, CATEGORIES, PHRASES, LOCAL_PLACES, EMERGENCY, VAULT_SEED } from "./extras.js";

/* ---------- utilitaires ---------- */
const $ = (s, el = document) => el.querySelector(s);
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const D = (iso) => { const [y, m, d] = iso.split("-").map(Number); return new Date(y, m - 1, d); };
const isoOf = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const fmt = (iso, opt = { weekday: "short", day: "numeric", month: "short" }) => iso ? D(iso).toLocaleDateString("fr-FR", opt).replace(".", "") : "";
const fmtLong = (iso) => fmt(iso, { weekday: "long", day: "numeric", month: "long" });
const daysBetween = (a, b) => Math.round((D(b) - D(a)) / 86400000);
const todayIso = () => new URLSearchParams(location.search).get("date") || isoOf(new Date());
const slug = (s) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").slice(0, 40);

const stageOn = (iso) => STAGES.find((s) => (iso >= s.from && iso < s.to) || (s.extra || []).some(([a, b]) => iso >= a && iso < b));
const stageById = Object.fromEntries(STAGES.map((s) => [s.id, s]));
const dayRow = (iso) => DAYS.find((d) => d[0] === iso);

const ICONS = {
  vol: '<path d="M21 15.5v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V8.5l-8 5v2l8-2.5V18l-2 1.5V21l3.5-1 3.5 1v-1.5L13 18v-5z"/>',
  train: '<path d="M12 2c-4 0-8 .5-8 4v9.5A3.5 3.5 0 0 0 7.5 19L6 20.5v.5h2.2l2-2h3.6l2 2H18v-.5L16.5 19a3.5 3.5 0 0 0 3.5-3.5V6c0-3.5-4-4-8-4zM7.5 17a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm3.5-7H6V6h5v4zm2 0V6h5v4h-5zm3.5 7a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z"/>',
  bus: '<path d="M4 16c0 .9.4 1.7 1 2.2V20a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1v-1h8v1a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1v-1.8c.6-.5 1-1.3 1-2.2V6c0-3.5-3.6-4-8-4S4 2.5 4 6v10zm3.5 1a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm9 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zM18 11H6V6h12v5z"/>',
  hotel: '<path d="M7 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm12-6h-8v7H3V5H1v15h2v-3h18v3h2v-9a4 4 0 0 0-4-4z"/>',
  activite: '<path d="M22 10V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v4a2 2 0 1 1 0 4v4a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-4a2 2 0 1 1 0-4zm-9 7.5h-2v-2h2v2zm0-4.5h-2v-2h2v2zm0-4.5h-2v-2h2v2z"/>',
  moto: '<path d="M19.4 10.2 17 5h-4v2h2.7l1.1 2.4L13 13h-2.5L9 11h2V9H5v2h2l2 3.2A4 4 0 1 0 9.9 17H13l4.1-5.3.5 1A4 4 0 1 0 19.4 10.2zM6 19a2 2 0 1 1 0-4 2 2 0 0 1 0 4zm12 0a2 2 0 1 1 0-4 2 2 0 0 1 0 4z"/>',
  admin: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/>',
};
const TYPES = { vol: "Vol", train: "Train", bus: "Bus / ferry", hotel: "Hébergement", activite: "Activité", moto: "Moto", admin: "Formalité" };
const STATUS = { a_reserver: "À réserver", repere: "Repéré", reserve: "Réservé" };
const icon = (t, cls = "") => `<svg class="ico ${cls}" viewBox="0 0 24 24" aria-hidden="true">${ICONS[t] || ICONS.activite}</svg>`;

/* ---------- état ---------- */
const S = { user: null, resas: [], checks: [], files: [], expenses: [], vault: [], food: [], journal: [], wx: null, settings: {}, tab: "today", sub: null, filter: "todo", sync: { fromCache: true, pending: false }, unsubs: [] };

function setSync(meta) {
  if (meta) S.sync = { ...S.sync, ...meta };
  const el = $("#sync"); if (!el) return;
  const online = navigator.onLine;
  let txt, cls;
  if (isDemo()) { txt = "Démo"; cls = "demo"; }
  else if (!online) { txt = S.sync.pending ? "Hors ligne · à envoyer" : "Hors ligne"; cls = "off"; }
  else if (S.sync.pending) { txt = "Envoi…"; cls = "wait"; }
  else { txt = "Synchronisé"; cls = "ok"; }
  el.className = "sync " + cls; el.textContent = txt;
}

/* ---------- démarrage ---------- */
const getTheme = () => { try { return localStorage.getItem("voyage-theme") || "light"; } catch { return "light"; } };
function applyTheme(t) {
  document.documentElement.dataset.theme = t;
  const dark = t === "dark" || (t === "auto" && matchMedia("(prefers-color-scheme: dark)").matches);
  document.querySelectorAll('meta[name="theme-color"]').forEach((m) => m.setAttribute("content", dark ? "#0F1A17" : "#EAF4EF"));
}
applyTheme(getTheme());

/* ---------- prononciation (voix de l'iPhone, marche hors ligne) ---------- */
const LANG_OF_GROUP = { Mandarin: "zh-CN", Cantonais: "zh-HK", Vietnamien: "vi-VN", Khmer: "km-KH", Malais: "ms-MY" };
const LANG_OF_COUNTRY = { hk: "zh-HK", cn: "zh-CN", vn: "vi-VN", kh: "km-KH", my: "ms-MY" };
const voiceFor = (lang) => {
  const vs = (window.speechSynthesis?.getVoices() || []).map((v) => ({ v, l: v.lang.replace("_", "-").toLowerCase() }));
  const L = lang.toLowerCase();
  return (vs.find((x) => x.l === L) || vs.find((x) => x.l.startsWith(L.slice(0, 2))))?.v || null;
};
if (window.speechSynthesis) { speechSynthesis.getVoices(); speechSynthesis.onvoiceschanged = () => {}; }
function speak(text, lang, btn) {
  if (!window.speechSynthesis) return noVoice(btn, lang);
  const v = voiceFor(lang);
  if (!v && lang !== "zh-CN" && lang !== "vi-VN") return noVoice(btn, lang);
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text.replace(/\s*\/\s*/g, ", "));
  u.lang = lang; if (v) u.voice = v; u.rate = 0.8;
  btn?.classList.add("playing"); u.onend = u.onerror = () => btn?.classList.remove("playing");
  speechSynthesis.speak(u);
}
function noVoice(btn, lang) {
  const msg = `Pas de voix ${({ "zh-CN": "chinoise", "zh-HK": "cantonaise", "vi-VN": "vietnamienne", "km-KH": "khmère", "ms-MY": "malaise" })[lang] || ""} sur cet appareil. Sur iPhone : Réglages › Accessibilité › Contenu énoncé › Voix, pour en télécharger une.`;
  if (btn) { btn.title = msg; } const t = document.createElement("div"); t.className = "toast"; t.textContent = msg; document.body.appendChild(t); setTimeout(() => t.remove(), 5000);
}
const playBtn = (text, lang) => `<button type="button" class="play" data-say="${esc(text)}" data-lang="${esc(lang)}" aria-label="Écouter"><svg viewBox="0 0 24 24">${TOOL_ICONS.play}</svg></button>`;

async function boot() {
  await initStore();
  window.addEventListener("online", () => setSync()); window.addEventListener("offline", () => setSync());
  store().onAuth((u) => { S.user = u; u ? startData() : renderLogin(); });
}

function startData() {
  S.unsubs.forEach((f) => f && f()); S.unsubs = [];
  renderShell();
  const seed = { resas: SEED_RESAS.map((r, i) => ({ id: "seed-" + String(i).padStart(2, "0") + "-" + slug(r[1]), type: r[0], title: r[1], date: r[2], notes: r[3], status: r[4], price: r[5], files: [] })), vault: VAULT_SEED.map((v) => ({ ...v, files: [] })) };
  store().seedIfNeeded(seed).catch(() => {});
  S.unsubs.push(store().subscribe("resas", (items, m) => { if (items) S.resas = items; setSync(m); render(); }));
  S.unsubs.push(store().subscribe("checks", (items) => { if (items) S.checks = items; render(); }));
  S.unsubs.push(store().subscribe("expenses", (items) => { if (items) S.expenses = items; render(); }));
  S.unsubs.push(store().subscribe("journal", (items) => { if (items) S.journal = items; render(); }));
  S.unsubs.push(store().subscribe("food", (items) => { if (items) S.food = items; render(); }));
  S.unsubs.push(store().subscribe("vault", (items) => { if (items) S.vault = items; render(); }));
  S.unsubs.push(store().subscribe("settings", (items) => { if (items) S.settings = Object.fromEntries(items.map((i) => [i.id, i])); render(); refreshRates(); ensureWeather(); }));
  S.unsubs.push(store().subscribe("files", (items) => {
    if (!items) return;
    const fresh = items.filter((f) => !S.files.some((g) => g.id === f.id));
    S.files = items; if (fresh.length && navigator.onLine) store().prefetchFiles(fresh);
    render();
  }));
}

/* ---------- connexion ---------- */
function renderLogin(msg = "") {
  document.body.innerHTML = `
  <main class="login">
    <div class="login-card">
      <h1>Asie, été 2027</h1>
      <p class="muted">Connectez-vous pour retrouver le voyage, synchronisé entre vos deux téléphones.</p>
      <form id="lf">
        <label>Email<input name="e" type="email" autocomplete="username" required></label>
        <label>Mot de passe<input name="p" type="password" autocomplete="current-password" minlength="6" required></label>
        ${msg ? `<p class="err">${esc(msg)}</p>` : ""}
        <button class="btn primary" type="submit">Se connecter</button>
        <button class="btn" type="button" id="su">Créer mon compte</button>
        <button class="link" type="button" id="fp">Mot de passe oublié</button>
      </form>
    </div>
  </main>`;
  const f = $("#lf"); const val = () => [f.e.value.trim(), f.p.value];
  const errMsg = (e) => ({ "auth/invalid-credential": "Email ou mot de passe incorrect.", "auth/email-already-in-use": "Ce compte existe déjà : connectez-vous.", "auth/weak-password": "Mot de passe trop court (6 caractères minimum).", "auth/network-request-failed": "Pas de réseau : la première connexion demande internet." }[e.code] || "Erreur : " + (e.code || e.message));
  f.onsubmit = async (ev) => { ev.preventDefault(); try { await store().signIn(...val()); } catch (e) { renderLogin(errMsg(e)); } };
  $("#su").onclick = async () => { if (!f.reportValidity()) return; try { await store().signUp(...val()); } catch (e) { renderLogin(errMsg(e)); } };
  $("#fp").onclick = async () => { const e = f.e.value.trim(); if (!e) return renderLogin("Indiquez votre email d'abord."); try { await store().resetPassword(e); renderLogin("Email de réinitialisation envoyé."); } catch (er) { renderLogin(errMsg(er)); } };
}

/* ---------- squelette ---------- */
function renderShell() {
  document.body.innerHTML = `
  <header class="top"><div class="ttlw"><h1 id="ttl">Asie, été 2027</h1><small id="clock" class="clock" hidden></small></div><span id="sync" class="sync"></span></header>
  <main id="view"></main>
  <button class="fab" id="fab" aria-label="Ajouter une réservation">+</button>
  <nav class="tabs">
    ${[["today", "Aujourd'hui", '<path d="M19 4h-1V2h-2v2H8V2H6v2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zm0 16H5V9h14v11zM7 11h5v5H7z"/>'],
       ["days", "Jours", '<path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z"/>'],
       ["resas", "Billets", ICONS.activite],
       ["money", "Dépenses", '<path d="M21 7H5a1 1 0 0 1 0-2h14V3H5a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3h16a1 1 0 0 0 1-1V8a1 1 0 0 0-1-1zm-3 8a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z"/>'],
       ["more", "Outils", '<path d="M4 4h7v7H4zm9 0h7v7h-7zM4 13h7v7H4zm9 0h7v7h-7z"/>']]
      .map(([k, l, p]) => `<button data-tab="${k}"><svg viewBox="0 0 24 24">${p}</svg><span>${l}</span></button>`).join("")}
  </nav>
  <div id="sheet" class="sheet" hidden></div>`;
  document.querySelectorAll(".tabs button").forEach((b) => (b.onclick = () => { S.tab = b.dataset.tab; S.sub = null; window.scrollTo(0, 0); render(); }));
  $("#fab").onclick = () => (S.tab === "money" ? openExpense(null) : openResa(null));
  setSync(); render();
}

function render() {
  const v = $("#view"); if (!v) return;
  document.querySelectorAll(".tabs button").forEach((b) => b.classList.toggle("on", b.dataset.tab === S.tab));
  $("#fab").hidden = !["resas", "today", "money"].includes(S.tab);
  $("#fab").setAttribute("aria-label", S.tab === "money" ? "Ajouter une dépense" : "Ajouter une réservation");
  setTint(); tickClock();
  v.innerHTML = ({ today: viewToday, days: viewDays, resas: viewResas, money: viewMoney, more: viewMore })[S.tab]();
  bindView(v);
  setSync();
}

// Couleur du fond : celle du pays où on est (avant le départ : vert jade)
function setTint() {
  const row = dayRow(todayIso());
  const st = row && STAGES.find((x) => x.id === row[1]);
  const col = st && COUNTRIES[st.c] && COUNTRIES[st.c].color;
  if (col) document.documentElement.style.setProperty("--tint", col);
  else document.documentElement.style.removeProperty("--tint");
}

/* ---------- vues ---------- */
const resasOn = (iso) => S.resas.filter((r) => r.date === iso).sort(byDate);
const bkFrom = (r) => bookingFor(r)?.from || r.date || "9";
const byBooking = (a, b) => bkFrom(a).localeCompare(bkFrom(b)) || byDate(a, b);
const byDate = (a, b) => (a.date || "9").localeCompare(b.date || "9") || (a.time || "").localeCompare(b.time || "");
const hotelsFor = (stage) => stage ? S.resas.filter((r) => r.type === "hotel" && r.date >= stage.from && r.date < stage.to) : [];

function resaCard(r) {
  const nf = (r.files || []).length;
  const bk = bookingFor(r);
  return `<button class="card resa ${r.status}" data-resa="${esc(r.id)}">
    <span class="rico t-${r.type}">${icon(r.type)}</span>
    <span class="rmain"><strong>${esc(r.title)}</strong>
      <small>${esc(fmt(r.date))}${r.time ? " · " + esc(r.time) : ""}${r.ref ? " · n° " + esc(r.ref) : ""}${r.paid ? " · payé " + esc(money(r.paid)) : r.price ? " · " + esc(r.price) : ""}</small>${bk && r.status !== "reserve" ? `<small class="bk ${bk.from <= todayIso() ? "now" : ""}">${bk.from <= todayIso() ? "À faire maintenant" : "À réserver : " + esc(bk.when)}${bk.sites.length ? " · " + esc(bk.sites.slice(0, 3).map((x) => x[0]).join(", ")) : ""}</small>` : ""}</span>
    <span class="rside"><span class="badge ${r.status}">${STATUS[r.status] || "—"}</span>${nf ? `<span class="clip">${nf} ${nf > 1 ? "fichiers" : "fichier"}</span>` : ""}</span>
  </button>`;
}

function stageBlock(st, iso) {
  if (!st) return "";
  const c = COUNTRIES[st.c];
  const hotels = hotelsFor(st);
  return `<section class="card stage" style="--c:${c.color}">
    <span class="motif">${MOTIFS[st.c] || ""}</span>
    <p class="kicker">${esc(c.name)}</p>
    <h2>${esc(st.name)}</h2>
    <p class="muted">${esc(fmt(st.from))} → ${esc(fmt(st.to))} · ${daysBetween(st.from, st.to)} ${daysBetween(st.from, st.to) > 1 ? "nuits" : "nuit"}</p>
    ${wxLine(st)}
    <h3>À faire</h3><ul>${st.todo.map((t) => `<li>${esc(t)}</li>`).join("")}</ul>
    <h3>Où dormir</h3><p>${esc(st.sleep)}</p>
    ${hotels.length ? hotels.map(resaCard).join("") : ""}
    ${(() => { const g = foodsForStage(st.id); return g ? `<h3>À goûter</h3><p class="foodline">${g.items.map(([fr]) => esc(fr)).join(" · ")}</p>` : ""; })()}
    ${showList(st)}
    ${st.tip ? `<p class="tip">${esc(st.tip)}</p>` : ""}
  </section>`;
}

function dayBlock(iso) {
  const d = dayRow(iso); if (!d) return "";
  const st0 = stageById[d[1]] || stageOn(iso); const c0 = COUNTRIES[st0?.c || "fr"];
  const n = DAYS.findIndex((x) => x[0] === iso) + 1;
  return `<section class="card day" style="--c:${c0.color}">
    <p class="kicker">${esc(fmtLong(iso))} · jour ${n} sur ${DAYS.length}</p>
    ${d[2] ? `<p class="trajet">${icon("train", "sm")} ${esc(d[2])}</p>` : ""}
    ${d[3] ? `<p>${esc(d[3])}</p>` : ""}
    <p class="muted">Nuit : ${esc(d[4])}</p>
  </section>`;
}

/* ---------- heure locale ---------- */
const TZ = { hk: "Asia/Hong_Kong", cn: "Asia/Shanghai", vn: "Asia/Ho_Chi_Minh", kh: "Asia/Phnom_Penh", my: "Asia/Kuala_Lumpur" };
function tickClock() {
  const el = $("#clock"); if (!el) return;
  const t = todayIso(), c = countryOn(t), tz = TZ[c];
  if (t < TRIP.start || t > TRIP.end || !tz) { el.hidden = true; return; }
  const h = (z) => new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", timeZone: z });
  el.hidden = false; el.textContent = `Ici ${h(tz)} · France ${h("Europe/Paris")}`;
}
setInterval(tickClock, 30000);

/* ---------- météo ---------- */
S.wx = cachedForecast();
let climateBusy = false, wxBusy = false;
const WX_STAGES = STAGES.filter((s) => s.id !== "kl1");
let wxErr = "";
const climate = () => ({ ...(cachedClimate() || {}), ...(S.settings.climate || {}) });
async function ensureWeather(force) {
  if (!navigator.onLine) { wxErr = "Pas de réseau : la météo se chargera dès que possible."; return; }
  const t = todayIso();
  if ((!climateBusy || force) && t <= TRIP.end) {
    const have = climate();
    if (WX_STAGES.some((st) => !have[st.id])) {
      climateBusy = true;
      try { const got = await fetchClimateAll(WX_STAGES); wxErr = ""; if (Object.keys(got).length) { store().put("settings", "climate", got).catch(() => {}); render(); } }
      catch (e) { wxErr = "Météo indisponible pour l'instant (" + e.message + ")."; climateBusy = false; render(); }
    }
  }
  if ((!wxBusy || force) && t <= TRIP.end) {
    const end = isoOf(new Date(D(t).getTime() + 15 * 86400000));
    const ids = STAGES.filter((st) => st.to > t && st.from <= end).map((st) => st.id);
    if (ids.length) { wxBusy = true; try { const r = await fetchForecast(ids); if (r) { S.wx = r; render(); } } catch (e) { wxErr = "Prévisions indisponibles (" + e.message + ")."; } wxBusy = false; }
  }
}
setInterval(ensureWeather, 3600e3);
// services météo officiels du pays (pour les alertes et le détail)
const WX_LOCAL = {
  hk: [["Observatoire de Hong Kong", "https://www.hko.gov.hk/fr/myobservatory.htm"]],
  cn: [["Météo chinoise officielle", "https://www.weather.com.cn"]],
  vn: [["Météo vietnamienne officielle", "https://nchmf.gov.vn"]],
  my: [["Météo malaisienne officielle", "https://www.met.gov.my"]],
};
const wxDay = (sid, iso) => S.wx?.data?.[sid]?.find((d) => d.date === iso);
const deg = (v) => Math.round(v) + "°";
function wxLine(st) {
  const days = [];
  for (let iso = st.from; iso <= st.to; iso = isoOf(new Date(D(iso).getTime() + 86400000))) { const d = wxDay(st.id, iso); if (d) days.push(d); }
  if (days.length) return `<div class="wxchips">${days.map((d) => `<span class="wxchip"><small>${esc(fmt(d.date, { weekday: "short" }))}</small>${WMO(d.code)[0]} <b>${deg(d.max)}</b>/${deg(d.min)}${d.rain ? `<small>${d.rain} %</small>` : ""}</span>`).join("")}</div>`;
  const c = climate()[st.id === "kl1" ? "kl2" : st.id];
  if (c) return `<p class="wxnorm">🌡️ D'habitude à ces dates : <b>${c.max}°</b> / ${c.min}° · pluie ${c.wet < 20 ? "rare" : c.wet < 45 ? "1 jour sur 3" : c.wet < 65 ? "1 jour sur 2" : "presque tous les jours"}</p>`;
  return "";
}
const wxIcon = (c) => (c.wet < 20 ? "☀️" : c.wet < 45 ? "🌤️" : c.wet < 65 ? "🌦️" : "🌧️");
function climateCard() {
  const c = climate();
  const rows = MAP_STAGES.filter((st) => c[st.id === "kl1" ? "kl2" : st.id]);
  return `<h2 class="sect">Le temps qui vous attend</h2><section class="card climcard">
    ${rows.length ? `<div class="climgrid">${rows.map((st) => { const x = c[st.id]; return `<button class="clim" data-stage="${st.id}" style="--c:${COUNTRIES[st.c].color}"><span class="wxe">${wxIcon(x)}</span><span><b>${esc(st.name.replace(/ \(.*\)/, "").replace("Cascade de ", "").replace("Gorges du ", "").replace(" et Angkor", ""))}</b><small>${x.max}°/${x.min}° · ☔ ${x.wet} %</small></span></button>`; }).join("")}</div>
      <p class="muted small">Moyennes des étés 2023 à 2025 aux dates de chaque étape (Open-Meteo) ; ☔ = part des jours de pluie. Les vraies prévisions arrivent 16 jours avant.</p>`
    : `<p class="muted">${esc(wxErr || "Chargement de la météo…")}</p><button class="btn sm" data-wxretry>Réessayer</button>`}
  </section>`;
}
function wxCard(t) {
  const days = [0, 1, 2, 3].map((k) => isoOf(new Date(D(t).getTime() + k * 86400000))).filter((iso) => iso <= TRIP.end);
  const rows = days.map((iso) => { const st = stageOn(iso) || stageById[dayRow(iso)?.[1]]; const d = st && wxDay(st.id, iso); return d ? { iso, st, d } : null; }).filter(Boolean);
  if (!rows.length) return "";
  return `<section class="card wxcard"><div class="wxrow">${rows.map(({ iso, st, d }, i) => `<div class="wxd ${i ? "" : "today"}"><small>${i ? esc(fmt(iso, { weekday: "short" })) : "Auj."}</small><span class="wxe">${WMO(d.code)[0]}</span><b>${deg(d.max)}</b><small>${deg(d.min)}${d.rain ? ` · ${d.rain} %` : ""}</small>${i && st.id !== rows[i - 1].st.id ? `<small class="wxst">${esc(st.name.split(" (")[0])}</small>` : ""}</div>`).join("")}</div>
    <p class="muted small">${esc(WMO(rows[0].d.code)[1])} · Open-Meteo, mis à jour à ${new Date(S.wx.at).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })} </p>
    <div class="wxlinks">${(WX_LOCAL[countryOn(t)] || []).concat([["Alertes typhon (Observatoire de Hong Kong)", "https://www.hko.gov.hk/fr/myobservatory.htm"]]).filter((x, i, a) => a.findIndex((y) => y[1] === x[1]) === i).map(([n, u]) => `<a class="chip" href="${u}" target="_blank" rel="noopener">${esc(n)} ↗</a>`).join("")}</div></section>`;
}

/* ---------- y aller (Organic Maps / Plans) ---------- */
function goBtn(q, label, sid) { return `<button class="play go" data-go-q="${esc(q)}" data-go-l="${esc(label || "")}" data-go-s="${esc(sid || "")}" aria-label="Y aller"><svg viewBox="0 0 24 24">${TOOL_ICONS.pin}</svg></button>`; }
function openGo(q, label, sid) {
  const c = LL[sid] || LL.hongkong, e = encodeURIComponent(q);
  const ov = document.createElement("div"); ov.className = "goshow";
  ov.innerHTML = `<div class="gobox"><p class="kicker">Y aller</p><p class="golbl">${esc(label || q)}</p>
    <a class="btn primary wide" href="om://search?cll=${c[0]},${c[1]}&query=${e}">Ouvrir dans Organic Maps</a>
    <a class="btn wide" href="https://www.google.com/maps/search/?api=1&query=${e}" target="_blank" rel="noopener">Ouvrir dans Google Maps</a>
    <button class="btn wide" data-gx>Fermer</button>
    <p class="muted small">Organic Maps marche sans réseau si vous avez téléchargé la carte du pays. Google Maps est bloqué en Chine sans VPN. Pas encore installée ? <a href="https://organicmaps.app/fr/" target="_blank" rel="noopener">organicmaps.app</a></p></div>`;
  ov.onclick = (ev) => { if (ev.target === ov || ev.target.closest("[data-gx]")) ov.remove(); };
  document.body.appendChild(ov);
}

/* ---------- carte du parcours ---------- */
const ROUTE = ["hongkong", "zhangjiajie", "fenghuang", "huangguoshu", "kunming", "gorges", "shangrila", "dali", "kunming",
  "✈hanoi", "croisiere", "ninhbinh", "puluong", "ninhbinh", "phongnha", "hoian", "quynhon", "hcmc", "✈siemreap", "✈kl1", "tioman", "kl2"];
const MAP_STAGES = STAGES.filter((s) => s.id !== "kl1");
const LABELS = { hongkong: ["Hong Kong", -6, 18, "end"], zhangjiajie: ["Zhangjiajie", 12, 4], kunming: ["Kunming", 12, 14], hanoi: ["Hanoi", -12, -8, "end"],
  hoian: ["Hội An", 12, 4], hcmc: ["Saigon", 12, 6], siemreap: ["Siem Reap", -12, 4, "end"], kl2: ["Kuala Lumpur", -12, 4, "end"], tioman: ["Tioman", 12, 4],
  shangrila: ["Yunnan", -12, -6, "end"] };
function wherePos(t) {
  if (t < TRIP.start || t > TRIP.end) return null;
  const st = stageOn(t) || stageById[dayRow(t)?.[1]];
  if (st) return { p: PTS[st.id], st };
  const prev = [...STAGES].reverse().find((s) => s.to <= t) || STAGES[0], next = STAGES.find((s) => s.from > t) || prev;
  const a = PTS[prev.id], b = PTS[next.id];
  return { p: [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2], st: null };
}
function tripMap(t) {
  const pos = wherePos(t);
  const segs = [];
  for (let i = 1; i < ROUTE.length; i++) {
    const fly = ROUTE[i].startsWith("✈"), id = ROUTE[i].replace("✈", ""), from = ROUTE[i - 1].replace("✈", "");
    const a = PTS[from], b = PTS[id], st = stageById[id];
    const done = st && st.from <= t;
    const mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2, dx = b[0] - a[0], dy = b[1] - a[1];
    const bend = fly ? 0.18 : 0.08;
    segs.push(`<path d="M${a} Q${mx - dy * bend},${my + dx * bend} ${b}" class="seg ${fly ? "fly" : ""} ${done ? "done" : ""}" style="--c:${COUNTRIES[st?.c || "fr"].color}"/>`);
  }
  const dots = MAP_STAGES.map((st, i) => {
    const [x, y] = PTS[st.id], c = COUNTRIES[st.c].color, past = st.to <= t, cur = pos?.st && (pos.st.id === st.id || (pos.st.id === "kl1" && st.id === "kl2"));
    const L = LABELS[st.id];
    return `<g class="mdot ${past ? "past" : ""} ${cur ? "cur" : ""}" data-stage="${st.id}" style="--c:${c}" role="button" aria-label="${esc(st.name)}">
      <circle cx="${x}" cy="${y}" r="16" class="hit"/><circle cx="${x}" cy="${y}" r="8.5" class="pin"/>
      <text x="${x}" y="${y + 3.2}" class="num">${i + 1}</text>
      ${L ? `<text x="${x + L[1]}" y="${y + L[2]}" class="lbl" text-anchor="${L[3] || "start"}">${esc(L[0])}</text>` : ""}</g>`;
  }).join("");
  const me = pos ? `<g class="me"><circle cx="${pos.p[0]}" cy="${pos.p[1]}" r="14" class="halo"/><circle cx="${pos.p[0]}" cy="${pos.p[1]}" r="5"/></g>` : "";
  const caption = pos ? (pos.st ? `Vous êtes à <b>${esc(pos.st.name)}</b>` : "En route vers la prochaine étape")
    : t < TRIP.start ? `${MAP_STAGES.length} étapes, ${daysBetween(TRIP.start, TRIP.end)} jours` : "Le voyage est terminé";
  return `<section class="card mapcard">
    <svg viewBox="0 0 ${MAP_W} ${MAP_H}" class="tripmap" aria-label="Carte du parcours">
      <rect width="${MAP_W}" height="${MAP_H}" class="sea"/>
      <path d="${LAND}" class="land"/>
      ${Object.entries(VISITED).map(([k, d]) => `<path d="${d}" class="land v" style="--c:${COUNTRIES[k].color}"/>`).join("")}
      ${segs.join("")}${dots}${me}
    </svg>
    <p class="mapcap">${caption}<span class="muted"> · touchez une étape</span></p>
    <div class="mapchips">${MAP_STAGES.map((st, i) => `<button class="chip" data-stage="${st.id}" style="--c:${COUNTRIES[st.c].color}"><i>${i + 1}</i>${esc(st.name.replace(" (nuit tampon)", ""))}</button>`).join("")}</div>
  </section>`;
}
function openStage(id) {
  const st = stageById[id]; if (!st) return;
  const days = DAYS.filter(([iso, sid]) => (sid || (stageOn(iso) || {}).id) === id);
  const sh = openSheet(`<div class="sheet-head"><h2>${esc(st.name)}</h2><button class="x" data-close aria-label="Fermer">✕</button></div>
    ${stageBlock(st, st.from)}
    <h2 class="sect">Les jours</h2>
    ${days.map(([iso, , trj, act, nuit]) => `<button class="row" style="--c:${COUNTRIES[st.c].color}" data-day="${iso}"><span class="date">${esc(fmt(iso))}</span><span class="txt"><strong>${esc(act || trj || "")}</strong><small>${esc(nuit)}</small></span></button>`).join("")}`);
  sh.querySelectorAll("[data-resa]").forEach((b) => (b.onclick = () => openResa(S.resas.find((r) => r.id === b.dataset.resa))));
  sh.querySelectorAll("[data-day]").forEach((b) => (b.onclick = () => openDay(b.dataset.day)));
  bindShow(sh);
}

function viewToday() {
  const t = todayIso();
  if (t < TRIP.start) {
    const left = daysBetween(t, TRIP.start);
    const todo = S.resas.filter((r) => r.status !== "reserve").sort(byBooking);
    const done = S.resas.length - todo.length;
    const checksDone = CHECKLIST.filter((_, i) => S.checks.some((c) => c.id === "c" + i && c.done)).length;
    return `
    <section class="hero deco">${landscape("h1")}<div class="hero-in"><p class="kicker">Départ le dimanche 27 juin 2027</p><p class="big">J−${left}</p>
      <div class="bars">
        <div><span>Réservations</span><b>${done}/${S.resas.length}</b><i style="--p:${S.resas.length ? done / S.resas.length : 0}"></i></div>
        <div><span>Préparatifs</span><b>${checksDone}/${CHECKLIST.length}</b><i style="--p:${checksDone / CHECKLIST.length}"></i></div>
      </div></div></section>
    ${tripMap(t)}
    ${climateCard()}
    <h2 class="sect">Prochaines réservations à faire</h2>
    ${todo.slice(0, 6).map(resaCard).join("") || `<p class="muted pad">Tout est réservé.</p>`}
    <button class="link pad" data-go="resas">Voir toutes les réservations</button>
    ${isDemo() ? `<p class="note">Mode démo : les données restent sur cet appareil. La synchronisation entre vos deux téléphones s'active une fois Firebase configuré.</p>` : ""}`;
  }
  if (t > TRIP.end) return `<section class="hero deco">${landscape("h3")}<div class="hero-in"><p class="big">Bon retour !</p><p class="muted">Le voyage est terminé. Tout reste consultable dans l'onglet Jours.</p></div></section>${tripMap(t)}`;
  const tomorrow = isoOf(new Date(D(t).getTime() + 86400000));
  const st = stageOn(t) || stageById[dayRow(t)?.[1]];
  const today = resasOn(t), tom = resasOn(tomorrow);
  return `${dayBlock(t)}
    ${wxCard(t)}
    ${tripMap(t)}
    ${today.length ? `<h2 class="sect">Aujourd'hui</h2>${today.map(resaCard).join("")}` : ""}
    ${tom.length ? `<h2 class="sect">Demain</h2>${tom.map(resaCard).join("")}` : ""}
    ${stageBlock(st, t)}`;
}

function viewDays() {
  const t = todayIso();
  let last = null;
  return `<h2 class="sect">Jour par jour</h2>` + DAYS.map(([iso, sid, trj, act, nuit]) => {
    const st = stageById[sid] || stageOn(iso);
    const c = COUNTRIES[st?.c || "fr"];
    const head = st && st.id !== last ? `<p class="group" style="--c:${c.color}">${c.name === st.name ? "" : esc(c.name) + " · "}${esc(st.name)}</p>` : "";
    if (st) last = st.id;
    const n = resasOn(iso).length;
    return `${head}<button class="row ${iso === t ? "now" : ""}" style="--c:${c.color}" data-day="${iso}">
      <span class="date">${esc(fmt(iso))}</span>
      <span class="txt"><strong>${esc(act || trj || "")}</strong><small>${esc(nuit)}</small></span>
      ${n ? `<span class="count">${n}</span>` : ""}
    </button>`;
  }).join("");
}

function viewResas() {
  const list = S.resas.filter((r) => S.filter === "all" || (S.filter === "todo" ? r.status !== "reserve" : r.status === "reserve")).sort(S.filter === "todo" ? byBooking : byDate);
  let lastM = "";
  const counts = { todo: S.resas.filter((r) => r.status !== "reserve").length, done: S.resas.filter((r) => r.status === "reserve").length };
  return `<button class="btn wide paste" data-paste>📋 Coller une réservation préparée par Claude</button><div class="chips">
    ${[["todo", `À faire (${counts.todo})`], ["done", `Réservé (${counts.done})`], ["all", "Tout"]].map(([k, l]) => `<button class="chip ${S.filter === k ? "on" : ""}" data-filter="${k}">${l}</button>`).join("")}
  </div>` + (list.map((r) => {
    const m = S.filter === "todo" ? "À réserver : " + bookingPeriod(bookingFor(r)?.from || (r.date < TRIP.start ? r.date : "2027-06-27"))
      : r.date ? fmt(r.date, { month: "long", year: "numeric" }) : "Sans date";
    const h = m !== lastM ? `<h2 class="sect">${esc(m)}</h2>` : ""; lastM = m;
    return h + resaCard(r);
  }).join("") || `<p class="muted pad">Rien ici.</p>`);
}

// Import d'une réservation préparée (texte JSON copié depuis la conversation avec Claude)
function openPaste() {
  const sh = openSheet(`<div class="sheet-head"><h2>Coller une réservation</h2><button class="x" data-close aria-label="Fermer">✕</button></div>
    <p class="muted small">Copiez le bloc de texte que Claude vous a donné (il commence par une accolade) et collez-le ici.</p>
    <textarea id="pt" rows="6" placeholder='{"match": "…", "status": "reserve", …}'></textarea>
    <p class="err" id="pe"></p><div id="pv"></div>
    <div class="actions"><button class="btn" id="pr">Lire</button><button class="btn primary" id="ps" disabled>Enregistrer</button></div>`);
  let items = [];
  const LBL = { title: "Titre", type: "Type", status: "Statut", date: "Date", time: "Heure", ref: "N° de réservation", paid: "Montant payé (€)", paidBy: "Payé par", price: "Prix estimé", place: "Adresse", localAddr: "Adresse locale", notes: "Notes" };
  $("#pr", sh).onclick = () => {
    $("#pe", sh).textContent = ""; $("#ps", sh).disabled = true;
    try {
      let raw = $("#pt", sh).value.trim().replace(/^```\w*|```$/g, "").trim().replace(/[“”]/g, '"');
      const data = JSON.parse(raw); items = (Array.isArray(data) ? data : [data]).map((d) => {
        const target = d.match ? S.resas.find((r) => r.title === d.match) || S.resas.find((r) => r.title.toLowerCase().includes(String(d.match).toLowerCase())) : null;
        const { match, ...fields } = d; if (fields.paidBy && !["p1", "p2"].includes(fields.paidBy)) delete fields.paidBy;
        return { target, fields };
      });
      $("#pv", sh).innerHTML = items.map(({ target, fields }) => `<div class="card"><p class="kicker">${target ? "Mise à jour de" : "Nouvelle réservation"}</p><h3>${esc(target?.title || fields.title || "Sans titre")}</h3>
        ${Object.entries(fields).map(([k, v]) => `<div class="kv"><span>${esc(LBL[k] || k)}</span><b>${esc(k === "status" ? STATUS[v] || v : k === "type" ? TYPES[v] || v : v)}</b></div>`).join("")}</div>`).join("");
      $("#ps", sh).disabled = false;
    } catch { $("#pe", sh).textContent = "Je n'arrive pas à lire ce texte : vérifiez qu'il est copié en entier, de { à }."; }
  };
  $("#ps", sh).onclick = () => {
    items.forEach(({ target, fields }) => { const id = target?.id || "r" + Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
      store().put("resas", id, { ...(target ? {} : { type: "hotel", status: "reserve", files: [] }), ...fields, by: S.user?.email || "" }); });
    closeSheet();
  };
}

function viewPrep() {
  const custom = S.checks.filter((c) => c.label).sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));
  const item = (id, label, done) => `<label class="check"><input type="checkbox" data-check="${esc(id)}" ${done ? "checked" : ""}><span>${esc(label)}</span></label>`;
  const isDone = (id) => S.checks.some((c) => c.id === id && c.done);
  const group = (g, title) => `<h2 class="sect">${title}</h2><div class="card list">${CHECKLIST.map((c, i) => c[0] === g ? item("c" + i, c[1], isDone("c" + i)) : "").join("")}${custom.filter((c) => c.group === g).map((c) => item(c.id, c.label, c.done)).join("")}
    <form class="addcheck" data-group="${g}"><input placeholder="Ajouter…" aria-label="Ajouter un élément"><button class="btn sm">OK</button></form></div>`;
  return group("avant", "Avant de partir") + group("sac", "Dans le sac");
}

/* ---------- interactions ---------- */
function bindView(v) {
  v.querySelectorAll("[data-resa]").forEach((b) => (b.onclick = () => openResa(S.resas.find((r) => r.id === b.dataset.resa))));
  v.querySelectorAll("[data-day]").forEach((b) => (b.onclick = () => openDay(b.dataset.day)));
  v.querySelectorAll("[data-wxretry]").forEach((b) => (b.onclick = () => { b.textContent = "Chargement…"; ensureWeather(true); }));
  v.querySelectorAll("[data-paste]").forEach((b) => (b.onclick = openPaste));
  v.querySelectorAll("[data-journal]").forEach((b) => (b.onclick = () => openJournal(b.dataset.journal)));
  hydrateThumbs(v);
  v.querySelectorAll("[data-food]").forEach((c) => (c.onchange = () => store().put("food", c.dataset.food, { done: c.checked, by: S.user?.email || "" })));
  v.querySelectorAll("[data-stage]").forEach((b) => (b.onclick = () => openStage(b.dataset.stage)));
  bindShow(v); bindExtras(v);
  v.querySelectorAll("[data-filter]").forEach((b) => (b.onclick = () => { S.filter = b.dataset.filter; render(); }));
  v.querySelectorAll("[data-go]").forEach((b) => (b.onclick = () => { S.tab = b.dataset.go; render(); }));
  v.querySelectorAll("[data-check]").forEach((c) => (c.onchange = () => store().put("checks", c.dataset.check, { done: c.checked, by: S.user?.email || "" })));
  v.querySelectorAll(".addcheck").forEach((f) => (f.onsubmit = (e) => {
    e.preventDefault(); const val = f.querySelector("input").value.trim(); if (!val) return;
    store().put("checks", "u" + Date.now().toString(36), { label: val, group: f.dataset.group, done: false, createdAt: Date.now() });
  }));
}

function openSheet(html) {
  const sh = $("#sheet"); sh.innerHTML = `<div class="sheet-bg" data-close></div><div class="sheet-body">${html}</div>`; sh.hidden = false;
  document.body.classList.add("locked");
  sh.querySelectorAll("[data-close]").forEach((b) => (b.onclick = closeSheet));
  return sh;
}
function closeSheet() { const sh = $("#sheet"); sh.hidden = true; sh.innerHTML = ""; document.body.classList.remove("locked"); }

function openDay(iso) {
  const st = stageById[dayRow(iso)?.[1]] || stageOn(iso);
  const sh = openSheet(`<div class="sheet-head"><h2>${esc(fmtLong(iso))}</h2><button class="x" data-close aria-label="Fermer">✕</button></div>
    ${dayBlock(iso)}${resasOn(iso).map(resaCard).join("")}
    ${stageBlock(st, iso)}`);
  sh.querySelectorAll("[data-journal]").forEach((b) => (b.onclick = () => openJournal(b.dataset.journal)));
  hydrateThumbs(sh);
  sh.querySelectorAll("[data-resa]").forEach((b) => (b.onclick = () => openResa(S.resas.find((r) => r.id === b.dataset.resa))));
  bindShow(sh);
}

function openResa(r) {
  const isNew = !r;
  r = r || { id: "r" + Date.now().toString(36), type: "hotel", status: "reserve", date: todayIso() < TRIP.start ? TRIP.start : todayIso(), files: [] };
  let files = [...(r.files || [])];
  const sh = openSheet(`
    <div class="sheet-head"><h2>${isNew ? "Nouvelle réservation" : "Réservation"}</h2><button class="x" data-close aria-label="Fermer">✕</button></div>
    ${(() => { const bk = bookingFor(r); return bk && r.status !== "reserve" ? `<div class="bkbox"><p class="kicker">Quand réserver</p><p><b>${esc(bk.when)}</b></p>${bk.tip ? `<p class="muted small">${esc(bk.tip)}</p>` : ""}${bk.sites.length ? `<div class="bksites">${bk.sites.map(([n, u]) => `<a class="chip" href="${esc(u)}" target="_blank" rel="noopener">${esc(n)} ↗</a>`).join("")}</div>` : ""}</div>` : ""; })()}
    <form id="rf" class="form">
      <label>Titre<input name="title" value="${esc(r.title || "")}" required placeholder="Ex. Hôtel Fenghuang"></label>
      <div class="two">
        <label>Type<select name="type">${Object.entries(TYPES).map(([k, l]) => `<option value="${k}" ${r.type === k ? "selected" : ""}>${l}</option>`).join("")}</select></label>
        <label>Statut<select name="status">${Object.entries(STATUS).map(([k, l]) => `<option value="${k}" ${r.status === k ? "selected" : ""}>${l}</option>`).join("")}</select></label>
      </div>
      <div class="two">
        <label>Date<input type="date" name="date" value="${esc(r.date || "")}"></label>
        <label>Heure<input type="time" name="time" value="${esc(r.time || "")}"></label>
      </div>
      <div class="two">
        <label>N° de réservation<input name="ref" value="${esc(r.ref || "")}" autocapitalize="characters"></label>
        <label>Prix estimé<input name="price" value="${esc(r.price || "")}"></label>
      </div>
      <div class="two">
        <label>Montant payé pour 2 (€)<input name="paid" inputmode="decimal" value="${esc(r.paid ?? "")}" placeholder="Une fois payé"></label>
        <label>Payé par<select name="paidBy">${Object.entries(people()).map(([k, n]) => `<option value="${k}" ${(r.paidBy || me()) === k ? "selected" : ""}>${esc(n)}</option>`).join("")}</select></label>
      </div>
      <label>Adresse ou lieu<input name="place" value="${esc(r.place || "")}"></label>
      <label>Adresse en langue locale (à montrer au chauffeur)<textarea name="localAddr" rows="2" placeholder="Copiez ici l'adresse en chinois ou en vietnamien de la confirmation">${esc(r.localAddr || "")}</textarea></label>
      ${r.localAddr || r.place ? `<div class="btnrow">${r.localAddr ? `<button type="button" class="btn sm" id="showaddr">Afficher en grand</button>` : ""}<button type="button" class="btn sm" id="goaddr">📍 Y aller</button></div>` : ""}
      <label>Notes<textarea name="notes" rows="3">${esc(r.notes || "")}</textarea></label>
      <div class="files"><h3>Billets et documents</h3><div id="fl"></div>
        <label class="btn addfile">Ajouter un billet (photo, capture, PDF)<input type="file" id="fi" accept="image/*,application/pdf" multiple hidden></label>
        <p class="muted small" id="fs"></p></div>
      <div class="actions">
        ${isNew ? "" : `<button type="button" class="btn danger" id="del">Supprimer</button>`}
        <button class="btn primary" type="submit">Enregistrer</button>
      </div>
    </form>`);
  const fl = $("#fl", sh), fs = $("#fs", sh);
  const drawFiles = () => {
    fl.innerHTML = files.map((id) => { const m = S.files.find((f) => f.id === id);
      return `<div class="file"><button type="button" class="fopen" data-f="${esc(id)}">${esc(m?.name || "Fichier (en cours de synchronisation)")}</button>
        <small>${m ? Math.round(m.size / 1024) + " Ko" : ""}</small><button type="button" class="fdel" data-fd="${esc(id)}" aria-label="Retirer">✕</button></div>`; }).join("") || `<p class="muted small">Aucun fichier.</p>`;
    fl.querySelectorAll("[data-f]").forEach((b) => (b.onclick = () => viewFile(b.dataset.f)));
    fl.querySelectorAll("[data-fd]").forEach((b) => (b.onclick = () => confirmIn(b, async () => {
      const id = b.dataset.fd; files = files.filter((x) => x !== id); drawFiles();
      await store().put("resas", r.id, { files }); store().deleteFile(id, S.files.find((f) => f.id === id)).catch(() => {});
    })));
  };
  drawFiles();
  $("#fi", sh).onchange = async (e) => {
    const list = [...e.target.files]; e.target.value = "";
    for (const f of list) {
      fs.textContent = `Ajout de ${f.name}…`;
      try {
        const prepared = await prepareFile(f);
        const id = await store().saveFile(prepared);
        files.push(id); drawFiles();
        if (!isNew || $("#rf", sh).elements.title.value) await store().put("resas", r.id, { ...(isNew ? collect() : {}), files });
      } catch (err) { fs.textContent = "Impossible d'ajouter ce fichier : " + err.message; continue; }
    }
    if (!fs.textContent.startsWith("Impossible")) fs.textContent = navigator.onLine ? "" : "Hors ligne : le fichier sera envoyé à l'autre téléphone au retour du réseau.";
  };
  const collect = () => { const f = $("#rf", sh).elements; return { type: f.type.value, title: f.title.value.trim(), status: f.status.value, date: f.date.value, time: f.time.value, ref: f.ref.value.trim(), price: f.price.value.trim(), paid: parseFloat(String(f.paid.value).replace(",", ".").replace(/[^\d.]/g, "")) || null, paidBy: f.paidBy.value, place: f.place.value.trim(), localAddr: f.localAddr.value.trim(), notes: f.notes.value.trim() }; };
  const ga = $("#goaddr", sh); if (ga) ga.onclick = () => openGo(r.localAddr || r.place, r.title, (stageOn(r.date) || {}).id);
  const sa = $("#showaddr", sh); if (sa) sa.onclick = () => showBig($("#rf", sh).elements.localAddr.value, $("#rf", sh).elements.title.value);
  $("#rf", sh).onsubmit = async (e) => { e.preventDefault(); store().put("resas", r.id, { ...collect(), files, by: S.user?.email || "" }); closeSheet(); };
  const del = $("#del", sh);
  if (del) del.onclick = () => confirmIn(del, () => {
    store().remove("resas", r.id); files.forEach((id) => store().deleteFile(id, S.files.find((f) => f.id === id)).catch(() => {})); closeSheet();
  });
}

// Images : réduites et compressées pour rester légères ; PDF : tels quels (4 Mo max)
async function prepareFile(f, max = 2000, q = 0.85) {
  if (f.type === "application/pdf") { if (f.size > 4e6) throw new Error("PDF trop lourd (4 Mo max) : faites plutôt une capture d'écran du billet."); return f; }
  if (!f.type.startsWith("image/")) throw new Error("Format non pris en charge");
  const img = await createImageBitmap(f).catch(() => null);
  if (!img) return f;
  const k = Math.min(1, max / Math.max(img.width, img.height));
  const cv = Object.assign(document.createElement("canvas"), { width: Math.round(img.width * k), height: Math.round(img.height * k) });
  cv.getContext("2d").drawImage(img, 0, 0, cv.width, cv.height);
  const blob = await new Promise((res) => cv.toBlob(res, "image/jpeg", q));
  return new File([blob], f.name.replace(/\.\w+$/, "") + ".jpg", { type: "image/jpeg" });
}

async function viewFile(id) {
  const meta = S.files.find((f) => f.id === id);
  const ov = document.createElement("div"); ov.className = "viewer";
  ov.innerHTML = `<div class="vbar"><button class="btn sm" data-x>Fermer</button><span>${esc(meta?.name || "")}</span><button class="btn sm" data-share>Partager</button></div><div class="vbody"><p class="muted">Ouverture…</p></div>`;
  document.body.appendChild(ov);
  ov.querySelector("[data-x]").onclick = () => { ov.remove(); if (url) URL.revokeObjectURL(url); };
  let url = null, blob = null;
  try {
    blob = await store().loadFile(id, meta);
    url = URL.createObjectURL(blob);
    ov.querySelector(".vbody").innerHTML = blob.type.startsWith("image/") ? `<img src="${url}" alt="">` : `<iframe src="${url}" title="Billet"></iframe>`;
  } catch {
    ov.querySelector(".vbody").innerHTML = `<p class="muted">Ce fichier n'est pas encore sur ce téléphone. Ouvrez l'app une fois avec du réseau pour le récupérer.</p>`;
  }
  ov.querySelector("[data-share]").onclick = async () => {
    if (!blob) return;
    const file = new File([blob], meta?.name || "billet", { type: blob.type });
    if (navigator.canShare?.({ files: [file] })) navigator.share({ files: [file] }).catch(() => {});
    else window.open(url, "_blank");
  };
}

/* ---------- À montrer au chauffeur ---------- */
function showList(st) {
  const items = [...(LOCAL_PLACES[st.id] || []).map(([fr, loc]) => ({ fr, loc })),
    ...hotelsFor(st).filter((r) => r.localAddr).map((r) => ({ fr: r.title, loc: r.localAddr }))];
  if (!items.length) return "";
  const lang = LANG_OF_COUNTRY[st.c] || "";
  return `<h3>À montrer au chauffeur</h3><div class="showlist">${items.map((i) =>
    `<div class="showrow"><button class="showitem" data-show-loc="${esc(i.loc)}" data-show-fr="${esc(i.fr)}" data-show-lang="${lang}"><span class="loc">${esc(i.loc)}</span><small>${esc(i.fr)}</small></button>${lang ? playBtn(i.loc, lang) : ""}${goBtn(i.loc, i.fr, st.id)}</div>`).join("")}</div>
    <p class="muted small">Touchez pour afficher en grand, 📍 pour l'itinéraire. L'adresse de l'hôtel s'ajoute dans sa réservation.</p>`;
}
function bindShow(el) {
  el.querySelectorAll("[data-show-loc]").forEach((b) => (b.onclick = () => showBig(b.dataset.showLoc, b.dataset.showFr, b.dataset.showLang)));
  el.querySelectorAll("[data-go-q]").forEach((b) => (b.onclick = (e) => { e.stopPropagation(); openGo(b.dataset.goQ, b.dataset.goL, b.dataset.goS); }));
  el.querySelectorAll("[data-say]").forEach((b) => (b.onclick = (e) => { e.stopPropagation(); speak(b.dataset.say, b.dataset.lang, b); }));
}
function showBig(loc, fr, lang) {
  if (!loc) return;
  const ov = document.createElement("div"); ov.className = "bigshow";
  ov.innerHTML = `<p class="bigloc">${esc(loc)}</p><p class="bigfr">${esc(fr || "")}</p><div class="bigbtns">${lang ? `<button class="btn" data-bsay>Écouter</button>` : ""}<button class="btn" data-bx>Fermer</button></div>`;
  ov.onclick = (e) => { if (e.target.closest("[data-bsay]")) speak(loc, lang, e.target.closest("[data-bsay]")); else { speechSynthesis?.cancel(); ov.remove(); } };
  document.body.appendChild(ov);
}

/* ---------- Devises ---------- */
let ratesBusy = false;
const rates = () => { const r = S.settings.rates?.rates || {}; return Object.fromEntries(Object.entries(CURRENCIES).map(([k, c]) => [k, r[k] || c.rate])); };
const toEur = (amount, cur) => amount / (rates()[cur] || 1);
const money = (v, cur = "EUR") => { const c = CURRENCIES[cur] || CURRENCIES.EUR; return Number(v || 0).toLocaleString("fr-FR", { minimumFractionDigits: 0, maximumFractionDigits: c.dec }) + " " + c.sym; };
async function refreshRates() {
  const at = S.settings.rates?.at || 0;
  if (ratesBusy || !navigator.onLine || Date.now() - at < 12 * 3600e3) return;
  ratesBusy = true;
  try {
    const res = await fetch("https://open.er-api.com/v6/latest/EUR"); const j = await res.json();
    if (j?.rates) await store().put("settings", "rates", { rates: Object.fromEntries(Object.keys(CURRENCIES).map((k) => [k, j.rates[k]]).filter(([, v]) => v)), at: Date.now() });
  } catch {} finally { ratesBusy = false; }
}
const ratesNote = () => S.settings.rates?.at ? `Taux du ${new Date(S.settings.rates.at).toLocaleDateString("fr-FR")}, mis à jour automatiquement avec du réseau.` : "Taux approximatifs, mis à jour dès que l'app a du réseau.";

/* ---------- Personnes ---------- */
const people = () => ({ p1: S.settings.people?.p1 || "Personne 1", p2: S.settings.people?.p2 || "Personne 2" });
const me = () => { try { return localStorage.getItem("voyage-me") || "p1"; } catch { return "p1"; } };
const setMe = (v) => { try { localStorage.setItem("voyage-me", v); } catch {} };
const countryOn = (iso) => (stageOn(iso) || stageById[dayRow(iso)?.[1]])?.c || "fr";

/* ---------- Dépenses ---------- */
// Réservations payées → comptées dans le budget (un hôtel est réparti sur ses nuits)
function resaSpend() {
  const out = [];
  S.resas.filter((r) => Number(r.paid) > 0 && r.date).forEach((r) => {
    const n = r.type === "hotel" ? Number((r.title || "").match(/\((\d+) nuits?\)/)?.[1] || 1) : 1;
    for (let i = 0; i < n; i++) {
      const iso = isoOf(new Date(D(r.date).getTime() + i * 86400000));
      out.push({ date: iso, eur: r.paid / n, payer: r.paidBy || "p1", split: "both", pre: true });
    }
  });
  return out;
}
const INTL_EST = 1760; // vols Nice ↔ Asie pour deux, prévus à part
// Poids de coût par pays (Hong Kong et Malaisie plus chers, Vietnam moins)
const COST_W = { hk: 1.6, cn: 1, vn: 0.8, kh: 0.9, my: 1.2, fr: 0 };
function budgetPlan(budget) {
  const days = DAYS.map(([iso]) => [iso, countryOn(iso)]);
  const sumW = days.reduce((t, [, c]) => t + (COST_W[c] || 0), 0) || 1;
  const perDay = (c) => (Math.max(0, budget - INTL_EST) * (COST_W[c] || 0)) / sumW;
  const nDays = {}; days.forEach(([, c]) => { if (COST_W[c]) nDays[c] = (nDays[c] || 0) + 1; });
  return { days, perDay, nDays };
}
function budgetDaily(ex, budget) {
  const t = todayIso(), plan = budgetPlan(budget);
  const spentOn = (iso) => ex.filter((e) => e.date === iso).reduce((s, e) => s + (e.eur || 0), 0);
  const by = {}; ex.forEach((e) => { const c = e.country || countryOn(e.date); by[c] = (by[c] || 0) + (e.eur || 0); });
  let top = "";
  if (t >= TRIP.start && t <= TRIP.end) {
    const c = countryOn(t), p = plan.perDay(c), sp = spentOn(t);
    const past = plan.days.filter(([iso]) => iso <= t), plannedSoFar = past.reduce((s, [, cc]) => s + plan.perDay(cc), 0);
    const spentSoFar = ex.filter((e) => e.date >= TRIP.start && e.date <= t).reduce((s, e) => s + (e.eur || 0), 0);
    const left = plan.days.filter(([iso]) => iso > t && COST_W[countryOn(iso)]).length;
    const rest = budget - ex.reduce((s, e) => s + (e.eur || 0), 0);
    const diff = plannedSoFar - spentSoFar;
    top = `<section class="card today-budget">
      <div class="cbar ${sp > p ? "over" : ""}" style="--c:${COUNTRIES[c].color}"><span>Aujourd'hui</span><b>${money(Math.round(sp))} <small>/ ${money(Math.round(p))}</small></b><i style="--p:${Math.min(1, sp / (p || 1))}"></i></div>
      <p class="bud-msg ${diff >= 0 ? "ok" : "warn"}">${diff >= 0 ? `Vous avez <b>${money(Math.round(diff))}</b> d'avance sur le budget prévu` : `Vous avez dépassé le budget prévu de <b>${money(Math.round(-diff))}</b>`} depuis le départ.</p>
      ${left ? `<p class="muted small">Il reste ${money(Math.round(rest))}, soit environ ${money(Math.round(rest / left))} par jour pour les ${left} jours restants.</p>` : ""}
    </section>`;
  }
  const rows = Object.keys(plan.nDays).map((c) => {
    const planned = plan.perDay(c) * plan.nDays[c], sp = by[c] || 0;
    const elapsed = plan.days.filter(([iso, cc]) => cc === c && iso <= t).length;
    return `<div class="cbar ${sp > planned ? "over" : ""}" style="--c:${COUNTRIES[c].color}"><span>${esc(COUNTRIES[c].name)} <small class="muted">· ${plan.nDays[c]} j</small></span>
      <b>${sp ? money(Math.round(sp)) + " <small>/ " : "<small>"}${money(Math.round(planned))}</small></b><i style="--p:${Math.min(1, sp / planned)}"></i>
      <small class="muted cday">Prévu ${money(Math.round(plan.perDay(c)))} par jour${elapsed && sp ? ` · dépensé ${money(Math.round(sp / elapsed))} par jour en moyenne` : ""}</small></div>`;
  }).join("");
  const fr = by.fr || 0;
  const other = `<div class="cbar ${fr > INTL_EST ? "over" : ""}" style="--c:${COUNTRIES.fr.color}"><span>Vols internationaux et divers</span><b>${fr ? money(Math.round(fr)) + " <small>/ " : "<small>"}${money(INTL_EST)}</small></b><i style="--p:${Math.min(1, fr / INTL_EST)}"></i></div>`;
  return `${top}<h2 class="sect">Budget par pays</h2><div class="card">${rows}${other}
    <p class="muted small">Tout compte : dépenses sur place et réservations payées (un hôtel est réparti sur ses nuits). Le budget est réparti selon le coût de la vie, plus élevé à Hong Kong et en Malaisie, plus bas au Vietnam ; il se règle dans Outils › Réglages.</p></div>`;
}

function viewMoney() {
  const P = people(); const budget = Number(S.settings.budget?.total || 10000);
  const ex = [...S.expenses].sort((a, b) => (b.date || "").localeCompare(a.date || "") || (b.createdAt || 0) - (a.createdAt || 0));
  const pre = resaSpend(), all = [...ex, ...pre];
  const total = all.reduce((t, e) => t + (e.eur || 0), 0), preTotal = pre.reduce((t, e) => t + e.eur, 0);
  const net = { p1: 0, p2: 0 };
  all.forEach((e) => { const v = e.eur || 0, payer = e.payer || "p1", other = payer === "p1" ? "p2" : "p1";
    net[payer] += v; if (e.split === "payer") net[payer] -= v; else if (e.split === "other") net[other] -= v; else { net.p1 -= v / 2; net.p2 -= v / 2; } });
  const owe = net.p1 > 0.5 ? `${esc(P.p2)} doit ${money(Math.round(net.p1))} à ${esc(P.p1)}` : net.p2 > 0.5 ? `${esc(P.p1)} doit ${money(Math.round(net.p2))} à ${esc(P.p2)}` : "Vous êtes quittes";
  const byCountry = {}; ex.forEach((e) => { const c = e.country || countryOn(e.date); byCountry[c] = (byCountry[c] || 0) + (e.eur || 0); });
  const maxC = Math.max(1, ...Object.values(byCountry));
  let lastD = "";
  return `<section class="hero money coin">
      <p class="kicker">Dépensé à deux, tout compris</p><p class="big">${money(Math.round(total))}</p>
      ${preTotal ? `<p class="muted small">dont ${money(Math.round(preTotal))} de réservations payées · ${money(Math.round(total - preTotal))} sur place</p>` : ""}
      <div class="bars"><div><span>Budget ${money(budget)}</span><b>${Math.round((total / budget) * 100)} %</b><i style="--p:${Math.min(1, total / budget)}"></i></div></div>
      <p class="owe">${owe}</p>
    </section>
    ${budgetDaily(all, budget)}
    ${ex.map((e) => { const h = e.date !== lastD ? `<h2 class="sect">${esc(fmtLong(e.date))}</h2>` : ""; lastD = e.date;
      return h + `<button class="card exp" data-exp="${esc(e.id)}"><span class="emain"><strong>${esc(e.desc || CATEGORIES[e.cat] || "Dépense")}</strong>
        <small>${esc(CATEGORIES[e.cat] || "")} · payé par ${esc(P[e.payer] || "")}${e.split === "payer" ? " (pour lui/elle)" : e.split === "other" ? " (pour l'autre)" : ""}</small></span>
        <span class="eside"><b>${money(e.eur)}</b>${e.cur !== "EUR" ? `<small>${money(e.amount, e.cur)}</small>` : ""}</span></button>`; }).join("")
      || `<p class="muted pad">Aucune dépense pour l'instant. Touchez + pour ajouter la première, dans n'importe quelle devise.</p>`}`;
}

function openExpense(e) {
  const isNew = !e; const P = people();
  const date = e?.date || (todayIso() < TRIP.start ? TRIP.start : todayIso());
  e = e || { id: "e" + Date.now().toString(36), date, cur: CURRENCY_OF[countryOn(date)] || "EUR", payer: me(), split: "both", cat: "repas" };
  const sh = openSheet(`<div class="sheet-head"><h2>${isNew ? "Nouvelle dépense" : "Dépense"}</h2><button class="x" data-close aria-label="Fermer">✕</button></div>
    <form id="ef" class="form">
      <div class="two"><label>Montant<input name="amount" inputmode="decimal" required value="${esc(e.amount ?? "")}" placeholder="0"></label>
        <label>Devise<select name="cur">${Object.entries(CURRENCIES).map(([k, c]) => `<option value="${k}" ${e.cur === k ? "selected" : ""}>${k} · ${c.sym}</option>`).join("")}</select></label></div>
      <p class="muted small" id="eurv"></p>
      <label>Description<input name="desc" value="${esc(e.desc || "")}" placeholder="Ex. dîner, taxi, entrée du parc"></label>
      <div class="two"><label>Catégorie<select name="cat">${Object.entries(CATEGORIES).map(([k, l]) => `<option value="${k}" ${e.cat === k ? "selected" : ""}>${l}</option>`).join("")}</select></label>
        <label>Date<input type="date" name="date" value="${esc(e.date)}"></label></div>
      <div class="two"><label>Payé par<select name="payer"><option value="p1" ${e.payer === "p1" ? "selected" : ""}>${esc(P.p1)}</option><option value="p2" ${e.payer === "p2" ? "selected" : ""}>${esc(P.p2)}</option></select></label>
        <label>Pour<select name="split"><option value="both" ${e.split === "both" ? "selected" : ""}>Les deux</option><option value="payer" ${e.split === "payer" ? "selected" : ""}>Celui qui paie</option><option value="other" ${e.split === "other" ? "selected" : ""}>L'autre</option></select></label></div>
      <div class="actions">${isNew ? "" : `<button type="button" class="btn danger" id="edel">Supprimer</button>`}<button class="btn primary" type="submit">Enregistrer</button></div>
    </form>`);
  const f = $("#ef", sh).elements;
  const num = () => parseFloat(String(f.amount.value).replace(/\s/g, "").replace(",", ".")) || 0;
  const upd = () => { $("#eurv", sh).textContent = f.cur.value === "EUR" ? "" : "≈ " + money(toEur(num(), f.cur.value)); };
  f.amount.oninput = upd; f.cur.onchange = upd; upd();
  $("#ef", sh).onsubmit = (ev) => { ev.preventDefault(); const a = num(); if (!a) return;
    setMe(f.payer.value);
    store().put("expenses", e.id, { amount: a, cur: f.cur.value, eur: Math.round(toEur(a, f.cur.value) * 100) / 100, desc: f.desc.value.trim(), cat: f.cat.value, date: f.date.value, payer: f.payer.value, split: f.split.value, country: countryOn(f.date.value), createdAt: e.createdAt || Date.now() });
    closeSheet(); };
  const d = $("#edel", sh); if (d) d.onclick = () => confirmIn(d, () => { store().remove("expenses", e.id); closeSheet(); });
}

// Confirmation dans le bouton (deuxième appui)
function confirmIn(btn, action) {
  if (btn.dataset.armed) return action();
  btn.dataset.armed = "1"; const old = btn.textContent; btn.textContent = "Confirmer ?";
  setTimeout(() => { if (btn.isConnected) { delete btn.dataset.armed; btn.textContent = old; } }, 3000);
}

/* ---------- Outils ---------- */
const TOOLS = [
  ["conv", "Convertisseur", "Devises hors ligne"],
  ["phrases", "Phrases de survie", "Chinois, vietnamien, khmer, malais"],
  ["food", "Spécialités à goûter", "À cocher étape par étape"],
  ["remind", "Rappels", "Dans le calendrier de l'iPhone"],
  ["tips", "Bons réflexes", "Pourboires, prix, pièges"],
  ["stats", "Stats du voyage", "Kilomètres, trains, plats"],
  ["vault", "Documents et urgences", "Passeports, assurance, numéros"],
  ["prep", "Préparatifs", "Checklist avant le départ et sac"],
  ["settings", "Réglages", "Prénoms, budget, compte"],
];
function viewMore() {
  if (!S.sub) return `<h2 class="sect">Outils</h2><div class="tools">${TOOLS.map(([k, t, d]) => `<button class="card tool tool-${k}" data-sub="${k}"><span class="tico"><svg viewBox="0 0 24 24">${TOOL_ICONS[k]}</svg></span><strong>${t}</strong><small>${d}</small></button>`).join("")}</div>`;
  const back = `<button class="back" data-sub="">‹ Outils</button>`;
  return back + ({ conv: viewConv, phrases: viewPhrases, food: viewFood, journal: viewJournal, remind: viewRemind, tips: viewTips, stats: viewStats, vault: viewVault, prep: viewPrep, settings: viewSettings })[S.sub]();
}

function viewConv() {
  const amt = S.convAmt ?? 100, cur = S.convCur || CURRENCY_OF[countryOn(todayIso())] || "CNY";
  const eur = toEur(amt, cur);
  return `<h2 class="sect">Convertisseur</h2><div class="card conv">
    <div class="two"><input id="ca" inputmode="decimal" value="${esc(amt)}" aria-label="Montant"><select id="cc" aria-label="Devise">${Object.entries(CURRENCIES).map(([k, c]) => `<option value="${k}" ${k === cur ? "selected" : ""}>${k} · ${esc(c.name)}</option>`).join("")}</select></div>
    <div class="convlist">${Object.entries(CURRENCIES).filter(([k]) => k !== cur).map(([k]) => `<div><span>${k}</span><b>${money(eur * rates()[k], k)}</b></div>`).join("")}</div>
    <p class="muted small">${ratesNote()}</p></div>`;
}

function viewPhrases() {
  return `<h2 class="sect">Phrases de survie</h2>${PHRASES.map((g) => `<details class="card phr" ${g.where === COUNTRIES[countryOn(todayIso())]?.name ? "open" : ""}><summary><strong>${esc(g.lang)}</strong> <small>${esc(g.where)}</small></summary>
    ${g.rows.map(([fr, loc, ph]) => `<div class="phrow"><button class="phrase" data-show-loc="${esc(loc)}" data-show-fr="${esc(fr + " · " + ph)}" data-show-lang="${LANG_OF_GROUP[g.lang]}"><span>${esc(fr)}</span><span class="loc">${esc(loc)}</span><small>${esc(ph)}</small></button>${playBtn(loc, LANG_OF_GROUP[g.lang])}</div>`).join("")}</details>`).join("")}
    <p class="muted small pad">Le bouton haut-parleur fait parler la voix de l'iPhone, même sans réseau. Touchez une phrase pour l'afficher en grand.</p>`;
}

function viewFood() {
  const done = new Set((S.food || []).filter((f) => f.done).map((f) => f.id));
  const all = FOODS.reduce((n, g) => n + g.items.length, 0);
  const here = foodsForStage((stageOn(todayIso()) || {}).id);
  return `<h2 class="sect">Spécialités à goûter</h2>
    <section class="card foodhead"><p class="big">${done.size}<small> / ${all}</small></p><p class="muted">goûtées à deux. Touchez le nom local pour le montrer au serveur.</p></section>
    ${FOODS.map((g) => { const n = g.items.filter((_, i) => done.has(foodId(g, i))).length;
      return `<details class="card food" style="--c:${COUNTRIES[g.c].color}" ${here ? (here.id === g.id ? "open" : "") : g.id === "hk" ? "open" : ""}>
      <summary><strong>${esc(g.region)}</strong><small>${n}/${g.items.length}</small></summary>
      ${g.items.map(([fr, loc, d], i) => { const id = foodId(g, i);
        return `<div class="fitem ${done.has(id) ? "done" : ""}"><label class="fchk"><input type="checkbox" data-food="${id}" ${done.has(id) ? "checked" : ""}><span></span></label>
        <div class="ftxt"><strong>${esc(fr)}</strong><small>${esc(d)}</small>
        ${loc !== fr ? `<button class="floc" data-show-loc="${esc(loc)}" data-show-fr="${esc(fr)}" data-show-lang="${g.lang}">${esc(loc)}</button>` : ""}</div>
        ${playBtn(loc, g.lang)}</div>`; }).join("")}</details>`; }).join("")}`;
}

function viewTips() {
  const cur = countryOn(todayIso());
  return `<h2 class="sect">Bons réflexes</h2>${TIPS.map((g) => `<details class="card food tipc" style="--c:${COUNTRIES[g.c].color}" ${g.c === cur || (cur === "fr" && g.c === "hk") ? "open" : ""}>
    <summary><strong>${esc(g.title)}</strong><span class="tipm">${MOTIFS[g.c] || ""}</span></summary>
    ${g.sections.map(([h, t]) => `<div class="tipsec"><h3>${esc(h)}</h3><p>${esc(t)}</p></div>`).join("")}</details>`).join("")}
    <h2 class="sect">Applis à installer</h2><div class="card list">${APPS.map(([n, d, u]) => `<a class="kv applink" href="${u}" target="_blank" rel="noopener"><span><b>${esc(n)}</b><small>${esc(d)}</small></span><span>↗</span></a>`).join("")}</div>
    <p class="muted small pad">Prix indicatifs pour vous donner un ordre d'idée : ils bougent, mais un écart de 3 ou 4 fois doit vous alerter.</p>`;
}

function viewStats() {
  const t = todayIso();
  const sum = (arr) => arr.reduce((a, b) => a + b, 0);
  const done = LEGS.filter((l) => l[3] < t || (l[3] === t && t > TRIP.start));
  const kmAll = sum(LEGS.map(legKm)), kmDone = sum(done.map(legKm));
  const cnt = (mode, arr = LEGS) => arr.filter((l) => l[2] === mode).length;
  const nightsTrain = LEGS.filter((l) => l[4] && l[2] === "train");
  const foodDone = (S.food || []).filter((f) => f.done).length, foodAll = FOODS.reduce((n, g) => n + g.items.length, 0);
  const daysDone = t < TRIP.start ? 0 : Math.min(DAYS.length, daysBetween(TRIP.start, t) + 1);
  const countries = new Set(DAYS.filter(([iso]) => iso <= t).map(([iso]) => countryOn(iso)).filter((c) => c !== "fr"));
  const stagesDone = MAP_STAGES.filter((st) => st.from <= t).length;
  const photos = sum((S.journal || []).map((j) => (j.photos || []).length));
  const spent = sum(S.expenses.map((e) => e.eur || 0)) + sum(resaSpend().map((e) => e.eur));
  const pre = t < TRIP.start;
  const tile = (big, small, label, p) => `<div class="stat"><b>${big}</b>${small ? `<small>${small}</small>` : ""}<span>${label}</span>${p != null ? `<i style="--p:${p}"></i>` : ""}</div>`;
  const fmtN = (n) => n.toLocaleString("fr-FR");
  return `<h2 class="sect">Stats du voyage</h2>
    <section class="card stats-hero"><p class="kicker">${pre ? "Ce qui vous attend" : "Depuis le départ"}</p>
      <p class="big">${fmtN(pre ? kmAll : kmDone)} km</p><p class="muted small">${pre ? "en tout, dont" : `sur ${fmtN(kmAll)} km prévus, dont`} ${fmtN(sum(LEGS.filter((l) => l[2] !== "vol").map(legKm)))} km sans avion</p>
      ${pre ? "" : `<i class="pbar" style="--p:${kmDone / kmAll}"></i>`}</section>
    <div class="stats">
      ${tile(pre ? DAYS.length : daysDone, pre ? "" : "/ " + DAYS.length, "jours", pre ? null : daysDone / DAYS.length)}
      ${tile(pre ? 5 : countries.size, pre ? "" : "/ 5", "pays", pre ? null : countries.size / 5)}
      ${tile(pre ? MAP_STAGES.length : stagesDone, pre ? "" : "/ " + MAP_STAGES.length, "étapes", pre ? null : stagesDone / MAP_STAGES.length)}
      ${tile(pre ? cnt("train") : cnt("train", done), pre ? "" : "/ " + cnt("train"), "trains 🚄")}
      ${tile(pre ? nightsTrain.length : nightsTrain.filter((l) => done.includes(l)).length, pre ? "" : "/ " + nightsTrain.length, "nuits en train 🛏️")}
      ${tile(pre ? cnt("vol") : cnt("vol", done), pre ? "" : "/ " + cnt("vol"), "vols ✈️")}
      ${tile(pre ? cnt("bateau") : cnt("bateau", done), pre ? "" : "/ " + cnt("bateau"), "bateaux ⛴️")}
      ${tile(pre ? cnt("moto") + 1 : cnt("moto", done) + (t > "2027-07-28" ? 1 : 0), pre ? "" : "/ " + (cnt("moto") + 1), "jours de moto 🏍️")}
      ${tile(foodDone, "/ " + foodAll, "plats goûtés 🍜", foodDone / foodAll)}
      ${tile(money(Math.round(spent)), "", "dépensés à deux")}
      ${tile(fmtN(Math.round(kmAll / 40075 * 100)) + " %", "", "du tour de la Terre 🌍")}
    </div>
    <p class="muted small pad">Distances approximatives : à vol d'oiseau pour l'avion, un peu plus par la route et le rail.</p>`;
}

function viewRemind() {
  const base = location.href.replace(/[?#].*$/, "").replace(/[^/]*$/, "");
  const https = base + "rappels.ics", webcal = https.replace(/^https?:/, "webcal:");
  return `<h2 class="sect">Rappels dans le calendrier</h2>
    <section class="card"><p>Ajoutez le calendrier <b>« Asie 2027 · rappels »</b> à votre iPhone : le jour où il faut réserver quelque chose, une alerte s'affiche à 9 h avec ce qu'il y a à faire et sur quels sites, même sans ouvrir l'appli.</p>
      <a class="btn primary wide" href="${esc(webcal)}">S'abonner au calendrier</a>
      <ol class="steps"><li>Touchez le bouton, puis <b>S'abonner</b>.</li><li>Sur l'écran suivant, <b>désactivez « Supprimer les alertes »</b>, sinon l'iPhone retire les rappels.</li><li>Touchez <b>Ajouter</b>. C'est tout : le calendrier se met à jour tout seul.</li></ol>
      <p class="muted small">À faire sur les deux téléphones. Si une réservation est déjà faite, ignorez simplement son rappel.</p></section>
    <h2 class="sect">Prochains rappels</h2><div class="card list">${upcomingReminders().map(([d, txt]) => `<div class="kv"><span>${esc(txt)}</span><b>${esc(fmt(d))}</b></div>`).join("") || `<p class="muted">Plus rien à venir.</p>`}</div>`;
}
function upcomingReminders() {
  const t = todayIso();
  return S.resas.filter((r) => r.status !== "reserve").map((r) => [bookingFor(r)?.from, r.title]).filter(([d]) => d && d >= t).sort((a, b) => a[0].localeCompare(b[0])).slice(0, 8);
}

/* ---------- carnet de voyage ---------- */
const thumbCache = new Map();
async function hydrateThumbs(el) {
  for (const img of el.querySelectorAll("img[data-fid]")) {
    const id = img.dataset.fid;
    try {
      if (!thumbCache.has(id)) thumbCache.set(id, URL.createObjectURL(await store().loadFile(id, S.files.find((f) => f.id === id))));
      img.src = thumbCache.get(id); img.classList.add("ok");
    } catch { img.alt = "Photo pas encore synchronisée"; }
  }
  el.querySelectorAll("img[data-fid]").forEach((img) => (img.onclick = () => viewFile(img.dataset.fid)));
}
const journalOn = (iso) => (S.journal || []).filter((j) => j.date === iso && (j.text || (j.photos || []).length)).sort((a, b) => (a.who || "").localeCompare(b.who || ""));
function journalBlock(iso, withDate) {
  const P = people(), items = journalOn(iso);
  if (!items.length) return "";
  return items.map((j) => `<div class="jentry">${withDate ? "" : ""}<p class="jwho">${esc(P[j.who] || "")}</p>${j.text ? `<p class="jtxt">${esc(j.text)}</p>` : ""}
    ${(j.photos || []).length ? `<div class="jphotos">${j.photos.map((id) => `<img data-fid="${esc(id)}" alt="">`).join("")}</div>` : ""}</div>`).join("");
}
function viewJournal() {
  const t = todayIso();
  const days = [...new Set((S.journal || []).filter((j) => j.text || (j.photos || []).length).map((j) => j.date))].sort().reverse();
  const canWrite = t >= TRIP.start && t <= TRIP.end;
  return `<h2 class="sect">Carnet de voyage</h2>
    <section class="card"><p>Chaque jour, une photo ou deux et quelques lignes, chacun de son côté. Le carnet est partagé entre vos deux téléphones.</p>
      <button class="btn primary wide" data-journal="${canWrite ? t : TRIP.start}">${canWrite ? "Écrire la page d'aujourd'hui" : "Essayer (page du 27 juin)"}</button></section>
    ${days.map((iso) => `<section class="card jday"><button class="jhead" data-journal="${iso}"><strong>${esc(fmtLong(iso))}</strong><small>${esc((stageOn(iso) || stageById[dayRow(iso)?.[1]] || {}).name || "")}</small></button>${journalBlock(iso)}</section>`).join("")
      || `<p class="muted pad">Le carnet est encore vide. Il se remplira pendant le voyage ; chaque page est aussi accessible depuis le jour correspondant dans l'onglet Jours.</p>`}`;
}
function openJournal(iso) {
  const who = me(), id = iso + "_" + who, P = people();
  const j = (S.journal || []).find((x) => x.id === id) || { text: "", photos: [] };
  let photos = [...(j.photos || [])];
  const sh = openSheet(`<div class="sheet-head"><h2>${esc(fmtLong(iso))}</h2><button class="x" data-close aria-label="Fermer">✕</button></div>
    <form id="jf" class="form">
      <p class="muted small">Page de ${esc(P[who])} (le prénom se règle dans Outils › Réglages)</p>
      <label>Ce qu'on retient de la journée<textarea name="text" rows="5" placeholder="Le meilleur moment, ce qu'on a mangé, une rencontre…">${esc(j.text || "")}</textarea></label>
      <div class="jphotos edit" id="jp"></div>
      <label class="btn addfile">Ajouter des photos<input type="file" id="jfi" accept="image/*" multiple hidden></label>
      <p class="muted small" id="js"></p>
      <div class="actions"><button class="btn primary" type="submit">Enregistrer</button></div>
    </form>`);
  const draw = () => { $("#jp", sh).innerHTML = photos.map((pid) => `<span class="jph"><img data-fid="${esc(pid)}" alt=""><button type="button" class="x sm" data-rm="${esc(pid)}" aria-label="Retirer">✕</button></span>`).join("");
    hydrateThumbs($("#jp", sh)); $("#jp", sh).querySelectorAll("[data-rm]").forEach((b) => (b.onclick = () => { photos = photos.filter((x) => x !== b.dataset.rm); store().deleteFile(b.dataset.rm, S.files.find((f) => f.id === b.dataset.rm)).catch(() => {}); draw(); })); };
  draw();
  const save = () => store().put("journal", id, { date: iso, who, text: $("#jf", sh).elements.text.value.trim(), photos, by: S.user?.email || "" });
  $("#jfi", sh).onchange = async (ev) => { const list = [...ev.target.files]; ev.target.value = ""; const st = $("#js", sh);
    for (const f of list) { try { st.textContent = "Envoi de la photo…"; const pid = await store().saveFile(await prepareFile(f, 1600, 0.75)); photos.push(pid); draw(); await save(); st.textContent = ""; } catch (err) { st.textContent = err.message; } } };
  $("#jf", sh).onsubmit = (e) => { e.preventDefault(); save(); closeSheet(); };
}

function viewVault() {
  const items = [...S.vault].sort((a, b) => (a.title || "").localeCompare(b.title || ""));
  return `<h2 class="sect">Numéros d'urgence</h2><div class="card list">${EMERGENCY.map(([c, n]) => `<div class="kv"><span>${esc(c)}</span><b>${esc(n)}</b></div>`).join("")}</div>
    <h2 class="sect">Documents</h2>${items.map((v) => `<button class="card resa" data-vault="${esc(v.id)}"><span class="rico t-admin">${icon("admin")}</span>
      <span class="rmain"><strong>${esc(v.title)}</strong><small>${esc((v.text || "").split("\n")[0])}</small></span>
      <span class="rside">${(v.files || []).length ? `<span class="clip">${v.files.length} fichier${v.files.length > 1 ? "s" : ""}</span>` : ""}</span></button>`).join("")}
    <button class="btn wide" data-newvault>Ajouter un document</button>`;
}

function openVault(v) {
  const isNew = !v; v = v || { id: "v" + Date.now().toString(36), title: "", text: "", files: [] };
  let files = [...(v.files || [])];
  const sh = openSheet(`<div class="sheet-head"><h2>${isNew ? "Nouveau document" : "Document"}</h2><button class="x" data-close aria-label="Fermer">✕</button></div>
    <form id="vf" class="form"><label>Titre<input name="title" required value="${esc(v.title)}"></label>
      <label>Notes (numéros, contacts…)<textarea name="text" rows="5">${esc(v.text || "")}</textarea></label>
      <div class="files"><h3>Fichiers</h3><div id="vfl"></div>
        <label class="btn addfile">Ajouter une photo ou un PDF<input type="file" id="vfi" accept="image/*,application/pdf" multiple hidden></label></div>
      <div class="actions">${isNew ? "" : `<button type="button" class="btn danger" id="vdel">Supprimer</button>`}<button class="btn primary" type="submit">Enregistrer</button></div></form>`);
  const fl = $("#vfl", sh);
  const draw = () => { fl.innerHTML = files.map((id) => { const m = S.files.find((f) => f.id === id);
      return `<div class="file"><button type="button" class="fopen" data-f="${esc(id)}">${esc(m?.name || "Fichier (synchronisation…)")}</button><small>${m ? Math.round(m.size / 1024) + " Ko" : ""}</small><button type="button" class="fdel" data-fd="${esc(id)}" aria-label="Retirer">✕</button></div>`; }).join("") || `<p class="muted small">Aucun fichier.</p>`;
    fl.querySelectorAll("[data-f]").forEach((b) => (b.onclick = () => viewFile(b.dataset.f)));
    fl.querySelectorAll("[data-fd]").forEach((b) => (b.onclick = () => confirmIn(b, async () => { const id = b.dataset.fd; files = files.filter((x) => x !== id); draw(); await store().put("vault", v.id, { files }); store().deleteFile(id, S.files.find((f) => f.id === id)).catch(() => {}); }))); };
  draw();
  const collect = () => { const f = $("#vf", sh).elements; return { title: f.title.value.trim() || "Document", text: f.text.value }; };
  $("#vfi", sh).onchange = async (ev) => { const list = [...ev.target.files]; ev.target.value = "";
    for (const f of list) { try { const id = await store().saveFile(await prepareFile(f)); files.push(id); draw(); await store().put("vault", v.id, { ...collect(), files }); } catch (err) { fl.insertAdjacentHTML("beforeend", `<p class="err">${esc(err.message)}</p>`); } } };
  $("#vf", sh).onsubmit = (ev) => { ev.preventDefault(); store().put("vault", v.id, { ...collect(), files }); closeSheet(); };
  const d = $("#vdel", sh); if (d) d.onclick = () => confirmIn(d, () => { store().remove("vault", v.id); files.forEach((id) => store().deleteFile(id, S.files.find((f) => f.id === id)).catch(() => {})); closeSheet(); });
}

function viewSettings() {
  const P = people(); const budget = S.settings.budget?.total || 10000;
  return `<h2 class="sect">Réglages</h2><form class="card form" id="sf">
    <div class="two"><label>Prénom 1<input name="p1" value="${esc(S.settings.people?.p1 || "")}" placeholder="Personne 1"></label>
      <label>Prénom 2<input name="p2" value="${esc(S.settings.people?.p2 || "")}" placeholder="Personne 2"></label></div>
    <label>Sur ce téléphone, je suis<select name="me"><option value="p1" ${me() === "p1" ? "selected" : ""}>${esc(P.p1)}</option><option value="p2" ${me() === "p2" ? "selected" : ""}>${esc(P.p2)}</option></select></label>
    <label>Apparence (sur ce téléphone)<select name="theme"><option value="light" ${getTheme() === "light" ? "selected" : ""}>Clair</option><option value="dark" ${getTheme() === "dark" ? "selected" : ""}>Sombre</option><option value="auto" ${getTheme() === "auto" ? "selected" : ""}>Comme l'iPhone</option></select></label>
    <label>Budget total du voyage pour deux, vols et logements compris (€)<input name="budget" inputmode="numeric" value="${esc(budget)}"></label>
    <button class="btn primary">Enregistrer</button></form>
    <div class="card"><p class="muted small">Connecté : ${esc(S.user?.email || "")} · version ${typeof __BUILD__ !== "undefined" ? __BUILD__ : "dev"}</p>${isDemo() ? "" : `<button class="btn danger sm" id="logout">Se déconnecter</button>`}</div>`;
}

function bindExtras(v) {
  v.querySelectorAll("[data-sub]").forEach((b) => (b.onclick = () => { S.sub = b.dataset.sub || null; window.scrollTo(0, 0); render(); }));
  v.querySelectorAll("[data-exp]").forEach((b) => (b.onclick = () => openExpense(S.expenses.find((e) => e.id === b.dataset.exp))));
  v.querySelectorAll("[data-vault]").forEach((b) => (b.onclick = () => openVault(S.vault.find((x) => x.id === b.dataset.vault))));
  const nv = v.querySelector("[data-newvault]"); if (nv) nv.onclick = () => openVault(null);
  const ca = $("#ca", v), cc = $("#cc", v);
  if (ca) { const upd = () => { S.convAmt = parseFloat(ca.value.replace(",", ".")) || 0; S.convCur = cc.value;
      const eur = toEur(S.convAmt, S.convCur);
      v.querySelector(".convlist").innerHTML = Object.keys(CURRENCIES).filter((k) => k !== S.convCur).map((k) => `<div><span>${k}</span><b>${money(eur * rates()[k], k)}</b></div>`).join(""); };
    ca.oninput = upd; cc.onchange = upd; }
  const sf = $("#sf", v);
  if (sf) sf.onsubmit = (e) => { e.preventDefault(); const f = sf.elements;
    store().put("settings", "people", { p1: f.p1.value.trim(), p2: f.p2.value.trim() });
    store().put("settings", "budget", { total: Number(f.budget.value) || 10000 }); setMe(f.me.value);
    try { localStorage.setItem("voyage-theme", f.theme.value); } catch {} applyTheme(f.theme.value); render(); };
  const lo = $("#logout", v); if (lo) lo.onclick = () => confirmIn(lo, () => store().signOut());
}

boot();
if ("serviceWorker" in navigator && location.protocol === "https:") {
  const hadCtrl = !!navigator.serviceWorker.controller; let reloaded = false;
  navigator.serviceWorker.addEventListener("controllerchange", () => { if (hadCtrl && !reloaded) { reloaded = true; location.reload(); } });
  navigator.serviceWorker.register("./sw.js").then((reg) => {
    reg.update().catch(() => {});
    document.addEventListener("visibilitychange", () => { if (document.visibilityState === "visible") reg.update().catch(() => {}); });
  }).catch(() => {});
}
