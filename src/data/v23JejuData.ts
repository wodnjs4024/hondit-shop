export type OurJejuPlace = {
  id: string;
  name: string;
  shortName: string;
  category: string;
  description: string;
  location: string;
  image: string;
  alt: string;
  lat: number;
  lon: number;
  featured?: boolean;
  officialUrl: string;
  officialLabel: string;
  photoCredit: string;
  photoUrl: string;
};

export const ourJejuBounds = {
  west: 126.12,
  east: 127.05,
  south: 33.08,
  north: 33.62,
};

export const ourJejuPlaces: OurJejuPlace[] = [
  {
    id: "jeju-national-university",
    name: "Jeju National University",
    shortName: "hondit home",
    category: "PROJECT ORIGIN",
    description: "The Ara Campus is where hondit's independent student-led cross-border commerce project began.",
    location: "102 Jejudaehak-ro, Jeju-si, Jeju 63243",
    image: "/images/jeju-field-university.webp",
    alt: "Jeju National University Ara Campus surrounded by green hills.",
    lat: 33.4559,
    lon: 126.5614,
    featured: true,
    officialUrl: "https://www.jejunu.ac.kr/eng/intro/guide/directions/aracampus.htm",
    officialLabel: "Official campus guide",
    photoCredit: "imagejeju - CC BY-SA 4.0",
    photoUrl: "https://commons.wikimedia.org/wiki/File:Jnuimage.jpg",
  },
  {
    id: "hallasan",
    name: "Hallasan",
    shortName: "Hallasan",
    category: "VOLCANIC HEART",
    description: "The mountain at Jeju's centre anchors the island's volcanic landscape and hondit's stone-led visual language.",
    location: "Hallasan National Park, Jeju",
    image: "/images/jeju-field-hallasan.webp",
    alt: "Hallasan rising above Jeju Island.",
    lat: 33.3617,
    lon: 126.5292,
    officialUrl: "https://whc.unesco.org/en/list/1264/",
    officialLabel: "UNESCO World Heritage",
    photoCredit: "Hallasan 2 - public domain",
    photoUrl: "https://commons.wikimedia.org/wiki/File:Hallasan_2.jpg",
  },
  {
    id: "woljeongri",
    name: "Woljeongri Beach",
    shortName: "Woljeongri",
    category: "CLEAR COAST",
    description: "Pale sand, emerald water and open coastal light express the fresh, quiet side of Jeju.",
    location: "Woljeong-ri, Gujwa-eup, Jeju-si",
    image: "/images/jeju-field-woljeongri.webp",
    alt: "Clear water and pale shoreline at Woljeongri Beach.",
    lat: 33.5565,
    lon: 126.7958,
    officialUrl: "https://www.visitjeju.net/en/detail/view?contentsid=CONT_000000000500496",
    officialLabel: "Visit Jeju guide",
    photoCredit: "Sgroey - CC BY-SA 4.0",
    photoUrl: "https://commons.wikimedia.org/wiki/File:Jeju_woljeongri_beach_1.jpg",
  },
  {
    id: "bijarim",
    name: "Bijarim Forest",
    shortName: "Bijarim",
    category: "SLOW FOREST",
    description: "A protected old-growth grove whose shaded paths bring a slower, softer rhythm to the island story.",
    location: "Bijarim-ro, Gujwa-eup, Jeju-si",
    image: "/images/jeju-field-bijarim.webp",
    alt: "A shaded green path through Bijarim Forest.",
    lat: 33.491,
    lon: 126.8115,
    officialUrl: "https://www.visitjeju.net/en/detail/view?contentsid=CONT_000000000500270",
    officialLabel: "Visit Jeju guide",
    photoCredit: "ProjectManhattan - CC BY-SA 3.0",
    photoUrl: "https://commons.wikimedia.org/wiki/File:Bijarim_forest,_Jeju.jpg",
  },
  {
    id: "seongsan",
    name: "Seongsan Ilchulbong",
    shortName: "Seongsan",
    category: "EASTERN EDGE",
    description: "The ocean-facing tuff cone is one of Jeju's clearest meetings of volcanic stone, wind and sea.",
    location: "Seongsan-eup, Seogwipo-si",
    image: "/images/jeju-field-seongsan.webp",
    alt: "Seongsan Ilchulbong rising from Jeju's eastern coast.",
    lat: 33.458,
    lon: 126.9425,
    officialUrl: "https://www.visitjeju.net/en/detail/view?contentsid=CONT_000000000500349",
    officialLabel: "Visit Jeju guide",
    photoCredit: "Bernard Gagnon - CC0",
    photoUrl: "https://commons.wikimedia.org/wiki/File:Seongsan,_Jeju_Island.jpg",
  },
  {
    id: "jusangjeolli",
    name: "Jusangjeolli Cliff",
    shortName: "Jusangjeolli",
    category: "STONE AND SEA",
    description: "Dark columnar rock meeting the ocean gives the volcanic diffuser its most direct landscape reference.",
    location: "36-30 Ieodo-ro, Seogwipo-si",
    image: "/images/jeju-field-jusangjeolli.webp",
    alt: "Dark volcanic columns meeting the sea at Jusangjeolli Cliff.",
    lat: 33.2387,
    lon: 126.426,
    officialUrl: "https://visitjeju.net/en/detail/view?contentsid=CNTS_000000000020476",
    officialLabel: "Visit Jeju guide",
    photoCredit: "Bernard Gagnon - CC0",
    photoUrl: "https://commons.wikimedia.org/wiki/File:Daepo_Jusangjeolli_Cliff_01.jpg",
  },
];

export function formatPlaceCoordinates(place: OurJejuPlace) {
  return `${place.lat.toFixed(4)} N - ${place.lon.toFixed(4)} E`;
}
