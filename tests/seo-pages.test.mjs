// Server-rendered storefront pages: facts match the storefront's own sources, same HTML for every visitor, no invented data.
import test from 'node:test';
import assert from 'node:assert/strict';
import Module from 'node:module';
import { buildSync } from 'esbuild';
import { buildSeoPage, catalogProducts, orderTerms, diffuserFacts } from '../api/_seo-pages.js';
import { termsFor } from '../shared/market-overrides.js';
import { getPolicyContent } from '../shared/policy-content.js';
import { pickupAlternates } from '../shared/pickup-search.js';
import { pickupRequestTotal } from '../shared/contact-copy.js';
import { JSDOM } from 'jsdom';
import { defaultProducts } from '../api/_bulk-data.js';
import handler from '../api/products.js';

const products = catalogProducts([]);
const PAGES = [
  ['home'], ['products'], ['bulk'], ['jeju'], ['pickup'], ['about'], ['faq'], ['shipping'], ['contact'], ['partners'],
  ...products.flatMap((p) => [['product', { slug: p.slug }], ['bulkProduct', { slug: p.slug }]]),
  ...['shipping', 'refund', 'privacy', 'terms'].map((policy) => ['policy', { policy }]),
];
const build = ([path, extra = {}]) => buildSeoPage(path, { ...extra, products });
const FORBIDDEN = /(cure|treat(s|ment)|heal(s|ing)|anti-?bacterial|purif|detox|dehumid|air[- ]clean|medical|clinically|guarantee|功效|공기\s*정화)/i;

test('every public storefront page has its own title, canonical, one h1 and valid JSON-LD', () => {
  const titles = new Set();
  for (const spec of PAGES) {
    const page = build(spec);
    assert.equal(page.status, 200, JSON.stringify(spec));
    assert.ok(!titles.has(page.title), `duplicate title: ${page.title}`);
    titles.add(page.title);
    assert.match(page.canonical, /^https:\/\/hondit-shop\.vercel\.app(\/[a-z0-9/-]*)?$/, page.canonical);
    assert.equal((page.html.match(/<h1[ >]/g) || []).length, 1, page.title);
    assert.ok(page.description.length > 40 && page.description.length <= 300);
    assert.ok(page.html.replace(/<[^>]+>/g, ' ').trim().length > 300, `${page.title} has real body text`);
    for (const data of page.jsonLd) assert.doesNotThrow(() => JSON.parse(JSON.stringify(data)));
  }
  assert.equal(build(['product', { slug: 'nope' }]).status, 404);
  assert.equal(build(['policy', { policy: 'nope' }]).status, 404);
});

test('no health claims, invented reviews, ratings or prices', () => {
  for (const spec of PAGES) {
    const page = build(spec);
    const text = page.html.replace(/<[^>]+>/g, ' ');
    if (spec[0] !== 'policy') assert.doesNotMatch(text, FORBIDDEN, page.title); // policy wording is the existing legal text
    for (const data of page.jsonLd) assert.doesNotMatch(JSON.stringify(data), /aggregateRating|"review"/, page.title);
  }
});

test('prices, currencies and quantities are exactly the approved checkout terms', () => {
  for (const product of products) {
    const rows = orderTerms(product);
    for (const row of rows) for (const tier of row.tiers) {
      const t = termsFor(product, row.market, tier.quantity);
      assert.equal(t.status, 'direct');
      assert.equal(t.unitMinor, tier.unitMinor);
      assert.equal(t.totalMinor, tier.totalMinor);
      assert.equal(t.billingCurrency, tier.currency);
    }
  }
  const d500 = products.find((p) => p.slug === 'diffuser-500g');
  const html = build(['product', { slug: 'diffuser-500g' }]).html;
  assert.match(html, /20 units: JPY 104000 total \(JPY 5200 per unit\), delivery included/);
  assert.match(html, /20 units: HKD 5600\.00 total \(HKD 280\.00 per unit\)/);
  assert.match(html, /20 units: SGD 920\.00 total \(SGD 46\.00 per unit\)/);
  assert.ok(orderTerms(d500).every((r) => !r.tiers.some((t) => t.quantity === 10) || r.market === 'SG'), 'only Singapore sells the 10-unit trial directly');
  assert.doesNotMatch(build(['bulkProduct', { slug: 'foam-oil' }]).html, /Japan|Taiwan/, 'cleansers are not offered in JP/TW');
});

