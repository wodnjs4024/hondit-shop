// HONDIT Journal + press outreach against an in-memory PostgREST stand-in and a mocked OpenAI.
// No real database, AI, Gmail, Metricool or Google Sheets call is made; any unexpected host makes the test fail.
import test from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import { reviewArticle, similarity, plainText, buildDistribution, kstToUtc, articlePath, ISSUED_LINK_IDS, PIPELINE_COLUMNS } from '../shared/journal.js';
import { seedArticles, seedPress } from '../shared/journal-seed.js';
import { defaultProducts } from '../api/_bulk-data.js';

/* ---------- in-memory PostgREST ---------- */
const UNIQUE = {
  journal_articles: [['language', 'slug'], ['content_id']],
  journal_distributions: [['article_id', 'channel'], ['link_id']],
  pr_outreach: [['outlet', 'market'], ['content_id'], ['link_id']],
  link_registry: [['link_id']],
};
function fakeDb({ tables = true } = {}) {
  const data = { journal_articles: [], journal_publish_log: [], journal_distributions: [], pr_outreach: [], link_registry: [] };
  const writes = [];
  let seq = 0;
  const match = (row, params) => {
    for (const [key, raw] of params) {
      if (['select', 'order', 'limit', 'on_conflict'].includes(key)) continue;
      const [op, ...rest] = raw.split('.');
      const value = rest.join('.');
      const cell = row[key];
      if (op === 'eq' && String(cell) !== value) return false;
      if (op === 'neq' && String(cell) === value) return false;
      if (op === 'lte' && !(cell && new Date(cell) <= new Date(value))) return false;
      if (op === 'in' && !value.replace(/^\(|\)$/g, '').split(',').includes(String(cell))) return false;
    }
    return true;
  };
  const guard = (before, after) => {
    if (after.status === 'published' && before?.status !== 'published') {
      const r = after.review || {};
      if (!after.approved_at || !after.approved_by || !r.facts || !r.claims || !r.images) throw new Error('Journal article cannot be published without approval and completed review');
    }
  };
  const conflict = (table, row, rows) => (UNIQUE[table] || []).some((cols) => cols.every((c) => row[c] !== undefined && row[c] !== null) && rows.some((o) => o !== row && cols.every((c) => o[c] === row[c])));
  const handle = (url, options = {}) => {
    const u = new URL(url);
    const table = u.pathname.replace('/rest/v1/', '');
    if (!(table in data)) return new Response(JSON.stringify({ message: `relation "public.${table}" does not exist` }), { status: 404 });
    if (!tables) return new Response(JSON.stringify({ message: `Could not find the table 'public.${table}' in the schema cache` }), { status: 404 });
    const params = [...u.searchParams.entries()];
    const rows = data[table];
    const method = options.method || 'GET';
    const prefer = String(options.headers?.Prefer || '');
    if (method !== 'GET') writes.push(`${method} ${table}`);
    if (method === 'GET') {
      let out = rows.filter((r) => match(r, params));
      const order = u.searchParams.get('order');
      if (order) { const [col, dir] = order.split(',')[0].split('.'); out = [...out].sort((a, b) => (String(a[col] ?? '') < String(b[col] ?? '') ? -1 : 1) * (dir === 'desc' ? -1 : 1)); }
      const limit = Number(u.searchParams.get('limit') || 0);
      return new Response(JSON.stringify(limit ? out.slice(0, limit) : out), { status: 200 });
    }
    if (method === 'POST') {
      const input = JSON.parse(options.body);
      const list = Array.isArray(input) ? input : [input];
      const created = [];
      for (const item of list) {
        const row = { id: item.id || `row-${++seq}`, created_at: new Date().toISOString(), updated_at: new Date().toISOString(), ...(table === 'journal_articles' ? { status: 'draft', review: {}, publish_attempts: 0, sources: [], related_products: [] } : {}), ...(table === 'pr_outreach' ? { approval_status: 'pending', send_status: 'not_sent', reply_status: 'none', metrics: {} } : {}), ...item };
        if (table === 'journal_publish_log') row.id = ++seq;
        if (conflict(table, row, rows)) {
          if (prefer.includes('ignore-duplicates')) continue;
          return new Response(JSON.stringify({ message: 'duplicate key value violates unique constraint' }), { status: 409 });
        }
        if (table === 'journal_articles') guard(null, row);
        rows.push(row);
        created.push(row);
      }
      return new Response(prefer.includes('return=minimal') ? '' : JSON.stringify(created), { status: 201 });
    }
    if (method === 'PATCH') {
      const patch = JSON.parse(options.body);
      const hits = rows.filter((r) => match(r, params));
      for (const row of hits) {
        const next = { ...row, ...patch, updated_at: new Date().toISOString() };
        if (conflict(table, next, rows.filter((o) => o !== row))) return new Response(JSON.stringify({ message: 'duplicate key value violates unique constraint' }), { status: 409 });
        try { if (table === 'journal_articles') guard(row, next); } catch (error) { return new Response(JSON.stringify({ message: error.message }), { status: 400 }); }
        Object.assign(row, next);
      }
      return new Response(JSON.stringify(hits), { status: 200 });
    }
    if (method === 'DELETE') {
      data[table] = rows.filter((r) => !match(r, params));
      return new Response(null, { status: 204 });
    }
    return new Response('{}', { status: 405 });
  };
  return { data, handle, writes };
}

