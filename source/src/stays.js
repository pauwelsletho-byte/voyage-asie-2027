// Où chercher les logements, étape par étape : où exactement, quoi vérifier, sur quels sites
import { SITES } from "./booking.js";

// Conseils de sites par pays
export const STAY_SITES = [
  ["Hong Kong", "Booking ou Agoda, comparer les deux (10 à 20 % d'écart). Lire la surface en m² et vérifier qu'il y a une fenêtre."],
  ["Chine", "Trip.com en priorité : le plus de choix, et il indique si l'hôtel accepte les étrangers (indispensable). Booking et Agoda en ont peu, Airbnb n'y est plus."],
  ["Vietnam, Cambodge", "Agoda (souvent un peu moins cher, attention au prix hors taxes) et Booking. Pour les petites adresses, les contacter ensuite sur WhatsApp ou Facebook : souvent moins cher en direct."],
  ["Malaisie", "Agoda puis Booking à Kuala Lumpur. À Tioman, beaucoup de chalets ne sont sur aucun site : passer par le centre de plongée ou en direct sur WhatsApp."],
  ["Partout", "Annulation gratuite, paiement sur place si possible. Mettre le PDF de confirmation dans l'app : elle remplit la fiche toute seule."],
];

// id d'étape → [où exactement, ce qu'il faut chercher ou vérifier, sites, à réserver en premier]
export const STAYS = {
  hongkong: ["Jordan ou Austin (Kowloon), à moins de 10 min à pied de la gare de West Kowloon", "Train à 8 h le 29. Chambres minuscules : surface et fenêtre. 100 à 150 € la nuit.", ["booking", "agoda"], true],
  zhangjiajie: ["1re nuit en ville, à pied de la gare du téléphérique de Tianmen (天门山索道). Puis 2 nuits dans le bourg de Wulingyuan (武陵源), à pied de l'entrée principale du parc", "Hôtel qui accepte les étrangers. Wulingyuan : départ des navettes du parc, et 30-40 min de la gare de Zhangjiajie-Ouest pour Furong.", ["trip", "booking"]],
  furong: ["Dans le vieux village, côté cascade", "Chambre « vue cascade » (瀑布景观). Éviter la ville neuve et les hôtels près de la gare.", ["trip"]],
  fenghuang: ["Vieille ville, au bord de la rivière Tuo, près d'une des entrées", "Chambre vue rivière (河景房). Lire les avis sur le bruit (bars sur certaines berges). Vieille ville piétonne : près d'une entrée = moins de sacs à porter.", ["trip", "booking"], true],
  huangguoshu: ["Village au pied du site, à pied de l'entrée de la cascade", "Simple suffit, une seule nuit. Hôtel qui accepte les étrangers.", ["trip"]],
  gorges: ["Halfway Guesthouse (中途客栈), sur le sentier", "Chambre avec vue. Peu de chambres et très demandé en été : le plus urgent de la Chine. Sinon, contacter la guesthouse directement.", ["trip", "booking"], true],
  shangrila: ["Vieille ville de Dukezong (独克宗古城)", "Hôtel-boutique tibétain. À 3 200 m les nuits sont fraîches : chauffage ou couverture chauffante.", ["trip", "booking"]],
  dali: ["Bord du lac Erhai côté Caicun ou Longkan, à 15 min de la vieille ville", "Chambre vue lac. Shuanglang est plus joli mais à près d'1 h de tout : trop loin pour 2 nuits.", ["trip", "booking"]],
  kunming: ["Près du lac Cuihu (翠湖)", "Sympa pour le soir. Le lendemain : environ 30 min de taxi jusqu'au marché aux champignons, puis l'aéroport.", ["trip", "booking"]],
  hanoi: ["Vieux quartier, côté ouest ou sud (vers Hàng Bông ou près du lac Hoàn Kiếm)", "Éviter Tạ Hiện (rue de la bière), très bruyante. Rue calme, chambre côté cour.", ["agoda", "booking"]],
  croisiere: ["À bord", "Opérateur qui dépose directement à Ninh Binh le 17. Remboursement en cas de typhon.", ["klook", "gyg"]],
  ninhbinh: ["Bungalow dans les rizières de Tam Cốc, côté Hang Múa", "Le même hôtel pour les nuits du 17, 20 et 21. Demander qu'ils gardent les gros sacs pendant Pù Luông et s'ils louent des motos. Piscine.", ["agoda", "booking", "whatsapp"]],
  puluong: ["Bungalow en bambou vers Bản Đôn ou Bản Hiêu", "Vue sur la vallée et les rizières. Demander l'état de la route en juillet.", ["agoda", "booking", "whatsapp"]],
  phongnha: ["Guesthouse dans la vallée de Bong Lai, à 10 min du village", "Au calme, avec piscine. Vélos ou scooters à louer sur place.", ["agoda", "booking"]],
  hoian: ["Villa dans les rizières entre la vieille ville et la plage d'An Bàng (Cẩm Thanh, Cẩm Hà)", "À 10 min à vélo de la vieille ville, piscine, vélos fournis. L'étape la plus demandée du Vietnam.", ["agoda", "booking", "whatsapp"], true],
  quynhon: ["Front de mer du centre-ville, ou Bãi Xếp au sud (plus calme, plus « resort »)", "Centre-ville : pratique pour les fruits de mer et les bateaux pour Kỳ Co. Late check-out le 1er (train de nuit).", ["agoda", "booking"]],
  hcmc: ["District 1, près du marché Bến Thành ou de Nguyễn Huệ ; ou District 3, plus calme", "Éviter la rue Bùi Viện (bars).", ["agoda", "booking"]],
  siemreap: ["Près de la rivière ou vers Wat Bo, à 5 min en tuk-tuk de Pub Street", "Piscine indispensable. Beaucoup d'hôtels proposent un tuk-tuk pour les temples.", ["agoda", "booking"]],
  kl1: ["À pied de la gare routière TBS (Bandar Tasik Selatan)", "Juste pour dormir : le bus pour Mersing part tôt.", ["agoda", "booking"]],
  tioman: ["Salang (plus animé, centres de plongée, snorkeling) ou Air Batang (plus calme, chalets sur la plage)", "Choisir d'abord le centre de plongée PADI : beaucoup proposent cours + logement.", ["whatsapp", "agoda", "booking"]],
  kl2: ["Bukit Bintang (à côté de Jalan Alor) ou KLCC", "Piscine sur le toit. Demander la garde des sacs le 18 jusqu'au soir (vol à 2 h).", ["agoda", "booking"]],
};

export const staySites = (id) => (STAYS[id]?.[2] || []).map((k) => SITES[k]).filter(Boolean);
