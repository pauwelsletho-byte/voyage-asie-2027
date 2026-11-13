// Décors animés (SVG + CSS) : un ciel qui suit l'heure, et un paysage par étape
let seed = 1;
const rnd = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
const r = (a, b) => a + rnd() * (b - a);
// décalage d'animation pour que les mouvements continuent d'un affichage à l'autre
const phaseDelay = (dur) => `-${((Date.now() / 1000) % dur).toFixed(2)}s`;

function sky(h, id) {
  const night = h < 5 || h >= 20, dawn = h >= 5 && h < 7, dusk = h >= 17.5 && h < 20;
  const [top, bot] = night ? ["#0B1B33", "#2A3F66"] : dawn ? ["#F4A988", "#FCE6C6"] : dusk ? ["#E9805A", "#FAD29E"] : ["#9ED9EC", "#EEF7F2"];
  const t = Math.max(0, Math.min(1, (h - 6) / 13.5));
  const sx = 40 + 320 * t, sy = 118 - 88 * Math.sin(Math.PI * t);
  const sunCol = dusk || dawn ? "#FF9A52" : "#F6C453";
  let out = `<defs><linearGradient id="${id}s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${top}"/><stop offset="1" stop-color="${bot}"/></linearGradient></defs>
    <rect width="400" height="150" fill="url(#${id}s)"/>`;
  if (night) {
    out += Array.from({ length: 28 }, () => `<circle cx="${r(5, 395).toFixed(0)}" cy="${r(4, 80).toFixed(0)}" r="${r(0.5, 1.4).toFixed(1)}" fill="#fff" class="star" style="animation-delay:-${r(0, 4).toFixed(1)}s"/>`).join("")
      + `<circle cx="318" cy="36" r="13" fill="#F4EBC9"/><circle cx="324" cy="32" r="12" fill="${top}" opacity=".9"/>`;
  } else {
    out += `<circle cx="${sx.toFixed(0)}" cy="${sy.toFixed(0)}" r="30" fill="${sunCol}" opacity=".18" class="sunglow"/><circle cx="${sx.toFixed(0)}" cy="${sy.toFixed(0)}" r="19" fill="${sunCol}"/>`;
    out += [[60, 28, 1], [230, 18, 0.8], [340, 44, 0.6]].map(([x, y, k], i) => `<g class="cloud" style="animation-duration:${90 + i * 30}s;animation-delay:${phaseDelay(90 + i * 30)}"><g transform="translate(${x} ${y}) scale(${k})" fill="#fff" opacity="${dusk || dawn ? 0.6 : 0.85}"><ellipse cx="0" cy="8" rx="26" ry="8"/><ellipse cx="-8" cy="3" rx="12" ry="9"/><ellipse cx="9" cy="1" rx="14" ry="11"/></g></g>`).join("");
  }
  return { svg: out, night, dusk, dawn };
}
const water = (y, c1, c2, night) => `<rect y="${y}" width="400" height="${150 - y}" fill="${night ? "#16314A" : c1}"/><rect y="${y + 14}" width="400" height="${136 - y}" fill="${night ? "#10263B" : c2}" opacity=".6"/>
  <g class="shimmer" stroke="${night ? "#7FA3C8" : "#fff"}" stroke-width="1.6" stroke-linecap="round" opacity=".55"><path d="M30 ${y + 8}h40M150 ${y + 16}h60M260 ${y + 6}h34M320 ${y + 22}h50M90 ${y + 26}h30"/></g>`;
