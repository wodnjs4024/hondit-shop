// GPT features against a mocked OpenAI and Supabase. No real API call, key or customer data.
import test from 'node:test';
import assert from 'node:assert/strict';
import { salesFacts } from '../shared/sales-facts.js';
import { defaultProducts } from '../api/_bulk-data.js';
import { toClientProduct } from '../api/_utils.js';

const products = defaultProducts.map(toClientProduct);

function harness({ key = 'sk-test-synthetic', openaiReply = 'Hello', json = null, status = 200 } = {}) {
  const keep = { key: process.env.OPENAI_API_KEY, model: process.env.OPENAI_MODEL, url: process.env.SUPABASE_URL, srk: process.env.SUPABASE_SERVICE_ROLE_KEY, anon: process.env.VITE_SUPABASE_ANON_KEY, env: process.env.VERCEL_ENV };
  const original = globalThis.fetch;
  const calls = [];
  if (key) process.env.OPENAI_API_KEY = key; else delete process.env.OPENAI_API_KEY;
  Object.assign(process.env, { SUPABASE_URL: 'https://mock.invalid', SUPABASE_SERVICE_ROLE_KEY: 'mock', VITE_SUPABASE_ANON_KEY: 'mock', VERCEL_ENV: 'production' });
  globalThis.fetch = async (url, options = {}) => {
    const u = new URL(url);
    if (u.host === 'api.openai.com') {
      const body = JSON.parse(options.body);
      calls.push(body);
      const content = json ? JSON.stringify(json) : openaiReply;
      return new Response(JSON.stringify(status === 200 ? { choices: [{ message: { content } }] } : { error: { code: 'insufficient_quota' } }), { status });
    }
    if (u.pathname === '/auth/v1/user') return new Response(JSON.stringify({ id: 'admin-1', email: 'owner@hondit.test' }), { status: 200 });
    if (u.pathname === '/rest/v1/admin_profiles') return new Response(JSON.stringify([{ user_id: 'admin-1', role: 'admin' }]), { status: 200 });
    if (u.pathname === '/rest/v1/products') return new Response(JSON.stringify(defaultProducts), { status: 200 });
    if (u.pathname === '/rest/v1/inquiries') return new Response(JSON.stringify([{ id: 'inq-1', name: 'Aiko', market: 'JP', channel: 'email', message: '20個のディフューザーはいくらですか？' }]), { status: 200 });
    throw new Error('unexpected ' + url);
  };
  const restore = () => { globalThis.fetch = original; for (const [k, v] of [['OPENAI_API_KEY', keep.key], ['OPENAI_MODEL', keep.model], ['SUPABASE_URL', keep.url], ['SUPABASE_SERVICE_ROLE_KEY', keep.srk], ['VITE_SUPABASE_ANON_KEY', keep.anon], ['VERCEL_ENV', keep.env]]) if (v === undefined) delete process.env[k]; else process.env[k] = v; };
  return { calls, restore };
}

async function run(handler, { method = 'POST', url, query = {}, body, token, ip = '203.0.113.9' }) {
  let status = 0, out = '';
  const res = { status(code) { status = code; return this; }, setHeader() { return this; }, end(text) { out = text; } };
  await handler({ method, url, query, headers: { 'x-forwarded-for': ip, ...(token ? { authorization: `Bearer ${token}` } : {}) }, body }, res);
  return { status, data: JSON.parse(out || '{}') };
}

test('sales facts come from the live checkout rules: payable markets, quote-only Malaysia, no invented terms', () => {
  const facts = salesFacts(products);
  assert.match(facts, /MARKET JP[\s\S]*diffuser-350g: 2400 JPY per unit, minimum 20 units, pay directly by PayPal/);
  assert.match(facts, /MARKET SG[\s\S]*foam-oil: 8\.90 SGD per unit/);
  assert.match(facts, /MARKET MY[\s\S]*diffuser-350g: 68\.00 MYR per unit, minimum 20 units, quote only/);
  assert.doesNotMatch(facts.split('MARKET MY')[1].split('MARKET BN')[0], /pay directly/);
  assert.doesNotMatch(facts, /MARKET JP[^\n]*\n[^M]*foam-oil/, 'cleansers are not offered in Japan');
  assert.match(facts, /never guess/);
});

