import { cleanProductUsage } from "../../shared/page-sales.js";
import { bulkProducts, type BulkProduct } from "../data/bulkProducts";
import { productOrder, v23Products, type StorefrontProduct } from "../data/v23SiteData";
import { fetchBulkProducts } from "./bulkApi";

/* Admin-managed fields carried onto every storefront product. */
function managedFields(apiProduct: BulkProduct) {
  return {
    sku: apiProduct.sku ?? null,
    status: apiProduct.status,
    contents: apiProduct.contents,
    media: apiProduct.media,
    markets: apiProduct.markets,
    stockUnits: apiProduct.stockUnits,
  };
}

/* The original five products: built-in story, photos and translations, with live sale state from the database.
   Stock keeps today's formula when the database row predates unit stock (stockUnits undefined). */
function mergeProduct(staticProduct: StorefrontProduct, apiProduct?: BulkProduct): StorefrontProduct {
  if (!apiProduct) return {...staticProduct,howTo:cleanProductUsage(staticProduct.howTo)};
  return {
    ...staticProduct,
    howTo: cleanProductUsage(staticProduct.howTo),
    active: apiProduct.active,
    purchaseEnabled: apiProduct.purchaseEnabled,
    stockQuantity: apiProduct.stockUnits === undefined ? apiProduct.inventoryPacks * apiProduct.packQuantity : apiProduct.stockUnits ?? undefined,
    bulkUnitPrice: apiProduct.unitPriceSgd,
    marketUnitPrices: apiProduct.marketUnitPrices ?? staticProduct.marketUnitPrices,
    bulkMoq: apiProduct.packQuantity,
    bulkStep: 10,
    ...managedFields(apiProduct),
  };
}

/* A product added in the admin: everything comes from the database. No approved price exists yet, so it is enquiry-only. */
function fromApiProduct(apiProduct: BulkProduct): StorefrontProduct {
  const en = apiProduct.contents?.en;
  const main = apiProduct.media?.find((item) => item.role === "main")?.url;
  return {
    slug: apiProduct.slug,
    apiSlug: apiProduct.slug,
    name: en?.name || apiProduct.name,
    shortName: en?.name || apiProduct.name,
    category: apiProduct.category === "diffuser" ? "SCENT" : "CARE",
    badge: "",
    detail: en?.shortDescription || apiProduct.shortDescription,
    description: en?.description || apiProduct.description,
    price: "",
    image: main || apiProduct.imageUrl,
    shopee: "",
    highlights: en?.highlights?.length ? en.highlights : apiProduct.features || [],
    howTo: cleanProductUsage(en?.howTo?.length ? en.howTo : apiProduct.usage || []),
    goodFor: "",
    bulkUnitPrice: 0,
    bulkMoq: Math.max(1, apiProduct.packQuantity || 1),
    bulkStep: 1,
    stockQuantity: apiProduct.stockUnits ?? undefined,
    active: apiProduct.active,
    purchaseEnabled: apiProduct.purchaseEnabled,
    quoteOnly: true,
    ...managedFields(apiProduct),
  };
}

/* Database first: the storefront lists what the database publishes (drafts and hidden products never appear).
   If the database cannot be read, fetchBulkProducts returns the built-in five, so the shop keeps working as before. */
export function composeStorefrontProducts(apiProducts: BulkProduct[]): StorefrontProduct[] {
  const listed = apiProducts
    .filter((item) => item.status !== "draft" && item.status !== "hidden")
    .map((item) => {
      const builtIn = v23Products.find((product) => product.apiSlug === item.slug);
      return builtIn ? mergeProduct(builtIn, item) : fromApiProduct(item);
    })
    .filter((product) => product.active !== false);
  const rank = (product: StorefrontProduct) => {
    const known = productOrder.indexOf(product.slug);
    if (known >= 0) return known;
    const api = apiProducts.find((item) => item.slug === product.slug);
    return productOrder.length + (api?.sortOrder ?? 1000) / 10000;
  };
  return listed.sort((a, b) => rank(a) - rank(b));
}

export async function loadStorefrontProducts() {
  const apiProducts = await fetchBulkProducts().catch(() => bulkProducts);
  return composeStorefrontProducts(apiProducts);
}

export async function loadStorefrontProduct(slug: string) {
  const products = await loadStorefrontProducts();
  return products.find((product) => product.slug === slug || product.apiSlug === slug);
}
