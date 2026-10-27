// Lecture des confirmations PDF dans l'appli (sans IA) : numéro, date, heure, prix, adresse
let loading = null;
function loadPdfJs() {
  if (window.pdfjsLib) return Promise.resolve(window.pdfjsLib);
  return (loading ||= new Promise((res, rej) => {
    const s = document.createElement("script"); s.src = "./pdfjs/pdf.min.js";
    s.onload = () => { window.pdfjsLib.GlobalWorkerOptions.workerSrc = "./pdfjs/pdf.worker.min.js"; res(window.pdfjsLib); };
    s.onerror = () => { loading = null; rej(new Error("lecteur PDF indisponible hors ligne")); };
    document.head.appendChild(s);
  }));
}
export async function pdfText(file) {
  const lib = await loadPdfJs();
  const doc = await lib.getDocument({ data: new Uint8Array(await file.arrayBuffer()) }).promise;
  let out = "";
  for (let p = 1; p <= Math.min(doc.numPages, 6); p++) {
    const tc = await (await doc.getPage(p)).getTextContent();
    out += tc.items.map((i) => i.str + (i.hasEOL ? "\n" : " ")).join("") + "\n";
  }
  return out.replace(/[ \t ]+/g, " ");
}

const MONTHS = { jan: 1, janv: 1, janvier: 1, january: 1, feb: 2, fev: 2, "fév": 2, "févr": 2, fevrier: 2, "février": 2, february: 2, mar: 3, mars: 3, march: 3, apr: 4, avr: 4, avril: 4, april: 4, may: 5, mai: 5,
  jun: 6, juin: 6, june: 6, jul: 7, juil: 7, juillet: 7, july: 7, aug: 8, aout: 8, "août": 8, august: 8, sep: 9, sept: 9, septembre: 9, september: 9, oct: 10, octobre: 10, october: 10, nov: 11, novembre: 11, november: 11, dec: 12, "déc": 12, decembre: 12, "décembre": 12, december: 12 };
const pad = (n) => String(n).padStart(2, "0");

function findDates(txt) {
  const found = [];
  const push = (y, m, d, idx) => { y = +y; if (y < 100) y += 2000; m = +m; d = +d; if (m >= 1 && m <= 12 && d >= 1 && d <= 31) found.push({ iso: `${y}-${pad(m)}-${pad(d)}`, idx }); };
  for (const m of txt.matchAll(/\b(20\d\d)[-/.](\d{1,2})[-/.](\d{1,2})\b/g)) push(m[1], m[2], m[3], m.index);
  for (const m of txt.matchAll(/\b(\d{1,2})[/.](\d{1,2})[/.](20\d\d|\d\d)\b/g)) push(m[3], m[2], m[1], m.index);
  for (const m of txt.matchAll(/\b(\d{1,2})(?:er)?\s+([a-zéû]{3,9})\.?,?\s+(20\d\d)\b/gi)) { const mo = MONTHS[m[2].toLowerCase()]; if (mo) push(m[3], mo, m[1], m.index); }
  for (const m of txt.matchAll(/\b([a-zéû]{3,9})\.?\s+(\d{1,2}),?\s+(20\d\d)\b/gi)) { const mo = MONTHS[m[1].toLowerCase()]; if (mo) push(m[3], mo, m[2], m.index); }
  for (const m of txt.matchAll(/(\d{4})年(\d{1,2})月(\d{1,2})日/g)) push(m[1], m[2], m[3], m.index);
  return found.sort((a, b) => a.idx - b.idx);
}

export function parseConfirmation(txt, { start, end, rates }) {
  const out = {}, low = txt.toLowerCase();
  // numéro de réservation
  const refRe = /(?:n[°º]|num[ée]ro|number|no\.|code|r[ée]f[ée]rence|reference|booking id|confirmation|pnr|itin[ée]raire|order)\s*(?:de\s+)?(?:r[ée]servation|booking|confirmation|commande|dossier)?\s*[:#]?\s*([A-Z0-9][A-Z0-9-]{4,19})\b/gi;
  for (const m of txt.matchAll(refRe)) { if (/\d/.test(m[1]) && !/^(19|20)\d\d$/.test(m[1])) { out.ref = m[1]; break; } }
  // date dans la période du voyage (de préférence après « arrivée », « check-in », « départ »)
  const dates = findDates(txt).filter((d) => d.iso >= start && d.iso <= end);
  if (dates.length) {
    const kw = [...low.matchAll(/arriv[ée]e|check-?in|d[ée]part|departure|date du voyage|travel date|date de s[ée]jour|入住/g)].map((m) => m.index);
    const near = dates.find((d) => kw.some((k) => d.idx > k && d.idx - k < 80));
    out.date = (near || dates[0]).iso;
    const after = txt.slice((near || dates[0]).idx, (near || dates[0]).idx + 120).match(/\b([01]?\d|2[0-3])[:h]([0-5]\d)\b/);
    if (after) out.time = `${pad(after[1])}:${after[2]}`;
  }
  // montant payé (converti en euros)
  const CUR = { "€": "EUR", eur: "EUR", hkd: "HKD", "hk$": "HKD", cny: "CNY", rmb: "CNY", "¥": "CNY", "￥": "CNY", vnd: "VND", "₫": "VND", usd: "USD", "us$": "USD", "$": "USD", myr: "MYR", rm: "MYR", khr: "KHR" };
  const amounts = [];
  const num = (s) => { s = s.replace(/\s/g, ""); if (/,\d{2}$/.test(s)) s = s.replace(/\./g, "").replace(",", "."); else s = s.replace(/,/g, ""); return parseFloat(s); };
  for (const m of txt.matchAll(/(€|eur|hkd|hk\$|cny|rmb|¥|￥|vnd|₫|usd|us\$|myr|rm)\s?(\d[\d\s.,]*\d|\d)/gi)) amounts.push({ cur: CUR[m[1].toLowerCase()], v: num(m[2]), idx: m.index });
  for (const m of txt.matchAll(/(\d[\d\s.,]*\d|\d)\s?(€|eur|hkd|cny|rmb|元|vnd|₫|đ|usd|myr)\b/gi)) amounts.push({ cur: CUR[m[2].toLowerCase()] || (m[2] === "元" ? "CNY" : "VND"), v: num(m[1]), idx: m.index });
  const valid = amounts.filter((a) => a.cur && a.v > 0 && a.v < 1e9);
  if (valid.length) {
    const kw = [...low.matchAll(/total|montant|prix|price|pay[ée]|paid|amount|à payer|charged|tarif/g)].map((m) => m.index);
    const near = valid.filter((a) => kw.some((k) => a.idx >= k && a.idx - k < 60));
    const toE = (a) => a.v / ((rates || {})[a.cur] || 1);
    const pick = (near.length ? near : valid).reduce((a, b) => (toE(b) > toE(a) ? b : a));
    out.paid = Math.round(toE(pick) * 100) / 100; out.paidCur = pick.cur; out.paidRaw = pick.v;
  }
  // adresse
  const adr = txt.match(/(?:adresse|address)\s*[:：]?\s*([^\n]{8,120})/i);
  if (adr) out.place = adr[1].trim();
  const cjk = txt.match(/[一-鿿][一-鿿0-9\-号號路街道区區县縣市镇鎮村巷弄楼樓]{5,40}/);
  if (cjk && /[路街道号號区區]/.test(cjk[0])) out.localAddr = cjk[0];
  return out;
}
