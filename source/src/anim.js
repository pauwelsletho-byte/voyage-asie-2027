// Petites animations : écran d'ouverture, tampons, confettis, compteurs, moments clés
export const calm = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
const seen = (k) => { try { return localStorage.getItem("anim-" + k) === "1"; } catch { return false; } };
const mark = (k) => { try { localStorage.setItem("anim-" + k, "1"); } catch {} };
const ss = (k) => { try { if (sessionStorage.getItem(k)) return true; sessionStorage.setItem(k, "1"); } catch {} return false; };

export function splash() {
  if (calm() || ss("splash")) return;
  const el = document.createElement("div"); el.className = "splash";
  el.innerHTML = `<svg viewBox="0 0 200 200" class="splash-svg" aria-hidden="true"><path class="trail" d="M20 160 Q90 150 120 90 T180 30" fill="none" stroke="#F0775A" stroke-width="3" stroke-dasharray="4 6" stroke-linecap="round"/>
    <g class="plane"><path d="M0 -6 L18 0 L0 6 L4 0Z M6 -2 L10 -12 L13 -12 L11 -1Z M6 2 L10 12 L13 12 L11 1Z" fill="#10876A"/></g></svg><p class="splash-t">Asie 2027</p>`;
  document.documentElement.appendChild(el);
  setTimeout(() => el.classList.add("out"), 1300); setTimeout(() => el.remove(), 1800);
}

// Gros tampon au centre de l'écran (réservation, frontière…)
export function stampOverlay({ title, sub = "", color = "#10876A", big = false, key }) {
  if (key && seen(key)) return; if (key) mark(key);
  if (calm()) return;
  const el = document.createElement("div"); el.className = "stampov" + (big ? " big" : "");
  el.innerHTML = `<div class="stamp" style="--sc:${color}"><span class="st1">${title}</span>${sub ? `<span class="st2">${sub}</span>` : ""}</div>`;
  el.onclick = () => el.remove();
  document.body.appendChild(el);
  setTimeout(() => el.classList.add("out"), big ? 2600 : 1300); setTimeout(() => el.remove(), big ? 3100 : 1700);
}

export function confetti(x, y, chars = ["🥢", "🍜", "🥟", "✨", "🍲"]) {
  if (calm()) return;
  for (let i = 0; i < 14; i++) {
    const p = document.createElement("span"); p.className = "confetto"; p.textContent = chars[i % chars.length];
    const a = Math.random() * Math.PI * 2, d = 50 + Math.random() * 70;
    p.style.left = x + "px"; p.style.top = y + "px";
    p.style.setProperty("--dx", Math.cos(a) * d + "px"); p.style.setProperty("--dy", Math.sin(a) * d - 40 + "px"); p.style.setProperty("--rot", (Math.random() * 360 - 180) + "deg");
    document.body.appendChild(p); setTimeout(() => p.remove(), 1100);
  }
}

// Panneau de gare pour le compte à rebours (une fois par ouverture de l'appli)
export function flap(el) {
  if (!el || calm() || el.dataset.done) return; el.dataset.done = 1;
  if (ss("flap")) return;
  const target = el.textContent; const chars = [...target];
  el.innerHTML = chars.map((c) => `<span class="fl">${c}</span>`).join("");
  el.querySelectorAll(".fl").forEach((s, i) => {
    const final = chars[i]; if (!/\d/.test(final)) return; let n = 0;
    const t = setInterval(() => { s.textContent = String((Math.random() * 10) | 0); s.classList.remove("tick"); void s.offsetWidth; s.classList.add("tick");
      if (++n > 8 + i * 3) { clearInterval(t); s.textContent = final; } }, 70);
  });
}

// Compteurs qui défilent : <b data-count="28322" data-suffix=" km">
const counted = new Set();
export function countUp(root) {
  root.querySelectorAll("[data-count]").forEach((el) => {
    const v = +el.dataset.count, key = (el.dataset.ckey || "") + v, fmt = (n) => Math.round(n).toLocaleString("fr-FR") + (el.dataset.suffix || "");
    if (calm() || counted.has(key) || !v) { el.textContent = fmt(v); return; }
    counted.add(key); const t0 = performance.now(), dur = 1100;
    const step = (t) => { const k = Math.min(1, (t - t0) / dur); el.textContent = fmt(v * (1 - Math.pow(1 - k, 3))); if (k < 1) requestAnimationFrame(step); };
    el.textContent = fmt(0); requestAnimationFrame(step);
  });
}

// Moments clés (mi-parcours, dernier soir, retour)
export function moment({ key, emoji, title, text, color = "#10876A" }) {
  if (seen(key)) return; mark(key);
  const el = document.createElement("div"); el.className = "momentov";
  el.innerHTML = `<div class="moment" style="--mc:${color}"><span class="me1">${emoji}</span><h2>${title}</h2><p>${text}</p><button class="btn primary">Super !</button></div>`;
  el.querySelector("button").onclick = () => el.remove(); el.onclick = (e) => { if (e.target === el) el.remove(); };
  document.body.appendChild(el);
  if (!calm()) { const b = el.querySelector(".moment").getBoundingClientRect(); setTimeout(() => confetti(innerWidth / 2, b.top + 40, ["🎉", "✨", "🌏", "🎊"]), 300); }
}

// Tirer pour actualiser (petite barque qui tangue)
export function pullToRefresh(onRefresh) {
  const ind = document.createElement("div"); ind.className = "ptr"; ind.innerHTML = `<svg viewBox="0 0 60 30"><path d="M8 18 Q30 28 52 18 L48 14 L12 14Z" fill="#7A4A2A"/><path d="M30 14 L30 2 L42 12Z" fill="#F0775A"/><path d="M0 24 q8 -4 15 0 t15 0 t15 0 t15 0" stroke="#4AA9B8" stroke-width="2" fill="none"/></svg>`;
  document.body.appendChild(ind);
  let y0 = null, dy = 0, busy = false;
  addEventListener("touchstart", (e) => { if (scrollY <= 0 && !document.body.classList.contains("locked") && e.touches.length === 1) { y0 = e.touches[0].clientY; dy = 0; } else y0 = null; }, { passive: true });
  addEventListener("touchmove", (e) => { if (y0 == null || busy) return; dy = e.touches[0].clientY - y0; if (dy > 0) { ind.style.transform = `translate(-50%, ${Math.min(80, dy * 0.5)}px)`; ind.style.opacity = Math.min(1, dy / 120); } }, { passive: true });
  addEventListener("touchend", async () => {
    if (y0 == null || busy) return; y0 = null;
    if (dy > 140) { busy = true; ind.classList.add("spin"); try { await onRefresh(); } catch {} setTimeout(() => { ind.classList.remove("spin"); ind.style.transform = ""; ind.style.opacity = 0; busy = false; }, 900); }
    else { ind.style.transform = ""; ind.style.opacity = 0; }
  });
}