const boat = (y, night, kind = "sampan") => `<g class="drift" style="animation-delay:${phaseDelay(26)}"><g transform="translate(120 ${y})"><g class="bob">${kind === "ferry"
  ? `<rect x="-2" y="-8" width="40" height="9" rx="2" fill="${night ? "#2B4A5E" : "#2F7A52"}"/><rect x="4" y="-14" width="26" height="7" fill="#F3EFE4"/>${night ? `<circle cx="10" cy="-10" r="1.5" fill="#FFD36B"/><circle cx="18" cy="-10" r="1.5" fill="#FFD36B"/><circle cx="26" cy="-10" r="1.5" fill="#FFD36B"/>` : ""}`
  : `<path d="M0 8 Q22 16 44 8 L40 4 L4 4Z" fill="${night ? "#3A2A20" : "#7A4A2A"}"/><path d="M20 4 L20 -16 L34 2Z" fill="${night ? "#8A5A4A" : "#F0775A"}"/>${night ? `<circle cx="38" cy="0" r="2" fill="#FFD36B" class="glow"/>` : ""}`}</g></g></g>`;
const ridge = (pts, fill, y = 150) => `<path d="M0 ${y} ${pts} L400 ${y}Z" fill="${fill}"/>`;

// paysages par type
const SCENES = {
  home(h, n) { return ridge("L0 92 Q14 50 28 62 Q34 30 46 34 Q56 40 60 72 Q70 52 80 66 L92 112 L150 112 Q160 40 176 26 Q186 22 192 40 Q198 70 206 62 Q214 46 224 52 Q232 64 236 112 L250 112 Q262 58 276 54 Q288 54 292 78 Q300 66 312 70 Q322 50 336 46 Q350 46 356 72 Q366 62 380 70 L400 80 L400 112", n ? "#1E4A3C" : "#6FB08E", 112)
      + ridge("L60 112 Q72 66 90 56 Q100 52 106 70 Q110 86 118 80 Q128 64 140 74 L150 112 L196 112 Q206 74 222 70 Q234 70 240 90 L250 112", n ? "#173A30" : "#2E7D5B", 112) + water(110, "#4AA9B8", "#2B8597", n) + boat(118, n); },
  city(h, n, v) {
    const b = v === "kl" ? [[20, 70, 34], [60, 85, 26], [92, 60, 30], [250, 80, 30], [290, 65, 34], [330, 90, 26], [362, 72, 32]] : v === "hcmc" ? [[10, 78, 30], [46, 90, 22], [74, 64, 26], [110, 84, 24], [200, 70, 22], [226, 46, 18], [250, 82, 30], [290, 60, 26], [322, 88, 24], [352, 70, 40]] : [[0, 74, 26], [28, 54, 22], [52, 66, 30], [86, 40, 24], [112, 58, 28], [144, 30, 20], [166, 62, 26], [196, 46, 30], [230, 70, 24], [258, 36, 22], [284, 56, 30], [318, 44, 26], [348, 66, 22], [372, 50, 28]];
    const base = v === "hk" ? 118 : 130;
    let s = v === "hk" ? ridge("L0 80 Q60 40 120 70 Q180 30 250 64 Q320 36 400 70", n ? "#14283A" : "#8CC5A4", 118) : "";
    s += b.map(([x, top, w]) => { let wins = ""; for (let y = top + 6; y < base - 4; y += 8) for (let xx = x + 4; xx < x + w - 3; xx += 7) wins += `<rect x="${xx}" y="${y}" width="3" height="4" class="${n ? "win" : ""}" fill="${n && rnd() < 0.65 ? "#FFD36B" : n ? "#24364F" : "#DCEFF4"}" style="animation-delay:-${r(0, 9).toFixed(1)}s"/>`;
      return `<rect x="${x}" y="${top}" width="${w}" height="${base - top}" fill="${n ? "#1A2638" : "#5E7F8C"}"/>${wins}`; }).join("");
    if (v === "kl") s += `<g fill="${n ? "#2A3A52" : "#9AB0BA"}"><path d="M160 130V44l6-10 6 10v86z"/><path d="M206 130V44l6-10 6 10v86z"/><rect x="172" y="74" width="34" height="3"/><path d="M166 34v-16M212 34v-16" stroke="${n ? "#9AB0BA" : "#6F8A96"}" stroke-width="1.5"/></g>${n ? `<g fill="#BFE3FF" class="win"><rect x="163" y="50" width="6" height="70" opacity=".35"/><rect x="209" y="50" width="6" height="70" opacity=".35"/></g>` : ""}`;
    if (v === "hcmc") s += `<rect y="130" width="400" height="20" fill="${n ? "#20262E" : "#6B6F73"}"/>` + Array.from({ length: 7 }, (_, i) => `<g class="scoot" style="animation-delay:-${(i * 1.4).toFixed(1)}s;animation-duration:${8 + (i % 3)}s"><circle cx="0" cy="${138 + (i % 2) * 6}" r="2.2" fill="${n ? "#FFD36B" : "#2F7A52"}"/></g>`).join("");
    else s += water(base, v === "kl" ? "#5BA6A8" : "#4AA9B8", "#2B8597", n) + (v === "hk" ? boat(base + 10, n, "ferry") : "");
    return s;
  },
  karst(h, n, v) {
    const tall = v === "zjj";
    let s = tall ? ridge("L0 90 Q60 70 120 86 Q200 66 280 84 Q340 72 400 88", n ? "#18302A" : "#8CC5A4", 150)
      + [[6, 40, 30], [44, 62, 24], [74, 26, 34], [120, 52, 26], [154, 14, 36], [204, 46, 28], [240, 22, 32], [284, 56, 26], [316, 30, 34], [360, 48, 30]].map(([x, top, w]) => `<path d="M${x} 150 L${x + 3} ${top + 30} L${x + 1} ${top + 8} L${x + w * 0.3} ${top} L${x + w * 0.7} ${top + 3} L${x + w - 1} ${top + 10} L${x + w - 4} ${top + 34} L${x + w} 150Z" fill="${n ? "#1E3A33" : "#6A8F7C"}"/><path d="M${x} ${top + 8} q${w * 0.25} -12 ${w * 0.5} -6 q${w * 0.3} -4 ${w * 0.5} 6 q-${w * 0.5} 6 -${w}z" fill="${n ? "#24473D" : "#3F8A62"}"/><path d="M${x + w * 0.55} ${top + 14} v40" stroke="${n ? "#18302A" : "#557A68"}" stroke-width="1.2" opacity=".6"/>`).join("")
      + `<defs><filter id="mb${seed % 997}" x="-20%" y="-200%" width="140%" height="500%"><feGaussianBlur stdDeviation="5"/></filter></defs><g class="mist" filter="url(#mb${seed % 997})" style="animation-delay:${phaseDelay(40)}"><ellipse cx="80" cy="112" rx="150" ry="9" fill="#fff" opacity=".55"/><ellipse cx="320" cy="92" rx="130" ry="7" fill="#fff" opacity=".45"/><ellipse cx="200" cy="128" rx="220" ry="10" fill="#fff" opacity=".5"/></g>`
      : ridge("L0 96 Q18 42 36 60 Q46 26 62 34 Q74 44 80 82 Q92 52 110 62 Q126 30 140 40 Q152 54 156 96 L170 96 Q186 36 204 42 Q216 48 220 92 L236 92 Q252 30 268 34 Q282 40 286 90 L300 90 Q316 50 332 56 Q346 28 362 36 Q376 46 380 92 L400 92", n ? "#1E3A33" : "#6FB08E", 120)
        + ridge("L40 120 Q56 70 74 68 Q88 70 92 120 L250 120 Q262 76 280 74 Q296 76 300 120", n ? "#183028" : "#2E7D5B", 120);
    if (v === "rice") s += `<rect y="118" width="400" height="32" fill="${n ? "#1F3A24" : "#9CCB6A"}"/>` + water(130, "#7DBFB0", "#4C9C8E", n) + boat(136, n);
    else if (v === "river") s += water(124, "#3F9C8E", "#2B7D73", n) + `<path d="M170 124 q30 -40 60 0z" fill="${n ? "#0A1814" : "#22362F"}"/>` + boat(132, n);
    else if (!tall) s += water(118, "#3FA6A8", "#2B8597", n) + boat(126, n, v === "sea" ? "ferry" : "sampan");
    return s;
  },
  mountains(h, n, v) {
    let s = ridge("L0 96 L40 60 L70 76 L110 30 L130 42 L150 22 L180 58 L220 40 L260 70 L300 26 L330 44 L360 34 L400 70", n ? "#1E2A3E" : "#8FA7B8", 150)
      + `<path d="M104 36 L110 30 L130 42 L150 22 L160 34 L148 32 L136 46 L124 40Z M294 32 L300 26 L316 36 L308 36Z" fill="#fff" opacity="${n ? 0.5 : 0.9}"/>`;
    if (v === "gorge") s += ridge("L0 70 L60 100 L120 150", n ? "#16222F" : "#5E7F70", 150) + ridge("L280 150 L330 96 L400 60", n ? "#16222F" : "#5E7F70", 150) + `<path d="M150 150 q50 -12 100 0" fill="${n ? "#2B4A5E" : "#B88A5A"}"/>`;
    else if (v === "lake") s += ridge("L0 110 Q80 90 160 108 Q260 88 400 104", n ? "#1C3328" : "#5E9C7C", 150) + water(114, "#6FB7C6", "#4A97A8", n) + boat(124, n);
    else s += ridge("L0 112 Q100 96 200 110 Q300 96 400 108", n ? "#1C3328" : "#9CBF7A", 150);
    if (v === "flags") s += `<path d="M20 70 Q110 96 200 76" stroke="${n ? "#556" : "#888"}" stroke-width=".8" fill="none"/>` + ["#3B6FD4", "#fff", "#D7352B", "#2F9E55", "#F2C230"].flatMap((c, k) => [0, 5, 10, 15].map((j) => { const t = (k + j) / 20, x = 20 + 180 * t, y = 70 + 26 * 4 * t * (1 - t) - 6 * t; return `<path d="M${x.toFixed(0)} ${y.toFixed(0)} l6 0 l-3 9z" fill="${c}" class="flag" style="animation-delay:-${r(0, 2).toFixed(1)}s"/>`; })).join("")
      + `<path d="M300 112 l12 -18 l12 18z M306 94 h12 l-6 -14z" fill="${n ? "#C9A54A" : "#F1D27A"}"/>`;
    return s;
  },
  town(h, n, v) {
    const lant = v === "hoian";
    let s = ridge("L0 96 Q60 70 120 88 Q200 64 280 86 Q340 72 400 90", n ? "#1C2E28" : "#8CC5A4", 120);
    s += [10, 58, 104, 150, 196, 242, 288, 334, 368].map((x, i) => { const w = 40, top = 78 + (i % 3) * 6, col = lant ? (n ? "#6A5A2E" : "#F2C94C") : (n ? "#3A2A20" : "#8A5A3A");
      return `<rect x="${x}" y="${top}" width="${w}" height="${116 - top}" fill="${col}"/><path d="M${x - 4} ${top} L${x + w / 2} ${top - 14} L${x + w + 4} ${top}Z" fill="${n ? "#3A2620" : lant ? "#9A4A2A" : "#4A3A30"}"/>${lant ? "" : `<path d="M${x + 6} 116v10M${x + w - 6} 116v10" stroke="${col}" stroke-width="2"/>`}<rect x="${x + 12}" y="${top + 10}" width="8" height="8" fill="${n ? "#FFC85A" : "#F3EFE4"}" opacity="${n ? 0.9 : 0.8}"/>`; }).join("");
    s += water(122, "#4A9C8E", "#2B7D73", n);
    if (n || lant) s += [40, 96, 150, 214, 270, 330].map((x, i) => `<circle cx="${x}" cy="${72 + (i % 2) * 6}" r="3.2" fill="#F0775A" class="lantern" style="animation-delay:-${r(0, 3).toFixed(1)}s"/>`).join("");
    if (n) s += Array.from({ length: 7 }, (_, i) => `<g class="rise" style="animation-delay:-${(i * 2.3).toFixed(1)}s"><circle cx="${40 + i * 52}" cy="120" r="2.6" fill="#FFB347"/></g>`).join("")
      + Array.from({ length: 8 }, (_, i) => `<circle cx="${30 + i * 48}" cy="${134 + (i % 2) * 6}" r="1.8" fill="#FFD36B" class="glow"/>`).join("");
    else s += boat(130, n);
    return s;
  },
  waterfall(h, n) {
    return ridge("L0 60 Q40 50 80 56 L150 56 L150 150", n ? "#1E3A33" : "#4E8C6A", 150) + ridge("L250 150 L250 56 L320 52 Q360 48 400 58", n ? "#1E3A33" : "#4E8C6A", 150)
      + `<rect x="150" y="56" width="100" height="70" fill="${n ? "#5A7A9A" : "#DCEFF4"}"/>`
      + `<g class="fall" stroke="#fff" stroke-width="2" opacity=".8">${Array.from({ length: 12 }, (_, i) => `<path d="M${156 + i * 8} 56v70" stroke-dasharray="10 8" style="animation-delay:-${r(0, 1).toFixed(2)}s"/>`).join("")}</g>`
      + water(124, "#7FC6C9", "#4A97A8", n) + `<defs><filter id="wb${seed % 997}" x="-30%" y="-200%" width="160%" height="500%"><feGaussianBlur stdDeviation="4"/></filter></defs><g class="mist" filter="url(#wb${seed % 997})" style="animation-delay:${phaseDelay(40)}"><ellipse cx="200" cy="124" rx="80" ry="12" fill="#fff" opacity=".7"/></g>`;
  },
  terraces(h, n) {
    let s = ridge("L0 70 Q80 40 160 60 Q260 30 400 56", n ? "#1C3328" : "#5E9C7C", 150);
    for (let i = 0; i < 6; i++) s += `<path d="M0 ${80 + i * 12} Q100 ${70 + i * 12} 200 ${82 + i * 12} T400 ${78 + i * 12} V150 H0Z" fill="${n ? ["#1D3A24", "#1A3420"][i % 2] : ["#9CCB6A", "#7DB356"][i % 2]}"/>`;
    s += `<g transform="translate(300 76)"><rect x="0" y="0" width="34" height="18" fill="${n ? "#3A2A20" : "#9A6A3A"}"/><path d="M-6 0 L17 -14 L40 0Z" fill="${n ? "#2A1E18" : "#6A4A2A"}"/><path d="M4 18v8M30 18v8" stroke="${n ? "#3A2A20" : "#9A6A3A"}" stroke-width="2"/>${n ? `<rect x="12" y="5" width="8" height="7" fill="#FFC85A"/>` : ""}</g>`;
    if (n) s += Array.from({ length: 16 }, () => `<circle cx="${r(20, 380).toFixed(0)}" cy="${r(80, 140).toFixed(0)}" r="1.4" fill="#E8FF8A" class="firefly" style="animation-delay:-${r(0, 6).toFixed(1)}s;animation-duration:${r(4, 8).toFixed(1)}s"/>`).join("");
    return s;
  },
  temple(h, n, v) {
    if (v === "hanoi") return ridge("L0 100 Q100 90 200 98 Q300 88 400 98", n ? "#1C3328" : "#7DB356", 116) + `<g fill="${n ? "#1A2638" : "#5E7F8C"}"><rect x="20" y="64" width="40" height="40"/><rect x="330" y="58" width="50" height="46"/></g>`
      + water(104, "#6FB7A8", "#4A978A", n) + `<path d="M120 104 Q170 82 220 104" stroke="#D7352B" stroke-width="5" fill="none"/><g transform="translate(240 80)"><rect x="0" y="8" width="40" height="18" fill="${n ? "#5A2A20" : "#C9462B"}"/><path d="M-6 8 L20 -6 L46 8Z" fill="${n ? "#3A2620" : "#7A2A1A"}"/></g>${n ? `<circle cx="140" cy="96" r="2" fill="#FFD36B" class="glow"/><circle cx="200" cy="96" r="2" fill="#FFD36B" class="glow"/>` : ""}`;
    const col = n ? "#14202E" : h < 8 ? "#3A2A3A" : "#5A5A5A";
    const tower = (x, ht, w) => `<path d="M${x - w} 112 L${x - w * 0.7} ${112 - ht * 0.5} L${x - w * 0.45} ${112 - ht * 0.8} L${x} ${112 - ht} L${x + w * 0.45} ${112 - ht * 0.8} L${x + w * 0.7} ${112 - ht * 0.5} L${x + w} 112Z" fill="${col}"/>`;
    return `<rect y="104" width="400" height="10" fill="${col}"/>` + tower(120, 40, 16) + tower(160, 52, 18) + tower(200, 70, 22) + tower(240, 52, 18) + tower(280, 40, 16)
      + water(114, "#5A8A8A", "#3A6A6A", n) + `<g opacity=".35" transform="translate(0 228) scale(1 -1)">${tower(160, 52, 18)}${tower(200, 70, 22)}${tower(240, 52, 18)}</g>`;
  },
  beach(h, n, v) {
    let s = water(84, "#3FB0C4", "#1F8FA8", n) + `<path d="M0 118 Q120 104 240 116 Q330 124 400 112 V150 H0Z" fill="${n ? "#3A3A30" : "#F3DFAE"}"/>`;
    if (v === "rocks") s += `<path d="M300 118 q20 -30 44 -12 q20 -16 40 6 q10 4 16 6z" fill="${n ? "#1E2A2E" : "#6F7A7A"}"/>`;
    else s += ridge("L250 84 Q290 40 330 54 Q360 30 400 50", n ? "#1C3328" : "#3F8A62", 84);
    s += `<g class="palm" style="transform-origin:62px 120px"><path d="M62 120 Q58 90 70 62" stroke="${n ? "#2A2018" : "#7A5A3A"}" stroke-width="4" fill="none"/><g fill="${n ? "#1C3328" : "#2E8A52"}" transform="translate(70 62)"><path d="M0 0 q-30 -6 -40 10 q20 -12 40 -10z"/><path d="M0 0 q30 -8 40 8 q-20 -10 -40 -8z"/><path d="M0 0 q-10 -24 -30 -26 q16 8 30 26z"/><path d="M0 0 q14 -22 34 -22 q-18 6 -34 22z"/></g></g>`;
    if (v === "turtle") s += `<g class="turtle"><g transform="translate(0 100)"><ellipse cx="0" cy="0" rx="7" ry="4" fill="${n ? "#2A4A3A" : "#3F7A4A"}"/><circle cx="8" cy="-1" r="2" fill="${n ? "#2A4A3A" : "#5A9A5A"}"/></g></g>`;
    return s;
  },
};
const STAGE_SCENE = {
  hongkong: ["city", "hk"], zhangjiajie: ["karst", "zjj"], furong: ["waterfall"], fenghuang: ["town", "stilt"], huangguoshu: ["waterfall"], gorges: ["mountains", "gorge"],
  shangrila: ["mountains", "flags"], dali: ["mountains", "lake"], kunming: ["mountains", "lake"], hanoi: ["temple", "hanoi"], croisiere: ["karst", "sea"],
  ninhbinh: ["karst", "rice"], puluong: ["terraces"], phongnha: ["karst", "river"], hoian: ["town", "hoian"], quynhon: ["beach", "rocks"],
  hcmc: ["city", "hcmc"], siemreap: ["temple", "angkor"], kl1: ["city", "kl"], kl2: ["city", "kl"], tioman: ["beach", "turtle"],
};
export function scene(stageId, hour, id = "sc") {
  const [kind, v] = STAGE_SCENE[stageId] || ["home"];
  seed = [...String(stageId)].reduce((a, c) => (a * 31 + c.charCodeAt(0)) % 2147483647, 7) || 7;
  const sk = sky(hour, id);
  return `<svg class="landscape scene scene-${kind}" viewBox="0 0 400 150" preserveAspectRatio="xMidYMax slice" aria-hidden="true">${sk.svg}${SCENES[kind](hour, sk.night, v)}</svg>`;
}
