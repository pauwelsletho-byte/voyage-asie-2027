// Spécialités à goûter, par région : [nom, nom local (à montrer), description]
export const FOODS = [
  { id: "hk", region: "Hong Kong", c: "hk", lang: "zh-HK", stages: ["hongkong"], items: [
    ["Dim sum (har gow, siu mai)", "點心", "Raviolis vapeur aux crevettes et au porc, dans une maison de thé"],
    ["Porc char siu", "叉燒", "Porc laqué au miel, sur du riz"],
    ["Soupe de wonton", "雲吞麵", "Nouilles fines et raviolis aux crevettes"],
    ["Pineapple bun au beurre", "菠蘿油", "Brioche croustillante avec une tranche de beurre froid"],
    ["Tartelette à l'œuf", "蛋撻", "Petite tarte au flan, encore tiède"],
    ["Thé au lait hongkongais", "港式奶茶", "Thé noir fort et lait concentré"],
  ] },
  { id: "hunan", region: "Hunan (Zhangjiajie, Fenghuang)", c: "cn", lang: "zh-CN", stages: ["zhangjiajie", "fenghuang"], items: [
    ["Tête de poisson aux piments", "剁椒鱼头", "Le plat star du Hunan, très relevé"],
    ["Porc braisé façon Mao", "毛氏红烧肉", "Porc caramélisé fondant"],
    ["Tofu puant", "臭豆腐", "Frit et pimenté : l'odeur fait peur, le goût beaucoup moins"],
    ["Nouilles de riz du Hunan", "湖南米粉", "Le petit-déjeuner local"],
    ["Bonbons au gingembre de Fenghuang", "姜糖", "Étirés à la main dans les rues de la vieille ville"],
  ] },
  { id: "guizhou", region: "Guizhou (Huangguoshu)", c: "cn", lang: "zh-CN", stages: ["huangguoshu"], items: [
    ["Poisson à la soupe acide", "酸汤鱼", "Bouillon rouge acidulé à la tomate fermentée"],
    ["Si wa wa", "丝娃娃", "Petites crêpes à garnir soi-même de légumes"],
  ] },
  { id: "yunnan", region: "Yunnan", c: "cn", lang: "zh-CN", stages: ["gorges", "shangrila", "dali", "kunming"], items: [
    ["Nouilles « traverser le pont »", "过桥米线", "Bouillon brûlant où l'on plonge soi-même les ingrédients"],
    ["Fondue aux champignons sauvages", "野生菌火锅", "La saison bat son plein en juillet, à ne pas rater"],
    ["Fromage de Dali grillé", "乳扇", "Fine feuille de fromage de lait grillée et roulée"],
    ["Galette aux pétales de rose", "鲜花饼", "La pâtisserie fétiche du Yunnan"],
    ["Fondue au yak", "牦牛肉火锅", "À Shangri-La, parfait quand il fait frais"],
    ["Thé au beurre tibétain", "酥油茶", "Salé et gras, ça réchauffe"],
    ["Baba de Lijiang", "丽江粑粑", "Galette feuilletée, sucrée ou salée"],
  ] },
  { id: "vnnord", region: "Nord du Vietnam", c: "vn", lang: "vi-VN", stages: ["hanoi", "croisiere", "ninhbinh", "puluong"], items: [
    ["Phở bò", "Phở bò", "La soupe de bœuf du matin, à Hanoi"],
    ["Bún chả", "Bún chả", "Porc grillé, vermicelles et herbes, le midi"],
    ["Café à l'œuf", "Cà phê trứng", "Crème d'œuf battue sur un café serré"],
    ["Chèvre de montagne", "Dê núi", "La spécialité de Ninh Binh"],
    ["Riz croustillant", "Cơm cháy", "Galettes de riz grillé, Ninh Binh"],
  ] },
  { id: "vncentre", region: "Centre du Vietnam", c: "vn", lang: "vi-VN", stages: ["phongnha", "hoian", "quynhon"], items: [
    ["Cao lầu", "Cao lầu", "Nouilles épaisses au porc, qu'on ne trouve qu'à Hội An"],
    ["Bánh mì", "Bánh mì", "Le meilleur sandwich du pays serait à Hội An"],
    ["Riz au poulet de Hội An", "Cơm gà Hội An", "Riz jaune et poulet effiloché"],
    ["Bún bò Huế", "Bún bò Huế", "Soupe de bœuf épicée à la citronnelle"],
    ["Crêpe croustillante", "Bánh xèo", "Aux crevettes, à rouler dans des herbes"],
    ["Fruits de mer de Quy Nhon", "Hải sản", "Au bord de la plage, au poids"],
  ] },
  { id: "vnsud", region: "Saigon", c: "vn", lang: "vi-VN", stages: ["hcmc"], items: [
    ["Cơm tấm", "Cơm tấm", "Riz brisé et côte de porc grillée"],
    ["Chè", "Chè", "Dessert en verre : haricots, coco, gelées"],
    ["Café glacé au lait", "Cà phê sữa đá", "Pour tenir dans la chaleur"],
  ] },
  { id: "kh", region: "Cambodge", c: "kh", lang: "km-KH", stages: ["siemreap"], items: [
    ["Amok de poisson", "អាម៉ុកត្រី", "Curry doux au lait de coco cuit en feuille de bananier"],
    ["Lok lak", "ឡុកឡាក់", "Bœuf sauté, sauce citron vert et poivre"],
    ["Nom banh chok", "នំបញ្ចុក", "Nouilles de riz au curry vert, le matin"],
    ["Porc et riz du matin", "បាយសាច់ជ្រូក", "Le petit-déjeuner de rue khmer"],
  ] },
  { id: "my", region: "Malaisie", c: "my", lang: "ms-MY", stages: ["kl1", "tioman", "kl2"], items: [
    ["Nasi lemak", "Nasi lemak", "Riz au lait de coco, sambal, anchois et œuf"],
    ["Roti canai", "Roti canai", "Pain feuilleté et sauce curry"],
    ["Char kway teow", "Char kway teow", "Nouilles plates sautées au wok"],
    ["Satay", "Satay", "Brochettes grillées sauce cacahuète"],
    ["Laksa", "Laksa", "Soupe de nouilles au curry coco"],
    ["Teh tarik", "Teh tarik", "Thé au lait « tiré » d'un verre à l'autre"],
    ["Cendol", "Cendol", "Glace pilée, lait de coco et sucre de palme"],
    ["Durian", "Durian", "Le roi des fruits, si vous osez"],
  ] },
];
export const foodId = (g, i) => `${g.id}-${i}`;
export const foodsForStage = (sid) => FOODS.find((g) => g.stages.includes(sid));
