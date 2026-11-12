// IndexNow sends only this site's sitemap URLs with a key the site publishes.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { INDEXNOW_KEY, sitemapUrls, indexNowPayload, indexNowRoute } from '../api/_indexnow.js';

test('key file is published at the site root and matches the key', async () => {
  assert.match(INDEXNOW_KEY, /^[a-f0-9]{32}$/);
  assert.equal(await readFile(new URL(`../public/${INDEXNOW_KEY}.txt`, import.meta.url), 'utf8'), INDEXNOW_KEY);
  const vercel = JSON.parse(await readFile(new URL('../vercel.json', import.meta.url), 'utf8'));
  assert.ok(vercel.crons.some((c) => c.path === '/api/products?indexnow=run'));
});

test('only own URLs, de-duplicated, with ampersands decoded', () => {
  const xml = '<loc>https://hondit-shop.vercel.app/</loc><loc>https://hondit-shop.vercel.app/faq?lang=ja</loc><loc>https://hondit-shop.vercel.app/</loc><loc>https://evil.example/x</loc><loc>https://hondit-shop.vercel.app/a?x=1&amp;y=2</loc>';
  assert.deepEqual(sitemapUrls(xml), ['https://hondit-shop.vercel.app/', 'https://hondit-shop.vercel.app/faq?lang=ja', 'https://hondit-shop.vercel.app/a?x=1&y=2']);
  const p = indexNowPayload(['https://hondit-shop.vercel.app/']);
  assert.equal(p.host, 'hondit-shop.vercel.app');
  assert.equal(p.keyLocation, `https://hondit-shop.vercel.app/${INDEXNOW_KEY}.txt`);
});

test('route refuses extra parameters and non-GET, and caches a successful run', async () => {
  const call = async (query, method = 'GET') => {
    const res = { headers: {}, statusCode: 0, body: '', setHeader(k, v) { this.headers[k.toLowerCase()] = v; }, end(b) { this.body = b; } };
    await indexNowRoute({ method, query }, res, async () => '<loc>https://hondit-shop.vercel.app/</loc>');
    return res;
  };
  assert.equal((await call({ indexnow: 'run', x: '1' })).statusCode, 400);
  assert.equal((await call({ indexnow: 'run' }, 'POST')).statusCode, 405);
  const realFetch = globalThis.fetch;
  let sent;
  globalThis.fetch = async (url, init) => { sent = { url, body: JSON.parse(init.body) }; return { status: 202 }; };
  try {
    const ok = await call({ indexnow: 'run' });
    assert.equal(ok.statusCode, 200);
    assert.match(ok.headers['cache-control'], /s-maxage=21600/);
    assert.equal(sent.url, 'https://api.indexnow.org/indexnow');
    assert.deepEqual(sent.body.urlList, ['https://hondit-shop.vercel.app/']);
  } finally { globalThis.fetch = realFetch; }
});
