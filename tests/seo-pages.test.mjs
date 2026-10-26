// Server-rendered storefront pages: facts match the storefront's own sources, same HTML for every visitor, no invented data.
import test from 'node:test';
import assert from 'node:assert/strict';
import Module from 'node:module';
import { buildSync } from 'esbuild';
import { buildSeoPage, catalogProducts, orderTerms, diffuserFacts, productSchema } from '../api/_seo-pages.js';
import { termsFor } from '../shared/market-overrides.js';
import { getPolicyContent } from '../shared/policy-content.js';
import handler from '../api/products.js';

const products = catalogProducts([]);
const PAGES = [
  ['home'], ['products'], ['bulk'], ['jeju'], ['shipping'], ['contact'],
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
      assert.equal(t.billingCurrency, tier.currency);
    }
  }
  const d500 = products.find((p) => p.slug === 'diffuser-500g');
  const html = build(['product', { slug: 'diffuser-500g' }]).html;
  assert.match(html, /Japan<\/strong>: 20 units: JPY 5200 per unit, delivery included/);
  assert.match(html, /Hong Kong<\/strong>: 20 units: HKD 280\.00 per unit/);
  assert.match(html, /Malaysia<\/strong>: 20 units: SGD 46\.00 per unit/);
  assert.ok(orderTerms(d500).every((r) => !r.tiers.some((t) => t.quantity === 10) || r.market === 'SG'), 'only Singapore sells the 10-unit trial directly');
  assert.doesNotMatch(build(['bulkProduct', { slug: 'foam-oil' }]).html, /Japan|Taiwan/, 'cleansers are not offered in JP/TW');
});

test('StoneJeju (maker) and HONDIT (seller, curator) are kept apart', () => {
  const page = build(['product', { slug: 'diffuser-350g' }]);
  const schema = page.jsonLd.find((d) => d['@type'] === 'Product');
  assert.equal(schema.brand.name, 'StoneJeju');
  assert.equal(schema.manufacturer.name, 'StoneJeju');
  assert.ok(schema.offers.length > 5 && schema.offers.every((o) => o.seller.name === 'HONDIT' && Number(o.price) > 0));
  assert.match(page.html, /Maker and product brand: <a[^>]*>StoneJeju<\/a>\. Seller and curator: HONDIT/);
  const home = build(['home']).html;
  assert.match(home, /student team in the GTEP programme at Jeju National University/);
  assert.match(home, /StoneJeju is the maker/);
  assert.match(home, /HONDIT does not manufacture the diffusers/);
  assert.equal(productSchema(products.find((p) => p.slug === 'foam-oil'), []).brand.name, 'HONDIT');
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

test('every visitor and bot gets identical HTML; market/language variants and unknown slugs keep the plain app shell', async () => {
  const agents = ['Mozilla/5.0 Chrome/130', 'Googlebot/2.1', 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko); compatible; OAI-SearchBot/1.0', 'PerplexityBot/1.0', 'ClaudeBot/1.0'];
  const bodies = [];
  for (const ua of agents) bodies.push((await call({ seoPage: 'product', seoSlug: 'diffuser-500g' }, { 'user-agent': ua })).body);
  assert.ok(bodies.every((b) => b === bodies[0]));
  assert.match(bodies[0], /<link rel="canonical" href="https:\/\/hondit-shop\.vercel\.app\/products\/diffuser-500g"/);
  assert.match(bodies[0], /<h1>[^<]*500g/);
  assert.match(bodies[0], /application\/ld\+json/);
  assert.match(bodies[0], /<title>[^<]*500g[^<]*HONDIT<\/title>/);
  assert.match(bodies[0], /name="robots" content="index,follow/);
  const variant = await call({ seoPage: 'home', market: 'JP', lang: 'ja' });
  assert.doesNotMatch(variant.body, /rel="canonical"/);
  assert.doesNotMatch(variant.body, /Jeju volcanic-stone diffusers and everyday care/);
  const unknown = await call({ seoPage: 'product', seoSlug: 'nope' });
  assert.equal(unknown.statusCode, 200);
  assert.doesNotMatch(unknown.body, /rel="canonical"/);
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