const ENV_KEYS = ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY', 'VITE_SUPABASE_ANON_KEY', 'VERCEL_ENV', 'OPENAI_API_KEY', 'JOURNAL_AI_ENABLED', 'JOURNAL_ALLOW_WRITES', 'CRON_SECRET', 'HONDIT_STAGING', 'CONTENT_PIPELINE_WEBHOOK_URL', 'CONTENT_PIPELINE_WEBHOOK_SECRET'];
const HOOK = 'https://script.google.com/macros/s/test-hook/exec';
// hook: (payload) => Response, standing in for the Apps Script web app.
function harness({ env = 'production', tables = true, openai = null, hook = null } = {}) {
  const keep = Object.fromEntries(ENV_KEYS.map((k) => [k, process.env[k]]));
  for (const k of ENV_KEYS) delete process.env[k];
  Object.assign(process.env, { SUPABASE_URL: 'https://mock.invalid', SUPABASE_SERVICE_ROLE_KEY: 'mock', VITE_SUPABASE_ANON_KEY: 'mock' });
  if (env) process.env.VERCEL_ENV = env;
  if (hook) Object.assign(process.env, { CONTENT_PIPELINE_WEBHOOK_URL: HOOK, CONTENT_PIPELINE_WEBHOOK_SECRET: 'hook-secret' });
  const hookCalls = [];
  const db = fakeDb({ tables });
  const original = globalThis.fetch;
  const outbound = [];
  globalThis.fetch = async (url, options = {}) => {
    const u = new URL(url);
    if (u.host === 'mock.invalid' && u.pathname === '/auth/v1/user') return new Response(JSON.stringify({ id: 'admin-1', email: 'owner@hondit.test' }), { status: 200 });
    if (u.host === 'mock.invalid' && u.pathname === '/rest/v1/admin_profiles') return new Response(JSON.stringify([{ user_id: 'admin-1', email: 'owner@hondit.test', role: 'admin' }]), { status: 200 });
    if (u.host === 'mock.invalid' && u.pathname === '/rest/v1/products') return new Response(JSON.stringify(defaultProducts), { status: 200 });
    if (u.host === 'mock.invalid') return db.handle(url, options);
    if (hook && url === HOOK) { const payload = JSON.parse(options.body); hookCalls.push(payload); return hook(payload); }
    if (u.host === 'api.openai.com' && openai) { outbound.push('openai'); return new Response(JSON.stringify({ choices: [{ message: { content: JSON.stringify(openai) } }] }), { status: 200 }); }
    throw new Error('unexpected outbound request ' + url);
  };
  const restore = () => { globalThis.fetch = original; for (const [k, v] of Object.entries(keep)) if (v === undefined) delete process.env[k]; else process.env[k] = v; };
  return { db, outbound, hookCalls, restore };
}

async function call(handler, { method = 'GET', path = '', query = {}, body, token = 'admin-token', headers = {} } = {}) {
  let status = 200, out = '';
  const head = {};
  const res = { statusCode: 200, json(value) { out = JSON.stringify(value); return this; }, status(code) { status = code; this.statusCode = code; return this; }, setHeader(k, v) { head[k.toLowerCase()] = v; return this; }, end(text = '') { out = text; if (this.statusCode !== 200) status = this.statusCode; } };
  const url = `/api/admin-handler?path=${encodeURIComponent(path)}`;
  await handler({ method, url, query: { path, ...query }, headers: { ...(token ? { authorization: `Bearer ${token}` } : {}), ...headers }, body }, res);
  let data = out;
  try { data = JSON.parse(out || '{}'); } catch { /* html */ }
  return { status, data, headers: head };
}
const admin = async () => (await import('../api/admin.js')).default;
const products = async () => (await import('../api/products.js')).default;

/* ---------- pure rules ---------- */
test('the four existing country drafts pass the automated review and are not copies of each other', () => {
  assert.equal(seedArticles.length, 4);
  assert.deepEqual(seedArticles.map((a) => a.language), ['en', 'ja', 'zh-HK', 'zh-TW']);
  for (const a of seedArticles) {
    const r = reviewArticle(a, { others: seedArticles });
    assert.deepEqual(r.errors, [], `${a.language}: ${r.errors.join(', ')}`);
    assert.equal(a.status, 'in_review', 'nothing is pre-approved');
    assert.equal(a.image_rights, 'pending', 'photo rights are not assumed');
    assert.ok(a.hero_image_alt && a.sources.length >= 3);
  }
  for (let i = 0; i < 4; i++) for (let j = i + 1; j < 4; j++) assert.ok(similarity(plainText(seedArticles[i]), plainText(seedArticles[j])) < 0.6);
});

test('automated review blocks risky claims, missing alt text, cloned text and unknown products', () => {
  const base = seedArticles[0];
  const risky = reviewArticle({ ...base, body_md: base.body_md + '\n\nIt purifies the air and helps you sleep better. The best diffuser, guaranteed.' });
  assert.ok(risky.errors.some((e) => e.includes('공기정화')));
  assert.ok(risky.errors.some((e) => e.includes('보증')));
  assert.ok(risky.errors.some((e) => e.includes('최상급')));
  const ja = reviewArticle({ ...seedArticles[1], body_md: seedArticles[1].body_md + '\n\n香りが30日持続し、消臭の効能があります。' });
  assert.ok(ja.errors.length >= 2);
  assert.ok(reviewArticle({ ...base, hero_image_alt: '' }).errors.some((e) => e.includes('alt')));
  const clone = reviewArticle({ ...base, id: 'copy', slug: 'copy-of-story' }, { others: [base] });
  assert.ok(clone.errors.some((e) => e.includes('겹칩니다')));
  assert.ok(reviewArticle({ ...base, related_products: ['candle'] }).errors.some((e) => e.includes('candle')));
  assert.ok(reviewArticle({ ...base, image_rights: 'pending' }, { publishing: true }).errors.some((e) => e.includes('사용권')));
});

test('Asia/Seoul input converts to UTC exactly', () => {
  assert.equal(kstToUtc('2026-10-28T09:00'), '2026-10-28T00:00:00.000Z');
  assert.equal(kstToUtc('not a date'), null);
});

/* ---------- public pages before and after the migration ---------- */
test('production before migration 010: no draft is public, the list is empty and noindex', async () => {
  const h = harness({ env: 'production', tables: false });
  try {
    const handler = await products();
    const list = await call(handler, { query: { journalPage: 'list' }, token: '' });
    assert.equal(list.status, 200);
    assert.match(list.data, /noindex,follow/);
    assert.doesNotMatch(list.data, /volcanic landscape to the everyday home/);
    const article = await call(handler, { query: { journalPage: 'article', lang: 'en', slug: seedArticles[0].slug }, token: '' });
    assert.equal(article.status, 404);
    const api = await call(handler, { query: { journalApi: '1', lang: 'en', slug: seedArticles[0].slug }, token: '' });
    assert.equal(api.status, 404);
  } finally { h.restore(); }
});

test('Preview deployment exposes no draft publicly; only a signed-in admin can preview, and nothing can be written', async () => {
  const h = harness({ env: 'preview', tables: false });
  try {
    const handler = await products();
    const page = await call(handler, { query: { journalPage: 'article', lang: 'ja', slug: seedArticles[1].slug }, token: '' });
    assert.equal(page.status, 404, 'no draft page on a Preview URL');
    const list = await call(handler, { query: { journalPage: 'list' }, token: '' });
    assert.doesNotMatch(list.data, new RegExp(seedArticles[1].title));
    assert.match(list.data, /noindex,follow/);
    const api = await call(handler, { query: { journalApi: '1', lang: 'ja', slug: seedArticles[1].slug, preview: '1' }, token: '' });
    assert.equal(api.status, 404, 'preview=1 without an admin session shows nothing');
    const adminView = await call(handler, { query: { journalApi: '1', lang: 'ja', slug: seedArticles[1].slug, preview: '1' } });
    assert.equal(adminView.status, 200);
    assert.equal(adminView.data.preview, true);
    assert.equal(adminView.headers['cache-control'], 'private, no-store');
    assert.equal(adminView.data.article.review, undefined, 'review notes never leave the admin API');
    const { runPublisher } = await import('../api/_journal.js');
    assert.ok((await runPublisher()).skipped);
    assert.equal((await call(await admin(), { method: 'POST', path: 'journal/import-seed' })).status, 403);
    assert.equal(h.db.writes.length, 0);
  } finally { h.restore(); }
});

