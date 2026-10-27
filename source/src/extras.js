// Données des outils : devises, phrases, lieux en écriture locale, urgences

// Devises : unités pour 1 €, valeurs de secours (fin 2026, approximatives) mises à jour en ligne
export const CURRENCIES = {
  EUR: { name: "Euro", sym: "€", rate: 1, dec: 2 },
  HKD: { name: "Dollar de Hong Kong", sym: "HK$", rate: 8.5, dec: 1 },
  CNY: { name: "Yuan", sym: "¥", rate: 7.8, dec: 1 },
  VND: { name: "Dong", sym: "₫", rate: 28500, dec: 0 },
  USD: { name: "Dollar US (Cambodge)", sym: "$", rate: 1.08, dec: 2 },
  KHR: { name: "Riel", sym: "៛", rate: 4400, dec: 0 },
  MYR: { name: "Ringgit", sym: "RM", rate: 5.0, dec: 2 },
};
export const CURRENCY_OF = { hk: "HKD", cn: "CNY", vn: "VND", kh: "USD", my: "MYR", fr: "EUR" };

export const CATEGORIES = { repas: "Repas", logement: "Hébergement", transport: "Transport", activite: "Activités", achat: "Achats", autre: "Autre" };

// Phrases de survie : [français, écriture locale, prononciation]
export const PHRASES = [
  { lang: "Mandarin", where: "Chine", rows: [
    ["Bonjour", "你好", "nǐ hǎo"],
    ["Merci", "谢谢", "xièxie"],
    ["Combien ça coûte ?", "多少钱？", "duōshao qián"],
    ["C'est trop cher", "太贵了", "tài guì le"],
    ["L'addition, s'il vous plaît", "买单", "mǎidān"],
    ["Pas pimenté, s'il vous plaît", "不要辣", "bú yào là"],
    ["Un peu pimenté", "微辣", "wēi là"],
    ["Où sont les toilettes ?", "厕所在哪里？", "cèsuǒ zài nǎlǐ"],
    ["Je voudrais aller ici", "我想去这里", "wǒ xiǎng qù zhèlǐ"],
    ["Je ne comprends pas", "我听不懂", "wǒ tīng bù dǒng"],
    ["Eau / bière", "水 / 啤酒", "shuǐ / píjiǔ"],
    ["Champignons sauvages", "野生菌", "yěshēng jùn"],
    ["Au secours !", "救命！", "jiùmìng"],
  ]},
  { lang: "Cantonais", where: "Hong Kong", rows: [
    ["Merci (pour un service)", "唔該", "m̀h gōi"],
    ["Merci (pour un cadeau)", "多謝", "dō jeh"],
    ["Combien ça coûte ?", "幾多錢？", "géi dō chín"],
    ["L'addition, s'il vous plaît", "埋單", "màaih dāan"],
  ]},
  { lang: "Vietnamien", where: "Vietnam", rows: [
    ["Bonjour", "Xin chào", "sinn tchao"],
    ["Merci", "Cảm ơn", "kam eun"],
    ["Combien ça coûte ?", "Bao nhiêu tiền?", "bao gnieou tienn"],
    ["C'est trop cher", "Đắt quá", "dat koua"],
    ["L'addition, s'il vous plaît", "Tính tiền", "tinn tienn"],
    ["Pas pimenté", "Không cay", "khom kaï"],
    ["Sans glace", "Không đá", "khom da"],
    ["Où sont les toilettes ?", "Nhà vệ sinh ở đâu?", "gna vé sinn eu dô"],
    ["Je voudrais aller ici", "Tôi muốn đi đến đây", "toï mouonn di dénn dâï"],
    ["Je ne comprends pas", "Tôi không hiểu", "toï khom hiéou"],
    ["C'est délicieux", "Ngon quá", "ngonn koua"],
    ["Eau / bière", "Nước / Bia", "neuk / bia"],
    ["Au secours !", "Cứu với!", "kiou veuï"],
  ]},
  { lang: "Khmer", where: "Cambodge", rows: [
    ["Bonjour", "ជំរាបសួរ", "tchoum reap sour"],
    ["Merci", "អរគុណ", "or kounn"],
    ["Combien ça coûte ?", "ថ្លៃប៉ុន្មាន?", "tlaï ponn mann"],
    ["C'est trop cher", "ថ្លៃពេក", "tlaï pék"],
    ["L'addition, s'il vous plaît", "គិតលុយ", "kit louy"],
    ["Pas pimenté", "កុំដាក់ម្ទេស", "kom dak mtéh"],
    ["Où sont les toilettes ?", "បង្គន់នៅឯណា?", "bangkon nov aé na"],
    ["Eau", "ទឹក", "teuk"],
  ]},
  { lang: "Malais", where: "Malaisie", rows: [
    ["Bonjour", "Selamat pagi", "selamat pagui"],
    ["Merci", "Terima kasih", "terima kassi"],
    ["Combien ça coûte ?", "Berapa harga?", "berapa harga"],
    ["C'est trop cher", "Mahal sangat", "mahal sangat"],
    ["L'addition, s'il vous plaît", "Bil, tolong", "bil tolong"],
    ["Pas pimenté", "Tak pedas", "tak pedas"],
    ["Où sont les toilettes ?", "Tandas di mana?", "tandas di mana"],
    ["C'est délicieux", "Sedap", "sédap"],
    ["Eau", "Air", "aïr"],
  ]},
];

