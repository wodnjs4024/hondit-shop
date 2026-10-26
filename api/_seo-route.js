// Server-rendered storefront pages (home, products, bulk orders, OUR JEJU, shipping, contact, policies).
// Dispatched from api/products.js as ?seoPage=<name>. Read-only: no orders, payments, prices or stock are touched.
// Everyone gets the same HTML. Pages are served as-is when the visitor picked a market or language in the URL
// (those variants keep their previous behaviour: this change adds content, it does not decide their indexing).
import { buildSeoPage, catalogProducts } from './_seo-pages.js';
import { setHead, shell } from './_journal-html.js';
import { getStorefrontProducts } from './_utils.js';

const PUBLIC_CACHE = 'public, max-age=0, s-maxage=60, stale-while-revalidate=300';
const q = (req, key) => (typeof req.query?.[key] === 'string' ? req.query[key] : '');

function send(res, status, html, cache) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', cache);
  res.setHeader('X-Content-Type-Options', 'nosniff');
  return res.end(html);
}

export async function seoRoute(req, res) {
  if (!['GET', 'HEAD'].includes(req.method)) { res.setHeader('Allow', 'GET, HEAD'); res.statusCode = 405; return res.end('Method not allowed'); }
  const html = await shell();
  const lang = q(req, 'lang');
  // A chosen market or non-English language is a different view of the page: leave it exactly as before.
  const variant = Boolean(q(req, 'market')) || (lang && lang !== 'en');
  let live = [];
  let liveOk = false;
  try { live = await getStorefrontProducts(); liveOk = true; } catch { live = []; }
  const page = buildSeoPage(q(req, 'seoPage'), { slug: q(req, 'seoSlug'), policy: q(req, 'seoPolicy'), products: catalogProducts(live) });
  // A product or policy that does not exist answers 404 (the app still draws its own not-found page). Products added in the admin
  // exist only in the database, so a product slug is called unknown only when the database was read and does not list it.
  const kind = q(req, 'seoPage');
  const slug = q(req, 'seoSlug');
  const missing = page.status === 404 && !variant
    && (kind === 'policy' || (['product', 'bulkProduct'].includes(kind) && liveOk && !live.some((p) => p.slug === slug)));
  if (missing) return send(res, 404, html, 'public, max-age=0, s-maxage=60');
  if (page.status !== 200 || variant) {
    // Unknown product or policy, or a market/language variant: the app shell, as it always was (React shows its own not-found page).
    return send(res, 200, html, variant ? PUBLIC_CACHE : 'no-store');
  }
  const body = setHead(html, {
    title: page.title, description: page.description, canonical: page.canonical, robots: 'index,follow,max-image-preview:large',
    image: page.image || html.match(/<meta\s+property="og:image"\s+content="([^"]*)"/)?.[1] || '', type: 'website', locale: 'en_SG', jsonLd: page.jsonLd, lang: 'en',
  }).replace('<div id="root"></div>', `<div id="root">${page.html}</div>`);
  return send(res, 200, req.method === 'HEAD' ? '' : body, PUBLIC_CACHE);
}
