// Google Merchant Center feed and sitemap from the live catalog. Synthetic products only.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { googleFeed, sitemap, feedItem } from '../api/_feeds.js';
import { defaultProducts } from '../api/_bulk-data.js';
import { toClientProduct } from '../api/_utils.js';

const products = defaultProducts.map(toClientProduct);
const items = (xml) => xml.split('<item>').slice(1);

test('feed lists only what a customer can pay for directly, at the minimum-pack total, delivery included', () => {
  const jp = googleFeed(products, 'JP');
  assert.equal(items(jp).length, 2, 'two diffusers; no cleansers in Japan');
  assert.match(jp, /<g:id>diffuser-350g-jp<\/g:id>[\s\S]*<g:price>48000 JPY<\/g:price>[\s\S]*<g:multipack>20<\/g:multipack>/);
  assert.match(jp, /<g:shipping><g:country>JP<\/g:country><g:price>0 JPY<\/g:price><\/g:shipping>/);
  const sg = googleFeed(products, 'SG');
  assert.equal(items(sg).length, 5);
  assert.match(sg, /<g:id>foam-oil-sg<\/g:id>[\s\S]*?<g:price>267\.00 SGD<\/g:price>[\s\S]*?<g:multipack>30<\/g:multipack>/);
  assert.match(sg, /<g:id>diffuser-500g-sg<\/g:id>[\s\S]*?<g:price>920\.00 SGD<\/g:price>/);
  assert.match(googleFeed(products, 'TW'), /<g:price>9600 TWD<\/g:price>/);
  assert.equal(items(googleFeed(products, 'MY')).length, 0, 'Malaysia is quote-only');
  assert.match(sg, /<g:link>https:\/\/hondit-shop\.vercel\.app\/products\/foam-oil\?market=SG&amp;lang=en<\/g:link>/);
  assert.match(sg, /<g:image_link>https:\/\/hondit-shop\.vercel\.app\/images\//);
  assert.match(sg, /<g:brand>HONDIT<\/g:brand>[\s\S]*<g:identifier_exists>no<\/g:identifier_exists>/);
});

test('feed follows admin settings: hidden market, sold out, drafts and price versions', () => {
  const p = products.find((x) => x.slug === 'diffuser-350g');
  assert.equal(feedItem({ ...p, markets: { JP: 'hidden' } }, 'JP'), null);
  assert.equal(feedItem({ ...p, markets: { JP: 'quote' } }, 'JP'), null);
  assert.equal(feedItem({ ...p, status: 'draft' }, 'JP'), null);
  assert.equal(feedItem({ ...p, stockUnits: 5 }, 'JP').availability, 'out_of_stock');
  assert.equal(feedItem({ ...p, prices: { JP: { general: { amount: 2600, currency: 'JPY', version: 'adm-x', effectiveFrom: '2026-01-01' } } } }, 'JP').price, '52000 JPY');
  assert.match(googleFeed([{ ...p, name: 'A & <B>' }], 'JP'), /A &amp; &lt;B&gt;/, 'XML is escaped');
});

test('sitemap includes published products automatically and skips drafts', () => {
  const xml = sitemap([...products, { ...products[0], slug: 'stone-candle', status: 'published' }, { ...products[0], slug: 'secret-draft', status: 'draft' }], '2026-10-19');
  assert.match(xml, /<loc>https:\/\/hondit-shop\.vercel\.app\/products\/stone-candle<\/loc><lastmod>2026-10-19<\/lastmod>/);
  assert.doesNotMatch(xml, /secret-draft/);
  assert.match(xml, /\/bulk-orders\/diffuser-350g/);
  assert.doesNotMatch(xml, /\/bulk-orders\/stone-candle/);
});

test('routes: sitemap and feeds are served by the products function; robots points to the sitemap', () => {
  const vercel = JSON.parse(fs.readFileSync('vercel.json', 'utf8'));
  assert.ok(vercel.rewrites.some((r) => r.source === '/sitemap.xml' && r.destination === '/api/products?sitemap=1'));
  assert.ok(vercel.rewrites.some((r) => r.source === '/feeds/google/:market'));
  assert.equal(fs.existsSync('public/sitemap.xml'), false, 'a static file would shadow the live sitemap');
  const robots = fs.readFileSync('public/robots.txt', 'utf8');
  assert.match(robots, /Disallow: \/admin/);
  assert.doesNotMatch(robots, /Disallow: \/api/, 'Google must be able to render pages');
  assert.match(robots, /Sitemap: https:\/\/hondit-shop\.vercel\.app\/sitemap\.xml/);
});

test('products function answers the feed with XML', async () => {
  const keep = { url: process.env.SUPABASE_URL, key: process.env.SUPABASE_SERVICE_ROLE_KEY };
  const original = globalThis.fetch;
  Object.assign(process.env, { SUPABASE_URL: 'https://mock.invalid', SUPABASE_SERVICE_ROLE_KEY: 'mock' });
  globalThis.fetch = async () => new Response(JSON.stringify(defaultProducts), { status: 200 });
  try {
    const { default: handler } = await import('../api/products.js');
    const headers = {};
    let out = '';
    const res = { statusCode: 0, status(c) { this.statusCode = c; return this; }, setHeader(k, v) { headers[k] = v; }, end(t) { out = t; } };
    await handler({ method: 'GET', query: { feed: 'google', market: 'hk' }, headers: {} }, res);
    assert.match(headers['Content-Type'], /application\/xml/);
    assert.match(out, /<g:id>diffuser-500g-hk<\/g:id>[\s\S]*<g:price>5600\.00 HKD<\/g:price>/);
  } finally {
    globalThis.fetch = original;
    for (const [k, v] of [['SUPABASE_URL', keep.url], ['SUPABASE_SERVICE_ROLE_KEY', keep.key]]) if (v === undefined) delete process.env[k]; else process.env[k] = v;
  }
});
