// Calendrier des rappels (fichier rappels.ics, généré à la construction)
import { BOOKING, SITES } from "./booking.js";
const EXTRA = [
  ["2026-11-15", "Vérifier les passeports", "Valables jusqu'à fin février 2028, 2 pages vierges."],
  ["2027-01-15", "Demander le permis international", "Sur ants.gouv.fr, gratuit, catégorie A pour la moto."],
  ["2027-03-15", "Vérifier l'exemption de visa chinoise pour 2027", "Sinon, prévoir la demande de visa en mai."],
  ["2027-04-15", "Rendez-vous vaccins", "Centre de vaccinations internationales : hépatite A, typhoïde, rappel DTP."],
  ["2027-06-01", "Théorie PADI en ligne", "8 à 12 h, plus le questionnaire médical."],
  ["2027-06-15", "Alipay, VPN, eSIM, Grab", "Relier Alipay à la carte, tester le VPN, installer l'eSIM et Grab."],
  ["2027-06-20", "Inscription sur Ariane", "Site du ministère des Affaires étrangères."],
  ["2027-06-24", "Météo et typhons", "Regarder MyObservatory avant le départ pour Hong Kong."],
];
const esc = (s) => String(s).replace(/\\/g, "\\\\").replace(/;/g, "\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
const fold = (l) => { const out = []; let s = l; while (s.length > 72) { out.push(s.slice(0, 72)); s = " " + s.slice(72); } out.push(s); return out.join("\r\n"); };
export function buildIcs(appUrl) {
  const byDate = {};
  for (const [title, [from, when, sites, tip]] of Object.entries(BOOKING)) {
    (byDate[from] ||= []).push(`• ${title} (${when})${sites.length ? " : " + sites.map((k) => SITES[k]?.[0]).filter(Boolean).join(", ") : ""}${tip ? ". " + tip : ""}`);
  }
  const ev = [];
  const stamp = new Date().toISOString().replace(/[-:]/g, "").slice(0, 15) + "Z";
  const add = (date, summary, desc, uid) => {
    const d = date.replace(/-/g, ""), n = new Date(date + "T12:00:00Z"); n.setUTCDate(n.getUTCDate() + 1);
    ev.push(["BEGIN:VEVENT", `UID:${uid}@asie2027`, `DTSTAMP:${stamp}`, `DTSTART;VALUE=DATE:${d}`, `DTEND;VALUE=DATE:${n.toISOString().slice(0, 10).replace(/-/g, "")}`,
      `SUMMARY:${esc(summary)}`, `DESCRIPTION:${esc(desc + "\n\nDétails et liens dans l'appli : " + appUrl)}`, `URL:${appUrl}`, "TRANSP:TRANSPARENT",
      "BEGIN:VALARM", "ACTION:DISPLAY", `DESCRIPTION:${esc(summary)}`, "TRIGGER:PT9H", "END:VALARM", "END:VEVENT"].map(fold).join("\r\n"));
  };
  Object.keys(byDate).sort().forEach((date) => {
    const items = byDate[date];
    add(date, items.length > 1 ? `Asie 2027 : ${items.length} réservations à faire` : `Asie 2027 : ${items[0].slice(2).split(" (")[0]}`, "À réserver :\n" + items.join("\n"), "resa-" + date);
  });
  EXTRA.forEach(([date, t, d], i) => add(date, "Asie 2027 : " + t, d, "prep-" + i));
  return ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Asie 2027//FR", "CALSCALE:GREGORIAN", "METHOD:PUBLISH",
    "X-WR-CALNAME:Asie 2027 · rappels", "X-WR-TIMEZONE:Europe/Paris", "REFRESH-INTERVAL;VALUE=DURATION:P1D", ...ev, "END:VCALENDAR", ""].join("\r\n");
}
