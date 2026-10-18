// Phase 2: admin price versions. Synthetic products and an in-memory database only.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { resolveCheckoutTerms, checkoutConditions } from '../shared/checkout-terms.js';
import { termsFor, cartTermsFor } from '../shared/market-overrides.js';
import { conditionsFor, currentPrices, priceSlot, priceSlots, amountToMinor } from '../shared/price-versions.js';
import { approvedResaleTerms } from '../shared/resale-economics.js';
import { toClientProduct } from '../api/_utils.js';
import { defaultProducts } from '../api/_bulk-data.js';

const root = path.resolve(import.meta.dirname, '..');
const base = (slug) => toClientProduct(defaultProducts.find((p) => p.slug === slug));
const v = (amount, currency, version = 'adm-test') => ({ amount, currency, version, effectiveFrom: '2026-10-18T00:00:00Z' });

test('without versions every decision is identical to the approved terms', () => {
  for (const slot of priceSlots) {
    const product = base(slot.sku);
    for (const q of [10, 20, 21, 30, 100]) assert.deepEqual(termsFor(product, slot.market, q), resolveCheckoutTerms(product, slot.market, q), `${slot.sku} ${slot.market} ${q}`);
    assert.equal(conditionsFor(product, slot.market), checkoutConditions);
  }
});

test('an SG version becomes the charged price, with its version recorded; MOQ and delivery stay as approved', () => {
  const product = { ...base('diffuser-350g'), prices: { SG: { general: v(23, 'SGD', 'adm-sg-1'), trial: v(25, 'SGD', 'adm-sg-trial') } } };
  const d = termsFor(product, 'SG', 20);
  assert.equal(d.status, 'direct');
  assert.equal(d.unitMinor, 2300);
  assert.equal(d.totalMinor, 46000);
  assert.equal(d.version, 'adm-sg-1');
  assert.equal(d.shippingIncluded, true);
  assert.equal(termsFor(product, 'SG', 21).totalMinor, 48300);
  assert.equal(termsFor(product, 'SG', 10).unitMinor, 2500);
  assert.equal(termsFor(product, 'SG', 15).status, 'unavailable', 'quantity rules unchanged');
  assert.equal(cartTermsFor([{ product, quantity: 20 }], 'SG').totalMinor, 46000, 'server cart path');
  assert.equal(approvedResaleTerms(product, 'SG', 20).unitMinor, 2300);
  // other products and markets are untouched
  assert.deepEqual(termsFor(base('diffuser-500g'), 'SG', 20), resolveCheckoutTerms(base('diffuser-500g'), 'SG', 20));
});

test('a version in a quote market changes only the reference price and never enables payment', () => {
  const product = { ...base('diffuser-350g'), prices: { MY: { general: v(70, 'MYR') }, JP: { general: v(2600, 'JPY'), trial: v(3500, 'JPY') }, BN: { trial: v(30, 'BND') } } };
  const d = termsFor(product, 'MY', 20);
  assert.equal(d.status, 'request');
  assert.equal(d.referenceUnitMinor, 7000);
  assert.equal(d.referenceTotalMinor, 140000);
  assert.equal(d.totalMinor, null);
  assert.equal(termsFor({ ...product, markets: { MY: 'direct' } }, 'MY', 20).status, 'request');
  // JP general is payable since 2026-10-18, so its version is the charged price; the JP trial stays a quote.
  assert.equal(termsFor(product, 'JP', 20).status, 'direct');
  assert.equal(termsFor(product, 'JP', 20).totalMinor, 52000);
  assert.equal(termsFor(product, 'JP', 10).status, 'request');
  assert.equal(termsFor(product, 'JP', 10).referenceUnitMinor, 3500);
  assert.equal(termsFor(product, 'BN', 10).referenceUnitMinor, 3000);
  assert.equal(termsFor(product, 'BN', 10).displayCurrency, 'BND');
});

test('versions with a wrong currency, too many decimals or an unknown slot are ignored', () => {
  const p = base('diffuser-350g');
  assert.deepEqual(termsFor({ ...p, prices: { SG: { general: v(23, 'HKD') } } }, 'SG', 20), resolveCheckoutTerms(p, 'SG', 20));
  assert.deepEqual(termsFor({ ...p, prices: { SG: { general: v(23.005, 'SGD') } } }, 'SG', 20), resolveCheckoutTerms(p, 'SG', 20));
  assert.deepEqual(termsFor({ ...p, prices: { SG: { general: v(0, 'SGD') } } }, 'SG', 20), resolveCheckoutTerms(p, 'SG', 20));
  assert.equal(priceSlot('foam-oil', 'JP', 'general'), null, 'cleansers are not sold in JP');
  assert.equal(priceSlot('foam-oil', 'SG', 'trial'), null, 'no trial for cleansers');
  assert.equal(amountToMinor('21.5', 2), 2150);
  assert.equal(amountToMinor('21.555', 2), null);
  assert.equal(amountToMinor('2400.5', 0), null);
});

