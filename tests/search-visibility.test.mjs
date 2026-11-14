import test from 'node:test';
import assert from 'node:assert/strict';
import { defaultProducts } from '../api/_bulk-data.js';
import { merchantOffer, merchantHtml } from '../api/_merchant.js';
import { googleFeed } from '../api/_feeds.js';
import { buildSeoPage } from '../api/_seo-pages.js';
import { visitCountUrl, visitCountEvent } from '../shared/visit-count.js';

test('diffuser Shopping titles keep the name first and add the words buyers search in each market', () => {
  const expected = { SG: ['en', /Lava Stone Aroma Diffuser.*No Electricity — \d+ units$/], JP: ['ja', /溶岩石 アロマストーン.*電気不要 — \d+個$/], HK: ['zh-HK', /擴香石.*免插電 — \d+件$/], TW: ['zh-TW', /擴香石.*免插電/], TH: ['th', /หินหอมภูเขาไฟเชจู.* \d+ ชิ้น$/], MY: ['ms', /Batu aroma lava Jeju.* \d+ unit$/] };
  for (const slug of ['diffuser-350g', 'diffuser-500g']) {
    const product = defaultProducts.find((p) => p.slug === slug);
    for (const [market, [language, pattern]] of Object.entries(expected)) {
      const { item } = merchantOffer(product, market, language);
      assert.ok(item, `${slug} ${market}`);
      assert.match(item.title, pattern);
      assert.ok(item.title.length <= 150);
      assert.doesNotMatch(item.title, /กรัม 350g|กรัม 500g/, 'volume is never repeated');
      assert.equal(item.productType, 'Home & Garden > Home Fragrance > Aroma Stone Diffusers');
    }
  }
  const feed = googleFeed(defaultProducts, 'SG');
  assert.match(feed, /<g:product_type>Home &amp; Garden &gt; Home Fragrance &gt; Aroma Stone Diffusers<\/g:product_type>/);
  assert.match(feed, /<g:product_type>Health &amp; Beauty &gt; Skin Care &gt; Facial Cleansers<\/g:product_type>/);
});

test('Shopping landing page uses the basalt palette, not the retired cream and green', () => {
  const { item } = merchantOffer(defaultProducts.find((p) => p.slug === 'diffuser-350g'), 'SG', 'en');
  const html = merchantHtml(item);
  assert.doesNotMatch(html, /#f8f5ef|#243b32/i);
  assert.match(html, /#1a1c1d/);
  assert.match(html, /<h1>[^<]*Lava Stone[^<]*<\/h1>/);
});

test('Organization carries a logo and the WebSite names its publisher', () => {
  const home = buildSeoPage('home');
  const org = home.jsonLd.find((x) => x['@type'] === 'Organization');
  assert.match(org.logo.url, /\/images\/hondit-logo\.png$/);
  const site = home.jsonLd.find((x) => x['@type'] === 'WebSite');
  assert.equal(site.publisher['@id'], org['@id']);
});

test('cookieless visit counts never send order, admin or personal query data', () => {
  assert.equal(visitCountUrl('https://hondit-shop.vercel.app/order-complete/HD-123?token=x'), null);
  assert.equal(visitCountUrl('https://hondit-shop.vercel.app/payment-failed/HD-1'), null);
  assert.equal(visitCountUrl('https://hondit-shop.vercel.app/admin/orders'), null);
  assert.equal(visitCountUrl('https://hondit-shop.vercel.app/products/diffuser-350g?lang=ja&email=a@b.c&utm_source=google&quantity=20'),
    'https://hondit-shop.vercel.app/products/diffuser-350g?lang=ja&utm_source=google');
  assert.equal(visitCountUrl('not a url'), null);
  assert.deepEqual(visitCountEvent({ type: 'pageview', url: 'https://hondit-shop.vercel.app/?market=JP&name=x' }), { type: 'pageview', url: 'https://hondit-shop.vercel.app/?market=JP' });
});
