export type BulkCategory = "cleansing" | "diffuser";

export type BulkProduct = {
  id: string;
  slug: string;
  name: string;
  category: BulkCategory;
  volumeLabel: string;
  shortDescription: string;
  description: string;
  imageUrl: string;
  unitPriceSgd: number;
  packQuantity: number;
  packPriceSgd: number;
  unitWeightKg: number;
  inventoryPacks: number;
  active: boolean;
  purchaseEnabled: boolean;
  sortOrder: number;
  features: string[];
  usage: string[];
};

export const BULK_QTY_STEP = 10;

export function getBulkMoq(product: BulkProduct) {
  return product.packQuantity;
}

export function getBulkMaxUnits(product: BulkProduct) {
  return product.inventoryPacks > 0 ? product.inventoryPacks * product.packQuantity : undefined;
}

export function normalizeBulkQuantity(product: BulkProduct, value: number) {
  const moq = getBulkMoq(product);
  const maxUnits = getBulkMaxUnits(product);
  const raw = Number.isFinite(value) ? Math.floor(value) : moq;
  let next = Math.max(moq, raw);
  next = moq + Math.floor((next - moq) / BULK_QTY_STEP) * BULK_QTY_STEP;
  if (maxUnits && next > maxUnits) {
    next = moq + Math.floor((maxUnits - moq) / BULK_QTY_STEP) * BULK_QTY_STEP;
  }
  return Math.max(moq, next);
}

export function getBulkTotal(product: BulkProduct, quantity: number) {
  return Number((product.unitPriceSgd * quantity).toFixed(2));
}

export function getStockStatus(product: BulkProduct) {
  const maxUnits = getBulkMaxUnits(product);
  const moq = getBulkMoq(product);
  if (maxUnits !== undefined && maxUnits < moq) return "Sold out";
  if (maxUnits !== undefined && maxUnits <= moq * 2) return "Low stock";
  return "In stock";
}

export const bulkProducts: BulkProduct[] = [
  {
    id: "foam-oil",
    slug: "foam-oil",
    name: "J'essence Vegan Foam Oil",
    category: "cleansing",
    volumeLabel: "150ml",
    shortDescription: "One-step cleansing for makeup and sunscreen routines.",
    description: "A gentle vegan foam oil selected for daily cleansing routines in warm Singapore weather.",
    imageUrl: "/images/foam-oil.png",
    unitPriceSgd: 8.5,
    packQuantity: 30,
    packPriceSgd: 255,
    unitWeightKg: 0.18,
    inventoryPacks: 20,
    active: true,
    purchaseEnabled: true,
    sortOrder: 10,
    features: ["Vegan", "pH 5.5", "Fragrance-free"],
    usage: ["For sunscreen and makeup removal", "Use as the first step of an evening cleansing routine"],
  },
  {
    id: "foaming-cleanser",
    slug: "foaming-cleanser",
    name: "J'essence Vegan Foaming Cleanser",
    category: "cleansing",
    volumeLabel: "200ml",
    shortDescription: "Soft daily face wash for a clean, comfortable finish.",
    description: "A soft foaming cleanser for everyday wash routines, selected for simple and clear skin care.",
    imageUrl: "/images/foaming-cleanser.png",
    unitPriceSgd: 8.5,
    packQuantity: 30,
    packPriceSgd: 255,
    unitWeightKg: 0.23,
    inventoryPacks: 20,
    active: true,
    purchaseEnabled: true,
    sortOrder: 20,
    features: ["Vegan", "pH 5.5", "Sensitive skin routine"],
    usage: ["For morning or evening cleansing", "Pair with Foam Oil after sunscreen-heavy days"],
  },
  {
    id: "cleansing-water",
    slug: "cleansing-water",
    name: "J'essence Vegan Cleansing Water",
    category: "cleansing",
    volumeLabel: "300ml",
    shortDescription: "Light cleansing water for quick reset moments.",
    description: "A lightweight cleansing water for light makeup, sunscreen residue and quick daily cleansing.",
    imageUrl: "/images/cleansing-water.png",
    unitPriceSgd: 8.5,
    packQuantity: 30,
    packPriceSgd: 255,
    unitWeightKg: 0.34,
    inventoryPacks: 20,
    active: true,
    purchaseEnabled: true,
    sortOrder: 30,
    features: ["Vegan", "pH 5.5", "No-rinse routine"],
    usage: ["Apply with cotton pad", "Use for light makeup or a quick cleanse"],
  },
  {
    id: "diffuser-350g",
    slug: "diffuser-350g",
    name: "Volcanic Stone Diffuser",
    category: "diffuser",
    volumeLabel: "350g",
    shortDescription: "Compact volcanic stone scent object for smaller corners.",
    description: "A compact Jeju volcanic stone diffuser with citrus oil, suited for desks, shelves and personal spaces.",
    imageUrl: "/images/diffuser-350g.png",
    unitPriceSgd: 21,
    packQuantity: 20,
    packPriceSgd: 420,
    unitWeightKg: 0.48,
    inventoryPacks: 12,
    active: true,
    purchaseEnabled: true,
    sortOrder: 40,
    features: ["Jeju volcanic stone", "Citrus oil 10ml included", "No flame", "No electricity", "Reusable stone"],
    usage: ["Place the stones in the pot", "Add citrus oil onto the stones", "Refresh with a few more drops when needed"],
  },
  {
    id: "diffuser-500g",
    slug: "diffuser-500g",
    name: "Volcanic Stone Diffuser",
    category: "diffuser",
    volumeLabel: "500g",
    shortDescription: "Fuller volcanic stone diffuser for rooms and shared spaces.",
    description: "A larger Jeju volcanic stone diffuser with citrus oil, suited for bedrooms, bathrooms and shared spaces.",
    imageUrl: "/images/diffuser-500g.png",
    unitPriceSgd: 46,
    packQuantity: 20,
    packPriceSgd: 920,
    unitWeightKg: 0.68,
    inventoryPacks: 10,
    active: true,
    purchaseEnabled: true,
    sortOrder: 50,
    features: ["Jeju volcanic stone", "Citrus oil 10ml included", "No flame", "No electricity", "Reusable stone"],
    usage: ["Place the stones in the pot", "Add citrus oil onto the stones", "Refresh with a few more drops when needed"],
  },
];

export function formatSgd(value: number) {
  return new Intl.NumberFormat("en-SG", {
    style: "currency",
    currency: "SGD",
    maximumFractionDigits: Number.isInteger(value) ? 0 : 2,
  }).format(value);
}

export function getBulkProduct(slug: string) {
  return bulkProducts.find((product) => product.slug === slug && product.active);
}
