// Quand et où réserver chaque élément prévu (repris du calendrier des préparatifs)
export const SITES = {
  gflights: ["Google Flights", "https://www.google.com/travel/flights"],
  skyscanner: ["Skyscanner", "https://www.skyscanner.fr"],
  booking: ["Booking", "https://www.booking.com"],
  agoda: ["Agoda", "https://www.agoda.com/fr-fr/"],
  trip: ["Trip.com", "https://fr.trip.com"],
  trains: ["Trains Trip.com", "https://fr.trip.com/trains/china/"],
  c12306: ["12306", "https://www.12306.cn/en/index.html"],
  vna: ["Vietnam Airlines", "https://www.vietnamairlines.com/fr/fr/"],
  ceair: ["China Eastern", "https://us.ceair.com/fr/"],
  airasia: ["AirAsia", "https://www.airasia.com/fr/fr"],
  klook: ["Klook", "https://www.klook.com/fr/"],
  gyg: ["GetYourGuide", "https://www.getyourguide.fr"],
  oxalis: ["Oxalis", "https://oxalis.com.vn"],
  dsvn: ["dsvn.vn", "https://dsvn.vn"],
  g12go: ["12Go", "https://12go.asia/fr"],
  baolau: ["Baolau", "https://www.baolau.com/fr"],
  easybook: ["Easybook", "https://www.easybook.com/fr-fr"],
  evisa: ["evisa.gov.kh", "https://www.evisa.gov.kh"],
  mdac: ["MDAC", "https://imigresen-online.imi.gov.my/mdac/main"],
  ants: ["ANTS", "https://ants.gouv.fr"],
  whatsapp: ["WhatsApp", "https://wa.me/"],
};

const H_CN = ["booking", "agoda", "trip"], H = ["booking", "agoda"];
const TR_CN = ["trains", "c12306"], TR_VN = ["dsvn", "g12go", "baolau"];

