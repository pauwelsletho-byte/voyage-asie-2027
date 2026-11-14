// Trajets du voyage : [de, vers, mode, date, nuit à bord, durée estimée]
import { LL } from "./mapdata.js";
const NICE = [43.66, 7.21];
export const LEGS = [
  ["nice", "hongkong", "vol", "2027-06-25", 1, "≈ 18 h avec l'escale"],
  ["hongkong", "zhangjiajie", "train", "2027-06-29", 0, "6 h 40 de train"],
  ["zhangjiajie", "furong", "train", "2027-07-02", 0, "23 min de train + 30 min de taxi"],
  ["furong", "fenghuang", "train", "2027-07-03", 0, "35-45 min de train"],
  ["fenghuang", "huangguoshu", "train", "2027-07-05", 0, "5 à 6 h (trains + bus)"],
  ["huangguoshu", "kunming", "train", "2027-07-06", 0, "≈ 3 h 30 (bus + train)"],
  ["kunming", "gorges", "train", "2027-07-06", 1, "10 h 30 de nuit + ≈ 2 h de bus"],
  ["gorges", "shangrila", "bus", "2027-07-08", 0, "≈ 3 h 30 (minibus + bus)"],
  ["shangrila", "dali", "train", "2027-07-10", 0, "≈ 3 h de train"],
  ["dali", "kunming", "train", "2027-07-12", 0, "≈ 2 h de train"],
  ["kunming", "hanoi", "vol", "2027-07-13", 0, "≈ 1 h de vol"],
  ["hanoi", "croisiere", "bateau", "2027-07-16", 0, "≈ 3 h de transfert"],
  ["croisiere", "ninhbinh", "bus", "2027-07-17", 0, "≈ 4 h de navette"],
  ["ninhbinh", "puluong", "moto", "2027-07-18", 0, "≈ 3 h de moto"],
  ["puluong", "ninhbinh", "moto", "2027-07-20", 0, "≈ 3 h de moto"],
  ["ninhbinh", "phongnha", "train", "2027-07-22", 1, "≈ 8 h de nuit + 45 min de taxi"],
  ["phongnha", "hoian", "train", "2027-07-26", 0, "≈ 7 h (taxi + train + taxi)"],
  ["hoian", "quynhon", "train", "2027-07-30", 0, "5 à 6 h de train"],
  ["quynhon", "hcmc", "train", "2027-08-01", 1, "≈ 11 h de nuit"],
  ["hcmc", "siemreap", "vol", "2027-08-06", 0, "≈ 1 h de vol + 1 h de navette"],
  ["siemreap", "kl1", "vol", "2027-08-10", 0, "≈ 2 h de vol"],
  ["kl1", "tioman", "bateau", "2027-08-11", 0, "5-6 h de bus + 2 h de ferry"],
  ["tioman", "kl2", "bateau", "2027-08-17", 0, "8 à 9 h (ferry + bus)"],
  ["kl2", "nice", "vol", "2027-08-18", 1, "≈ 17 h avec l'escale"],
];
const ll = (id) => (id === "nice" ? NICE : LL[id]);
function hav([a, b], [c, d]) {
  const r = Math.PI / 180, dLat = (c - a) * r, dLon = (d - b) * r;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a * r) * Math.cos(c * r) * Math.sin(dLon / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.sqrt(h));
}
// distance approximative : à vol d'oiseau pour l'avion, +30 % par la route ou le rail
export const legKm = ([f, t, mode]) => Math.round(hav(ll(f), ll(t)) * (mode === "vol" ? 1 : 1.3));
