// Cookieless page counts (Vercel Web Analytics). No cookie, no stored visitor ID and no cross-site tracking,
// so it runs for every visitor; Google Analytics stays behind the consent choice. Only the path and the
// few parameters that say where a visit came from are sent; order, admin and payment pages are never sent.
const PRIVATE = /^\/(admin|order-complete|payment-failed|api)(\/|$)/;
const KEEP = ['lang', 'market', 'utm_source', 'utm_medium', 'utm_campaign', 'link_id'];
export function visitCountUrl(href) {
  let url;
  try { url = new URL(href); } catch { return null; }
  if (PRIVATE.test(url.pathname)) return null;
  const kept = new URLSearchParams();
  for (const key of KEEP) { const value = url.searchParams.get(key); if (value) kept.set(key, value.slice(0, 80)); }
  const query = kept.toString();
  return url.origin + url.pathname + (query ? `?${query}` : '');
}
export function visitCountEvent(event) {
  const url = visitCountUrl(event?.url);
  return url ? { ...event, url } : null;
}
