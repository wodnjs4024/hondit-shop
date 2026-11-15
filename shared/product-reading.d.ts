export const READING_LABELS: Record<string, string>;
export type ReadingLink = { title: string; dek: string; path: string; language: string; hreflang: string };
export function relatedReading(articles: unknown[], slug: string, language?: string, limit?: number): ReadingLink[];
export function readingLabel(language: string): string;
