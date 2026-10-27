import { TRIP, COUNTRIES, STAGES, DAYS, SEED_RESAS, CHECKLIST } from "./data.js";
import { initStore, store, isDemo } from "./store.js";

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
const S = { user: null, resas: [], checks: [], files: [], tab: "today", filter: "todo", sync: { fromCache: true, pending: false }, unsubs: [] };

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
async function boot() {
  await initStore();
  window.addEventListener("online", () => setSync()); window.addEventListener("offline", () => setSync());
  store().onAuth((u) => { S.user = u; u ? startData() : renderLogin(); });
}

function startData() {
  S.unsubs.forEach((f) => f && f()); S.unsubs = [];
  renderShell();
  const seed = { resas: SEED_RESAS.map((r, i) => ({ id: "seed-" + String(i).padStart(2, "0") + "-" + slug(r[1]), type: r[0], title: r[1], date: r[2], notes: r[3], status: r[4], price: r[5], files: [] })) };
  store().seedIfNeeded(seed).catch(() => {});
  S.unsubs.push(store().subscribe("resas", (items, m) => { if (items) S.resas = items; setSync(m); render(); }));
  S.unsubs.push(store().subscribe("checks", (items) => { if (items) S.checks = items; render(); }));
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
  <header class="top"><h1 id="ttl">Asie, été 2027</h1><span id="sync" class="sync"></span></header>
  <main id="view"></main>
  <button class="fab" id="fab" aria-label="Ajouter une réservation">+</button>
  <nav class="tabs">
    ${[["today", "Aujourd'hui", '<path d="M19 4h-1V2h-2v2H8V2H6v2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zm0 16H5V9h14v11zM7 11h5v5H7z"/>'],
       ["days", "Jours", '<path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z"/>'],
       ["resas", "Billets", ICONS.activite],
       ["prep", "Préparatifs", '<path d="M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4z"/>']]
      .map(([k, l, p]) => `<button data-tab="${k}"><svg viewBox="0 0 24 24">${p}</svg><span>${l}</span></button>`).join("")}
  </nav>
  <div id="sheet" class="sheet" hidden></div>`;
  document.querySelectorAll(".tabs button").forEach((b) => (b.onclick = () => { S.tab = b.dataset.tab; window.scrollTo(0, 0); render(); }));
  $("#fab").onclick = () => openResa(null);
  setSync(); render();
}

function render() {
  const v = $("#view"); if (!v) return;
  document.querySelectorAll(".tabs button").forEach((b) => b.classList.toggle("on", b.dataset.tab === S.tab));
  $("#fab").hidden = S.tab !== "resas" && S.tab !== "today";
  v.innerHTML = ({ today: viewToday, days: viewDays, resas: viewResas, prep: viewPrep })[S.tab]();
  bindView(v);
  setSync();
}

/* ---------- vues ---------- */
const resasOn = (iso) => S.resas.filter((r) => r.date === iso).sort(byDate);
const byDate = (a, b) => (a.date || "9").localeCompare(b.date || "9") || (a.time || "").localeCompare(b.time || "");
const hotelsFor = (stage) => stage ? S.resas.filter((r) => r.type === "hotel" && r.date >= stage.from && r.date < stage.to) : [];

function resaCard(r) {
  const nf = (r.files || []).length;
  return `<button class="card resa ${r.status}" data-resa="${esc(r.id)}">
    <span class="rico t-${r.type}">${icon(r.type)}</span>
    <span class="rmain"><strong>${esc(r.title)}</strong>
      <small>${esc(fmt(r.date))}${r.time ? " · " + esc(r.time) : ""}${r.ref ? " · n° " + esc(r.ref) : ""}${r.price ? " · " + esc(r.price) : ""}</small></span>
    <span class="rside"><span class="badge ${r.status}">${STATUS[r.status] || "—"}</span>${nf ? `<span class="clip">${nf} ${nf > 1 ? "fichiers" : "fichier"}</span>` : ""}</span>
  </button>`;
}

function stageBlock(st, iso) {
  if (!st) return "";
  const c = COUNTRIES[st.c];
  const hotels = hotelsFor(st);
  return `<section class="card stage" style="--c:${c.color}">
    <p class="kicker">${esc(c.name)}</p>
    <h2>${esc(st.name)}</h2>
    <p class="muted">${esc(fmt(st.from))} → ${esc(fmt(st.to))} · ${daysBetween(st.from, st.to)} ${daysBetween(st.from, st.to) > 1 ? "nuits" : "nuit"}</p>
    <h3>À faire</h3><ul>${st.todo.map((t) => `<li>${esc(t)}</li>`).join("")}</ul>
    <h3>Où dormir</h3><p>${esc(st.sleep)}</p>
    ${hotels.length ? hotels.map(resaCard).join("") : ""}
    ${st.tip ? `<p class="tip">${esc(st.tip)}</p>` : ""}
  </section>`;
}

function dayBlock(iso) {
  const d = dayRow(iso); if (!d) return "";
  return `<section class="card day">
    <p class="kicker">${esc(fmtLong(iso))}</p>
    ${d[2] ? `<p class="trajet">${icon("train", "sm")} ${esc(d[2])}</p>` : ""}
    ${d[3] ? `<p>${esc(d[3])}</p>` : ""}
    <p class="muted">Nuit : ${esc(d[4])}</p>
  </section>`;
}

function viewToday() {
  const t = todayIso();
  if (t < TRIP.start) {
    const left = daysBetween(t, TRIP.start);
    const todo = S.resas.filter((r) => r.status !== "reserve").sort(byDate);
    const done = S.resas.length - todo.length;
    const checksDone = CHECKLIST.filter((_, i) => S.checks.some((c) => c.id === "c" + i && c.done)).length;
    return `
    <section class="hero"><p class="kicker">Départ le dimanche 27 juin 2027</p><p class="big">J−${left}</p>
      <div class="bars">
        <div><span>Réservations</span><b>${done}/${S.resas.length}</b><i style="--p:${S.resas.length ? done / S.resas.length : 0}"></i></div>
        <div><span>Préparatifs</span><b>${checksDone}/${CHECKLIST.length}</b><i style="--p:${checksDone / CHECKLIST.length}"></i></div>
      </div></section>
    <h2 class="sect">Prochaines réservations à faire</h2>
    ${todo.slice(0, 6).map(resaCard).join("") || `<p class="muted pad">Tout est réservé.</p>`}
    <button class="link pad" data-go="resas">Voir toutes les réservations</button>
    ${isDemo() ? `<p class="note">Mode démo : les données restent sur cet appareil. La synchronisation entre vos deux téléphones s'active une fois Firebase configuré.</p>` : ""}`;
  }
  if (t > TRIP.end) return `<section class="hero"><p class="big">Bon retour !</p><p class="muted">Le voyage est terminé. Tout reste consultable dans l'onglet Jours.</p></section>`;
  const tomorrow = isoOf(new Date(D(t).getTime() + 86400000));
  const st = stageOn(t) || stageById[dayRow(t)?.[1]];
  const today = resasOn(t), tom = resasOn(tomorrow);
  return `${dayBlock(t)}
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
  const list = S.resas.filter((r) => S.filter === "all" || (S.filter === "todo" ? r.status !== "reserve" : r.status === "reserve")).sort(byDate);
  let lastM = "";
  const counts = { todo: S.resas.filter((r) => r.status !== "reserve").length, done: S.resas.filter((r) => r.status === "reserve").length };
  return `<div class="chips">
    ${[["todo", `À faire (${counts.todo})`], ["done", `Réservé (${counts.done})`], ["all", "Tout"]].map(([k, l]) => `<button class="chip ${S.filter === k ? "on" : ""}" data-filter="${k}">${l}</button>`).join("")}
  </div>` + (list.map((r) => {
    const m = r.date ? fmt(r.date, { month: "long", year: "numeric" }) : "Sans date";
    const h = m !== lastM ? `<h2 class="sect">${esc(m)}</h2>` : ""; lastM = m;
    return h + resaCard(r);
  }).join("") || `<p class="muted pad">Rien ici.</p>`);
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
    ${dayBlock(iso)}${resasOn(iso).map(resaCard).join("")}${stageBlock(st, iso)}`);
  sh.querySelectorAll("[data-resa]").forEach((b) => (b.onclick = () => openResa(S.resas.find((r) => r.id === b.dataset.resa))));
}

