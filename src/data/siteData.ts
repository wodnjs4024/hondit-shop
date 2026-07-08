export const CANONICAL_URL = "https://hondit-shop.vercel.app";

export const links = {
  instagram: "https://www.instagram.com/hondit.office/",
  shopeeStore: "https://shopee.sg/hondit.office.sg",
};

export const DISCOUNT_LABEL = "30% OFF";

export type Product = {
  id: string;
  name: string;
  displayName?: string;
  category?: string;
  size?: string;
  description: string;
  bestFor?: string;
  ctaLabel?: string;
  chips: string[];
  image: string;
  alt: string;
  href: string;
  listPrice: number;
  salePrice: number;
  eventName: string;
};

export const cleansingProducts: Product[] = [
  {
    id: "foam-oil",
    name: "Foam Oil",
    displayName: "J'essence Vegan Foam Oil 150ml",
    category: "J'ESSENCE VEGAN FOAM OIL",
    size: "150ml",
    description: "One tube for makeup, sunscreen and a complete cleanse.",
    bestFor: "Makeup / Sunscreen / One-step cleansing",
    ctaLabel: "View on Shopee",
    chips: ["Vegan", "pH 5.5", "Fragrance-Free"],
    image: "/images/foam-oil.png",
    alt: "hondit Foam Oil cleanser product bottle with original label and packaging.",
    href: "https://shopee.sg/-Jessence-Vegan-Foam-Oil-150ml-pH-5.5-Fragrance-Free-Triple-Cleanser-for-Sensitive-Skin-hondit-i.1777500029.46061061091?extraParams=%7B%22display_model_id%22%3A340962094822%2C%22model_selection_logic%22%3A3%7D",
    listPrice: 27.36,
    salePrice: 19.15,
    eventName: "shopee_foam_oil_click",
  },
  {
    id: "foaming-cleanser",
    name: "Foaming Cleanser",
    displayName: "J'essence Vegan Foaming Cleanser 200ml",
    category: "J'ESSENCE VEGAN FOAMING CLEANSER",
    size: "200ml",
    description: "A soft everyday face wash with a clean, comfortable finish.",
    bestFor: "Morning wash / Daily cleansing / Sensitive skin",
    ctaLabel: "View on Shopee",
    chips: ["Vegan", "pH 5.5", "Sensitive Skin"],
    image: "/images/foaming-cleanser.png",
    alt: "hondit Foaming Cleanser product tube with original label and packaging.",
    href: "https://shopee.sg/-Jessence-Vegan-Foaming-Cleanser-200ml-pH-5.5-Fragrance-Free-Face-Wash-for-Sensitive-Skin-hondit-i.1777500029.48211055800?extraParams=%7B%22display_model_id%22%3A370962042962%2C%22model_selection_logic%22%3A3%7D",
    listPrice: 29.45,
    salePrice: 20.62,
    eventName: "shopee_foaming_cleanser_click",
  },
  {
    id: "cleansing-water",
    name: "Cleansing Water",
    displayName: "J'essence Vegan Cleansing Water 300ml",
    category: "J'ESSENCE VEGAN CLEANSING WATER",
    size: "300ml",
    description: "A lightweight option for quick cleansing and light makeup removal.",
    bestFor: "Light makeup / Quick reset / No-rinse moments",
    ctaLabel: "View on Shopee",
    chips: ["Vegan", "pH 5.5", "Fragrance-Free"],
    image: "/images/cleansing-water.png",
    alt: "hondit Cleansing Water product bottle with original label and packaging.",
    href: "https://shopee.sg/-Jessence-Vegan-Cleansing-Water-300ml-pH-5.5-Fragrance-Free-Makeup-Remover-for-Sensitive-Skin-hondit-i.1777500029.49661058384?extraParams=%7B%22display_model_id%22%3A435962061879%2C%22model_selection_logic%22%3A3%7D",
    listPrice: 28.89,
    salePrice: 20.22,
    eventName: "shopee_cleansing_water_click",
  },
];

export const diffuserProducts: Product[] = [
  {
    id: "diffuser-500",
    name: "Volcanic Diffuser 500g",
    displayName: "Volcanic Diffuser",
    category: "VOLCANIC STONE DIFFUSER",
    size: "500g",
    description: "A fuller presence for bedrooms, bathrooms and shared spaces.",
    bestFor: "Bedroom / Bathroom / Shared space",
    ctaLabel: "View 500g on Shopee",
    chips: ["Jeju volcanic stone", "Citrus oil 10ml included", "No flame", "No electricity", "Reusable stone"],
    image: "/images/diffuser-500g.png",
    alt: "hondit volcanic stone diffuser 500g package with citrus oil included.",
    href: "https://shopee.sg/Diffuser-Home-Fragrance-Air-Freshener-Room-Scent-Aroma-Diffuser-with-Citrus-Essential-Oil-10ml-500g-i.1777500029.56058301270?extraParams=%7B%22display_model_id%22%3A420908704644%2C%22model_selection_logic%22%3A3%7D",
    listPrice: 91.79,
    salePrice: 64.25,
    eventName: "shopee_diffuser_500_click",
  },
  {
    id: "diffuser-350",
    name: "Volcanic Diffuser 350g",
    displayName: "Volcanic Diffuser",
    category: "VOLCANIC STONE DIFFUSER",
    size: "350g",
    description: "A compact scent object for desks, shelves and smaller corners.",
    bestFor: "Desk / Shelf / Personal corner",
    ctaLabel: "View 350g on Shopee",
    chips: ["Jeju volcanic stone", "Citrus oil 10ml included", "No flame", "No electricity", "Reusable stone"],
    image: "/images/diffuser-350g.png",
    alt: "hondit volcanic stone diffuser 350g package with citrus oil included.",
    href: "https://shopee.sg/Aroma-Diffuser-Stone-Diffuser-with-Citrus-Essential-Oil-10ml-Home-Fragrance-Air-Freshener-Room-Scent-350g-i.1777500029.47159645745?extraParams=%7B%22display_model_id%22%3A445946326744%2C%22model_selection_logic%22%3A3%7D",
    listPrice: 47.66,
    salePrice: 33.36,
    eventName: "shopee_diffuser_350_click",
  },
];

