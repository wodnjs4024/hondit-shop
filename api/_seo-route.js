// Server-rendered storefront pages (home, products, bulk orders, OUR JEJU, shipping, contact, policies).
// Dispatched from api/products.js as ?seoPage=<name>. Read-only: no orders, payments, prices or stock are touched.
// Everyone gets the same HTML. Market and campaign parameters do not create additional canonical URLs.
import { buildSeoPage, catalogProducts } from './_seo-pages.js';
import { setHead, shell } from './_journal-html.js';
import { getPayPalMode, getStorefrontProducts, supabase } from './_utils.js';

const PUBLIC_CACHE = 'public, max-age=0, s-maxage=60, stale-while-revalidate=300';
const q = (req, key) => (typeof req.query?.[key] === 'string' ? req.query[key] : '');
const catalogPages = new Set(['home', 'products', 'product', 'bulk', 'bulkProduct']);
const orderPages = new Set(['product', 'bulk', 'bulkProduct']);
const pickupLocales = { en: 'en_SG', ko: 'ko_KR', ja: 'ja_JP', 'zh-Hant': 'zh_HK', ms: 'ms_MY', th: 'th_TH' };

async function confirmedLiveCheckout() {
  if (process.env.VERCEL_ENV !== 'production' || getPayPalMode() !== 'live'
    || !process.env.PAYPAL_CLIENT_ID || !process.env.PAYPAL_CLIENT_SECRET) return false;
  try {
    const rows = await supabase('/site_settings?id=eq.1&select=checkout_enabled');
    return rows?.[0]?.checkout_enabled === true;
  } catch {
    return false;
  }
}

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
  const kind = q(req, 'seoPage');
  const lang = q(req, 'lang');
  const preview = process.env.VERCEL_ENV === 'preview';
  if (preview) res.setHeader('X-Robots-Tag', 'noindex, follow');
  // Only pickup has complete server copy in the other storefront languages.
  const variant = kind !== 'pickup' && lang && lang !== 'en';
  if (variant) return send(res, 200, req.method === 'HEAD' ? '' : html, PUBLIC_CACHE);
  const productionCatalog = process.env.VERCEL_ENV === 'production' && catalogPages.has(kind);
  if (productionCatalog && (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY)) {
    return send(res, 503, req.method === 'HEAD' ? '' : html, 'no-store');
  }
  const [live, checkoutLive] = await Promise.all([
    catalogPages.has(kind) ? getStorefrontProducts().catch(() => null) : null,
    orderPages.has(kind) && confirmedLiveCheckout(),
  ]);
  if (productionCatalog && !live) return send(res, 503, req.method === 'HEAD' ? '' : html, 'no-store');
  const page = buildSeoPage(kind, { slug: q(req, 'seoSlug'), policy: q(req, 'seoPolicy'), language: lang, products: catalogProducts(live || [], { liveOnly: productionCatalog }), showOrderTerms: Boolean(live && checkoutLive) });
  // A product or policy that does not exist answers 404 (the app still draws its own not-found page). Products added in the admin
  // exist only in the database, so a product slug is called unknown only when the database was read and does not list it.
  const slug = q(req, 'seoSlug');
  const missing = page.status === 404
    && (kind === 'policy' || (['product', 'bulkProduct'].includes(kind) && live && !live.some((p) => p.slug === slug)));
  if (missing) return send(res, 404, req.method === 'HEAD' ? '' : html, 'public, max-age=0, s-maxage=60');
  if (page.status !== 200) {
    return send(res, 200, req.method === 'HEAD' ? '' : html, 'no-store');
  }
  const canonicalPath = new URL(page.canonical).pathname;
  const body = setHead(html, {
    title: page.title, description: page.description, canonical: page.canonical, robots: preview ? 'noindex,follow' : 'index,follow,max-image-preview:large',
    image: page.image || html.match(/<meta\s+property="og:image"\s+content="([^"]*)"/)?.[1] || '', type: 'website',
    locale: pickupLocales[page.lang] || 'en_SG', lang: page.lang || 'en',
    alternates: page.alternates, jsonLd: page.jsonLd, storefrontPath: canonicalPath,
  }).replace('<div id="root"></div>', `<div id="root">${page.html}</div>`);
  return send(res, 200, req.method === 'HEAD' ? '' : body, PUBLIC_CACHE);
}