test('StoneJeju (maker) and HONDIT (seller, curator) are kept apart', () => {
  const page = build(['product', { slug: 'diffuser-350g' }]);
  const schema = page.jsonLd.find((d) => d['@type'] === 'ItemPage');
  assert.equal(schema.mainEntity.sameAs, diffuserFacts['diffuser-350g'].source);
  assert.match(page.html, /Maker and product brand: <a[^>]*>StoneJeju<\/a>\. Seller and curator: HONDIT/);
  const home = build(['home']).html;
  assert.match(home, /student team in the GTEP programme at Jeju National University/);
  assert.match(home, /StoneJeju is the maker/);
  assert.match(home, /HONDIT does not manufacture the diffusers/);
});

test('server diffuser facts equal src/data/productFacts.ts and policy pages use the shared policy text', () => {
  const root = process.cwd();
  const out = buildSync({ stdin: { contents: 'export {diffuserFacts,diffuserCare} from "./src/data/productFacts";', resolveDir: root }, bundle: true, write: false, platform: 'node', format: 'cjs' });
  const runtime = new Module(root + '/facts-check.cjs'); runtime.paths = Module._nodeModulePaths(root); runtime._compile(out.outputFiles[0].text, root + '/facts-check.cjs');
  for (const [slug, f] of Object.entries(diffuserFacts)) {
    const src = runtime.exports.diffuserFacts[slug];
    for (const key of ['content', 'dimensions', 'container', 'oil', 'source']) assert.equal(f[key], src[key], `${slug}.${key}`);
  }
  const refund = build(['policy', { policy: 'refund' }]).html;
  for (const section of getPolicyContent('refund', 'the selected country', 'the selected market currency', true).sections) assert.ok(refund.includes(section.heading.replace(/&/g, '&amp;')) || refund.includes(section.heading));
});

async function call(query, headers = {}) {
  const res = { headers: {}, statusCode: 0, body: '', setHeader(k, v) { this.headers[k.toLowerCase()] = v; }, end(b) { this.body = b || ''; return this; } };
  await handler({ method: 'GET', query, headers }, res);
  return res;
}

