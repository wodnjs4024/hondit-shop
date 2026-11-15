export const PRODUCT_FAQ_LABEL: Record<string, string>;
export type ProductFaq = { language: string; label: string; items: { question: string; answer: string }[] };
export function productFaq(slug: string, language?: string): ProductFaq | null;
export function productFaqSchema(slug: string, language: string, url: string): Record<string, unknown> | null;
