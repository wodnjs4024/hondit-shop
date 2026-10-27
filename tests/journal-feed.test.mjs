import test from 'node:test';
import assert from 'node:assert/strict';
import { seedArticles } from '../shared/journal-seed.js';

test('journal RSS feed lists published articles with images', async () => {
  const { renderFeed } = await import('../api/_journal-route.js');
  const xml = renderFeed(seedArticles.map((a) => ({ ...a, published_at: '2026-10-25T08:14:00Z' })));
  assert.match(xml, /<rss version="2.0"/);
  assert.equal((xml.match(/<item>/g) || []).length, 4);
  assert.match(xml, /<enclosure url="https:\/\/hondit-shop\.vercel\.app\/images\//);
  assert.match(xml, /hondit-shop\.vercel\.app\/journal\/en\//);
});
