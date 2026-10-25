import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { reviewArticle, approvalBlockers, similarity, plainText } from '../shared/journal.js';
import { seedArticles } from '../shared/journal-seed.js';
import { seedArticles2 } from '../shared/journal-seed-2.js';

test('second batch: four unrelated-angle drafts pass review and stay unpublished', () => {
  assert.deepEqual(seedArticles2.map((a) => a.language), ['en', 'ja', 'zh-HK', 'zh-TW']);
  const all = [...seedArticles, ...seedArticles2];
  for (const a of seedArticles2) {
    const r = reviewArticle(a, { others: all.filter((o) => o.id !== a.id) });
    assert.equal(r.ok, true, `${a.content_id}: ${JSON.stringify(r.errors)}`);
    assert.equal(approvalBlockers(a, all.filter((o) => o.id !== a.id)).length, 0);
    assert.equal(a.status, 'in_review');
    for (const o of all) if (o !== a) assert.ok(similarity(plainText(a), plainText(o)) < 0.6);
  }
  assert.equal(new Set(all.map((a) => a.slug + a.language)).size, all.length);
  const groups = new Set(seedArticles.map((a) => a.group_key));
  assert.equal(new Set(seedArticles2.map((a) => a.group_key)).size, 4);
  for (const a of seedArticles2) assert.ok(!groups.has(a.group_key));
});

test('second batch: hero images exist and the SQL matches the code', () => {
  for (const a of seedArticles2) {
    const img = a.hero_image_url.replace(/^\//, '');
    assert.ok(existsSync(new URL(`../public/${img}`, import.meta.url)), img);
  }
  const sql = readFileSync(new URL('../supabase/seeds/011_journal_batch2.sql', import.meta.url), 'utf8');
  for (const a of seedArticles2) assert.ok(sql.includes(`'${a.slug}'`) && sql.includes(`'${a.content_id}'`));
});

test('journal RSS feed lists published articles with images', async () => {
  const { renderFeed } = await import('../api/_journal-route.js');
  const xml = renderFeed(seedArticles.map((a) => ({ ...a, published_at: '2026-10-25T08:14:00Z' })));
  assert.match(xml, /<rss version="2.0"/);
  assert.equal((xml.match(/<item>/g) || []).length, 4);
  assert.match(xml, /<enclosure url="https:\/\/hondit-shop\.vercel\.app\/images\//);
  assert.match(xml, /hondit-shop\.vercel\.app\/journal\/en\//);
});
