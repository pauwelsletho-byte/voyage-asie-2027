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
  // sans année : « 18 juin », « Jun 18 » → 2027 pendant le voyage, sinon la prochaine occurrence
  const yearFor = (mo, d) => { if (mo >= 6 && mo <= 8) return 2027; const now = new Date(), y = now.getFullYear(); return new Date(y, mo - 1, d) < now ? y + 1 : y; };
  const taken = (idx) => found.some((f) => Math.abs(f.idx - idx) < 3);
  for (const m of txt.matchAll(/\b(\d{1,2})(?:er)?\s+([a-zéû]{3,9})\.?(?!\.?,?\s+(?:20\d\d))/gi)) { const mo = MONTHS[m[2].toLowerCase()]; if (mo && !taken(m.index)) push(yearFor(mo, +m[1]), mo, m[1], m.index); }
  for (const m of txt.matchAll(/\b([a-zéû]{3,9})\.?\s+(\d{1,2})\b(?!,?\s+20\d\d)/gi)) { const mo = MONTHS[m[1].toLowerCase()]; if (mo && !taken(m.index)) push(yearFor(mo, +m[2]), mo, m[2], m.index); }
  return found.sort((a, b) => a.idx - b.idx);
}

export function parseConfirmation(txt, { start, end, rates }) {
  const out = {}, low = txt.toLowerCase();
  // numéro de réservation
  const refRe = /(?:n[°º]|num[ée]ro|number|no\.|code|r[ée]f[ée]rence|reference|booking id|confirmation|pnr|itin[ée]raire|order)\s*(?:de\s+)?(?:r[ée]servation|booking|confirmation|commande|dossier)?\s*[:#]?\s*([A-Z0-9][A-Z0-9.-]{4,19}[A-Z0-9])\b/gi;
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
  const num = (s) => { s = s.replace(/[ \u00a0\u202f]/g, ""); if (/,\d{1,2}$/.test(s)) s = s.replace(/\./g, "").replace(",", "."); else if (/\.\d{3}$/.test(s) && !/\.\d{1,2}$/.test(s)) s = s.replace(/\./g, ""); else s = s.replace(/,/g, ""); return parseFloat(s); };
  // un seul nombre : milliers séparés par espace, point ou virgule (groupes de 3 chiffres), décimales éventuelles
  const N = "(\\d{1,3}(?:[ \\u00a0\\u202f.,]\\d{3})+(?:[.,]\\d{1,2})?|\\d+(?:[.,]\\d{1,2})?)";
  for (const m of txt.matchAll(new RegExp("(€|eur|hkd|hk\\$|cny|rmb|¥|￥|vnd|₫|usd|us\\$|myr|rm)[ \\u00a0]?" + N + "(?![\\d])", "gi"))) amounts.push({ cur: CUR[m[1].toLowerCase()], v: num(m[2]), idx: m.index });
  for (const m of txt.matchAll(new RegExp("(?<![\\d.,])" + N + "[ \\u00a0]?(€|eur|hkd|cny|rmb|元|vnd|₫|đ|usd|myr)(?![a-z])", "gi"))) amounts.push({ cur: CUR[m[2].toLowerCase()] || (m[2] === "元" ? "CNY" : "VND"), v: num(m[1]), idx: m.index });
  const valid = amounts.filter((a) => a.cur && a.v > 0 && a.v < 1e9);
  if (valid.length) {
    const toE = (a) => a.v / ((rates || {})[a.cur] || 1);
    const after = (re, max) => { const ks = [...low.matchAll(re)].map((m) => m.index); return valid.filter((a) => ks.some((k) => a.idx >= k && a.idx - k < max)); };
    const tot = after(/prix total|montant total|total price|total amount|grand total|total à payer|total payé|total paid|total charged|total \(ttc\)|total ttc|总价|订单总额|\btotal\b/g, 50);
    const paidKw = after(/montant pay[ée]|vous avez pay[ée]|amount paid|you paid|paid|pay[ée]|à payer|amount due|montant|price|prix/g, 40);
    // dernier « total » du document (le récapitulatif final), sinon le plus grand montant lié à un mot-clé, sinon le plus grand tout court
    const pick = tot.length ? tot[tot.length - 1] : (paidKw.length ? paidKw : valid).reduce((a, b) => (toE(b) > toE(a) ? b : a));
    out.paid = Math.round(toE(pick) * 100) / 100; out.paidCur = pick.cur; out.paidRaw = pick.v;
  }
  // annulation gratuite et date de paiement (n'importe quelle date, pas forcément pendant le voyage)
  const all = findDates(txt);
  const after2 = (re, max = 140) => { for (const m of low.matchAll(re)) { const d = all.find((x) => x.idx > m.index && x.idx - m.index < max); if (d) return d.iso; } return null; };
  out.cancelBy = after2(/annulation gratuite|annuler gratuitement|annulable gratuitement|gratuitement jusqu|gratuit jusqu|sans frais (?:d'annulation )?jusqu|sans frais avant|annuler sans frais|annulation sans frais|free cancell?ation|cancel for free|cancel free|free of charge until|free of charge before|cancell?ation is free|without charge (?:until|before)|cancel (?:before|until|by)|免费取消|可免费取消/g, 160);
  out.payOn = after2(/vous paierez|vous serez débité|vous serez prélevé|sera débité|sera prélevé|débitera|prélèvement le|prélèvement prévu|paiement le|paiement prévu|payer le|à payer avant|à payer le|date de paiement|prépaiement le|pay on|you'?ll pay|you will pay|you will be charged|will be charged on|be charged on|payment (?:due|date|on|will be taken)|charged on|due date/g, 160);
  out.payOnSite = /paiement sur place|payer sur place|à régler sur place|réglerez sur place|paierez (?:à l'établissement|sur place|à l'hôtel)|payer à l'établissement|pay at the property|pay at (?:the )?hotel|pay on arrival|paiement à l'arrivée|到店付款|到店支付/.test(low) || undefined;
  if (out.payOnSite) delete out.payOn;
  // adresse
  const adr = txt.match(/(?:adresse|address)\s*[:：]?\s*([^\n]{8,120})/i);
  if (adr) out.place = adr[1].trim();
  const cjk = txt.match(/[一-鿿][一-鿿0-9\-号號路街道区區县縣市镇鎮村巷弄楼樓]{5,40}/);
  if (cjk && /[路街道号號区區]/.test(cjk[0])) out.localAddr = cjk[0];
  return out;
}
