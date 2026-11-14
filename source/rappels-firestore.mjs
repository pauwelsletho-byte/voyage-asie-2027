// Régénère rappels.ics avec les échéances (annulation, paiement) lues dans Firestore.
// Lancé par GitHub Actions toutes les heures (secret FIREBASE_SERVICE_ACCOUNT).
import { writeFileSync } from "fs";
import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { buildIcs } from "./src/ics.js";

const sa = process.env.FIREBASE_SERVICE_ACCOUNT;
if (!sa) { console.log("Pas de clé FIREBASE_SERVICE_ACCOUNT : rien à faire."); process.exit(0); }
initializeApp({ credential: cert(JSON.parse(sa)) });
const snap = await getFirestore().collection("trips/asie-2027/resas").get();
const resas = snap.docs.map((d) => ({ id: d.id, ...d.data() })).filter((r) => r.cancelBy || r.payOn);
writeFileSync(process.argv[2] || "../rappels.ics", buildIcs("https://pauwelsletho-byte.github.io/voyage-asie-2027/", resas, new Date("2026-01-01T00:00:00Z")));
console.log(`rappels.ics : ${resas.length} réservation(s) avec échéance.`);
