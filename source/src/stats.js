// Trajets du voyage pour les statistiques : [de, vers, mode, date, nuit à bord]
import { LL } from "./mapdata.js";
const NICE = [43.66, 7.21];
export const LEGS = [
  ["nice", "hongkong", "vol", "2027-06-27", 1],
  ["hongkong", "zhangjiajie", "train", "2027-06-30"],
  ["zhangjiajie", "fenghuang", "train", "2027-07-03"],
  ["fenghuang", "huangguoshu", "train", "2027-07-05"],
  ["huangguoshu", "kunming", "train", "2027-07-06"],
  ["kunming", "gorges", "train", "2027-07-06", 1],
  ["gorges", "shangrila", "bus", "2027-07-08"],
  ["shangrila", "dali", "train", "2027-07-10"],
  ["dali", "kunming", "train", "2027-07-12"],
  ["kunming", "hanoi", "vol", "2027-07-13"],
  ["hanoi", "croisiere", "bateau", "2027-07-16"],
  ["croisiere", "ninhbinh", "bus", "2027-07-17"],
  ["ninhbinh", "puluong", "moto", "2027-07-18"],
  ["puluong", "ninhbinh", "moto", "2027-07-20"],
  ["ninhbinh", "phongnha", "train", "2027-07-22", 1],
  ["phongnha", "hoian", "train", "2027-07-26"],
  ["hoian", "quynhon", "train", "2027-07-30"],
  ["quynhon", "hcmc", "train", "2027-08-01", 1],
  ["hcmc", "siemreap", "vol", "2027-08-06"],
  ["siemreap", "kl1", "vol", "2027-08-10"],
  ["kl1", "tioman", "bateau", "2027-08-11"],
  ["tioman", "kl2", "bateau", "2027-08-17"],
  ["kl2", "nice", "vol", "2027-08-19", 1],
];
const ll = (id) => (id === "nice" ? NICE : LL[id]);
function hav([a, b], [c, d]) {
  const r = Math.PI / 180, dLat = (c - a) * r, dLon = (d - b) * r;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a * r) * Math.cos(c * r) * Math.sin(dLon / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.sqrt(h));
}
// distance approximative : à vol d'oiseau pour l'avion, +30 % par la route ou le rail
export const legKm = ([f, t, mode]) => Math.round(hav(ll(f), ll(t)) * (mode === "vol" ? 1 : 1.3));