test('unapproved and not-yet-due articles stay private in production, also through the JSON API and sitemap', async () => {
  const h = harness({ env: 'production' });
  try {
    const A = await admin(), P = await products();
    await call(A, { method: 'POST', path: 'journal/import-seed' });
    const en = h.db.data.journal_articles.find((a) => a.language === 'en');
    for (const query of [{ journalPage: 'article', lang: 'en', slug: en.slug }, { journalApi: '1', lang: 'en', slug: en.slug }, { journalApi: '1', lang: 'en', slug: en.slug, preview: '1' }]) {
      assert.equal((await call(P, { query, token: '' })).status, 404, JSON.stringify(query));
    }
    assert.deepEqual((await call(P, { query: { journalApi: '1' }, token: '' })).data.articles, []);
    assert.doesNotMatch((await call(P, { query: { sitemap: '1' }, token: '' })).data, /\/journal\//);
  } finally { h.restore(); }
});

/* ---------- full workflow ---------- */
test('register drafts -> review -> approve -> schedule (KST) -> publish once -> SEO output', async () => {
  const h = harness({ env: 'production' });
  try {
    const A = await admin(), P = await products();
    const imported = await call(A, { method: 'POST', path: 'journal/import-seed' });
    assert.deepEqual(imported.data, { articles: 4, press: 15, pressUpdated: 0 });
    const again = await call(A, { method: 'POST', path: 'journal/import-seed' });
    assert.deepEqual(again.data, { articles: 0, press: 0, pressUpdated: 0 }, 'importing twice adds nothing');

    const en = h.db.data.journal_articles.find((a) => a.language === 'en');
    const ja = h.db.data.journal_articles.find((a) => a.language === 'ja');
    assert.equal((await call(A, { method: 'POST', path: `journal/${en.id}/action`, body: { action: 'schedule', publishAt: '2030-01-01T09:00' } })).status, 409, 'cannot schedule before approval');
    const blocked = await call(A, { method: 'POST', path: `journal/${en.id}/action`, body: { action: 'approve' } });
    assert.equal(blocked.status, 422);
    assert.ok(blocked.data.blockers.some((b) => b.includes('사실관계')));

    for (const a of [en, ja]) {
      assert.equal((await call(A, { method: 'POST', path: `journal/${a.id}/review`, body: { facts: true, claims: true, images: true, imageRights: 'confirmed', notes: 'checked' } })).status, 200);
      const ok = await call(A, { method: 'POST', path: `journal/${a.id}/action`, body: { action: 'approve' } });
      assert.equal(ok.status, 200);
      assert.equal(ok.data.article.approved_by, 'owner@hondit.test');
    }
    const past = await call(A, { method: 'POST', path: `journal/${en.id}/action`, body: { action: 'schedule', publishAt: '2020-01-01T09:00' } });
    assert.equal(past.status, 422);

    const when = new Date(Date.now() + 2 * 3600 * 1000);
    const kst = new Date(when.getTime() + 9 * 3600 * 1000).toISOString().slice(0, 16);
    const scheduled = await call(A, { method: 'POST', path: `journal/${en.id}/action`, body: { action: 'schedule', publishAt: kst } });
    assert.equal(scheduled.status, 200);
    assert.equal(scheduled.data.article.status, 'scheduled');
    assert.equal(scheduled.data.article.publish_at, kstToUtc(kst));
    assert.equal((await call(P, { query: { journalPage: 'article', lang: 'en', slug: en.slug }, token: '' })).status, 404, 'not public before its time');

    const { runPublisher } = await import('../api/_journal.js');
    const later = new Date(when.getTime() + 60_000);
    const [first, second] = await Promise.all([runPublisher({ now: later }), runPublisher({ now: later })]);
    assert.equal(first.published.length + second.published.length, 1, 'concurrent runs publish exactly once');
    const row = h.db.data.journal_articles.find((a) => a.id === en.id);
    assert.equal(row.status, 'published');
    assert.equal(row.public_url, `https://hondit-shop.vercel.app/journal/en/${en.slug}`);
    assert.equal(h.db.data.journal_publish_log.filter((l) => l.article_id === en.id && l.action === 'published').length, 1);
    assert.equal((await runPublisher({ now: later })).published.length, 0, 'a later run does nothing');

    // ja: publish now
    const now = await call(A, { method: 'POST', path: `journal/${ja.id}/action`, body: { action: 'schedule', publishNow: true } });
    assert.equal(now.data.article.status, 'published');

    const page = await call(P, { query: { journalPage: 'article', lang: 'en', slug: en.slug }, token: '' });
    assert.equal(page.status, 200);
    const doc = new JSDOM(page.data).window.document;
    assert.equal(doc.querySelector('link[rel=canonical]').href, row.public_url);
    assert.equal(doc.querySelector('meta[name=robots]').content, 'index,follow,max-image-preview:large');
    assert.equal(doc.documentElement.lang, 'en');
    const alternates = [...doc.querySelectorAll('link[rel=alternate]')].map((l) => l.getAttribute('hreflang'));
    assert.deepEqual(alternates.sort(), ['en', 'ja', 'x-default']);
    const ld = JSON.parse(doc.querySelector('script[type="application/ld+json"]').textContent);
    assert.equal(ld['@type'], 'Article');
    assert.equal(ld.headline, en.title);
    assert.equal(ld.datePublished, row.published_at);
    assert.equal(ld.about[0]['@type'], 'Product');
    assert.ok(doc.querySelector('#root .journal-body h2'), 'article text is in the HTML');
    assert.ok([...doc.querySelectorAll('#root img')].every((img) => img.hasAttribute('alt')));
    assert.ok(doc.querySelector('#root a[href="/products/diffuser-350g"]'), 'related product link');
    assert.ok(doc.querySelector('#journal-ssr'));

    const sitemap = await call(P, { query: { sitemap: '1' }, token: '' });
    assert.match(sitemap.data, new RegExp(`/journal/en/${en.slug}</loc>`));
    assert.match(sitemap.data, /hreflang="ja"/);
    assert.doesNotMatch(sitemap.data, /zh-hk\//, 'unpublished translations stay out of the sitemap');

    const list = await call(P, { query: { journalPage: 'list', lang: 'en' }, token: '' });
    assert.match(list.data, /index,follow/);
    assert.match(list.data, new RegExp(en.slug));
  } finally { h.restore(); }
});

test('cancel, edit-after-approval, failure with retry and archive', async () => {
  const h = harness({ env: 'production' });
  try {
    const A = await admin();
    await call(A, { method: 'POST', path: 'journal/import-seed' });
    const hk = h.db.data.journal_articles.find((a) => a.language === 'zh-HK');
    await call(A, { method: 'POST', path: `journal/${hk.id}/review`, body: { facts: true, claims: true, images: true, imageRights: 'confirmed' } });
    await call(A, { method: 'POST', path: `journal/${hk.id}/action`, body: { action: 'approve' } });
    await call(A, { method: 'POST', path: `journal/${hk.id}/action`, body: { action: 'schedule', publishAt: '2031-05-01T10:00' } });
    const cancelled = await call(A, { method: 'POST', path: `journal/${hk.id}/action`, body: { action: 'cancel_schedule' } });
    assert.equal(cancelled.data.article.status, 'approved');
    assert.equal(cancelled.data.article.publish_at, null);

    const edited = await call(A, { method: 'PATCH', path: `journal/${hk.id}`, body: { title: hk.title + '（修訂）' } });
    assert.equal(edited.data.article.status, 'in_review', 'approval covers the reviewed text only');
    assert.equal(edited.data.article.approved_at, null);

    await call(A, { method: 'POST', path: `journal/${hk.id}/review`, body: { facts: true, claims: true, images: true, imageRights: 'confirmed' } });
    await call(A, { method: 'POST', path: `journal/${hk.id}/action`, body: { action: 'approve' } });
    await call(A, { method: 'POST', path: `journal/${hk.id}/action`, body: { action: 'schedule', publishAt: '2031-05-01T10:00' } });
    // Something breaks after scheduling (e.g. the image credit was withdrawn in the database).
    h.db.data.journal_articles.find((a) => a.id === hk.id).image_rights = 'restricted';
    const { runPublisher } = await import('../api/_journal.js');
    const due = new Date('2031-05-01T02:00:00Z');
    for (let i = 1; i <= 3; i++) await runPublisher({ now: due });
    const failed = h.db.data.journal_articles.find((a) => a.id === hk.id);
    assert.equal(failed.status, 'failed');
    assert.equal(failed.publish_attempts, 3);
    assert.match(failed.last_error, /사용권/);
    assert.ok(h.db.data.journal_publish_log.some((l) => l.article_id === hk.id && l.action === 'failed' && l.ok === false));

    failed.image_rights = 'confirmed';
    const retried = await call(A, { method: 'POST', path: `journal/${hk.id}/action`, body: { action: 'retry' } });
    assert.equal(retried.data.article.status, 'scheduled', 'retry keeps the planned time when it is still ahead');
    await runPublisher({ now: due });
    assert.equal(h.db.data.journal_articles.find((a) => a.id === hk.id).status, 'published', 'retry publishes once the problem is fixed');
    const archived = await call(A, { method: 'POST', path: `journal/${hk.id}/action`, body: { action: 'archive' } });
    assert.equal(archived.data.article.status, 'archived');
    assert.equal((await call(A, { method: 'DELETE', path: `journal/${h.db.data.journal_articles.find((a) => a.language === 'en').id}` })).status, 200, 'unapproved drafts can be deleted');
  } finally { h.restore(); }
});

test('the database itself refuses a publish without approval', async () => {
  const h = harness({ env: 'production' });
  try {
    await call(await admin(), { method: 'POST', path: 'journal/import-seed' });
    const tw = h.db.data.journal_articles.find((a) => a.language === 'zh-TW');
    const { supabase } = await import('../api/_utils.js');
    await assert.rejects(() => supabase(`/journal_articles?id=eq.${tw.id}`, { method: 'PATCH', body: JSON.stringify({ status: 'published', published_at: new Date().toISOString() }) }), /without approval/);
  } finally { h.restore(); }
});

/* ---------- AI drafts ---------- */
test('AI drafting is off until enabled, and an AI draft is only ever a draft', async () => {
  const output = { slug: 'Small Desk Diffuser Guide', title: 'Choosing a volcanic-stone diffuser for a small desk', dek: 'A short guide.', body_md: '## Sizes\n\nThe 350g version is about 75 × 100 × 75 mm. It purifies the air.', seo_title: 'Small desk diffuser | HONDIT Journal', seo_description: 'Guide', hero_image_alt: 'Diffuser on a desk', claims_to_verify: ['책상 크기 예시'] };
  const h = harness({ env: 'production', openai: output });
  try {
    const A = await admin();
    process.env.OPENAI_API_KEY = 'sk-test';
    const off = await call(A, { method: 'POST', path: 'journal/ai-draft', body: { topic: 'Choosing a diffuser for a small desk', language: 'en', products: ['diffuser-350g'] } });
    assert.equal(off.status, 503);
    assert.equal(h.outbound.length, 0, 'no paid API call while disabled');
    process.env.JOURNAL_AI_ENABLED = '1';
    const on = await call(A, { method: 'POST', path: 'journal/ai-draft', body: { topic: 'Choosing a diffuser for a small desk', language: 'en', products: ['diffuser-350g'] } });
    assert.equal(on.status, 200);
    assert.equal(on.data.article.status, 'draft');
    assert.equal(on.data.article.author_type, 'ai_assisted');
    assert.equal(on.data.article.slug, 'small-desk-diffuser-guide');
    assert.ok(on.data.article.ai_meta.facts_used.includes('diffuser-350g'));
    assert.ok(on.data.check.errors.some((e) => e.includes('공기정화')), 'the risky AI sentence is flagged for the editor');
    assert.equal(h.outbound.length, 1);
  } finally { h.restore(); }
});

/* ---------- channels, press, pipeline ---------- */
test('channel packages use the approved article, a new link_id and the Final URL rule, once per channel', async () => {
  const h = harness({ env: 'production' });
  try {
    const A = await admin();
    await call(A, { method: 'POST', path: 'journal/import-seed' });
    const tw = h.db.data.journal_articles.find((a) => a.language === 'zh-TW');
    assert.throws(() => buildDistribution(tw, 'pinterest', 'l0044'), /공개된 기사만/);
    await call(A, { method: 'POST', path: `journal/${tw.id}/review`, body: { facts: true, claims: true, images: true, imageRights: 'confirmed' } });
    await call(A, { method: 'POST', path: `journal/${tw.id}/action`, body: { action: 'approve' } });
    await call(A, { method: 'POST', path: `journal/${tw.id}/action`, body: { action: 'schedule', publishNow: true } });
    assert.equal((await call(A, { method: 'POST', path: `journal/${tw.id}/distributions`, body: { channel: 'pinterest', linkId: 'l0044' } })).status, 409, 'no new ID before 03_LINKS is synced');
    await syncLinks(A);
    const reused = await call(A, { method: 'POST', path: `journal/${tw.id}/distributions`, body: { channel: 'pinterest', linkId: 'l0027' } });
    assert.equal(reused.status, 422, 'issued link IDs are never reused');
    const made = await call(A, { method: 'POST', path: `journal/${tw.id}/distributions`, body: { channel: 'pinterest', linkId: 'l0044' } });
    assert.equal(made.status, 201);
    const url = new URL(made.data.distribution.final_url);
    assert.equal(url.pathname, articlePath(tw));
    assert.equal(url.searchParams.get('market'), 'TW');
    assert.equal(url.searchParams.get('lang'), 'en', 'Taiwan links keep lang=en as in 03_LINKS');
    assert.equal(url.searchParams.get('utm_source'), 'pinterest');
    assert.equal(url.searchParams.get('utm_medium'), 'social');
    assert.equal(url.searchParams.get('utm_content'), 'l0044');
    assert.equal(url.searchParams.get('link_id'), 'l0044');
    assert.ok(made.data.distribution.title.length <= 100);
    assert.equal(made.data.linksRow[0], 'l0044');
    assert.equal(made.data.linksRow[8], made.data.distribution.final_url);
    const dup = await call(A, { method: 'POST', path: `journal/${tw.id}/distributions`, body: { channel: 'pinterest', linkId: 'l0045' } });
    assert.equal(dup.status, 409, 'one package per article and channel');
    const sameLink = await call(A, { method: 'POST', path: `journal/${tw.id}/distributions`, body: { channel: 'facebook', linkId: 'l0044' } });
    assert.equal(sameLink.status, 409, 'one link_id per placement');
    const id = made.data.distribution.id;
    assert.equal((await call(A, { method: 'PATCH', path: `journal/distributions/${id}`, body: { status: 'scheduled', external_id: 'x' } })).status, 409, 'must be approved before it is scheduled');
    await call(A, { method: 'PATCH', path: `journal/distributions/${id}`, body: { status: 'approved' } });
    const sched = await call(A, { method: 'PATCH', path: `journal/distributions/${id}`, body: { status: 'scheduled', external_id: '403999999' } });
    assert.equal(sched.data.distribution.external_id, '403999999');
    assert.ok(ISSUED_LINK_IDS.includes('l0043') && !ISSUED_LINK_IDS.includes('l0044'));
  } finally { h.restore(); }
});

test('press outreach tracks approval, sending, replies and coverage without sending anything', async () => {
  const h = harness({ env: 'production' });
  try {
    const A = await admin();
    await call(A, { method: 'POST', path: 'journal/import-seed' });
    const list = await call(A, { path: 'press' });
    assert.equal(list.data.outreach.length, 15, 'the 15 priority candidates, each once');
    assert.equal(new Set(list.data.outreach.map((r) => `${r.market}:${r.outlet}`)).size, 15);
    assert.deepEqual(list.data.outreach.map((r) => r.link_id).filter(Boolean).sort(), ['l0039', 'l0040', 'l0041', 'l0042', 'l0043'], 'no new link_id is issued by the import');
    assert.ok(list.data.outreach.every((r) => r.send_status === 'not_sent' && r.approval_status === 'pending' && (!r.link_id || r.email_body.includes(r.link_id))));
    const row = list.data.outreach.find((r) => r.content_id === 'P-EMAIL-JP-01');
    assert.equal((await call(A, { method: 'POST', path: `press/${row.id}/action`, body: { action: 'mark_sent' } })).status, 409, 'cannot mark unsent drafts as sent before approval');
    assert.equal((await call(A, { method: 'POST', path: 'press', body: { market: 'JP', outlet: 'Mynavi Woman' } })).status, 409, 'no duplicate outlet in a market');
    await call(A, { method: 'POST', path: `press/${row.id}/action`, body: { action: 'approve' } });
    const sent = await call(A, { method: 'POST', path: `press/${row.id}/action`, body: { action: 'mark_sent', gmailMessageId: 'msg-1' } });
    assert.equal(sent.data.outreach.send_status, 'sent');
    await call(A, { method: 'POST', path: `press/${row.id}/action`, body: { action: 'record_reply', replyStatus: 'interested', notes: '사진 요청' } });
    const pub = await call(A, { method: 'POST', path: `press/${row.id}/action`, body: { action: 'record_published', url: 'https://woman.mynavi.jp/article/example' } });
    assert.equal(pub.data.outreach.published_url, 'https://woman.mynavi.jp/article/example');
    const edited = await call(A, { method: 'PATCH', path: `press/${list.data.outreach[0].id}`, body: { email_subject: 'changed' } });
    assert.equal(edited.data.outreach.approval_status, 'pending', 'an edited email needs approval again');
    assert.equal(h.outbound.length, 0, 'no email or external call was made');
  } finally { h.restore(); }
});

test('the 15-candidate file: grades and hold reasons kept, the five existing rows not duplicated, holds and unlinked rows not approvable', async () => {
  const h = harness({ env: 'production' });
  try {
    const A = await admin();
    // Production already holds the five Gmail-draft rows (registered before the 15-candidate file existed).
    const fileFields = ['grade', 'recheck_result', 'verified_route', 'pre_send_check', 'evidence_url', 'related_url', 'hold_reason'];
    h.db.data.pr_outreach.push(...seedPress.slice(0, 5).map((p) => ({ ...Object.fromEntries(Object.entries(p).filter(([k]) => !fileFields.includes(k))), id: `old-${p.content_id}`, content_id: null, approval_status: 'approved', approved_by: 'owner@hondit.test', metrics: {} })));
    const imported = await call(A, { method: 'POST', path: 'journal/import-seed' });
    assert.equal(imported.data.press, 10, 'only the ten new candidates are added');
    assert.equal(imported.data.pressUpdated, 5, 'the five existing rows get the file grades');
    const rows = (await call(A, { path: 'press' })).data.outreach;
    assert.equal(rows.length, 15);
    assert.equal(new Set(rows.map((r) => `${r.market}:${r.outlet}`)).size, 15);
    const old = rows.find((r) => r.id === 'old-P-EMAIL-SG-01');
    const ig0 = rows.find((r) => r.content_id === 'P-DM-SG-02');
    await call(A, { method: 'PATCH', path: `press/${ig0.id}`, body: { hold_reason: '' } });
    assert.equal((await call(A, { method: 'POST', path: 'journal/import-seed' })).data.press, 0);
    assert.equal(h.db.data.pr_outreach.find((r) => r.id === ig0.id).hold_reason, '', 'a released hold is not put back by a re-import');
    assert.equal(old.approval_status, 'approved', 'existing status is left alone');
    assert.equal(old.grade, 'A');
    assert.equal(old.recheck_result, 'A / 제안 준비');
    const byId = (cid) => rows.find((r) => r.content_id === cid);
    assert.equal(byId('P-EMAIL-HK-03').recheck_result, 'A- / 제안 준비');
    assert.equal(byId('P-EMAIL-HK-04').recheck_result, 'B / 전문 교류');
    for (const cid of ['P-DM-SG-01', 'P-DM-SG-02', 'P-DM-SG-03', 'P-DM-JP-01']) {
      assert.match(byId(cid).hold_reason, /계정 검증 실패/);
      assert.equal(byId(cid).recheck_result, '보류 / 계정 검증');
    }
    assert.ok(rows.filter((r) => !r.id.startsWith('old-')).every((r) => r.send_status === 'not_sent' && r.approval_status === 'pending' && !r.link_id));
    const approve = (row) => call(A, { method: 'POST', path: `press/${row.id}/action`, body: { action: 'approve' } });
    const ig = byId('P-DM-SG-01'), hc = byId('P-EMAIL-SG-03');
    assert.match((await approve(ig)).data.error, /보류/);
    assert.equal((await approve(hc)).status, 409, 'no link_id yet');
    await syncLinks(A);
    assert.equal((await call(A, { method: 'PATCH', path: `press/${hc.id}`, body: { link_id: 'l0040' } })).status, 409, 'issued link IDs are never reused');
    const linked = await call(A, { method: 'PATCH', path: `press/${hc.id}`, body: { link_id: 'l0044' } });
    assert.equal(linked.status, 200);
    const ok = await approve(linked.data.outreach);
    assert.equal(ok.status, 200);
    assert.equal(ok.data.outreach.approval_status, 'approved');
    const moved = await call(A, { method: 'PATCH', path: `press/${hc.id}`, body: { link_id: 'l0045' } });
    assert.equal(moved.data.outreach.approval_status, 'pending', 'changing the link_id needs approval again');
    assert.match(moved.data.outreach.email_body, /link_id=l0045/);
    assert.doesNotMatch(moved.data.outreach.email_body, /l0044/);
    assert.equal(rows.filter((r) => r.send_status === 'sent').length, 0);
    assert.equal(h.outbound.length, 0, 'nothing was sent');
  } finally { h.restore(); }
});

test('CONTENT_PIPELINE export matches the sheet columns and existing IDs', async () => {
  const h = harness({ env: 'production' });
  try {
    const A = await admin();
    await call(A, { method: 'POST', path: 'journal/import-seed' });
    const out = await call(A, { path: 'journal/pipeline' });
    assert.deepEqual(out.data.columns, PIPELINE_COLUMNS);
    assert.equal(out.data.columns.length, 13);
    assert.ok(out.data.rows.every((r) => r.length === 13));
    const ids = out.data.rows.map((r) => r[0]);
    for (const id of ['S-JRN-SG-01', 'S-JRN-JP-01', 'S-JRN-HK-01', 'S-JRN-TW-01', 'P-EMAIL-SG-01', 'P-EMAIL-SG-02', 'P-EMAIL-JP-01', 'P-EMAIL-HK-01', 'P-EMAIL-TW-01']) assert.ok(ids.includes(id), id);
    assert.equal(out.data.tsv.split('\n').length, 19);
    assert.equal(out.data.rows.find((r) => r[0] === 'P-DM-SG-01')[8], '후보(제안문 없음)');
    assert.equal(out.data.webhook, false);
  } finally { h.restore(); }
});

async function dueArticle(h, A, language = 'en') {
  await call(A, { method: 'POST', path: 'journal/import-seed' });
  const a = h.db.data.journal_articles.find((x) => x.language === language);
  await call(A, { method: 'POST', path: `journal/${a.id}/review`, body: { facts: true, claims: true, images: true, imageRights: 'confirmed' } });
  await call(A, { method: 'POST', path: `journal/${a.id}/action`, body: { action: 'approve' } });
  await call(A, { method: 'POST', path: `journal/${a.id}/action`, body: { action: 'schedule', publishAt: '2031-01-01T09:00' } });
  // Time passes: the scheduled minute is now in the past and no publisher has run yet.
  const row = h.db.data.journal_articles.find((x) => x.id === a.id);
  row.publish_at = new Date(Date.now() - 5 * 60_000).toISOString();
  return row;
}

test('the publisher endpoint refuses every request without the right CRON_SECRET and writes nothing', async () => {
  const h = harness({ env: 'production' });
  try {
    const A = await admin(), P = await products();
    const row = await dueArticle(h, A);
    const before = h.db.writes.length;
    const cron = (headers = {}) => call(P, { query: { journalCron: '1' }, token: '', headers });
    assert.equal((await cron()).status, 503, 'no secret configured = closed');
    process.env.CRON_SECRET = 'short';
    assert.equal((await cron({ authorization: 'Bearer short' })).status, 503, 'a weak secret is treated as not configured');
    process.env.CRON_SECRET = 'cron-secret-for-tests-0123456789';
    assert.equal((await cron()).status, 401);
    assert.equal((await cron({ authorization: 'Bearer wrong-secret-for-tests-012345678' })).status, 401);
    assert.equal((await cron({ authorization: 'cron-secret-for-tests-0123456789' })).status, 401, 'scheme is required');
    assert.equal(h.db.writes.length, before, 'refused calls changed nothing');
    assert.equal(row.status, 'scheduled');
    const ok = await cron({ authorization: 'Bearer cron-secret-for-tests-0123456789' });
    assert.equal(ok.status, 200);
    assert.equal(ok.data.published.length, 1);
    assert.equal(row.status, 'published');
    assert.equal(row.published_at, row.publish_at, 'recorded as published at its scheduled time');
  } finally { h.restore(); }
});

test('a scheduled article is public from its exact time without any write, and public traffic never runs the publisher', async () => {
  const h = harness({ env: 'production' });
  try {
    const A = await admin(), P = await products();
    const row = await dueArticle(h, A);
    const before = h.db.writes.length;
    const page = await call(P, { query: { journalPage: 'article', lang: 'en', slug: row.slug }, token: '' });
    assert.equal(page.status, 200, 'visible as soon as publish_at has passed');
    const doc = new JSDOM(page.data).window.document;
    assert.equal(JSON.parse(doc.querySelector('script[type="application/ld+json"]').textContent).datePublished, row.publish_at);
    assert.equal(page.headers['cache-control'], 'public, max-age=0, s-maxage=60');
    assert.match((await call(P, { query: { journalPage: 'list', lang: 'en' }, token: '' })).data, new RegExp(row.slug));
    assert.match((await call(P, { query: { sitemap: '1' }, token: '' })).data, new RegExp(`/journal/en/${row.slug}`));
    assert.equal((await call(P, { query: { journalApi: '1', lang: 'en', slug: row.slug }, token: '' })).status, 200);
    assert.equal(h.db.writes.length, before, 'public reads wrote nothing');
    assert.equal(row.status, 'scheduled');
    // Not yet due, or no longer passing the publish checks: hidden again.
    row.image_rights = 'restricted';
    assert.equal((await call(P, { query: { journalPage: 'article', lang: 'en', slug: row.slug }, token: '' })).status, 404);
    row.image_rights = 'confirmed';
    row.publish_at = new Date(Date.now() + 60_000).toISOString();
    assert.equal((await call(P, { query: { journalPage: 'article', lang: 'en', slug: row.slug }, token: '' })).status, 404);
    // Opening the admin list records due articles (authenticated).
    row.publish_at = new Date(Date.now() - 60_000).toISOString();
    const list = await call(A, { path: 'journal' });
    assert.equal(list.data.publisher.published.length, 1);
    assert.equal(row.status, 'published');
  } finally { h.restore(); }
});

/* ---------- CONTENT_PIPELINE bridge ---------- */
const jsonResponse = (body, status = 200) => new Response(typeof body === 'string' ? body : JSON.stringify(body), { status });
test('CONTENT_PIPELINE sync counts only a confirmed save; auth failure, wrong row, wrong values and non-JSON are failures', async () => {
  let reply = () => jsonResponse('ok');
  const h = harness({ env: 'production', hook: (payload) => reply(payload) });
  try {
    const A = await admin();
    await call(A, { method: 'POST', path: 'journal/import-seed' });
    const en = h.db.data.journal_articles.find((a) => a.language === 'en');
    const sync = () => call(A, { method: 'POST', path: `journal/${en.id}/pipeline-sync` });
    const lastLog = () => h.db.data.journal_publish_log.filter((l) => l.article_id === en.id && l.action.startsWith('pipeline_')).pop();
    const cases = [
      ['plain-text ok from an old script', () => jsonResponse('ok')],
      ['auth failure', () => jsonResponse({ ok: false, error: 'forbidden' })],
      ['auth failure as text', () => jsonResponse('forbidden')],
      ['HTTP error', () => jsonResponse({ ok: true }, 500)],
      ['row mismatch', (p) => jsonResponse({ ok: true, id: 'S-JRN-XX-99', result: 'updated', written: p.row.slice(8, 13) })],
      ['no save result', (p) => jsonResponse({ ok: true, id: p.row[0], written: p.row.slice(8, 13) })],
      ['values not stored', (p) => jsonResponse({ ok: true, id: p.row[0], result: 'updated', written: ['', '', '', '', ''] })],
      ['sheet update failed', () => jsonResponse({ ok: false, error: 'Exception: range protected' })],
    ];
    for (const [name, fn] of cases) {
      reply = fn;
      const res = await sync();
      assert.equal(res.status, 502, name);
      assert.equal(res.data.ok, false, name);
      assert.equal(lastLog().action, 'pipeline_failed', name);
      assert.equal(lastLog().ok, false, name);
    }
    assert.equal(h.hookCalls[0].secret, 'hook-secret');
    assert.equal(h.hookCalls[0].action, 'pipeline_row');
    reply = (p) => jsonResponse({ ok: true, id: p.row[0], result: 'updated', row_number: 4, written: p.row.slice(8, 13) });
    const ok = await sync();
    assert.equal(ok.status, 200);
    assert.equal(lastLog().action, 'pipeline_synced');
    assert.equal(lastLog().ok, true);
  } finally { h.restore(); }
});

test('a failed sheet sync after publishing is logged as a failure, not as success', async () => {
  const h = harness({ env: 'production', hook: () => jsonResponse('ok') });
  try {
    const A = await admin();
    const row = await dueArticle(h, A);
    const { runPublisher } = await import('../api/_journal.js');
    await runPublisher();
    assert.equal(row.status, 'published', 'the article itself is published');
    const logs = h.db.data.journal_publish_log.filter((l) => l.article_id === row.id);
    assert.ok(logs.some((l) => l.action === 'pipeline_failed' && l.ok === false));
    assert.ok(!logs.some((l) => l.action === 'pipeline_synced'));
  } finally { h.restore(); }
});

/* ---------- link_id registry ---------- */
const syncLinks = (A, extra = []) => call(A, { method: 'POST', path: 'journal/links/sync', body: { ids: [...ISSUED_LINK_IDS, ...extra].join('\n') } });
test('new link IDs are checked against the whole 03_LINKS history, not only the IDs known when this was built', async () => {
  const h = harness({ env: 'production' });
  try {
    const A = await admin();
    await call(A, { method: 'POST', path: 'journal/import-seed' });
    const hc = h.db.data.pr_outreach.find((r) => r.content_id === 'P-EMAIL-SG-03');
    const setLink = (row, id) => call(A, { method: 'PATCH', path: `press/${row.id}`, body: { link_id: id } });
    assert.equal((await setLink(hc, 'l0044')).status, 409, 'refused until 03_LINKS has been synced');
    assert.equal((await call(A, { method: 'POST', path: 'journal/links/sync', body: { ids: 'l0001 l0002 l0044' } })).status, 422, 'a partial paste is not a sync');
    // The team issued l0044 and l0045 in the sheet by hand after this system was built.
    const synced = await syncLinks(A, ['l0044', 'l0045']);
    assert.equal(synced.status, 200);
    assert.equal(synced.data.next, 'l0046');
    assert.equal(synced.data.syncFresh, true);
    assert.equal((await setLink(hc, 'l0044')).status, 409, 'an ID issued in the sheet later is refused');
    assert.equal((await setLink(hc, 'l0045')).status, 409);
    const ok = await setLink(hc, 'l0046');
    assert.equal(ok.status, 200);
    assert.equal(ok.data.outreach.link_id, 'l0046');
    assert.match(ok.data.outreach.email_body, /link_id=l0046/, 'the bare site link becomes the Final URL');
    assert.equal(ok.data.linksRow[0], 'l0046');
    assert.equal(ok.data.linksRow[8], 'https://hondit-shop.vercel.app/?market=SG&lang=en&utm_source=outreach&utm_medium=email&utm_campaign=sg_pr_202610&utm_content=l0046&link_id=l0046');
    const other = h.db.data.pr_outreach.find((r) => r.content_id === 'P-EMAIL-HK-02');
    assert.equal((await setLink(other, 'l0046')).status, 409, 'one ID, one placement');
    assert.ok(h.db.data.link_registry.some((r) => r.link_id === 'l0046' && r.source === 'pr_outreach'));
    // A stale sync is not trusted.
    for (const r of h.db.data.link_registry) if (r.last_seen_in_sheet) r.last_seen_in_sheet = new Date(Date.now() - 25 * 3600 * 1000).toISOString();
    assert.equal((await setLink(other, 'l0047')).status, 409);
  } finally { h.restore(); }
});

test('with the sheet bridge, a link ID is issued in 03_LINKS itself and refused when the sheet already has it', async () => {
  let reply = () => jsonResponse({ ok: false, error: 'taken' });
  const h = harness({ env: 'production', hook: (p) => reply(p) });
  try {
    const A = await admin();
    await call(A, { method: 'POST', path: 'journal/import-seed' });
    const hc = h.db.data.pr_outreach.find((r) => r.content_id === 'P-EMAIL-SG-03');
    const setLink = (id) => call(A, { method: 'PATCH', path: `press/${hc.id}`, body: { link_id: id } });
    assert.equal((await setLink('l0044')).status, 409, 'the sheet says it is taken');
    reply = () => jsonResponse('ok');
    assert.equal((await setLink('l0045')).status, 502, 'an unconfirmed reservation is not accepted');
    assert.equal(h.db.data.pr_outreach.find((r) => r.id === hc.id).link_id, null);
    reply = (p) => jsonResponse({ ok: true, link_id: p.link_id, row_number: 46, next_link_id: 'l0047' });
    const ok = await setLink('l0046');
    assert.equal(ok.status, 200);
    const call0 = h.hookCalls.filter((c) => c.action === 'reserve_link').pop();
    assert.equal(call0.link_id, 'l0046');
    assert.equal(call0.row.length, 20, '03_LINKS row A–T');
    reply = () => jsonResponse({ ok: true, link_ids: [...ISSUED_LINK_IDS, 'l0044', 'l0046'], next_link_id: 'l0047' });
    const pulled = await call(A, { method: 'POST', path: 'journal/links/sync', body: {} });
    assert.equal(pulled.status, 200);
    assert.equal(pulled.data.next, 'l0047');
  } finally { h.restore(); }
});

test('seed data stays in sync with the generated SQL seed', async () => {
  const fs = await import('node:fs');
  const sql = fs.readFileSync(new URL('../supabase/seeds/010_journal_seed.sql', import.meta.url), 'utf8');
  for (const a of seedArticles) assert.ok(sql.includes(`'${a.slug}'`) && sql.includes(`'${a.content_id}'`));
  for (const p of seedPress) assert.ok(sql.includes(`'${p.content_id}'`) && (!p.gmail_draft_id || sql.includes(`'${p.gmail_draft_id}'`)));
  const migration = fs.readFileSync(new URL('../supabase/migrations/010_journal_pr.sql', import.meta.url), 'utf8');
  assert.doesNotMatch(migration, /alter table public\.(orders|products|order_items|inquiries|product_prices)\b/i, '010 changes no existing table');
  assert.doesNotMatch(migration, /\bdrop\b(?! trigger if exists journal_articles_guard)/i);
});

test('the four country articles: real product photos on disk, valid internal links, and hreflang/translation links to each other', async () => {
  const fs = await import('node:fs');
  const h = harness({ env: 'production' });
  try {
    const A = await admin(), P = await products();
    await call(A, { method: 'POST', path: 'journal/import-seed' });
    for (const a of h.db.data.journal_articles) {
      await call(A, { method: 'POST', path: `journal/${a.id}/review`, body: { facts: true, claims: true, images: true, imageRights: 'confirmed' } });
      assert.equal((await call(A, { method: 'POST', path: `journal/${a.id}/action`, body: { action: 'approve' } })).status, 200, a.language);
      assert.equal((await call(A, { method: 'POST', path: `journal/${a.id}/action`, body: { action: 'schedule', publishNow: true } })).data.article.status, 'published', a.language);
    }
    const urls = Object.fromEntries(seedArticles.map((a) => [a.language, `https://hondit-shop.vercel.app${articlePath(a)}`]));
    const routes = ['/contact', '/partners', '/products/diffuser-350g', '/products/diffuser-500g'];
    for (const a of seedArticles) {
      const page = await call(P, { query: { journalPage: 'article', lang: articlePath(a).split('/')[2], slug: a.slug }, token: '' });
      assert.equal(page.status, 200, a.language);
      const doc = new JSDOM(page.data).window.document;
      const alt = Object.fromEntries([...doc.querySelectorAll('link[rel=alternate][hreflang]')].map((l) => [l.getAttribute('hreflang'), l.href]));
      assert.deepEqual({ en: alt.en, ja: alt.ja, 'zh-HK': alt['zh-HK'], 'zh-TW': alt['zh-TW'] }, urls, `${a.language} hreflang`);
      const nav = [...doc.querySelectorAll('#root .journal-translations a')].map((x) => x.getAttribute('href')).sort();
      assert.deepEqual(nav, seedArticles.filter((o) => o.id !== a.id).map(articlePath).sort(), `${a.language} translation links`);
      for (const img of doc.querySelectorAll('#root img')) {
        const src = img.getAttribute('src');
        assert.ok(img.getAttribute('alt') !== null, `${a.language} alt ${src}`);
        assert.ok(fs.existsSync(new URL(`../public${decodeURI(src)}`, import.meta.url)), `${a.language} missing image ${src}`);
      }
      for (const link of doc.querySelectorAll('#root .journal-body a[href^="/"], #root .journal-related a[href^="/"]')) assert.ok(routes.includes(link.getAttribute('href')), `${a.language} link ${link.getAttribute('href')}`);
    }
  } finally { h.restore(); }
});
