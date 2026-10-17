import { cleanProductUsage } from "../../shared/page-sales.js";
import { catalogCopy } from "../data/catalogCopy";
import type { StorefrontProduct } from "../data/v23SiteData";
import { formatMarketUnitMoney, marketProductText, type DisplayLanguage, type MarketConfig } from "./market";

/* One place that decides what a customer reads for a product:
   the admin's text for the visitor's language first, then today's translated copy (unchanged for the original five products). */
export type ContentLanguage = "ko" | "en" | "ja" | "zh" | "ms" | "th";
export function contentLanguage(language: DisplayLanguage): ContentLanguage {
  return language === "zh" || language === "zh-HK" || language === "zh-TW" ? "zh" : language;
}

type TextField = "name" | "shortDescription" | "description";
function adminText(product: StorefrontProduct, language: DisplayLanguage, field: TextField) {
  const value = product.contents?.[contentLanguage(language)]?.[field];
  return typeof value === "string" && value.trim() ? value : "";
}

export const productName = (product: StorefrontProduct, language: DisplayLanguage) =>
  adminText(product, language, "name") || marketProductText(language, product.name);
export const productDetail = (product: StorefrontProduct, language: DisplayLanguage) =>
  adminText(product, language, "shortDescription") || marketProductText(language, product.detail);
export const productDescription = (product: StorefrontProduct, language: DisplayLanguage, fallback = product.description) =>
  adminText(product, language, "description") || marketProductText(language, fallback);

export function productList(product: StorefrontProduct, language: DisplayLanguage, field: "highlights" | "howTo") {
  const own = product.contents?.[contentLanguage(language)]?.[field];
  if (Array.isArray(own) && own.some((item) => item.trim())) return own.filter((item) => item.trim());
  return cleanProductUsage(product[field] || []).map((item: string) => marketProductText(language, item));
}

/* Photos added in the admin replace the built-in set for that role; products without admin photos keep theirs. */
export function productMainImage(product: StorefrontProduct) {
  return product.media?.find((item) => item.role === "main")?.url || product.image;
}
export function productGallery(product: StorefrontProduct) {
  return (product.media || []).filter((item) => item.role === "gallery").map((item) => item.url);
}

/* Products added in the admin have no approved price yet: never show a converted or zero price for them. */
export function productPriceLabel(product: StorefrontProduct, market: MarketConfig, language: DisplayLanguage) {
  return product.quoteOnly ? catalogCopy(language).priceOnRequest : formatMarketUnitMoney(product, market);
}
