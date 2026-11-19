// Journal batch 4: four market gift guides pass the automated review, differ from every other article, stay in_review,
// state the Jeju-only availability until March 2027, quote no prices, and the SQL matches the code.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { reviewArticle, articlePath } from '../shared/journal.js';
import { seedArticles } from '../shared/journal-seed.js';
import { seedArticles3 } from '../shared/journal-seed-3.js';
import { seedArticles4 } from '../shared/journal-seed-4.js';
import { articleMarkup } from '../api/_journal-html.js';
import { pickupFaq, AVAILABILITY } from '../shared/pickup-faq.js';

const all = [...seedArticles, ...seedArticles3, ...seedArticles4];

test('batch 4 articles pass the automated review against every other article', () => {
  assert.equal(seedArticles4.length, 4);
  for (const a of seedArticles4) {
    const r = reviewArticle(a, { others: all });
    assert.deepEqual(r.errors, [], a.content_id);
    assert.equal(a.status, 'in_review');
    assert.ok(!a.published_at && !a.publish_at);
  }
  assert.deepEqual(seedArticles4.map((a) => a.language).sort(), ['en', 'ja', 'zh-HK', 'zh-TW']);
  assert.equal(new Set(seedArticles4.map((a) => a.group_key)).size, 1, 'one guide adapted per market, linked by hreflang');
  assert.equal(new Set(seedArticles4.map((a) => articlePath(a))).size, 4);
  const earlier = new Set([...seedArticles, ...seedArticles3].map((a) => a.hero_image_url));
  assert.equal(new Set(seedArticles4.map((a) => a.hero_image_url)).size, 4, 'each guide has its own hero photo');
  for (const a of seedArticles4) assert.ok(!earlier.has(a.hero_image_url), `${a.content_id} reuses an earlier hero photo`);
});

test('each guide states the Jeju-only availability until March 2027 and quotes no prices', () => {
  const until = { en: /March 2027/, ja: /2027年3月/, 'zh-HK': /2027 年 3 月/, 'zh-TW': /2027 年 3 月/ };
  for (const a of seedArticles4) {
    assert.match(a.dek, until[a.language], a.content_id);
    assert.match(a.body_md, until[a.language], a.content_id);
    assert.doesNotMatch(a.body_md, /\b(SGD|S\$|HKD|HK\$|NT\$|TWD|JPY|KRW|¥)\s?\d|\d\s?(円|元|ウォン)/, `${a.content_id} quotes a price`);
    assert.match(a.body_md, /\(\/products\/diffuser-350g\)/);
    assert.match(a.body_md, /\(\/jeju\/pickup\)/);
  }
});

test('articles render with their order links and the SQL file is generated from the code', async () => {
  for (const a of seedArticles4) {
    const html = articleMarkup({ ...a, published_at: '2026-11-19T00:00:00Z' }, []);
    assert.match(html, /<h1/);
    assert.match(html, /href="\/products\/diffuser-350g\?market=/);
  }
  const sql = await readFile(new URL('../supabase/seeds/015_journal_batch4.sql', import.meta.url), 'utf8');
  for (const a of seedArticles4) assert.ok(sql.includes(a.content_id) && sql.includes(a.slug));
  assert.match(sql, /'in_review'/);
  assert.doesNotMatch(sql, /'published'/);
});

test('pickup FAQ exists in four languages, matches the pickup terms and carries the availability line', () => {
  for (const lang of ['en', 'ko', 'ja', 'zh-HK']) {
    const faq = pickupFaq(lang);
    assert.equal(faq.items.length, 5, lang);
    const text = faq.items.flat().join(' ');
    assert.match(text, /18,000/);
    assert.match(text, /40,000/);
    assert.ok(text.includes(AVAILABILITY[lang]), lang);
  }
  assert.equal(pickupFaq('zh-TW').language, 'zh-HK');
  assert.equal(pickupFaq('th'), null, 'no FAQ markup where there is no translated FAQ');
});
