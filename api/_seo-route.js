// Server-rendered storefront pages (home, products, bulk orders, OUR JEJU, shipping, contact, policies).
// Dispatched from api/products.js as ?seoPage=<name>. Read-only: no orders, payments, prices or stock are touched.
// Everyone gets the same HTML. Market and campaign parameters do not create additional canonical URLs.
import { buildSeoPage, buildLocalizedSeoPage, catalogProducts, seoAlternates } from './_seo-pages.js';
import { canonicalSeoLanguage, HTML_LANG, OG_LOCALE, LOCALIZED_PAGES } from '../shared/seo-locales.js';
import { setHead, shell } from './_journal-html.js';
import { getPayPalMode, getStorefrontProducts, supabase } from './_utils.js';
import { homeHeroPoster } from '../shared/storefront-catalog.js';

const PUBLIC_CACHE = 'public, max-age=0, s-maxage=60, stale-while-revalidate=300';
const q = (req, key) => (typeof req.query?.[key] === 'string' ? req.query[key] : '');
const catalogPages = new Set(['home', 'products', 'product', 'bulk', 'bulkProduct']);
const orderPages = new Set(['product', 'bulk', 'bulkProduct']);
const pickupLocales = { en: 'en_SG', ko: 'ko_KR', ja: 'ja_JP', 'zh-Hant': 'zh_HK', ms: 'ms_MY', th: 'th_TH' };

export async function confirmedLiveCheckout() {
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
  const slug = q(req, 'seoSlug');
  const guidePath = '/diffusers' + (q(req, 'seoGuide') ? '/' + q(req, 'seoGuide') : '');
  const preview = process.env.VERCEL_ENV === 'preview';
  if (preview) res.setHeader('X-Robots-Tag', 'noindex, follow');
  if (kind === 'product' && q(req, 'preview') === '1') {
    res.setHeader('X-Robots-Tag', 'noindex, follow');
    return send(res, 200, req.method === 'HEAD' ? '' : html, 'no-store');
  }
  const productionCatalog = process.env.VERCEL_ENV === 'production' && catalogPages.has(kind);
  if (productionCatalog && (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY)) {
    return send(res, 503, req.method === 'HEAD' ? '' : html, 'no-store');
  }
  const [live, checkoutLive] = await Promise.all([
    catalogPages.has(kind) ? getStorefrontProducts().catch(() => null) : null,
    orderPages.has(kind) && confirmedLiveCheckout(),
  ]);
  if (productionCatalog && !live) return send(res, 503, req.method === 'HEAD' ? '' : html, 'no-store');
  const products = catalogProducts(live || [], { liveOnly: productionCatalog });
  const showOrderTerms = Boolean(live && checkoutLive);
  const indexedLang = canonicalSeoLanguage(lang);
  const localized = indexedLang !== 'en' && LOCALIZED_PAGES.includes(kind);
  const page = localized
    ? buildLocalizedSeoPage(kind, indexedLang, { slug, products, showOrderTerms })
    : buildSeoPage(kind, { slug, policy: q(req, 'seoPolicy'), language: lang, guidePath, products, showOrderTerms });
  // A product or policy that does not exist answers 404 (the app still draws its own not-found page). Products added in the admin
  // exist only in the database, so a product slug is called unknown only when the database was read and does not list it.
  const missing = page.status === 404
    && (kind === 'policy' || kind === 'diffuserGuide'
      || (['product', 'bulkProduct'].includes(kind) && live && !live.some((p) => p.slug === slug)));
  if (missing) return send(res, 404, req.method === 'HEAD' ? '' : html, 'public, max-age=0, s-maxage=60');
  if (page.status !== 200) {
    return send(res, 200, req.method === 'HEAD' ? '' : html, 'no-store');
  }
  const canonical = new URL(page.canonical);
  if (kind === 'home') res.setHeader('Link', `<${homeHeroPoster}>; rel=preload; as=image; fetchpriority=high`);
  const body = setHead(html, {
    title: page.title, description: page.description, canonical: page.canonical,
    robots: preview || kind === 'bulkProduct' ? 'noindex,follow' : 'index,follow,max-image-preview:large',
    image: page.image || html.match(/<meta\s+property="og:image"\s+content="([^"]*)"/)?.[1] || '', type: 'website',
    locale: page.locale || pickupLocales[page.lang] || (localized ? OG_LOCALE[indexedLang] : 'en_SG'),
    lang: page.lang || (localized ? HTML_LANG[indexedLang] : 'en'),
    alternates: page.alternates || seoAlternates(kind, slug), jsonLd: page.jsonLd, storefrontPath: canonical.pathname + canonical.search,
  }).replace('<div id="root"></div>', `<div id="root">${page.html}</div>`);
  return send(res, 200, req.method === 'HEAD' ? '' : body, PUBLIC_CACHE);
}
