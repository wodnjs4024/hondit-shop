// Journal batch 3: four search-driven articles pass the automated review, differ from the live ones, stay in_review, and the SQL matches the code.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { reviewArticle, articlePath } from '../shared/journal.js';
import { seedArticles } from '../shared/journal-seed.js';
import { seedArticles3 } from '../shared/journal-seed-3.js';
import { articleMarkup } from '../api/_journal-html.js';

test('batch 3 articles pass the automated review against every other article', () => {
  assert.equal(seedArticles3.length, 4);
  for (const a of seedArticles3) {
    const r = reviewArticle(a, { others: [...seedArticles, ...seedArticles3] });
    assert.deepEqual(r.errors, [], a.content_id);
    assert.equal(a.status, 'in_review');
    assert.ok(!a.published_at && !a.publish_at);
  }
  assert.deepEqual(seedArticles3.map((a) => a.language).sort(), ['en', 'ja', 'zh-HK', 'zh-TW']);
  assert.equal(new Set(seedArticles3.map((a) => a.group_key)).size, 4, 'four separate stories, not translations of one');
  assert.equal(new Set(seedArticles3.map((a) => articlePath(a))).size, 4);
});

test('order paragraphs state the approved conditions and no prices or single-unit promises', () => {
  for (const a of seedArticles3) {
    assert.doesNotMatch(a.body_md, /\b(SGD|S\$|HKD|HK\$|NT\$|TWD|JPY|¥)\s?\d|\d\s?(円|元)/, `${a.content_id} quotes a price`);
    assert.match(a.body_md, /\(\/products\/diffuser-350g\)/);
    assert.match(a.body_md, /10/);
  }
  assert.match(seedArticles3.find((a) => a.language === 'en').body_md, /5, 10 or 20 or more units/);
  for (const lang of ['ja', 'zh-HK', 'zh-TW']) assert.match(seedArticles3.find((a) => a.language === lang).body_md, /5/);
});

test('articles render with their order links and the SQL file is generated from the code', async () => {
  for (const a of seedArticles3) {
    const html = articleMarkup({ ...a, id: a.id, published_at: '2026-11-13T00:00:00Z' }, []);
    assert.match(html, /<h1/);
    assert.match(html, /href="\/products\/diffuser-350g\?market=/);
  }
  const sql = await readFile(new URL('../supabase/seeds/012_journal_batch3.sql', import.meta.url), 'utf8');
  for (const a of seedArticles3) assert.ok(sql.includes(a.content_id) && sql.includes(a.slug));
  assert.match(sql, /'in_review'/);
  assert.doesNotMatch(sql, /'published'/);
});
