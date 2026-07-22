export type StorefrontProduct = {
  slug: string;
  apiSlug: string;
  name: string;
  shortName: string;
  category: "CARE" | "SCENT";
  badge: string;
  detail: string;
  description: string;
  price: string;
  image: string;
  shopee: string;
  highlights: string[];
  howTo: string[];
  goodFor: string;
  bulkUnitPrice: number;
  bulkMoq: number;
  bulkStep: number;
  stockQuantity?: number;
  active?: boolean;
  featured?: boolean;
};

export const SHOPEE = "https://shopee.sg/hondit.office.sg";
export const INSTAGRAM = "https://www.instagram.com/hondit.office/";
export const EMAIL = "hondit.official@gmail.com";

export const productOrder = ["diffuser-350g", "diffuser-500g", "foam-oil", "foaming-cleanser", "cleansing-water"];

export const v23Products: StorefrontProduct[] = [
  {
    slug: "diffuser-350g",
    apiSlug: "diffuser-350g",
    name: "Volcanic Diffuser 350g",
    shortName: "Diffuser 350g",
    category: "SCENT",
    badge: "HOME SCENT",
    detail: "Compact scent for small spaces",
    description: "A compact scent object made with porous Jeju volcanic scoria, a handmade vessel and 10ml citrus oil. Add scent only when you want it, without flame, reeds or electricity.",
    price: "S$33.36",
    image: "/images/diffuser-350g.webp",
    shopee: "https://shopee.sg/Aroma-Diffuser-Stone-Diffuser-with-Citrus-Essential-Oil-10ml-Home-Fragrance-Air-Freshener-Room-Scent-350g-i.1777500029.47159645745",
    highlights: ["350g volcanic scoria", "10ml citrus oil included", "No flame or electricity", "Best for bedroom, bathroom or desk"],
    howTo: ["Place the volcanic stone in its vessel.", "Add 10-12 drops of citrus oil directly onto the stone.", "Let it absorb, then refresh with a few drops whenever needed."],
    goodFor: "Small bedrooms, bathrooms, desks and quiet personal spaces.",
    bulkUnitPrice: 21,
    bulkMoq: 20,
    bulkStep: 10,
    featured: true,
  },
  {
    slug: "diffuser-500g",
    apiSlug: "diffuser-500g",
    name: "Volcanic Diffuser 500g",
    shortName: "Diffuser 500g",
    category: "SCENT",
    badge: "HOME SCENT",
    detail: "Scent object for larger rooms",
    description: "A larger Jeju volcanic-stone diffuser for a stronger visual presence. Its porous scoria holds citrus oil and releases a light, clean scent without flame, reeds or power.",
    price: "S$64.25",
    image: "/images/diffuser-500g.webp",
    shopee: "https://shopee.sg/Diffuser-Home-Fragrance-Air-Freshener-Room-Scent-Aroma-Diffuser-with-Citrus-Essential-Oil-10ml-500g-i.1777500029.56058301270",
    highlights: ["500g volcanic scoria", "10ml citrus oil included", "Handmade vessel", "A larger object for home or business spaces"],
    howTo: ["Arrange the volcanic stone in its vessel.", "Add 10-12 drops across the upper stones.", "Refresh the scent only when you choose."],
    goodFor: "Living rooms, reception desks, studios and hospitality spaces.",
    bulkUnitPrice: 46,
    bulkMoq: 20,
    bulkStep: 10,
    featured: true,
  },
  {
    slug: "foam-oil",
    apiSlug: "foam-oil",
    name: "Vegan Foam Oil 150ml",
    shortName: "Vegan Foam Oil",
    category: "CARE",
    badge: "EVENING CARE",
    detail: "Makeup and sunscreen cleanse",
    description: "A vegan, pH 5.5 foam-oil cleanser designed for sunscreen, base makeup and a complete evening cleanse. Fragrance-free and made for a calm, simple routine.",
    price: "S$19.15",
    image: "/images/foam-oil.webp",
    shopee: "https://shopee.sg/-Jessence-Vegan-Foam-Oil-150ml-pH-5.5-Fragrance-Free-Triple-Cleanser-for-Sensitive-Skin-hondit-i.1777500029.46061061091",
    highlights: ["Vegan formula", "pH 5.5", "Fragrance-free", "For sunscreen and base makeup"],
    howTo: ["Pump onto dry hands.", "Massage gently over dry skin.", "Add water to create foam, then rinse thoroughly."],
    goodFor: "Evening cleansing when sunscreen or light makeup needs to be removed.",
    bulkUnitPrice: 8.99,
    bulkMoq: 30,
    bulkStep: 10,
    featured: true,
  },
  {
    slug: "foaming-cleanser",
    apiSlug: "foaming-cleanser",
    name: "Vegan Foaming Cleanser 200ml",
    shortName: "Foaming Cleanser",
    category: "CARE",
    badge: "DAILY CARE",
    detail: "Soft everyday face wash",
    description: "A fragrance-free vegan foaming cleanser with a pH 5.5 formula for a soft daily wash. The pump creates ready-to-use foam for a quick morning or evening routine.",
    price: "S$20.62",
    image: "/images/foaming-cleanser.webp",
    shopee: "https://shopee.sg/-Jessence-Vegan-Foaming-Cleanser-200ml-pH-5.5-Fragrance-Free-Face-Wash-for-Sensitive-Skin-hondit-i.1777500029.48211055800",
    highlights: ["Vegan formula", "pH 5.5", "Fragrance-free", "Ready-to-use soft foam"],
    howTo: ["Wet your face with lukewarm water.", "Pump the foam into your hand.", "Massage gently and rinse thoroughly."],
    goodFor: "Morning cleansing and a simple everyday face-wash routine.",
    bulkUnitPrice: 8.99,
    bulkMoq: 30,
    bulkStep: 10,
    featured: true,
  },
  {
    slug: "cleansing-water",
    apiSlug: "cleansing-water",
    name: "Vegan Cleansing Water 300ml",
    shortName: "Cleansing Water",
    category: "CARE",
    badge: "LIGHT CARE",
    detail: "Quick and gentle cleanse",
    description: "A fragrance-free vegan cleansing water for light makeup and quick resets. Its pH 5.5 formula offers a low-effort first cleansing step.",
    price: "S$20.22",
    image: "/images/cleansing-water.webp",
    shopee: "https://shopee.sg/-Jessence-Vegan-Cleansing-Water-300ml-pH-5.5-Fragrance-Free-Makeup-Remover-for-Sensitive-Skin-hondit-i.1777500029.49661058384",
    highlights: ["Vegan formula", "pH 5.5", "Fragrance-free", "For light makeup and quick cleansing"],
    howTo: ["Soak a cotton pad with cleansing water.", "Wipe gently across the face without rubbing.", "Follow with a water-based cleanser when your routine requires it."],
    goodFor: "Light makeup, quick cleansing and low-effort evening resets.",
    bulkUnitPrice: 8.99,
    bulkMoq: 30,
    bulkStep: 10,
    featured: true,
  },
];

export function getV23Product(slug: string) {
  return v23Products.find((product) => product.slug === slug || product.apiSlug === slug);
}
