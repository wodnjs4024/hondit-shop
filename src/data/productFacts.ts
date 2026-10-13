// Verified against StoneJeju product-detail images on 2026-10-13.
// Supplier domestic retail prices intentionally excluded from customer price data.
export const diffuserFacts = {
  "diffuser-350g": {
    officialName: "볼카닉 디퓨져 350",
    content: "350g ±",
    dimensions: "75 × 100 × 75 mm",
    container: "Glass vessel",
    oil: "10mL",
    description:
      "Compact Jeju volcanic scoria diffuser with a glass vessel and 10mL citrus fragrance oil.",
    source: "https://stonejeju.com/product/detail.html?product_no=42",
    image: "/images/diffuser-350g.webp",
  },
  "diffuser-500g": {
    officialName: "볼카닉 디퓨져 500",
    content: "500g ±",
    dimensions: "100 × 105 × 100 mm",
    container: "Jeju onggi pottery",
    oil: "10mL",
    description:
      "Jeju volcanic scoria diffuser with Jeju onggi pottery and 10mL citrus fragrance oil.",
    source: "https://stonejeju.com/product/detail.html?product_no=41",
    image: "/images/diffuser-500g.webp",
  },
} as const;
export function productFacts(slug: string) {
  return diffuserFacts[slug as keyof typeof diffuserFacts];
}
export const diffuserCare = [
  "Natural stone varies in size and colour and may shed fine powder.",
  "Avoid prolonged contact with sensitive or damaged skin. Follow the product label.",
  "Rinse the stone in warm water and dry completely before changing the fragrance.",
];
