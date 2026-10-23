import type { JournalArticle } from './journal';
export const SOURCE_DOC: string;
export const JOURNAL_FACTS: { id: string; label: string; url: string; facts: string[] }[];
export const seedArticles: JournalArticle[];
export const seedPress: Record<string, unknown>[];
