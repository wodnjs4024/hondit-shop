// Admin password change and reset, against a synthetic Supabase. No real account or email is touched.
import test from 'node:test';
import assert from 'node:assert/strict';

const ADMIN = { id: '11111111-1111-4111-8111-111111111111', email: 'owner@hondit.test' };
const STRANGER = { id: '22222222-2222-4222-8222-222222222222', email: 'someone@hondit.test' };

function harness() {
  const calls = [];
  const keep = { url: process.env.SUPABASE_URL, anon: process.env.VITE_SUPABASE_ANON_KEY, key: process.env.SUPABASE_SERVICE_ROLE_KEY, env: process.env.VERCEL_ENV };
  const original = globalThis.fetch;
  Object.assign(process.env, { SUPABASE_URL: 'https://mock.invalid', VITE_SUPABASE_ANON_KEY: 'anon', SUPABASE_SERVICE_ROLE_KEY: 'service', VERCEL_ENV: 'production' });
  globalThis.fetch = async (url, options = {}) => {
    const u = new URL(url);
    const auth = String(options.headers?.Authorization || '');
    const body = options.body ? JSON.parse(options.body) : null;
    calls.push({ method: options.method || 'GET', path: u.pathname, search: decodeURIComponent(u.search), auth, body });
    const reply = (status, data) => new Response(JSON.stringify(data), { status });
    if (u.pathname === '/auth/v1/user' && (options.method || 'GET') === 'GET') {
      if (auth === 'Bearer admin-token' || auth === 'Bearer recovery-token') return reply(200, ADMIN);
      if (auth === 'Bearer stranger-token') return reply(200, STRANGER);
      return reply(401, { msg: 'invalid' });
    }
    if (u.pathname === '/auth/v1/user' && options.method === 'PUT') return body.password === 'same-as-before' ? reply(422, { msg: 'New password should be different from the old password.' }) : reply(200, ADMIN);
    if (u.pathname === '/auth/v1/token') return body.password === 'right-current' ? reply(200, { access_token: 'x' }) : reply(400, { error: 'invalid_grant' });
    if (u.pathname === '/auth/v1/recover') return reply(200, {});
    if (u.pathname === '/rest/v1/admin_profiles') return reply(200, decodeURIComponent(u.search).includes(ADMIN.id) || decodeURIComponent(u.search).includes(ADMIN.email) ? [{ user_id: ADMIN.id }] : []);
    throw new Error('unexpected ' + u.pathname);
  };
  const restore = () => { globalThis.fetch = original; for (const [k, v] of [['SUPABASE_URL', keep.url], ['VITE_SUPABASE_ANON_KEY', keep.anon], ['SUPABASE_SERVICE_ROLE_KEY', keep.key], ['VERCEL_ENV', keep.env]]) if (v === undefined) delete process.env[k]; else process.env[k] = v; };
  return { calls, restore };
}

async function call(path, body, token) {
  const { default: handler } = await import('../api/admin.js');
  let status = 0, out = '';
  const res = { status(code) { status = code; return this; }, setHeader() { return this; }, end(text) { out = text; } };
  await handler({ method: 'POST', url: path, query: {}, headers: token ? { authorization: `Bearer ${token}` } : {}, body }, res);
  return { status, data: JSON.parse(out || '{}') };
}

test('signed-in change: needs the admin session and the current password, then sets the new one', async () => {
  const h = harness();
  try {
    assert.equal((await call('/api/admin/password', { currentPassword: 'right-current', newPassword: 'jeju-stone-2026' })).status, 401);
    assert.equal((await call('/api/admin/password', { currentPassword: 'right-current', newPassword: 'jeju-stone-2026' }, 'staging-preview')).status, 401);
    assert.equal((await call('/api/admin/password', { currentPassword: 'right-current', newPassword: 'jeju-stone-2026' }, 'stranger-token')).status, 401, 'not an admin');
    assert.equal((await call('/api/admin/password', { currentPassword: 'right-current', newPassword: 'short' }, 'admin-token')).status, 422);
    assert.equal((await call('/api/admin/password', { currentPassword: 'wrong', newPassword: 'jeju-stone-2026' }, 'admin-token')).status, 403);
    assert.equal(h.calls.some((c) => c.method === 'PUT'), false, 'nothing changed so far');
    assert.equal((await call('/api/admin/password', { currentPassword: 'right-current', newPassword: 'same-as-before' }, 'admin-token')).status, 422);
    const ok = await call('/api/admin/password', { currentPassword: 'right-current', newPassword: 'jeju-stone-2026' }, 'admin-token');
    assert.equal(ok.status, 200);
    const put = h.calls.filter((c) => c.method === 'PUT').at(-1);
    assert.equal(put.auth, 'Bearer admin-token');
    assert.deepEqual(put.body, { password: 'jeju-stone-2026' });
    assert.equal(JSON.stringify(ok.data).includes('jeju'), false, 'password never echoed');
  } finally { h.restore(); }
});

test('reset link: the emailed one-time session sets the new password without the old one', async () => {
  const h = harness();
  try {
    assert.equal((await call('/api/admin/password', { mode: 'recovery', accessToken: 'expired', newPassword: 'jeju-stone-2026' })).status, 401);
    const ok = await call('/api/admin/password', { mode: 'recovery', accessToken: 'recovery-token', newPassword: 'jeju-stone-2026' });
    assert.equal(ok.status, 200);
    assert.equal(h.calls.filter((c) => c.method === 'PUT').at(-1).auth, 'Bearer recovery-token');
    assert.equal(h.calls.some((c) => c.path === '/auth/v1/token'), false);
  } finally { h.restore(); }
});

test('reset email goes only to registered admins, only back to this shop, and answers the same either way', async () => {
  const h = harness();
  try {
    const stranger = await call('/api/admin/password-reset', { email: STRANGER.email, origin: 'https://hondit-shop.vercel.app' });
    assert.equal(stranger.status, 200);
    assert.equal(h.calls.some((c) => c.path === '/auth/v1/recover'), false);
    const admin = await call('/api/admin/password-reset', { email: ADMIN.email, origin: 'https://evil.example' });
    assert.deepEqual(admin.data, stranger.data);
    const recover = h.calls.find((c) => c.path === "/auth/v1/recover");
    assert.equal(recover.search, '?redirect_to=https://hondit-shop.vercel.app/admin/reset-password');
    await call('/api/admin/password-reset', { email: ADMIN.email, origin: 'https://hondit-shop-abc123-hondit.vercel.app' });
    assert.equal(h.calls.filter((c) => c.path === '/auth/v1/recover').at(-1).search, '?redirect_to=https://hondit-shop-abc123-hondit.vercel.app/admin/reset-password');
    assert.equal((await call('/api/admin/password-reset', { email: 'not-an-email' })).status, 422);
  } finally { h.restore(); }
});
