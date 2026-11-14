export const PRODUCT_STORY_LANGUAGES: string[];
export const PRODUCT_STORY_LABELS: Record<string, { heading: string; box: string; maker: string }>;
export const PRODUCT_STORY: Record<string, unknown>;
export function productStory(slug: string, language?: string): null | { paragraphs: string[]; box: string[]; maker: string; labels: { heading: string; box: string; maker: string }; language: string };
