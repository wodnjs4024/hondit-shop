import test from 'node:test';
import assert from 'node:assert/strict';
import { relatedReading, readingLabel } from '../shared/product-reading.js';
import { buildSeoPage, buildLocalizedSeoPage } from '../api/_seo-pages.js';
import { storefrontCatalog } from '../shared/storefront-catalog.js';

const articles = [
  { language: 'en', slug: 'a-en', title: 'EN old', published_at: '2026-10-01T00:00:00Z', related_products: ['diffuser-350g'] },
  { language: 'en', slug: 'b-en', title: 'EN new', published_at: '2026-11-01T00:00:00Z', related_products: ['diffuser-350g'] },
  { language: 'ja', slug: 'c-ja', title: 'JA', published_at: '2026-11-02T00:00:00Z', related_products: ['diffuser-350g'] },
  { language: 'zh-TW', slug: 'd-tw', title: 'TW', published_at: '2026-11-03T00:00:00Z', related_products: ['diffuser-350g'] },
  { language: 'en', slug: 'e-en', title: 'Other product', published_at: '2026-11-04T00:00:00Z', related_products: ['foam-oil'] },
  { language: 'xx', slug: 'bad', title: 'Unknown language', related_products: ['diffuser-350g'] },
];

test('product reading list keeps only articles about the product, page language first, newest first', () => {
  assert.deepEqual(relatedReading(articles, 'diffuser-350g', 'en').map((a) => a.title), ['EN new', 'EN old', 'TW', 'JA']);
  assert.deepEqual(relatedReading(articles, 'diffuser-350g', 'ja').map((a) => a.title)[0], 'JA');
  assert.deepEqual(relatedReading(articles, 'diffuser-350g', 'zh-HK').map((a) => a.path)[0], '/journal/zh-tw/d-tw');
  assert.equal(relatedReading(articles, 'diffuser-500g', 'en').length, 0);
  assert.equal(relatedReading(null, 'diffuser-350g').length, 0);
  assert.equal(readingLabel('zh-TW'), readingLabel('zh-HK'));
});

test('server-rendered product pages link related Journal articles, and stay clean without them', () => {
  const en = buildSeoPage('product', { slug: 'diffuser-350g', products: storefrontCatalog, articles });
  assert.match(en.html, /Read more in the Journal.*href="\/journal\/en\/b-en" hreflang="en"/s);
  assert.doesNotMatch(buildSeoPage('product', { slug: 'diffuser-350g', products: storefrontCatalog }).html, /Read more in the Journal/);
  const ja = buildLocalizedSeoPage('product', 'ja', { slug: 'diffuser-350g', products: storefrontCatalog, articles });
  assert.match(ja.html, /ジャーナルで読む.*\/journal\/ja\/c-ja/s);
});