test('every visitor and bot gets identical HTML; market variants point at the clean URL and unknown slugs answer 404 with the plain app shell', async () => {
  const agents = ['Mozilla/5.0 Chrome/130', 'Googlebot/2.1', 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko); compatible; OAI-SearchBot/1.0', 'PerplexityBot/1.0', 'ClaudeBot/1.0'];
  const bodies = [];
  for (const ua of agents) bodies.push((await call({ seoPage: 'product', seoSlug: 'diffuser-500g' }, { 'user-agent': ua })).body);
  assert.ok(bodies.every((b) => b === bodies[0]));
  assert.match(bodies[0], /<link rel="canonical" href="https:\/\/hondit-shop\.vercel\.app\/products\/diffuser-500g"/);
  assert.match(bodies[0], /<h1>[^<]*500g/);
  assert.match(bodies[0], /application\/ld\+json/);
  assert.match(bodies[0], /<title>[^<]*500g[^<]*HONDIT<\/title>/);
  assert.match(bodies[0], /name="robots" content="index,follow/);
  const englishMarket = await call({ seoPage: 'product', seoSlug: 'diffuser-500g', market: 'SG', lang: 'en', quantity: '20', utm_source: 'instagram' });
  assert.equal(englishMarket.body, bodies[0]);
  // A market choice is the same page: same text, canonical at the language version, so it is not indexed separately.
  const variant = await call({ seoPage: 'home', market: 'JP', lang: 'ja' });
  assert.match(variant.body, /<link rel="canonical" href="https:\/\/hondit-shop\.vercel\.app\/\?lang=ja"/);
  assert.match(variant.body, /<html lang="ja"/);
  const sgVariant = await call({ seoPage: 'product', seoSlug: 'diffuser-350g', market: 'SG', utm_source: 'instagram' });
  assert.match(sgVariant.body, /<link rel="canonical" href="https:\/\/hondit-shop\.vercel\.app\/products\/diffuser-350g"/);
  const shipJa = await call({ seoPage: 'shipping', lang: 'ja' });
  assert.match(shipJa.body, /<link rel="canonical" href="https:\/\/hondit-shop\.vercel\.app\/shipping"/, 'a page without a Japanese version points at the English one');
  assert.doesNotMatch(shipJa.body, /hreflang/);
  const unknown = await call({ seoPage: 'product', seoSlug: 'nope' });
  assert.equal(unknown.statusCode, 404);
  assert.doesNotMatch(unknown.body, /rel="canonical"/);
  assert.match(unknown.body, /<script type="module"/, 'the app still loads to draw its own not-found page');
  assert.equal((await call({ seoPage: 'policy', seoPolicy: 'nope' })).statusCode, 404);
  assert.equal((await call({ seoPage: 'policy', seoPolicy: 'refund' })).statusCode, 200);
  assert.equal((await call({ seoPage: 'product', seoSlug: 'nope', market: 'JP' })).statusCode, 404, 'an unknown product is unknown in every market');
  const home = await call({ seoPage: 'home' });
  assert.match(home.body, /<div id="root"><header>/);
  assert.match(home.body, /<script type="module"/, 'the app bundle still loads');
});

test('operator market settings narrow the page the same way they narrow checkout', () => {
  const diffuser = { ...products.find((p) => p.slug === 'diffuser-500g') };
  assert.ok(orderTerms(diffuser).some((r) => r.market === 'JP'));
  assert.ok(!orderTerms({ ...diffuser, markets: { JP: 'hidden', HK: 'quote' } }).some((r) => ['JP', 'HK'].includes(r.market)));
  const live = catalogProducts([{ slug: 'diffuser-350g', status: 'hidden', active: true }]);
  assert.ok(!live.some((p) => p.slug === 'diffuser-350g'));
});

test('contact page lists the real public channels and the organisation names its contact point', () => {
  const page = build(['contact']);
  assert.match(page.html, /hondit\.office@gmail\.com/);
  assert.match(page.html, /\+82 10-3338-2694/);
  assert.match(page.html, /hondit_jeju/);
  const org = page.jsonLd.find((d) => d['@type'] === 'Organization');
  assert.equal(org.contactPoint.email, 'hondit.office@gmail.com');
  assert.equal(org.contactPoint.telephone, '+82 10-3338-2694');
});

test('zero-decimal currencies (TWD, JPY) are shown and marked up in whole units, as PayPal charges them', () => {
  for (const slug of ['diffuser-350g', 'diffuser-500g']) {
    const rows = orderTerms(products.find((p) => p.slug === slug));
    for (const r of rows.filter((x) => ['TWD', 'JPY'].includes(x.terms?.currency || x.currency))) {
      assert.doesNotMatch(JSON.stringify(r), /\.\d\d"/, `${slug} ${JSON.stringify(r)}`);
    }
    const html = build(['bulkProduct', { slug }]).html;
    assert.match(html, /TWD \d+(?!\.)/);
    assert.doesNotMatch(html, /(TWD|JPY) \d+\.\d/);
  }
});

test('cleansing care is J’essence made by 제주리퍼블릭, sold by HONDIT, and pH 5.5 stays shown', () => {
  for (const slug of ['foam-oil', 'foaming-cleanser', 'cleansing-water']) {
    const page = buildSeoPage('product', { slug, products });
    assert.equal(page.jsonLd.find((d) => d['@type'] === 'ItemPage').mainEntity.sameAs, undefined);
    assert.match(page.html, /J’essence/);
    assert.match(page.html, /제주리퍼블릭/);
  }
  // JW confirmed pH 5.5 for the cleansing water and the foaming cleanser (the manufacturer's English material differs; kept as 5.5).
  for (const slug of ['cleansing-water', 'foaming-cleanser']) {
    const page = buildSeoPage('product', { slug, products });
    assert.match(page.html, /pH 5\.5/);
    assert.match(JSON.stringify(page.jsonLd), /pH 5\.5/);
  }
});

test('market-neutral product pages never publish a unit price as an Offer, and journal articles mark products as Thing', async () => {
  for (const slug of ['diffuser-350g', 'diffuser-500g']) {
    const product = products.find((p) => p.slug === slug);
    const page = build(['product', { slug }]);
    assert.ok(page.jsonLd.every((d) => d['@type'] !== 'Product' && !d.offers));
    const doc = new JSDOM(page.html).window.document;
    assert.equal(doc.querySelector('main img').getAttribute('src'), product.image);
    const link = doc.querySelector(`a[href="/bulk-orders/${slug}?market=SG&lang=en&quantity=10"]`);
    const term = termsFor(product, 'SG', 10);
    assert.ok(link?.textContent.includes(`SGD ${(term.totalMinor / 100).toFixed(2)} total`));
  }
  const { articleJsonLd } = await import('../api/_journal-html.js');
  const article = { title: 'T', language: 'en', related_products: ['diffuser-350g'], published_at: '2026-10-25T08:14:00Z', slug: 'x' };
  const about = articleJsonLd(article)[0].about;
  assert.ok(about.every((a) => a['@type'] === 'Thing' && !('offers' in a) && !('review' in a) && !('aggregateRating' in a)));
});

test('pickup initial HTML matches its public language and pricing, and campaign variants point to a clean canonical', async () => {
  for (const { hreflang, path } of pickupAlternates.filter(item => item.hreflang !== 'x-default')) {
    const url = new URL(path, 'https://hondit-shop.vercel.app');
    const lang = url.searchParams.get('lang') || 'en';
    const response = await call({ seoPage: 'pickup', lang, market: 'SG', utm_source: 'instagram', quantity: '2' });
    const doc = new JSDOM(response.body).window.document;
    assert.equal(response.statusCode, 200);
    assert.equal(doc.documentElement.lang, hreflang);
    assert.equal(doc.querySelector('link[rel="canonical"]').href, url.href);
    assert.equal(doc.querySelectorAll('link[hreflang]').length, 7);
    assert.match(doc.querySelector('h1').textContent, /\S/);
    for (const size of ['350g', '500g']) assert.ok(doc.body.textContent.includes(pickupRequestTotal(1, size).toLocaleString('en-US')));
    assert.doesNotMatch(response.body, /"@type":"Offer"|utm_source/);
  }
});

test('public price text requires confirmed live checkout; pickup has no catalog dependency', async () => {
  const keys = ['VERCEL_ENV', 'SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY', 'PAYPAL_MODE', 'PAYPAL_CLIENT_ID', 'PAYPAL_CLIENT_SECRET'];
  const original = Object.fromEntries(keys.map(key => [key, process.env[key]]));
  const fetchBefore = globalThis.fetch;
  try {
    Object.assign(process.env, {
      VERCEL_ENV: 'production', SUPABASE_URL: 'https://mock.invalid', SUPABASE_SERVICE_ROLE_KEY: 'synthetic',
      PAYPAL_MODE: 'live', PAYPAL_CLIENT_ID: 'synthetic', PAYPAL_CLIENT_SECRET: 'synthetic',
    });
    let enabled = true;
    let failed = false;
    let requests = 0;
    globalThis.fetch = async (url) => {
      requests++;
      const path = new URL(url).pathname;
      if (path.endsWith('/site_settings')) return Response.json([{ checkout_enabled: enabled }]);
      if (failed) throw new Error('Mock catalog unavailable');
      return Response.json(defaultProducts);
    };
    const query = { seoPage: 'product', seoSlug: 'diffuser-350g', market: 'SG', lang: 'en' };
    assert.match((await call(query)).body, /SGD 230\.00 total/);
    const thaiQuery = { seoPage: 'product', seoSlug: 'diffuser-350g', lang: 'th' };
    assert.match((await call(thaiQuery)).body, /ยอดรวม THB [\d.]+/);
    assert.doesNotMatch((await call({ ...thaiQuery, market: 'SG' })).body, /ยอดรวม THB/);
    enabled = false;
    assert.doesNotMatch((await call(query)).body, /SGD 230\.00 total/);
    assert.doesNotMatch((await call(thaiQuery)).body, /ยอดรวม THB/);
    failed = true;
    const product = await call(query);
    assert.equal(product.statusCode, 503);
    assert.equal(product.headers['cache-control'], 'no-store');
    const before = requests;
    assert.equal((await call({ seoPage: 'pickup', lang: 'ja' })).statusCode, 200);
    assert.equal(requests, before);
    process.env.VERCEL_ENV = 'preview';
    const preview = await call({ seoPage: 'pickup' });
    assert.equal(preview.headers['x-robots-tag'], 'noindex, follow');
    assert.match(preview.body, /name="robots" content="noindex,follow"/);
  } finally {
    globalThis.fetch = fetchBefore;
    for (const key of keys) {
      if (original[key] === undefined) delete process.env[key];
      else process.env[key] = original[key];
    }
  }
});

test('About and FAQ pages carry the trust facts and FAQPage data from the shared content', () => {
  const about = build(['about']);
  const text = about.html.replace(/<[^>]+>/g, ' ');
  assert.match(text, /StoneJeju/);
  assert.match(text, /102 Jejudaehak-ro/);
  assert.match(text, /hondit\.office@gmail\.com/);
  assert.match(text, /637-12-03059/);
  const faq = build(['faq']);
  for (const page of [about, faq]) {
    const ld = page.jsonLd.find((d) => d['@type'] === 'FAQPage');
    assert.ok(ld.mainEntity.length >= 3);
    for (const q of ld.mainEntity) assert.ok(page.html.includes(q.name.replace(/&/g, '&amp;')) || page.html.includes(q.name));
  }
  assert.equal(about.jsonLd.find((d) => d['@type'] === 'Organization')['@id'], 'https://hondit-shop.vercel.app/#organization');
});

test('the app head logic keeps /about and /faq indexable instead of treating them as not found', async () => {
  const { readFile } = await import('node:fs/promises');
  const source = await readFile(new URL('../src/App.tsx', import.meta.url), 'utf8');
  assert.match(source, /pathname === "\/about" \|\| pathname === "\/faq"/);
});

import { buildLocalizedSeoPage, seoAlternates } from '../api/_seo-pages.js';
import { LOCALES, SEO_LANGUAGES } from '../shared/seo-locales.js';
import { sitemap } from '../api/_feeds.js';

const LOCAL_PAGES = [['home'], ['products'], ['bulk'], ['jeju'], ['about'], ['faq'], ...products.map((p) => ['product', { slug: p.slug }])];

test('Korean, Japanese and Traditional Chinese versions: own title, self canonical, hreflang to every version, one h1, no claims', () => {
  for (const lang of ['ko', 'ja', 'zh-HK']) {
    const titles = new Set();
    for (const [path, extra = {}] of LOCAL_PAGES) {
      const page = buildLocalizedSeoPage(path, lang, { ...extra, products });
      assert.equal(page.status, 200, `${lang} ${path}`);
      assert.ok(!titles.has(page.title), `duplicate ${lang} title ${page.title}`);
      titles.add(page.title);
      assert.ok(page.canonical.endsWith(`?lang=${lang}`), page.canonical);
      assert.equal((page.html.match(/<h1[ >]/g) || []).length, 1);
      assert.ok(page.description.length > 30 && page.description.length <= 300, `${lang} ${path} description`);
      const text = page.html.replace(/<[^>]+>/g, ' ');
      assert.doesNotMatch(text, FORBIDDEN, `${lang} ${path}`);
      assert.doesNotMatch(text, /(정화|淨化|浄化|除濕|除湿|제습|殺菌|살균|治療|치료|効果|功效|효능)/, `${lang} ${path} health wording`);
      const hreflangs = page.alternates.map((a) => a.hreflang);
      for (const h of ['en', 'ko', 'ja', 'zh-Hant', 'zh-HK', 'zh-TW', 'x-default']) assert.ok(hreflangs.includes(h), `${lang} ${path} ${h}`);
      assert.ok(page.alternates.some((a) => a.href === page.canonical), 'self reference');
      // internal links stay in the language
      assert.match(page.html, new RegExp(`href="/products\\?lang=${lang}"|href="/\\?lang=${lang}"`));
    }
  }
  // Facts stay identical: dimensions and prices come from the same sources as the English page.
  const ja = buildLocalizedSeoPage('product', 'ja', { slug: 'diffuser-500g', products }).html;
  assert.match(ja, /100 × 105 × 100 mm/);
  assert.match(ja, /20個：1個あたり JPY 5200（送料込み） · 合計 JPY 104000/);
  const zh = buildLocalizedSeoPage('faq', 'zh-HK', { products }).html;
  assert.match(zh, /擴香石/);
  assert.match(zh, /手信/);
});

test('every language has copy for every catalog product, and the English pages list the language versions', () => {
  for (const lang of ['ko', 'ja', 'zh-HK']) for (const p of products) assert.ok(LOCALES[lang].products[p.slug], `${lang} ${p.slug}`);
  assert.deepEqual(SEO_LANGUAGES, ['en', 'ko', 'ja', 'zh-HK']);
  assert.equal(seoAlternates('product', 'admin-only-product').length, 0, 'a product without translated copy has no language versions');
  assert.equal(seoAlternates('shipping').length, 0);
});

test('served language version: localized head, html lang and server marker for the app', async () => {
  const res = await call({ seoPage: 'faq', lang: 'zh-HK' });
  assert.equal(res.statusCode, 200);
  assert.match(res.body, /<html lang="zh-Hant"/);
  assert.match(res.body, /<link rel="canonical" href="https:\/\/hondit-shop\.vercel\.app\/faq\?lang=zh-HK"/);
  assert.match(res.body, /hreflang="ja" href="https:\/\/hondit-shop\.vercel\.app\/faq\?lang=ja"/);
  assert.match(res.body, /<title>濟州火山石擴香石 FAQ/);
  assert.match(res.body, /<meta name="hondit-ssr" content="\/faq\?lang=zh-HK"/);
  assert.match(res.body, /"@type":"FAQPage"/);
  const en = await call({ seoPage: 'home' });
  assert.match(en.body, /hreflang="x-default" href="https:\/\/hondit-shop\.vercel\.app\/"/);
});

test('sitemap lists each language version with hreflang links and product images', () => {
  const xml = sitemap(products.map((p) => ({ ...p, status: 'published' })));
  for (const lang of ['ko', 'ja', 'zh-HK']) {
    assert.match(xml, new RegExp(`<loc>https://hondit-shop\\.vercel\\.app/faq\\?lang=${lang}</loc>`));
    assert.match(xml, new RegExp(`<loc>https://hondit-shop\\.vercel\\.app/products/diffuser-350g\\?lang=${lang}</loc>`));
  }
  assert.doesNotMatch(xml, /shipping\?lang=/);
  assert.doesNotMatch(xml, /<loc>[^<]+\/bulk-orders\//);
  assert.match(xml, /<image:loc>https:\/\/hondit-shop\.vercel\.app\/images\/diffuser-350g\.webp<\/image:loc>/);
  assert.equal(new Set(xml.match(/<loc>[^<]+<\/loc>/g)).size, xml.match(/<loc>[^<]+<\/loc>/g).length, 'no duplicate URLs');
});

test('business guide has useful initial HTML and product order routes stay reachable without being indexed', async () => {
  const partners = await call({ seoPage: 'partners', utm_source: 'instagram' });
  const partnerDoc = new JSDOM(partners.body).window.document;
  assert.equal(partners.statusCode, 200);
  assert.equal(partnerDoc.querySelector('link[rel=canonical]').href, 'https://hondit-shop.vercel.app/partners');
  assert.equal(partnerDoc.querySelector('main h1').textContent, 'Store & business purchase guide');
  assert.ok(partnerDoc.querySelector('main a[href="/bulk-orders"]'));
  const order = await call({ seoPage: 'bulkProduct', seoSlug: 'diffuser-350g', market: 'SG', quantity: '10' });
  assert.equal(order.statusCode, 200);
  assert.match(order.body, /<meta name="robots" content="noindex,follow"/);
});

test('the app keeps the server head on the first view and builds language canonicals the same way', async () => {
  const { readFile } = await import('node:fs/promises');
  const source = await readFile(new URL('../src/App.tsx', import.meta.url), 'utf8');
  assert.match(source, /meta\[name="hondit-ssr"\]/);
  assert.match(source, /canonicalSeoLanguage\(searchLanguage, location\.pathname\)/);
});
