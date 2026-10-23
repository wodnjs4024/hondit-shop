export type JournalCopy = { journal: string; kicker: string; listTitle: string; listDek: string; published: string; updated: string; by: string; related: string; shop: string; contact: string; partners: string; sources: string; other: string; empty: string; read: string; authorTypes: Record<string, string>; preview: string };
export const PRODUCT_NAMES: Record<string, string>;
export const PRODUCT_IMAGES: Record<string, string>;
export const JOURNAL_COPY: Record<string, JournalCopy>;
export function copyFor(language: string | null | undefined): JournalCopy;