// titre de la réservation → [à partir du (AAAA-MM-JJ), quand, sites, conseil]
export const BOOKING = {
  "Vol Nice → Hong Kong": ["2026-12-01", "Décembre à mars, avant avril", ["gflights", "skyscanner"], "Escale sur le même billet, bagage en soute inclus. Alerte de prix dès maintenant."],
  "Vol Kuala Lumpur → Nice": ["2026-12-01", "Décembre à mars, avant avril", ["gflights", "skyscanner"], "Idéalement sur le même billet que l'aller."],
  "Assurance voyage": ["2026-12-01", "Dès l'achat des vols", [], "Annulation, santé, rapatriement, météo. Vérifier d'abord ce que couvre la carte bancaire."],
  "Hôtel Hong Kong (2 nuits)": ["2027-04-01", "Avril", H_CN, "Annulation gratuite si possible."],
  "Train G6080 Hong Kong → Zhangjiajie-Ouest": ["2027-06-01", "Demande dès début juin, ventes vers le 15 juin", TR_CN, "Un seul train par jour : déposer la demande sur Trip.com dès début juin, elle part à l'ouverture."],
  "Hôtel Zhangjiajie ville (1 nuit)": ["2027-04-01", "Avril", H_CN, "Vérifier que l'hôtel accepte les étrangers."],
  "Mont Tianmen (billet nominatif)": ["2027-06-27", "3 ou 4 jours avant", ["trip"], "Billet lié au passeport."],
  "Guesthouse Wulingyuan (2 nuits)": ["2027-04-01", "Avril", H_CN, "Vérifier que l'hôtel accepte les étrangers."],
  "Parc de Wulingyuan (billet 4 jours)": ["2027-06-28", "3 ou 4 jours avant", ["trip"], "Billet lié au passeport."],
  "Train Zhangjiajie → Fenghuang": ["2027-06-18", "Vers le 18 juin", TR_CN, "Ventes environ 15 jours avant."],
  "Auberge Fenghuang (2 nuits)": ["2027-04-01", "Avril", H_CN, "Chambre avec vue sur la rivière."],
  "Trains Fenghuang → Anshun": ["2027-06-20", "Vers le 20 juin", TR_CN, "Ventes environ 15 jours avant."],
  "Hôtel Huangguoshu (1 nuit)": ["2027-04-01", "Avril", H_CN, ""],
  "Train Anshun → Kunming": ["2027-06-21", "Vers le 21 juin", TR_CN, "À prendre en même temps que le train de nuit."],
  "Train de nuit Y752 Kunming → Lijiang": ["2027-06-21", "Vers le 21 juin", TR_CN, "Couchette molle (soft sleeper)."],
  "Halfway Guesthouse (1 nuit)": ["2027-04-01", "Avril", ["trip", "booking"], "Chambre avec vue, ça part vite en été."],
  "Hôtel Shangri-La (2 nuits)": ["2027-04-01", "Avril", H_CN, ""],
  "Train Shangri-La → Dali": ["2027-06-25", "Vers le 25 juin", TR_CN, "Ventes environ 15 jours avant."],
  "Guesthouse Dali (2 nuits)": ["2027-04-01", "Avril", H_CN, ""],
  "Train Dali → Kunming": ["2027-06-27", "Vers le 27 juin, le jour du départ", TR_CN, "Ventes environ 15 jours avant."],
  "Hôtel Kunming (1 nuit)": ["2027-04-01", "Avril", H_CN, ""],
  "Vol Kunming → Hanoi": ["2027-04-01", "Avril", ["gflights", "vna", "ceair"], ""],
  "Hôtel Hanoi (3 nuits)": ["2027-05-01", "Mai", H, ""],
  "Croisière baie de Lan Ha": ["2027-05-01", "Mai", ["klook", "gyg"], "Vérifier le remboursement en cas de typhon et le dépôt à Ninh Binh le 17."],
  "Bungalow Ninh Binh (3 nuits)": ["2027-04-01", "Avril", H, "Tam Cốc, avec piscine."],
  "Moto Ninh Binh (3 jours)": ["2027-07-04", "1 à 2 semaines avant (dès mai pour une 250)", ["whatsapp"], "Par WhatsApp avec l'hôtel ou un loueur de Ninh Binh."],
  "Bungalow Pù Luông (2 nuits)": ["2027-04-01", "Avril", H, ""],
  "Train de nuit SE1 Ninh Binh → Đồng Hới": ["2027-07-08", "1 à 2 semaines avant", TR_VN, "Couchette à 4."],
  "Guesthouse Phong Nha (3 nuits)": ["2027-05-01", "Mai", H, ""],
  "Excursion Tu Lan": ["2027-05-01", "Mai", ["oxalis"], "Places limitées."],
  "Train Đồng Hới → Đà Nẵng": ["2027-07-22", "Quelques jours avant", TR_VN, ""],
  "Villa Hội An (4 nuits)": ["2027-04-01", "Avril", H, "Avec piscine."],
  "Train Đà Nẵng → Diêu Trì": ["2027-07-26", "Quelques jours avant", TR_VN, ""],
  "Hôtel Quy Nhon (2 nuits)": ["2027-05-01", "Mai", H, ""],
  "Train de nuit SE1 Diêu Trì → Saigon": ["2027-07-18", "1 à 2 semaines avant", TR_VN, "Couchette à 4."],
  "Hôtel Hô Chi Minh-Ville (4 nuits)": ["2027-05-01", "Mai", H, ""],
  "Vol Hô Chi Minh-Ville → Siem Reap": ["2027-04-01", "Avril", ["gflights", "vna"], ""],
  "E-visa Cambodge": ["2027-06-01", "En juin ou en route, avant le 6 août", ["evisa"], "Valable 3 mois : pas avant mai."],
  "Hôtel Siem Reap (4 nuits)": ["2027-04-01", "Avril", H, "Hôtel-boutique avec piscine."],
  "Vol Siem Reap → Kuala Lumpur": ["2027-02-15", "Promo AirAsia fin février, sinon avril", ["airasia"], "Guetter les grosses promos (novembre, février)."],
  "Hôtel KL près de TBS (1 nuit)": ["2027-05-01", "Mai", H, "Près de la gare routière TBS."],
  "Carte d'arrivée Malaisie (MDAC)": ["2027-08-07", "Dans les 3 jours avant l'arrivée", ["mdac"], "Gratuit, uniquement sur le site officiel."],
  "Bus TBS → Mersing + ferry Tioman": ["2027-08-04", "Environ 1 semaine avant", ["g12go", "easybook"], "Horaires du ferry selon les marées."],
  "PADI Open Water": ["2027-05-01", "Mai (choisir le centre dès février)", [], "Récupérer le code de la théorie en ligne."],
  "Chalet Tioman (6 nuits)": ["2027-05-01", "Mai", H, "Salang ou Air Batang."],
  "Hôtel Kuala Lumpur (2 nuits)": ["2027-04-01", "Avril", H, "Piscine sur le toit."],
};

export function bookingFor(r) {
  const b = r && BOOKING[r.title];
  return b ? { from: b[0], when: b[1], sites: b[2].map((k) => SITES[k]).filter(Boolean), tip: b[3] } : null;
}

// Périodes de réservation, pour regrouper la liste « À faire »
export function bookingPeriod(from) {
  if (!from) return "Sans date";
  if (from < "2027-04-01") return "Décembre 2026 à mars 2027";
  if (from < "2027-05-01") return "Avril 2027";
  if (from < "2027-06-01") return "Mai 2027";
  if (from < "2027-06-27") return "Juin 2027";
  return "Pendant le voyage";
}
