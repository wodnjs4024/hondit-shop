// Four-market answer coverage (JP, HK, TW, SG): broad souvenir and brand questions are answered on each country guide
// in its own language, each market's structured data carries only that market's offer, and the 350g is shown with a
// 350g photo everywhere.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { buildSeoPage, buildLocalizedSeoPage, catalogProducts } from '../api/_seo-pages.js';
import { defaultProducts } from '../api/_bulk-data.js';
import { toClientProduct } from '../api/_utils.js';
import { merchantOffer } from '../api/_merchant.js';
import { infoPageFor } from '../shared/info-content.js';

const rows = defaultProducts.map(toClientProduct);
const products = catalogProducts(rows);
const guides = { SG: ['/diffusers', 'SGD'], JP: ['/diffusers/japan', 'JPY'], HK: ['/diffusers/hong-kong', 'HKD'], TW: ['/diffusers/taiwan', 'TWD'] };

test('each country guide answers the souvenir and brand questions in its language, in HTML and FAQPage', () => {
  const brand = { SG: /What is HONDIT\?/, JP: /HONDIT（ホンディット）とは/, HK: /HONDIT 是甚麼/, TW: /HONDIT 是什麼/ };
  for (const [market, [path]] of Object.entries(guides)) {
    const page = buildSeoPage('diffuserGuide', { guidePath: path, products, offerRows: rows });
    assert.match(page.html, brand[market]);
    assert.match(page.html, /StoneJeju/);
    assert.match(page.html, /GTEP/);
    const faq = page.jsonLd.find((d) => d['@type'] === 'FAQPage');
    assert.ok(faq.mainEntity.some((q) => brand[market].test(q.name)), market);
  }
});

test('country guides carry offers for their own market only, identical to the merchant pages', () => {
  for (const [market, [path, currency]] of Object.entries(guides)) {
    const page = buildSeoPage('diffuserGuide', { guidePath: path, products, offerRows: rows });
    const list = page.jsonLd.find((d) => d['@type'] === 'CollectionPage').mainEntity.itemListElement;
    for (const entry of list) {
      const offers = entry.item.offers;
      assert.ok(offers.length >= 1);
      for (const offer of offers) {
        assert.equal(offer.priceCurrency, currency);
        assert.equal(offer.eligibleRegion.name, market);
        const { item } = merchantOffer(rows.find((r) => r.slug === entry.item.sku), market);
        assert.equal(offer.price, item.priceAmount);
        assert.equal(offer.url, item.link);
        assert.equal(offer.eligibleQuantity.value, item.quantity);
      }
    }
    // Without confirmed live checkout (no rows) there is no offer at all.
    const plain = buildSeoPage('diffuserGuide', { guidePath: path, products });
    assert.doesNotMatch(JSON.stringify(plain.jsonLd), /"Offer"/);
  }
  const hk = JSON.stringify(buildSeoPage('diffuserGuide', { guidePath: '/diffusers/hong-kong', products, offerRows: rows }).jsonLd);
  assert.doesNotMatch(hk, /JPY|\/merchant\/JP\//);
});

test('the Japanese product page carries the JP offer; multi-market pages stay market-neutral', () => {
  for (const slug of ['diffuser-350g', 'diffuser-500g']) {
    const ja = buildLocalizedSeoPage('product', 'ja', { slug, products, offerRows: rows }).jsonLd[0].mainEntity;
    assert.equal(ja['@type'], 'Product');
    assert.deepEqual(ja.offers.map((o) => o.priceCurrency), ['JPY']);
    assert.equal(ja.brand.name, 'StoneJeju');
    for (const lang of ['zh-HK', 'ko']) {
      assert.equal(buildLocalizedSeoPage('product', lang, { slug, products, offerRows: rows }).jsonLd[0].mainEntity['@type'], 'Thing');
    }
    assert.equal(buildSeoPage('product', { slug, products, offerRows: rows }).jsonLd[0].mainEntity['@type'], 'Thing');
  }
});

test('About pages name the official shop and the HONDIT–StoneJeju relationship in each language', () => {
  for (const [lang, pattern] of [['en', /official shop/], ['ja', /公式サイト/], ['zh-HK', /官方網站/]]) {
    const about = infoPageFor('about', lang);
    assert.ok(about.faq.some((f) => pattern.test(f.q) && f.a.includes('https://hondit-shop.vercel.app')), lang);
    assert.match(about.intro[0], /StoneJeju/);
    assert.match(about.intro[0], /GTEP/);
  }
  assert.match(infoPageFor('about', 'ja').intro[0], /HONDIT（ホンディット）/);
});

test('the 350g is never shown with the 500g onggi photo', () => {
  const source = readFileSync(new URL('../src/data/bulkProducts.ts', import.meta.url), 'utf8');
  assert.doesNotMatch(source, /diffuser350Studio|imageUrl: packImages\.diffuser500Studio/);
  assert.match(source, /diffuser350Main: "\/images\/diffuser-350g\.webp"/);
  const d350 = source.slice(source.indexOf('id: "diffuser-350g"'), source.indexOf('id: "diffuser-500g"'));
  assert.doesNotMatch(d350, /diffuser500|_500_|350_studio/);
  const d500 = source.slice(source.indexOf('id: "diffuser-500g"'), source.indexOf('export const livePaymentTestProduct'));
  assert.doesNotMatch(d500, /diffuserPair|350/);
  assert.doesNotMatch(readFileSync(new URL('../api/_bulk-data.js', import.meta.url), 'utf8'), /02_diffuser_350_studio/);
});

test('llms.txt maps each country to its own guide', () => {
  const llms = readFileSync(new URL('../public/llms.txt', import.meta.url), 'utf8');
  for (const [, [path, currency]] of Object.entries(guides)) assert.ok(llms.includes(`https://hondit-shop.vercel.app${path} (${currency}`));
  assert.match(llms, /HONDIT（ホンディット）/);
});
