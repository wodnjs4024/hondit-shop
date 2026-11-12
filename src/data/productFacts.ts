// Verified against StoneJeju product-detail images on 2026-10-13.
// Supplier domestic retail prices intentionally excluded from customer price data.
import { diffuserSpecs as diffuserFacts } from "../../shared/diffuser-guide.js";
export { diffuserFacts };
export { diffuserCare } from "../../shared/diffuser-guide.js";
export function productFacts(slug: string) {
  return diffuserFacts[slug as keyof typeof diffuserFacts];
}
