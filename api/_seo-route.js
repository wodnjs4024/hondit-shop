// Server-rendered storefront pages (home, products, bulk orders, OUR JEJU, shipping, contact, policies).
// Dispatched from api/products.js as ?seoPage=<name>. Read-only: no orders, payments, prices or stock are touched.
// Everyone gets the same HTML (no bot detection).
// Language versions: ?lang=ko|ja|zh-HK on home, products, product pages, bulk orders, OUR JEJU, About and FAQ are their own
// indexable pages (self canonical, hreflang to every version). English is the plain URL.
// Market choices (?market=JP), campaign tags and languages without their own version are the same page seen another way:
// they get the same server text and a canonical that points at the clean URL, so search engines index one page, not hundreds.
import { buildSeoPage, buildLocalizedSeoPage, catalogProducts, isSeoLanguage, seoAlternates } from './_seo-pages.js';
import { HTML_LANG, OG_LOCALE, LOCALIZED_PAGES } from '../shared/seo-locales.js';
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
  const kind = q(req, 'seoPage');
  const slug = q(req, 'seoSlug');
  let live = [];
  let liveOk = false;
  try { live = await getStorefrontProducts(); liveOk = true; } catch { live = []; }
  const products = catalogProducts(live);
  const localized = isSeoLanguage(lang) && LOCALIZED_PAGES.includes(kind);
  const english = buildSeoPage(kind, { slug, policy: q(req, 'seoPolicy'), products });
  const page = localized ? buildLocalizedSeoPage(kind, lang, { slug, products }) : english;
  // A product or policy that does not exist answers 404 (the app still draws its own not-found page). Products added in the admin
  // exist only in the database, so a product slug is called unknown only when the database was read and does not list it.
  const missing = english.status === 404
    && (kind === 'policy' || (['product', 'bulkProduct'].includes(kind) && liveOk && !live.some((p) => p.slug === slug)));
  if (missing) return send(res, 404, html, 'public, max-age=0, s-maxage=60');
  if (page.status !== 200) {
    // A product only in the database (no server text yet): the app shell, as it always was.
    return send(res, 200, html, 'no-store');
  }
  // The clean URL this request is a view of: its language version when there is one, else the English page.
  const alternates = localized || english.status === 200 ? seoAlternates(kind, slug) : [];
  const canonical = localized ? page.canonical : english.canonical;
  const shown = localized ? lang : 'en';
  const body = setHead(html, {
    title: page.title, description: page.description, canonical, robots: 'index,follow,max-image-preview:large',
    image: page.image || html.match(/<meta\s+property="og:image"\s+content="([^"]*)"/)?.[1] || '', type: 'website', locale: OG_LOCALE[shown], jsonLd: page.jsonLd, lang: HTML_LANG[shown],
    alternates,
  }).replace('<div id="root"></div>', `<div id="root">${page.html}</div>`)
    .replace('</head>', `  <meta name="hondit-ssr" content="${new URL(canonical).pathname + new URL(canonical).search}" />\n  </head>`);
  return send(res, 200, req.method === 'HEAD' ? '' : body, PUBLIC_CACHE);
}