export const setProducts: Product[] = [
  {
    id: "soap-toothpaste-set",
    name: "Soap & Toothpaste Set",
    displayName: "Daily Care Soap & Toothpaste Set",
    category: "DAILY CARE SET",
    size: "Set",
    description: "A practical everyday care set for simple gifting and daily use.",
    bestFor: "Gifting / Daily care / Travel-ready routines",
    ctaLabel: "Buy on Shopee",
    chips: ["Daily care", "Giftable", "Ships from Korea"],
    image: "/images/foaming-cleanser.png",
    alt: "hondit soap and toothpaste set for daily care.",
    href: links.shopeeStore,
    listPrice: 43.55,
    salePrice: 30.49,
    eventName: "shopee_soap_toothpaste_set_click",
  },
  {
    id: "bar-soap-set-3",
    name: "Bar Soap Set of 3",
    displayName: "Bar Soap Set of 3",
    category: "DAILY SOAP SET",
    size: "3 pcs",
    description: "A simple soap set for bathroom shelves, guest rooms and daily cleansing.",
    bestFor: "Guest rooms / Daily cleansing / Small gifts",
    ctaLabel: "Buy on Shopee",
    chips: ["3-piece set", "Giftable", "Ships from Korea"],
    image: "/images/cleansing-water.png",
    alt: "hondit three-piece bar soap set.",
    href: links.shopeeStore,
    listPrice: 54.41,
    salePrice: 38.09,
    eventName: "shopee_bar_soap_set_3_click",
  },
];

export const retailProducts: Product[] = [...diffuserProducts.slice().reverse(), ...cleansingProducts, ...setProducts];

export const guideCards = [
  {
    number: "01",
    title: "Foam Oil",
    intro: "For makeup and sunscreen.",
    body: "One product for a simpler cleansing routine.",
    targetId: "foam-oil",
  },
  {
    number: "02",
    title: "Foaming Cleanser",
    intro: "For your everyday face wash.",
    body: "Soft foam with a fresh, comfortable finish.",
    targetId: "foaming-cleanser",
  },
  {
    number: "03",
    title: "Cleansing Water",
    intro: "For light makeup and quick cleansing.",
    body: "An easy choice for busy days.",
    targetId: "cleansing-water",
  },
];

export const ritualCards = [
  {
    number: "01",
    eyebrow: "REMOVE MAKEUP & SUNSCREEN",
    title: "Choose Foam Oil",
    targetId: "foam-oil",
  },
  {
    number: "02",
    eyebrow: "EVERYDAY FACE WASH",
    title: "Choose Foaming Cleanser",
    targetId: "foaming-cleanser",
  },
  {
    number: "03",
    eyebrow: "QUICK LIGHT CLEANSE",
    title: "Choose Cleansing Water",
    targetId: "cleansing-water",
  },
  {
    number: "04",
    eyebrow: "SCENT A PERSONAL SPACE",
    title: "Choose Volcanic Diffuser",
    targetId: "diffuser-500",
  },
];

export const trustItems = [
  ["SHIPS FROM KOREA", "Orders are prepared and shipped from Korea."],
  ["SHOP ON SHOPEE SG", "Purchases and payments are completed through Shopee Singapore."],
  ["PRODUCT SUPPORT", "Questions can be sent through Shopee Chat."],
  ["CAREFULLY CURATED", "A focused selection of Korean care and scent products."],
];

export const faqs = [
  {
    question: "Where can I purchase hondit products?",
    answer: "You can purchase hondit products through our official Shopee Singapore store or through the product links on this site.",
  },
  {
    question: "Are orders shipped from Korea?",
    answer: "Orders are prepared and shipped from Korea. Estimated delivery times may vary depending on order date and logistics.",
  },
  {
    question: "Which cleanser should I choose?",
    answer: "Choose Foam Oil for makeup and sunscreen, Foaming Cleanser for everyday face wash, and Cleansing Water for quick light cleansing.",
  },
  {
    question: "How do I use the volcanic diffuser?",
    answer: "Place the stones in the pot, add citrus oil onto the stones, allow it to absorb naturally, and refresh with a few more drops when needed.",
  },
  {
    question: "Does the diffuser require flame or electricity?",
    answer: "No. The volcanic diffuser is designed to scent a space without flame or electricity.",
  },
  {
    question: "Where can I ask product questions?",
    answer: "Product questions can be sent through Shopee Chat or through hondit's Instagram profile.",
  },
];

export const diffuserChips = [
  "Jeju Volcanic Stone",
  "Citrus Oil 10ml Included",
  "No Flame / No Electricity",
  "Refill and Reuse",
];

export const sections = [
  { id: "home", label: "Home" },
  { id: "singapore", label: "Singapore" },
  { id: "ritual", label: "Find Yours" },
  { id: "cleansing", label: "Cleansing" },
  { id: "diffuser", label: "Diffuser" },
  { id: "faq", label: "FAQ" },
  { id: "explore", label: "Explore" },
  { id: "about", label: "About" },
] as const;

export type SectionId = (typeof sections)[number]["id"];

