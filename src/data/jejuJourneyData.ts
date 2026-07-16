export type JejuPlace = {
  id: string;
  name: string;
  tag: string;
  address: string;
  note: string;
  image: string;
  x: number;
  y: number;
  featured?: boolean;
};

export const asiaCountryLabels = [
  { name: "Korea", x: 68, y: 32 },
  { name: "Japan", x: 79, y: 46 },
  { name: "China", x: 49, y: 48 },
  { name: "Singapore", x: 50, y: 82 },
];

export const university: JejuPlace = {
  id: "jeju-national-university",
  name: "hondit origin at Jeju National University",
  tag: "HONDIT HOME",
  address: "102 Jejudaehak-ro, Jeju-si, Jeju, Republic of Korea 63243",
  note: "hondit began as a student-led GTEP project at Jeju National University, connecting Jeju-inspired Korean products with Singapore buyers.",
  image: "/images/jnu-campus.webp",
  x: 44.5,
  y: 18.5,
  featured: true,
};

export const jejuPlaces: JejuPlace[] = [
  {
    id: "saryeoni-forest",
    name: "Saryeoni Forest Path",
    tag: "FOREST",
    address: "Saryeoni Forest Path, Jeju-si, Jeju",
    note: "A quiet cedar forest that reflects the calm rhythm behind hondit's daily rituals.",
    image: "/images/hondit-hero.webp",
    x: 52.1,
    y: 29.2,
  },
  {
    id: "hallasan",
    name: "Hallasan",
    tag: "MOUNTAIN",
    address: "Hallasan National Park, Jeju",
    note: "The center of Jeju's volcanic landscape and the island's grounded character.",
    image: "/images/place-hallasan.webp",
    x: 42.1,
    y: 38.1,
  },
  {
    id: "seongsan",
    name: "Seongsan Ilchulbong",
    tag: "COAST",
    address: "Seongsan-eup, Seogwipo-si, Jeju",
    note: "A volcanic coast shape that makes Jeju's stone and sea feel immediate.",
    image: "/images/place-seongsan.webp",
    x: 85.8,
    y: 24,
  },
  {
    id: "woljeongri",
    name: "Woljeongri Beach",
    tag: "SEA",
    address: "Woljeongri Beach, Gujwa-eup, Jeju-si",
    note: "Clear water and pale light, echoing the freshness of the cleansing line.",
    image: "/images/place-woljeongri.webp",
    x: 70.3,
    y: 9.6,
  },
  {
    id: "osulloc",
    name: "O'sulloc Tea Fields",
    tag: "PLANTS",
    address: "O'sulloc Tea Museum, Seogwipo-si, Jeju",
    note: "Green fields and slow care, a visual reference for gentle daily routines.",
    image: "/images/place-osulloc.webp",
    x: 15.9,
    y: 46.3,
  },
  {
    id: "hyeopjae",
    name: "Hyeopjae Beach",
    tag: "SEA",
    address: "Hyeopjae Beach, Hallim-eup, Jeju-si",
    note: "A bright coast where white sand and dark volcanic stone meet.",
    image: "/images/place-hyeopjae.webp",
    x: 10.6,
    y: 33.3,
  },
  {
    id: "jeongbang",
    name: "Jeongbang Falls",
    tag: "WATER",
    address: "Jeongbang Falls, Seogwipo-si, Jeju",
    note: "Fresh movement and coastal air, connected to hondit's clean water mood.",
    image: "/images/place-jeongbang.webp",
    x: 47,
    y: 55.3,
  },
  {
    id: "udo",
    name: "Udo Island",
    tag: "ISLAND",
    address: "Udo-myeon, Jeju",
    note: "A small island rhythm that keeps the brand quiet and human in scale.",
    image: "/images/place-udo.webp",
    x: 87,
    y: 17.1,
  },
  {
    id: "seopjikoji",
    name: "Seopjikoji",
    tag: "WIND",
    address: "Seopjikoji, Seogwipo-si, Jeju",
    note: "A windy coastal path that carries Jeju's open air and mineral tone.",
    image: "/images/place-seopjikoji.webp",
    x: 84.6,
    y: 29.1,
  },
  {
    id: "yongduam",
    name: "Yongduam Rock",
    tag: "STONE",
    address: "Yongduam Rock, Jeju-si, Jeju",
    note: "A dark volcanic edge close to the city, direct and textural.",
    image: "/images/place-yongduam.webp",
    x: 39.8,
    y: 15.4,
  },
  {
    id: "bijarim",
    name: "Bijarim Forest",
    tag: "FOREST",
    address: "Bijarim Forest, Gujwa-eup, Jeju-si",
    note: "A protected forest mood that supports hondit's soft, slow care language.",
    image: "/images/place-bijarim.webp",
    x: 71.6,
    y: 19.2,
  },
  {
    id: "cheonjiyeon",
    name: "Cheonjiyeon Falls",
    tag: "WATER",
    address: "Cheonjiyeon Falls, Seogwipo-si, Jeju",
    note: "A calm waterfall reference for freshness without exaggerated claims.",
    image: "/images/place-cheonjiyeon.webp",
    x: 43,
    y: 54.9,
  },
];

export const allJejuPoints = [university, ...jejuPlaces];
