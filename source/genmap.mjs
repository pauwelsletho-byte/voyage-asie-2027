// Génère la carte (SVG précalculé) à partir de Natural Earth 1:50m
import { readFileSync, writeFileSync } from "fs";
import { feature } from "topojson-client";
import { geoMercator, geoPath } from "d3-geo";
const topo = JSON.parse(readFileSync("node_modules/world-atlas/countries-50m.json", "utf8"));
const countries = feature(topo, topo.objects.countries).features;
const W = 360, H = 520;
const bbox = { type: "Feature", geometry: { type: "MultiPoint", coordinates: [[97.6, 1.6], [116.2, 30.3]] } };
const proj = geoMercator().fitExtent([[6, 6], [W - 6, H - 6]], bbox).clipExtent([[-2, -2], [W + 2, H + 2]]);
const path = geoPath(proj).digits(0);
const VISITED = { "Hong Kong": "hk", China: "cn", Vietnam: "vn", Cambodia: "kh", Malaysia: "my" };
const land = [], visited = {};
for (const f of countries) {
  const n = f.properties.name;
  const d = path(f); if (!d) continue;
  if (VISITED[n]) visited[VISITED[n]] = (visited[VISITED[n]] || "") + d; else land.push(d);
}
const P = {
  hongkong: [114.17, 22.3], zhangjiajie: [110.48, 29.2], fenghuang: [109.6, 27.95], huangguoshu: [105.67, 25.99],
  gorges: [100.1, 27.2], shangrila: [99.7, 27.83], dali: [100.16, 25.69], kunming: [102.71, 25.04],
  hanoi: [105.85, 21.03], croisiere: [107.05, 20.75], ninhbinh: [105.97, 20.25], puluong: [105.1, 20.46],
  phongnha: [106.28, 17.59], hoian: [108.33, 15.88], quynhon: [109.22, 13.78], hcmc: [106.7, 10.78],
  siemreap: [103.86, 13.36], kl1: [101.69, 3.14], tioman: [104.16, 2.82], kl2: [101.69, 3.14],
};
const pts = Object.fromEntries(Object.entries(P).map(([k, ll]) => [k, proj(ll).map((v) => Math.round(v * 10) / 10)]));
// un peu de clipping : on ne garde que ce qui touche le cadre (le SVG le coupe de toute façon)
writeFileSync("src/mapdata.js", `// généré par genmap.mjs (Natural Earth 1:50m, domaine public)
export const MAP_W = ${W}, MAP_H = ${H};
export const LAND = ${JSON.stringify(land.join(""))};
export const VISITED = ${JSON.stringify(visited)};
export const PTS = ${JSON.stringify(pts)};
`);
console.log("ok", Math.round(readFileSync("src/mapdata.js").length / 1024) + " Ko");