test('the version in force is the latest that has started and was not cancelled', () => {
  const rows = [
    { market: 'SG', kind: 'general', currency: 'SGD', amount: '22.00', version: 'a', effective_from: '2026-10-01T00:00:00Z', created_at: '2026-10-01T00:00:00Z' },
    { market: 'SG', kind: 'general', currency: 'SGD', amount: '23.00', version: 'b', effective_from: '2026-10-10T00:00:00Z', created_at: '2026-10-09T00:00:00Z' },
    { market: 'SG', kind: 'general', currency: 'SGD', amount: '99.00', version: 'c', effective_from: '2026-10-12T00:00:00Z', created_at: '2026-10-09T00:00:00Z', cancelled_at: '2026-10-11T00:00:00Z' },
    { market: 'SG', kind: 'general', currency: 'SGD', amount: '24.00', version: 'd', effective_from: '2026-11-01T00:00:00Z', created_at: '2026-10-09T00:00:00Z' },
  ];
  assert.equal(currentPrices(rows, '2026-10-15T00:00:00Z').SG.general.version, 'b');
  assert.equal(currentPrices(rows, '2026-11-02T00:00:00Z').SG.general.amount, 24);
  assert.deepEqual(currentPrices(rows, '2026-09-01T00:00:00Z'), {});
});

test('product rows carry the version in force to the storefront price and the server', () => {
  const row = { ...defaultProducts.find((p) => p.slug === 'diffuser-350g'), market_unit_prices: { SG: 21, JP: 2400 }, product_prices: [
    { market: 'SG', kind: 'general', currency: 'SGD', amount: '23.00', version: 'adm-x', effective_from: '2026-01-01T00:00:00Z' },
    { market: 'JP', kind: 'general', currency: 'JPY', amount: '2600', version: 'adm-y', effective_from: '2099-01-01T00:00:00Z' },
  ] };
  const product = toClientProduct(row);
  assert.equal(product.prices.SG.general.version, 'adm-x');
  assert.equal(product.prices.JP, undefined, 'future version not yet in force');
  assert.equal(product.marketUnitPrices.SG, 23);
  assert.equal(product.marketUnitPrices.JP, 2400);
  assert.equal(product.baseMarketUnitPrices.SG, 21);
  assert.equal(termsFor(product, 'SG', 20).totalMinor, 46000);
  const plain = toClientProduct({ ...row, product_prices: undefined });
  assert.deepEqual(plain.prices, {});
  assert.deepEqual(plain.marketUnitPrices, { SG: 21, JP: 2400 });
});

function adminHarness(products) {
  const calls = [];
  const db = [];
  const keep = { env: process.env.VERCEL_ENV, staging: process.env.HONDIT_STAGING, url: process.env.SUPABASE_URL, key: process.env.SUPABASE_SERVICE_ROLE_KEY, anon: process.env.VITE_SUPABASE_ANON_KEY };
  const original = globalThis.fetch;
  Object.assign(process.env, { VERCEL_ENV: 'preview', HONDIT_STAGING: '1', SUPABASE_URL: 'https://abcdefghijklmnopqrst.supabase.co', SUPABASE_SERVICE_ROLE_KEY: 'synthetic', VITE_SUPABASE_ANON_KEY: 'synthetic' });
  globalThis.fetch = async (url, options = {}) => {
    const u = new URL(url);
    calls.push({ method: options.method || 'GET', path: u.pathname, search: decodeURIComponent(u.search), body: options.body ? JSON.parse(options.body) : null });
    let data = [];
    if (u.pathname.endsWith('/products')) data = products;
    else if (u.pathname.endsWith('/product_prices') && options.method === 'POST') { const row = { id: 'row-' + db.length, ...JSON.parse(options.body) }; db.push(row); data = [row]; }
    else if (u.pathname.endsWith('/product_prices') && options.method === 'PATCH') data = [];
    else if (u.pathname.endsWith('/product_prices')) data = db;
    return new Response(JSON.stringify(data), { status: 200 });
  };
  const restore = () => { globalThis.fetch = original; for (const [k, val] of [['VERCEL_ENV', keep.env], ['HONDIT_STAGING', keep.staging], ['SUPABASE_URL', keep.url], ['SUPABASE_SERVICE_ROLE_KEY', keep.key], ['VITE_SUPABASE_ANON_KEY', keep.anon]]) if (val === undefined) delete process.env[k]; else process.env[k] = val; };
  return { calls, db, restore };
}