function openResa(r) {
  const isNew = !r;
  r = r || { id: "r" + Date.now().toString(36), type: "hotel", status: "reserve", date: todayIso() < TRIP.start ? TRIP.start : todayIso(), files: [] };
  let files = [...(r.files || [])];
  const sh = openSheet(`
    <div class="sheet-head"><h2>${isNew ? "Nouvelle réservation" : "Réservation"}</h2><button class="x" data-close aria-label="Fermer">✕</button></div>
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
        <label>Prix<input name="price" value="${esc(r.price || "")}"></label>
      </div>
      <label>Adresse ou lieu<input name="place" value="${esc(r.place || "")}"></label>
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
    fl.querySelectorAll("[data-fd]").forEach((b) => (b.onclick = async () => {
      if (!confirm("Retirer ce fichier ?")) return;
      const id = b.dataset.fd; files = files.filter((x) => x !== id); drawFiles();
      await store().put("resas", r.id, { files }); store().deleteFile(id, S.files.find((f) => f.id === id)).catch(() => {});
    }));
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
      } catch (err) { alert("Impossible d'ajouter ce fichier : " + err.message); }
    }
    fs.textContent = navigator.onLine ? "" : "Hors ligne : le fichier sera envoyé à l'autre téléphone au retour du réseau.";
  };
  const collect = () => { const f = $("#rf", sh).elements; return { type: f.type.value, title: f.title.value.trim(), status: f.status.value, date: f.date.value, time: f.time.value, ref: f.ref.value.trim(), price: f.price.value.trim(), place: f.place.value.trim(), notes: f.notes.value.trim() }; };
  $("#rf", sh).onsubmit = async (e) => { e.preventDefault(); store().put("resas", r.id, { ...collect(), files, by: S.user?.email || "" }); closeSheet(); };
  const del = $("#del", sh);
  if (del) del.onclick = async () => {
    if (!confirm("Supprimer cette réservation et ses fichiers ?")) return;
    store().remove("resas", r.id); files.forEach((id) => store().deleteFile(id, S.files.find((f) => f.id === id)).catch(() => {})); closeSheet();
  };
}

// Images : réduites et compressées pour rester légères ; PDF : tels quels (4 Mo max)
async function prepareFile(f) {
  if (f.type === "application/pdf") { if (f.size > 4e6) throw new Error("PDF trop lourd (4 Mo max) : faites plutôt une capture d'écran du billet."); return f; }
  if (!f.type.startsWith("image/")) throw new Error("Format non pris en charge");
  const img = await createImageBitmap(f).catch(() => null);
  if (!img) return f;
  const max = 2000, k = Math.min(1, max / Math.max(img.width, img.height));
  const cv = Object.assign(document.createElement("canvas"), { width: Math.round(img.width * k), height: Math.round(img.height * k) });
  cv.getContext("2d").drawImage(img, 0, 0, cv.width, cv.height);
  const blob = await new Promise((res) => cv.toBlob(res, "image/jpeg", 0.85));
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

boot();
if ("serviceWorker" in navigator && location.protocol === "https:") navigator.serviceWorker.register("./sw.js").catch(() => {});
