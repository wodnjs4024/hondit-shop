import test from 'node:test';
import assert from 'node:assert/strict';
import { productFaq, productFaqSchema } from '../shared/product-faq.js';
import { productImageAlt } from '../shared/product-story.js';
import { storefrontCatalog } from '../shared/storefront-catalog.js';
import { buildSeoPage, buildLocalizedSeoPage } from '../api/_seo-pages.js';

test('every product has questions in every language, and the schema mirrors the visible text', () => {
  for (const { slug } of storefrontCatalog) for (const lang of ['en', 'ko', 'ja', 'zh-HK', 'th', 'ms']) {
    const faq = productFaq(slug, lang);
    assert.ok(faq && faq.items.length >= 2, `${slug} ${lang}`);
    const schema = productFaqSchema(slug, lang, 'https://x/p');
    assert.deepEqual(schema.mainEntity.map((q) => q.name), faq.items.map((i) => i.question));
  }
  assert.doesNotMatch(JSON.stringify(productFaq('diffuser-350g', 'en')), /expiry|\d+\s*(days|weeks|hours)/i);
});

test('product pages carry the questions and a descriptive image alt', () => {
  const en = buildSeoPage('product', { slug: 'foam-oil', products: storefrontCatalog });
  assert.ok(en.jsonLd.some((x) => x['@type'] === 'FAQPage'));
  assert.match(en.html, /Questions about this product/);
  const ja = buildLocalizedSeoPage('product', 'ja', { slug: 'diffuser-500g', products: storefrontCatalog });
  assert.ok(ja.jsonLd.some((x) => x['@type'] === 'FAQPage' && x.inLanguage === 'ja'));
  assert.equal(productImageAlt('diffuser-350g', 'Volcanic Diffuser 350g', 'en'), 'Volcanic Diffuser 350g (Jeju volcanic scoria, black glass vessel, citrus fragrance oil)');
  assert.match(buildSeoPage('product', { slug: 'diffuser-350g', products: storefrontCatalog }).html, /alt="Volcanic Diffuser 350g \(Jeju volcanic scoria/);
});