async function call(handler, method, url, body) {
  let status = 0, out = '';
  const res = { status(code) { status = code; return this; }, setHeader() { return this; }, end(text) { out = text; } };
  await handler({ method, url, query: {}, headers: { authorization: 'Bearer staging-preview' }, body }, res);
  return { status, data: JSON.parse(out || '{}') };
}

test('admin price API: validates, guards large changes, never back-dates, records who and when', async () => {
  const rows = defaultProducts.map((p) => ({ ...p, pack_quantity: p.packQuantity, active: true, purchase_enabled: true, product_prices: [] }));
  const h = adminHarness(rows);
  try {
    const { default: handler } = await import('../api/admin.js');
    const list = await call(handler, 'GET', '/api/admin/prices');
    assert.equal(list.status, 200);
    const sg = list.data.slots.find((s) => s.sku === 'diffuser-350g' && s.market === 'SG' && s.kind === 'general');
    assert.equal(sg.codeAmount, 21);
    assert.equal(sg.chargeable, true);
    assert.equal(list.data.slots.find((s) => s.sku === 'diffuser-350g' && s.market === 'SG' && s.kind === 'trial').codeAmount, 23);
    assert.equal(list.data.slots.find((s) => s.sku === 'diffuser-350g' && s.market === 'JP' && s.kind === 'general').codeAmount, 2400);
    assert.equal(list.data.slots.some((s) => s.sku === 'foam-oil' && s.market === 'JP'), false);

    const id = rows.find((p) => p.slug === 'diffuser-350g').id;
    assert.equal((await call(handler, 'POST', '/api/admin/prices', { productId: id, market: 'JP', kind: 'general', amount: '2600' })).status, 200);
    assert.equal((await call(handler, 'POST', '/api/admin/prices', { productId: id, market: 'SG', kind: 'general', amount: '21.005' })).status, 422);
    assert.equal((await call(handler, 'POST', '/api/admin/prices', { productId: id, market: 'JP', kind: 'general', amount: '2600.5' })).status, 422, 'JPY has no decimals');
    assert.equal((await call(handler, 'POST', '/api/admin/prices', { productId: id, market: 'SG', kind: 'general', amount: '21' })).status, 422, 'same as today');
    assert.equal((await call(handler, 'POST', '/api/admin/prices', { productId: id, market: 'SG', kind: 'general', amount: '23', effectiveFrom: '2020-01-01T00:00:00Z' })).status, 422, 'no back-dating');
    assert.equal((await call(handler, 'POST', '/api/admin/prices', { productId: 'foam-oil', market: 'JP', kind: 'general', amount: '10' })).status, 422);
    const large = await call(handler, 'POST', '/api/admin/prices', { productId: id, market: 'SG', kind: 'general', amount: '40' });
    assert.equal(large.status, 409);
    assert.equal(large.data.code, 'LARGE_CHANGE');
    const ok = await call(handler, 'POST', '/api/admin/prices', { productId: id, market: 'SG', kind: 'general', amount: '40', confirmLargeChange: true, note: 'synthetic' });
    assert.equal(ok.status, 200);
    assert.equal(ok.data.chargeable, true);
    const saved = h.db.at(-1);
    assert.equal(saved.currency, 'SGD');
    assert.equal(saved.amount, 40);
    assert.match(saved.version, /^adm-sg-diffuser-350g-general-\d{14}-[a-z0-9]{4}$/);
    assert.equal(saved.created_by, '00000000-0000-4000-8000-0000000000aa');
    assert.ok(new Date(saved.effective_from).getTime() >= Date.now() - 5000);

    const cancel = await call(handler, 'POST', '/api/admin/prices/row-0/cancel');
    assert.equal(cancel.status, 409, 'a started version cannot be cancelled');
    const patch = h.calls.find((c) => c.method === 'PATCH');
    assert.match(patch.search, /cancelled_at=is\.null&effective_from=gt\./);
    assert.equal(h.calls.some((c) => c.method === 'DELETE'), false);
  } finally {
    h.restore();
  }
});

test('migration 009 keeps price history append-only', () => {
  const sql = fs.readFileSync(path.join(root, 'supabase/migrations/009_price_versions.sql'), 'utf8');
  assert.match(sql, /Price history cannot be deleted/);
  assert.match(sql, /cannot start in the past/);
  assert.match(sql, /Only a version that has not started yet can be cancelled/);
  assert.match(sql, /revoke all on public\.product_prices from public, anon, authenticated/);
  assert.doesNotMatch(sql, /alter table public\.(products|orders|order_items)/);
});
