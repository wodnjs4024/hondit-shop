export type BulkCategory = "cleansing" | "diffuser";

const imagePackRoot = "/images/hondit-pack/hondit_codex_image_pack";
const packImages = {
  fullLineReal: `${imagePackRoot}/01_product_originals/15_full_product_line_real.webp`,
  fullLineShipping: `${imagePackRoot}/02_brand_lifestyle/09_full_line_shipping.webp`,
  cleansingTrio: `${imagePackRoot}/02_brand_lifestyle/03_cleansing_trio_ice.webp`,
  diffuserPair: `${imagePackRoot}/02_brand_lifestyle/05_diffuser_350_editorial.webp`,
  diffuser350Studio: `${imagePackRoot}/01_product_originals/02_diffuser_350_studio.webp`,
  diffuser350Window: `${imagePackRoot}/01_product_originals/03_diffuser_350_window.webp`,
  diffuser350Stone: `${imagePackRoot}/01_product_originals/04_diffuser_350_stone.webp`,
  diffuser350Shelf: `${imagePackRoot}/01_product_originals/05_diffuser_350_shelf.webp`,
  diffuser500Studio: `${imagePackRoot}/01_product_originals/06_diffuser_500_studio.webp`,
  diffuser500Window: `${imagePackRoot}/01_product_originals/07_diffuser_500_window.webp`,
  diffuser500Wood: `${imagePackRoot}/01_product_originals/08_diffuser_500_wood.webp`,
  foamingCutout: `${imagePackRoot}/01_product_originals/09_foaming_cleanser_cutout.webp`,
  foamingPack: `${imagePackRoot}/01_product_originals/10_foaming_cleanser_pack.webp`,
  foamingLifestyle: `${imagePackRoot}/01_product_originals/11_foaming_cleanser_lifestyle.webp`,
  foamOil: `${imagePackRoot}/01_product_originals/12_foam_oil_cleanser.webp`,
  cleansingWaterPack: `${imagePackRoot}/01_product_originals/13_cleansing_water_pack.webp`,
  cleansingWaterCutout: `${imagePackRoot}/01_product_originals/14_cleansing_water_cutout.webp`,
  jejuSea: `${imagePackRoot}/03_jeju_real_photos/08_hamdeok_beach.webp`,
  jejuStone: `${imagePackRoot}/03_jeju_real_photos/11_jusangjeolli_cliff.webp`,
};

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
  galleryImages?: string[];
  detailImages?: string[];
  detailHighlights?: string[];
  detailHowToUse?: string[];
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
    imageUrl: packImages.foamOil,
    unitPriceSgd: 8.99,
    packQuantity: 30,
    packPriceSgd: 269.7,
    unitWeightKg: 0.18,
    inventoryPacks: 20,
    active: true,
    purchaseEnabled: true,
    sortOrder: 10,
    features: ["Vegan", "pH 5.5", "Fragrance-free"],
    usage: ["For sunscreen and makeup removal", "Use as the first step of an evening cleansing routine"],
    galleryImages: [packImages.foamOil, packImages.cleansingTrio, packImages.fullLineReal, packImages.jejuSea],
    detailImages: [packImages.foamOil, packImages.cleansingTrio, packImages.fullLineReal],
    detailHighlights: ["Melts makeup and sunscreen before rinsing.", "Gentle pH 5.5 vegan cleansing routine.", "Best as an evening first cleanse."],
    detailHowToUse: ["Apply to dry hands and face.", "Massage over makeup and sunscreen.", "Add water to emulsify, then rinse clean."],
  },
  {
    id: "foaming-cleanser",
    slug: "foaming-cleanser",
    name: "J'essence Vegan Foaming Cleanser",
    category: "cleansing",
    volumeLabel: "200ml",
    shortDescription: "Soft daily face wash for a clean, comfortable finish.",
    description: "A soft foaming cleanser for everyday wash routines, selected for simple and clear skin care.",
    imageUrl: packImages.foamingPack,
    unitPriceSgd: 8.99,
    packQuantity: 30,
    packPriceSgd: 269.7,
    unitWeightKg: 0.23,
    inventoryPacks: 20,
    active: true,
    purchaseEnabled: true,
    sortOrder: 20,
    features: ["Vegan", "pH 5.5", "Sensitive skin routine"],
    usage: ["For morning or evening cleansing", "Pair with Foam Oil after sunscreen-heavy days"],
    galleryImages: [packImages.foamingPack, packImages.foamingCutout, packImages.foamingLifestyle, packImages.cleansingTrio],
    detailImages: [packImages.foamingPack, packImages.foamingLifestyle, packImages.cleansingTrio],
    detailHighlights: ["Soft daily foam for a comfortable finish.", "Designed for morning and evening routines.", "Pairs well after Foam Oil on sunscreen-heavy days."],
    detailHowToUse: ["Dispense onto wet hands.", "Lather into a soft foam.", "Massage over face and rinse thoroughly."],
  },
  {
    id: "cleansing-water",
    slug: "cleansing-water",
    name: "J'essence Vegan Cleansing Water",
    category: "cleansing",
    volumeLabel: "300ml",
    shortDescription: "Light cleansing water for quick reset moments.",
    description: "A lightweight cleansing water for light makeup, sunscreen residue and quick daily cleansing.",
    imageUrl: packImages.cleansingWaterPack,
    unitPriceSgd: 8.99,
    packQuantity: 30,
    packPriceSgd: 269.7,
    unitWeightKg: 0.34,
    inventoryPacks: 20,
    active: true,
    purchaseEnabled: true,
    sortOrder: 30,
    features: ["Vegan", "pH 5.5", "No-rinse routine"],
    usage: ["Apply with cotton pad", "Use for light makeup or a quick cleanse"],
    galleryImages: [packImages.cleansingWaterPack, packImages.cleansingWaterCutout, packImages.cleansingTrio, packImages.jejuSea],
    detailImages: [packImages.cleansingWaterPack, packImages.cleansingWaterCutout, packImages.cleansingTrio],
    detailHighlights: ["Light cleansing water for quick reset moments.", "Useful for light makeup and low-effort cleansing.", "Fresh wipe-clean feeling without heaviness."],
    detailHowToUse: ["Soak a cotton pad with cleansing water.", "Swipe gently across face and neck.", "Repeat as needed and follow with cleanser if desired."],
  },
  {
    id: "diffuser-350g",
    slug: "diffuser-350g",
    name: "Volcanic Stone Diffuser",
    category: "diffuser",
    volumeLabel: "350g",
    shortDescription: "Compact volcanic stone scent object for smaller corners.",
    description: "A compact Jeju volcanic stone diffuser with citrus oil, suited for desks, shelves and personal spaces.",
    imageUrl: packImages.diffuser350Studio,
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
    galleryImages: [packImages.diffuser350Studio, packImages.diffuser350Window, packImages.diffuser350Stone, packImages.diffuser350Shelf, packImages.diffuserPair],
    detailImages: [packImages.diffuser350Studio, packImages.diffuser350Window, packImages.diffuser350Stone, packImages.diffuserPair],
    detailHighlights: ["Compact volcanic stone scent object.", "No flame, electricity or reed sticks.", "Best for desks, shelves and personal corners."],
    detailHowToUse: ["Place the Jeju volcanic stones in the pot.", "Add 10-12 drops of citrus oil onto the stones.", "Refresh with a few more drops whenever needed."],
  },
  {
    id: "diffuser-500g",
    slug: "diffuser-500g",
    name: "Volcanic Stone Diffuser",
    category: "diffuser",
    volumeLabel: "500g",
    shortDescription: "Fuller volcanic stone diffuser for rooms and shared spaces.",
    description: "A larger Jeju volcanic stone diffuser with citrus oil, suited for bedrooms, bathrooms and shared spaces.",
    imageUrl: packImages.diffuser500Studio,
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
    galleryImages: [packImages.diffuser500Studio, packImages.diffuser500Window, packImages.diffuser500Wood, packImages.diffuserPair, packImages.jejuStone],
    detailImages: [packImages.diffuser500Studio, packImages.diffuser500Window, packImages.diffuser500Wood, packImages.diffuserPair],
    detailHighlights: ["Fuller volcanic stone diffuser for shared spaces.", "A calm scent object with visible texture.", "Best for bedrooms, bathrooms and larger corners."],
    detailHowToUse: ["Place the Jeju volcanic stones in the pot.", "Add 10-12 drops of citrus oil onto the stones.", "Refresh with a few more drops whenever needed."],
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
