import test from 'node:test';
import assert from 'node:assert/strict';
import { PRODUCT_STORY, PRODUCT_STORY_LANGUAGES, productStory } from '../shared/product-story.js';
import { storefrontCatalog } from '../shared/storefront-catalog.js';
import { buildSeoPage, buildLocalizedSeoPage } from '../api/_seo-pages.js';

test('every catalog product has a full description in every storefront language', () => {
  for (const { slug } of storefrontCatalog) {
    assert.ok(PRODUCT_STORY[slug], slug);
    for (const lang of PRODUCT_STORY_LANGUAGES) {
      const story = productStory(slug, lang);
      assert.equal(story.language, lang);
      assert.equal(story.paragraphs.length, 3, `${slug} ${lang}`);
      assert.ok(story.box.length >= 1);
      assert.ok(story.paragraphs.every((p) => p.length > 40));
    }
  }
  assert.equal(productStory('diffuser-350g', 'zh-TW').language, 'zh-HK');
  assert.equal(productStory('nope', 'en'), null);
});

test('descriptions keep the maker facts and avoid claims the makers have not published', () => {
  const all = JSON.stringify(PRODUCT_STORY);
  assert.doesNotMatch(all, /handmade|unglazed|certified|hours|weeks|days of scent/i);
  for (const lang of PRODUCT_STORY_LANGUAGES) {
    assert.match(productStory('diffuser-350g', lang).box.join(' '), /75 × 100 × 75/);
    assert.match(productStory('diffuser-500g', lang).box.join(' '), /100 × 105 × 100/);
    assert.match(productStory('diffuser-500g', lang).paragraphs.join(' '), /10/);
  }
});

test('server-rendered product pages include the description', () => {
  assert.match(buildSeoPage('product', { slug: 'foam-oil', products: storefrontCatalog }).html, /About this product.*oil &gt; cream|About this product.*creamy/s);
  const ja = buildLocalizedSeoPage('product', 'ja', { slug: 'diffuser-500g', products: storefrontCatalog });
  assert.match(ja.html, /この商品について/);
});
