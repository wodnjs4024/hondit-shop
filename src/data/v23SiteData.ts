import { storefrontCatalog } from '../../shared/storefront-catalog.js';
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
  purchaseEnabled?: boolean;
  featured?: boolean;
  marketUnitPrices?: Partial<Record<"SG" | "HK" | "TW" | "JP" | "BN" | "MO" | "TH" | "MY", number>>;
  /* Managed in the admin (migration 008). Absent on the static copy, so the original five products render exactly as before. */
  sku?: string | null;
  status?: ProductStatus;
  contents?: Partial<Record<string, ProductContent>>;
  media?: ProductMedia[];
  markets?: Partial<Record<string, MarketMode>>;
  prices?: import("../../shared/price-versions.js").ProductPrices;
  stockUnits?: number | null;
  /** Added in the admin without approved terms in code: enquiry only, no price shown. */
  quoteOnly?: boolean;
};

export type ProductStatus = "draft" | "published" | "soldout" | "hidden";
export type MarketMode = "hidden" | "quote" | "direct";
export type ProductContent = { name?: string; shortDescription?: string; description?: string; highlights?: string[]; howTo?: string[] };
export type ProductMedia = { url: string; storagePath?: string | null; role: "main" | "gallery" | "detail"; sortOrder: number; alt?: Record<string, string> };

export const SHOPEE = "https://shopee.sg/hondit.office.sg";
export const INSTAGRAM = "https://www.instagram.com/hondit.office/";
export const EMAIL = "hondit.office@gmail.com";

export const productOrder = ["diffuser-350g", "diffuser-500g", "foam-oil", "foaming-cleanser", "cleansing-water"];

export const v23Products: StorefrontProduct[] = storefrontCatalog;

export function getV23Product(slug: string) {
  return v23Products.find((product) => product.slug === slug || product.apiSlug === slug);
}