test('chat: grounded system prompt, trimmed history, chosen model, nothing stored', async () => {
  const h = harness({ openaiReply: 'Twenty diffusers are ¥48,000 including EMS. [Order here](/products/diffuser-350g?market=JP)' });
  try {
    process.env.OPENAI_MODEL = 'test-model';
    const { default: handler } = await import('../api/contact.js');
    const messages = Array.from({ length: 12 }, (_, i) => ({ role: i % 2 ? 'assistant' : 'user', content: `m${i}` })).concat([{ role: 'user', content: '20 diffusers price?' }]);
    const r = await run(handler, { url: '/api/contact?assistant=1', query: { assistant: '1' }, body: { messages, language: 'ja', market: 'JP' } });
    assert.equal(r.status, 200);
    assert.match(r.data.reply, /¥48,000/);
    const sent = h.calls[0];
    assert.equal(sent.model, 'test-model');
    assert.equal(sent.messages.length, 1 + 8, 'system + last 8 messages');
    assert.match(sent.messages[0].content, /Reply in Japanese/);
    assert.match(sent.messages[0].content, /2400 JPY per unit/);
    assert.doesNotMatch(sent.messages[0].content, /MARKET SG/, 'only the visitor market');
    assert.ok(sent.max_tokens <= 400);
  } finally { h.restore(); }
});

test('chat: unavailable without a key, rejects empty questions, and rate-limits one visitor', async () => {
  const { default: handler } = await import('../api/contact.js');
  let h = harness({ key: null });
  try {
    assert.deepEqual((await run(handler, { method: 'GET', url: '/api/contact?assistant=1', query: { assistant: '1' } })).data, { available: false });
    assert.equal((await run(handler, { url: '/api/contact?assistant=1', query: { assistant: '1' }, body: { messages: [{ role: 'user', content: 'hi' }] } })).status, 503);
  } finally { h.restore(); }
  h = harness();
  try {
    assert.deepEqual((await run(handler, { method: 'GET', url: '/api/contact?assistant=1', query: { assistant: '1' } })).data, { available: true });
    assert.equal((await run(handler, { url: '/api/contact?assistant=1', query: { assistant: '1' }, body: { messages: [] }, ip: '198.51.100.1' })).status, 422);
    let last = 0;
    for (let i = 0; i < 21; i++) last = (await run(handler, { url: '/api/contact?assistant=1', query: { assistant: '1' }, body: { messages: [{ role: 'user', content: 'hi' }] }, ip: '198.51.100.2' })).status;
    assert.equal(last, 429);
  } finally { h.restore(); }
});

test('chat: an OpenAI quota error becomes a short customer message, not a crash', async () => {
  const h = harness({ status: 429 });
  try {
    const { default: handler } = await import('../api/contact.js');
    const r = await run(handler, { url: '/api/contact?assistant=1', query: { assistant: '1' }, body: { messages: [{ role: 'user', content: 'hi' }] }, ip: '198.51.100.3' });
    assert.equal(r.status, 429);
    assert.equal(r.data.error, 'The assistant could not answer right now.');
  } finally { h.restore(); }
});

test('admin: reply draft for a stored enquiry, translation, and status; all need admin login', async () => {
  const draft = { language: 'Japanese', reply: 'HONDIT team', reply_ko: '번역', summary_ko: '가격 문의', owner_checks: ['배송일 확인'] };
  let h = harness({ json: draft });
  try {
    const { default: handler } = await import('../api/admin.js');
    assert.notEqual((await run(handler, { url: '/api/admin/ai/reply', body: { inquiryId: 'inq-1' } })).status, 200, 'no token');
    assert.deepEqual((await run(handler, { method: 'GET', url: '/api/admin/ai/status', token: 'admin-token' })).data, { configured: true });
    const r = await run(handler, { url: '/api/admin/ai/reply', body: { inquiryId: 'inq-1' }, token: 'admin-token' });
    assert.equal(r.status, 200);
    assert.deepEqual(r.data.draft, { language: 'Japanese', reply: 'HONDIT team', replyKo: '번역', summaryKo: '가격 문의', ownerChecks: ['배송일 확인'] });
    assert.match(h.calls[0].messages[0].content, /MARKET JP/);
    assert.match(h.calls[0].messages[1].content, /20個のディフューザー/);
  } finally { h.restore(); }
  const row = { name: 'Stone', shortDescription: 's', description: 'd', highlights: ['a'], howTo: ['b'] };
  h = harness({ json: { en: row, ja: row, zh: row, ms: row, th: row } });
  try {
    const { default: handler } = await import('../api/admin.js');
    assert.equal((await run(handler, { url: '/api/admin/ai/translate', body: { source: {} }, token: 'admin-token' })).status, 422);
    const r = await run(handler, { url: '/api/admin/ai/translate', body: { source: { name: '스톤', description: '설명' } }, token: 'admin-token' });
    assert.equal(r.status, 200);
    assert.deepEqual(Object.keys(r.data.translations), ['en', 'ja', 'zh', 'ms', 'th']);
    assert.equal(r.data.translations.ja.name, 'Stone');
  } finally { h.restore(); }
});
