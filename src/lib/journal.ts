import type { JournalArticle } from "../../shared/journal";
import { getAdminToken } from "./bulkApi";

export type JournalListResponse = { articles: JournalArticle[]; preview: boolean };
export type JournalArticleResponse = { article: JournalArticle; translations: Pick<JournalArticle, "id" | "language" | "slug" | "title">[]; preview: boolean };
type SsrData = ({ kind: "list"; language: string | null } & JournalListResponse) | ({ kind: "article" } & JournalArticleResponse);

/* The server-rendered page embeds the same data it rendered; the first React render uses it instead of refetching. */
let ssr: SsrData | null | undefined;
function takeSsr(): SsrData | null {
  if (ssr !== undefined) return ssr;
  try {
    const node = typeof document === "undefined" ? null : document.getElementById("journal-ssr");
    ssr = node?.textContent ? (JSON.parse(node.textContent) as SsrData) : null;
  } catch { ssr = null; }
  return ssr;
}
export function initialList(language: string | null): JournalListResponse | null {
  const data = takeSsr();
  return data?.kind === "list" && data.language === language ? data : null;
}
export function initialArticle(language: string, slug: string): JournalArticleResponse | null {
  const data = takeSsr();
  return data?.kind === "article" && data.article.language === language && data.article.slug === slug ? data : null;
}

async function read<T>(response: Response): Promise<T> {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw Object.assign(new Error(data.error || "Journal request failed"), { status: response.status });
  return data as T;
}
export async function fetchJournalList(language: string | null) {
  return read<JournalListResponse>(await fetch(`/api/journal${language ? `?lang=${encodeURIComponent(language)}` : ""}`, { cache: "no-store" }));
}
export async function fetchJournalArticle(language: string, slug: string, preview = false) {
  const token = preview ? getAdminToken() : "";
  return read<JournalArticleResponse>(await fetch(`/api/journal?lang=${encodeURIComponent(language)}&slug=${encodeURIComponent(slug)}${preview ? "&preview=1" : ""}`, { cache: "no-store", headers: token ? { Authorization: `Bearer ${token}` } : {} }));
}
