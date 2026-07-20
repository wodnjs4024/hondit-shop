export type OurJejuPlace = {
  id: string;
  name: string;
  shortName: string;
  category: string;
  description: string;
  location: string;
  latitude: number;
  longitude: number;
  image: string;
  markerOffset: {
    x: number;
    y: number;
  };
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
    description:
      "The Ara Campus in Jeju City is where the hondit student-led project is based, connecting Jeju-sourced stories with Singapore-ready commerce.",
    location: "102 Jejudaehak-ro, Jeju-si, Jeju-do, Republic of Korea",
    latitude: 33.4559,
    longitude: 126.5614,
    image: "/images/jeju-field-university.webp",
    markerOffset: { x: -2, y: -7 },
    featured: true,
    officialUrl: "https://www.jejunu.ac.kr/eng/intro/guide/directions/aracampus.htm",
    officialLabel: "Official campus guide",
    photoCredit: "imagejeju · CC BY-SA 4.0",
    photoUrl:
      "https://commons.wikimedia.org/wiki/File:%EC%A0%9C%EC%A3%BC%EB%8C%80%ED%95%99%EA%B5%90_%EC%95%84%EB%9D%BC%EC%BA%A0%ED%8D%BC%EC%8A%A4_%EC%A0%95%EB%AC%B8_%EC%A0%84%EA%B2%BD.jpg",
  },
  {
    id: "hallasan",
    name: "Hallasan National Park",
    shortName: "Hallasan",
    category: "VOLCANIC HEART",
    description:
      "Jeju rises around Hallasan, a volcanic mountain that gives the island its mineral-rich terrain and quiet strength.",
    location: "2070-61 1100-ro, Jeju-si, Jeju-do, Republic of Korea",
    latitude: 33.3617,
    longitude: 126.5292,
    image: "/images/jeju-field-hallasan.webp",
    markerOffset: { x: 2, y: -9 },
    officialUrl: "https://www.visitjeju.net/en/detail/view?contentsid=CONT_000000000500685",
    officialLabel: "Visit Jeju guide",
    photoCredit: "Visit Jeju / public tourism reference",
    photoUrl: "https://www.visitjeju.net/",
  },
  {
    id: "woljeongri",
    name: "Woljeongri Beach",
    shortName: "Woljeongri",
    category: "COAST & ISLANDS",
    description:
      "Clear water, pale sand and black stone edges make Woljeongri a calm reference for the cleansing side of hondit.",
    location: "Woljeong-ri, Gujwa-eup, Jeju-si, Jeju-do, Republic of Korea",
    latitude: 33.5565,
    longitude: 126.7958,
    image: "/images/jeju-field-woljeongri.webp",
    markerOffset: { x: 4, y: -7 },
    officialUrl: "https://www.visitjeju.net/en/detail/view?contentsid=CONT_000000000500460",
    officialLabel: "Visit Jeju guide",
    photoCredit: "Visit Jeju / public tourism reference",
    photoUrl: "https://www.visitjeju.net/",
  },
  {
    id: "bijarim",
    name: "Bijarim Forest",
    shortName: "Bijarim",
    category: "FOREST TRAILS",
    description:
      "A dense nutmeg forest with a slow walking rhythm, chosen here as Jeju's softer botanical counterpoint.",
    location: "55 Bijasup-gil, Gujwa-eup, Jeju-si, Jeju-do, Republic of Korea",
    latitude: 33.4914,
    longitude: 126.8113,
    image: "/images/jeju-field-bijarim.webp",
    markerOffset: { x: 6, y: 2 },
    officialUrl: "https://www.visitjeju.net/en/detail/view?contentsid=CONT_000000000500270",
    officialLabel: "Visit Jeju guide",
    photoCredit: "Visit Jeju / public tourism reference",
    photoUrl: "https://www.visitjeju.net/",
  },
  {
    id: "seongsan",
    name: "Seongsan Ilchulbong",
    shortName: "Seongsan",
    category: "UNESCO LANDSCAPE",
    description:
      "A tuff cone formed by volcanic activity, Seongsan keeps the island's geological story visible at the coast.",
    location: "284-12 Ilchul-ro, Seongsan-eup, Seogwipo-si, Jeju-do, Republic of Korea",
    latitude: 33.4581,
    longitude: 126.9425,
    image: "/images/jeju-field-seongsan.webp",
    markerOffset: { x: -8, y: -6 },
    officialUrl: "https://whc.unesco.org/en/list/1264/",
    officialLabel: "UNESCO listing",
    photoCredit: "Visit Jeju / public tourism reference",
    photoUrl: "https://www.visitjeju.net/",
  },
  {
    id: "jusangjeolli",
    name: "Jusangjeolli Cliff",
    shortName: "Jusangjeolli",
    category: "VOLCANIC COAST",
    description:
      "Columnar basalt cliffs show the sharp, enduring geometry of Jeju stone against the sea.",
    location: "36-30 Ieodo-ro, Seogwipo-si, Jeju-do, Republic of Korea",
    latitude: 33.2378,
    longitude: 126.4256,
    image: "/images/jeju-field-jusangjeolli.webp",
    markerOffset: { x: 8, y: 7 },
    officialUrl: "https://www.visitjeju.net/en/detail/view?contentsid=CONT_000000000500477",
    officialLabel: "Visit Jeju guide",
    photoCredit: "Visit Jeju / public tourism reference",
    photoUrl: "https://www.visitjeju.net/",
  },
];