// Lieux à montrer au chauffeur, par étape : [nom français, écriture locale]
export const LOCAL_PLACES = {
  hongkong: [["Gare de West Kowloon (train pour la Chine)", "西九龍站"], ["Aéroport de Hong Kong", "香港國際機場"]],
  zhangjiajie: [["Gare de Zhangjiajie-Ouest", "张家界西站"], ["Téléphérique du mont Tianmen", "天门山索道"], ["Wulingyuan (entrée du parc)", "武陵源"], ["Grand Canyon de Zhangjiajie", "张家界大峡谷"]],
  fenghuang: [["Vieille ville de Fenghuang", "凤凰古城"], ["Gare de Fenghuang (vieille ville)", "凤凰古城站"]],
  huangguoshu: [["Cascade de Huangguoshu", "黄果树瀑布"], ["Gare d'Anshun-Ouest", "安顺西站"]],
  gorges: [["Gorges du Saut du Tigre", "虎跳峡"], ["Qiaotou (départ du sentier)", "桥头"], ["Halfway Guesthouse", "中途客栈"], ["Gare de Lijiang", "丽江站"]],
  shangrila: [["Vieille ville de Dukezong", "独克宗古城"], ["Monastère de Songzanlin", "松赞林寺"], ["Gare de Shangri-La", "香格里拉站"]],
  dali: [["Vieille ville de Dali", "大理古城"], ["Lac Erhai", "洱海"], ["Gare de Dali", "大理站"]],
  kunming: [["Marché aux champignons de Mushuihua", "木水花野生菌交易市场"], ["Gare de Kunming", "昆明站"], ["Aéroport de Kunming", "昆明长水国际机场"]],
  hanoi: [["Aéroport de Hanoi", "Sân bay Nội Bài"], ["Lac Hoàn Kiếm", "Hồ Hoàn Kiếm"]],
  ninhbinh: [["Gare de Ninh Binh", "Ga Ninh Bình"], ["Tam Cốc", "Tam Cốc, Ninh Bình"]],
  puluong: [["Réserve de Pù Luông", "Khu bảo tồn Pù Luông"]],
  phongnha: [["Gare de Đồng Hới", "Ga Đồng Hới"], ["Village de Phong Nha", "Phong Nha, Quảng Bình"]],
  hoian: [["Gare de Đà Nẵng", "Ga Đà Nẵng"], ["Vieille ville de Hội An", "Phố cổ Hội An"]],
  quynhon: [["Gare de Diêu Trì", "Ga Diêu Trì"]],
  hcmc: [["Gare de Saigon", "Ga Sài Gòn"], ["Aéroport Tân Sơn Nhất", "Sân bay Tân Sơn Nhất"]],
  siemreap: [["Aéroport de Siem Reap-Angkor", "ព្រលានយន្តហោះសៀមរាបអង្គរ"]],
  kl1: [["Gare routière TBS", "Terminal Bersepadu Selatan"]],
  tioman: [["Port de Mersing", "Jeti Mersing"]],
  kl2: [["Aéroport KLIA", "KLIA Terminal 1"]],
};

// Numéros d'urgence par pays (à revérifier avant le départ)
export const EMERGENCY = [
  ["Hong Kong", "999 (police, ambulance, pompiers)"],
  ["Chine", "110 police · 120 ambulance · 119 pompiers"],
  ["Vietnam", "113 police · 115 ambulance · 114 pompiers"],
  ["Cambodge", "117 police · 119 ambulance · 118 pompiers"],
  ["Malaisie", "999 (ou 112 depuis un portable)"],
  ["Depuis partout", "112 sur la plupart des portables"],
];

export const VAULT_SEED = [
  { id: "v-passeport-1", kind: "doc", title: "Passeport (moi)", text: "Ajoutez une photo de la page d'identité." },
  { id: "v-passeport-2", kind: "doc", title: "Passeport (ma copine)", text: "Ajoutez une photo de la page d'identité." },
  { id: "v-assurance", kind: "doc", title: "Assurance voyage", text: "Numéro de contrat :\nNuméro d'assistance 24 h/24 :" },
  { id: "v-permis", kind: "doc", title: "Permis de conduire + permis international", text: "" },
  { id: "v-carte", kind: "doc", title: "Cartes bancaires (opposition)", text: "Numéros d'opposition de vos banques (pas les numéros de carte)." },
  { id: "v-ambassades", kind: "note", title: "Ambassades et consulats de France", text: "Coordonnées à recopier depuis diplomatie.gouv.fr avant le départ (Pékin, Canton, Hanoi, Hô Chi Minh-Ville, Phnom Penh, Kuala Lumpur). Pensez aussi à l'inscription sur Ariane." },
];
