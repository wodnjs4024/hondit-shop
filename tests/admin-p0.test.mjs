// Admin P0: market overrides, database-first catalogue, stock rules, dashboard figures, snapshot cleaning, API wiring.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import Module from 'node:module';
import { buildSync } from 'esbuild';
import { termsFor, cartTermsFor, isVisibleInMarket } from '../shared/market-overrides.js';
import { resolveCheckoutTerms } from '../shared/checkout-terms.js';
import { toClientProduct, calculateCart, previewWritesBlocked, applyProductSnapshot } from '../api/_utils.js';
import { summarizeOrders, isTestOrder, netAmount } from '../api/_admin-summary.js';
import { cleanSnapshot } from '../api/_admin-products.js';

const root = path.resolve(import.meta.dirname, '..');
const fixture = JSON.parse(fs.readFileSync(path.join(root, 'tests/fixtures/prod-api-products-2026-10-17.json'), 'utf8'));
const build = buildSync({
  stdin: { contents: 'export {composeStorefrontProducts} from "./src/lib/storefrontApi";export {productName,productDetail,productList,productMainImage,productGallery,productPriceLabel} from "./src/lib/productText";export {markets} from "./src/lib/market";', resolveDir: root, loader: 'ts' },
  bundle: true, write: false, platform: 'node', format: 'cjs', jsx: 'automatic', external: ['react', 'react-dom', 'react-router-dom'], logLevel: 'silent', define: { 'import.meta.env': '{"DEV":false,"MODE":"test"}' },
});
const runtime = new Module(path.join(root, 'admin-p0-runtime.cjs'));
runtime.paths = Module._nodeModulePaths(root);
runtime._compile(build.outputFiles[0].text, path.join(root, 'admin-p0-runtime.cjs'));
const { composeStorefrontProducts, productName, productDetail, productList, productMainImage, productGallery, productPriceLabel, markets } = runtime.exports;

const storefront = () => composeStorefrontProducts(fixture.products);
const d350 = () => storefront().find((p) => p.slug === 'diffuser-350g');

test('market override: hidden removes, quote turns direct into a request, direct never creates a price', () => {
  const base = d350();
  assert.equal(termsFor(base, 'SG', 20).status, 'direct');
  assert.equal(termsFor({ ...base, markets: { SG: 'hidden' } }, 'SG', 20).status, 'unavailable');
  const quote = termsFor({ ...base, markets: { SG: 'quote' } }, 'SG', 20);
  assert.equal(quote.status, 'request');
  assert.equal(quote.totalMinor, null);
  assert.equal(quote.referenceTotalMinor, 42000, 'reference amount stays visible for an enquiry');
  // JP has no approved terms: "direct" cannot enable payment
  assert.deepEqual(termsFor({ ...base, markets: { JP: 'direct' } }, 'JP', 20), resolveCheckoutTerms(base, 'JP', 20));
  assert.equal(cartTermsFor([{ product: { ...base, markets: { SG: 'quote' } }, quantity: 20 }], 'SG').status, 'request');
});

test('new products are enquiry-only, respect MOQ and are only visible where opened', () => {
  const fresh = { slug: 'stone-candle', apiSlug: 'stone-candle', category: 'SCENT', bulkMoq: 12, active: true, purchaseEnabled: true, markets: { SG: 'quote', HK: 'hidden' } };
  assert.equal(termsFor(fresh, 'SG', 12).status, 'request');
  assert.equal(termsFor(fresh, 'SG', 12).referenceTotalMinor, null);
  assert.equal(termsFor(fresh, 'SG', 11).reason, 'quantity_condition_scope');
  assert.equal(termsFor(fresh, 'JP', 12).status, 'unavailable', 'no market row and no approved terms: not sold');
  assert.equal(termsFor({ ...fresh, markets: { SG: 'direct' } }, 'SG', 12).status, 'request', 'direct without approved terms is still an enquiry');
  assert.equal(isVisibleInMarket(fresh, 'SG', false), true);
  assert.equal(isVisibleInMarket(fresh, 'HK', true), false);
  assert.equal(isVisibleInMarket(fresh, 'JP', true), true, 'no setting keeps the category rule');
});

test('catalogue is database-first: drafts and hidden never listed, new products listed as enquiry-only, original five unchanged', () => {
  const rows = [
    ...fixture.products,
    { ...fixture.products[0], id: 'draft-thing', slug: 'draft-thing', status: 'draft' },
    { id: 'stone-candle', slug: 'stone-candle', name: 'Stone Candle', category: 'diffuser', volumeLabel: '200g', shortDescription: 'short', description: 'long', imageUrl: '/images/x.webp', unitPriceSgd: 0, packQuantity: 12, packPriceSgd: 0, unitWeightKg: 0, inventoryPacks: 0, stockUnits: null, active: true, purchaseEnabled: true, sortOrder: 900, features: [], usage: [], status: 'published', contents: { en: { name: 'Stone Candle', shortDescription: 'Jeju stone' }, ko: { name: '스톤 캔들' } }, media: [{ url: 'https://x.supabase.co/a.webp', role: 'main', sortOrder: 1 }, { url: 'https://x.supabase.co/b.webp', role: 'gallery', sortOrder: 2 }], markets: { SG: 'quote' } },
  ];
  const listed = composeStorefrontProducts(rows);
  assert.deepEqual(listed.map((p) => p.slug), ['diffuser-350g', 'diffuser-500g', 'foam-oil', 'foaming-cleanser', 'cleansing-water', 'stone-candle']);
  const candle = listed.at(-1);
  assert.equal(candle.quoteOnly, true);
  assert.equal(candle.bulkMoq, 12);
  assert.equal(productName(candle, 'ko'), '스톤 캔들');
  assert.equal(productName(candle, 'ja'), 'Stone Candle', 'missing language falls back to English');
  assert.equal(productMainImage(candle), 'https://x.supabase.co/a.webp');
  assert.deepEqual(productGallery(candle), ['https://x.supabase.co/b.webp']);
  assert.equal(productPriceLabel(candle, markets.SG, 'ko'), '가격 문의');
  // hiding an original product removes it
  const hidden = composeStorefrontProducts(fixture.products.map((p) => (p.slug === 'foam-oil' ? { ...p, status: 'hidden' } : p)));
  assert.ok(!hidden.some((p) => p.slug === 'foam-oil'));
  // original five read exactly as before when no admin text exists
  const original = d350();
  assert.equal(productName(original, 'ko'), productName({ ...original, contents: undefined }, 'ko'));
  assert.equal(productDetail(original, 'en'), 'Compact scent for small spaces');
  assert.ok(productList(original, 'en', 'howTo').length > 0);
  assert.equal(productPriceLabel(original, markets.SG, 'ko'), '$21');
});

test('admin text overrides built-in copy only for the language it was written in', () => {
  const edited = { ...d350(), contents: { ko: { name: '볼캐닉 디퓨저 350g (새 이름)', highlights: ['하나', ' '] } } };
  assert.equal(productName(edited, 'ko'), '볼캐닉 디퓨저 350g (새 이름)');
  assert.equal(productName(edited, 'en'), 'Volcanic Diffuser 350g');
  assert.deepEqual(productList(edited, 'ko', 'highlights'), ['하나']);
});

test('stock: null is untracked, a number is exact (0 = sold out); old rows keep packs x MOQ', () => {
  const row = fixture.products.find((p) => p.slug === 'foam-oil');
  assert.equal(toClientProduct(row).stockUnits, 600);
  assert.equal(toClientProduct({ ...row, stock_units: 7 }).stockUnits, 7);
  assert.equal(toClientProduct({ ...row, inventoryPacks: 0, stockUnits: undefined }).stockUnits, null);
  const product = toClientProduct(row);
  assert.throws(() => calculateCart([{ slug: 'foam-oil', packCount: 30 }], [{ ...product, stockUnits: 0 }]), /sold out/);
  assert.throws(() => calculateCart([{ slug: 'foam-oil', packCount: 30 }], [{ ...product, stockUnits: 20 }]), /exceeds stock/);
  assert.equal(calculateCart([{ slug: 'foam-oil', packCount: 30 }], [{ ...product, stockUnits: null, inventoryPacks: 0 }]).lines[0].totalUnits, 30);
});

test('dashboard: test orders excluded, refunds netted, currencies never added together', () => {
  const now = new Date('2026-10-17T12:00:00Z');
  const ago = (days) => new Date(now.getTime() - days * 864e5).toISOString();
  const item = (slug = 'diffuser-350g') => [{ product_slug: slug, product_name_snapshot: 'Volcanic Stone Diffuser', total_units: 20 }];
  const orders = [
    { currency: 'SGD', total_sgd: 420, payment_status: 'completed', order_status: 'shipped', paid_at: ago(9), created_at: ago(10), country_code: 'SG', utm_source: 'qr', order_items: item() },
    { currency: 'SGD', total_sgd: 230, payment_status: 'completed', order_status: 'preparing', paid_at: ago(2), created_at: ago(3), country_code: 'SG', order_items: item() },
    { currency: 'HKD', total_sgd: 2560, payment_status: 'completed', order_status: 'paid', paid_at: ago(1), created_at: ago(2), country_code: 'HK', order_items: item() },
    { currency: 'SGD', total_sgd: 420, payment_status: 'completed', order_status: 'paid', paid_at: ago(1), created_at: ago(2), is_test: true, order_items: item() },
    { currency: 'SGD', total_sgd: 1, payment_status: 'completed', order_status: 'delivered', paid_at: ago(20), created_at: ago(21), order_items: item('live-payment-test') },
    { currency: 'SGD', total_sgd: 267, payment_status: 'refunded', order_status: 'refunded', paid_at: ago(15), created_at: ago(16), refunded_amount: 267, order_items: item() },
    { currency: 'SGD', total_sgd: 420, payment_status: 'completed', order_status: 'paid', paid_at: ago(40), created_at: ago(41), refunded_amount: 20, order_items: item() },
    { currency: 'JPY', total_sgd: 48000, payment_status: 'payment_failed', order_status: 'pending_payment', created_at: ago(1), order_items: item() },
    { currency: 'SGD', total_sgd: 420, payment_status: 'payment_cancelled', order_status: 'pending_payment', created_at: ago(1), order_items: item() },
  ];
  const s = summarizeOrders(orders, [{ status: 'new' }, { status: 'read' }, { status: 'replied' }], now);
  assert.deepEqual(s.kpi.revenue30, { SGD: 650, HKD: 2560 });
  assert.deepEqual(s.kpi.revenueAll, { SGD: 1050, HKD: 2560 });
  assert.equal(s.kpi.newOrders7, 2);
  assert.equal(s.kpi.toShip, 3);
  assert.equal(s.kpi.unanswered, 2);
  assert.equal(s.details.testOrders, 2);
  assert.equal(s.details.attempts30, 2);
  assert.deepEqual(s.details.refunds, { SGD: 287 });
  assert.equal(summarizeOrders(orders, null, now).kpi.unanswered, null);
  assert.equal(isTestOrder({ environment: 'sandbox' }), true);
  assert.equal(netAmount({ total_sgd: 100, payment_status: 'refunded' }), 0, 'refunded without an amount means fully refunded');
});

test('snapshot cleaning keeps text, photos and markets but never prices; MOQ only for enquiry-only products', () => {
  const original = toClientProduct(fixture.products.find((p) => p.slug === 'diffuser-350g'));
  const dirty = {
    base: { status: 'published', packQuantity: 5, unitPriceSgd: 1, category: 'weapons', sku: 'abc' },
    contents: { ko: { name: '  이름 ', highlights: ['a', '', 'b'] }, xx: { name: 'ignored' } },
    media: [{ url: 'javascript:alert(1)' }, { url: '/images/a.webp', role: 'main' }, { url: 'https://x.co/b.webp', role: 'weird' }],
    markets: { SG: 'quote', XX: 'direct', JP: 'free' },
  };
  const clean = cleanSnapshot(dirty, original);
  assert.equal(clean.base.packQuantity, undefined, 'approved products keep their MOQ');
  assert.equal(clean.base.unitPriceSgd, undefined);
  assert.equal(clean.base.category, 'diffuser');
  assert.equal(clean.base.sku, 'ABC');
  assert.deepEqual(Object.keys(clean.contents), ['ko']);
  assert.deepEqual(clean.contents.ko.highlights, ['a', 'b']);
  assert.deepEqual(clean.media.map((m) => [m.url, m.role]), [['/images/a.webp', 'main'], ['https://x.co/b.webp', 'gallery']]);
  assert.deepEqual(clean.markets, { SG: 'quote' });
  const fresh = cleanSnapshot({ base: { packQuantity: 12 } }, { ...original, slug: 'stone-candle' });
  assert.equal(fresh.base.packQuantity, 12);
  const preview = applyProductSnapshot(original, clean);
  assert.equal(preview.imageUrl, '/images/a.webp');
  assert.equal(preview.unitPriceSgd, original.unitPriceSgd, 'preview never changes price');
});

test('preview deployments stay read-only unless wired to staging, and never to the production database', () => {
  const keep = { env: process.env.VERCEL_ENV, staging: process.env.HONDIT_STAGING, url: process.env.SUPABASE_URL };
  try {
    process.env.VERCEL_ENV = 'preview'; delete process.env.HONDIT_STAGING; process.env.SUPABASE_URL = 'https://abcdefghijklmnopqrst.supabase.co';
    assert.equal(previewWritesBlocked('POST'), true);
    assert.equal(previewWritesBlocked('GET'), false);
    process.env.HONDIT_STAGING = '1';
    assert.equal(previewWritesBlocked('POST'), false);
    process.env.SUPABASE_URL = 'https://vohlwqamyujzfqthhplk.supabase.co';
    assert.equal(previewWritesBlocked('POST'), true, 'staging flag cannot unlock the production database');
    process.env.VERCEL_ENV = 'production';
    assert.equal(previewWritesBlocked('POST'), false);
  } finally {
    for (const [k, v] of [['VERCEL_ENV', keep.env], ['HONDIT_STAGING', keep.staging], ['SUPABASE_URL', keep.url]]) if (v === undefined) delete process.env[k]; else process.env[k] = v;
  }
});

test('payment server applies market overrides and records stock once after capture', () => {
  const read = (f) => fs.readFileSync(path.join(root, f), 'utf8');
  const create = read('api/paypal/create-order.js');
  assert.match(create, /cartTermsFor\(body\.cart\.map/);
  assert.match(create, /const decision=cartTermsFor\(/);
  assert.doesNotMatch(create, /resolveCheckoutCart\(/);
  assert.match(read('api/paypal/capture-order.js'), /rpc\/record_order_stock[^\n]*\.catch\(\(\) => \{\}\)/);
  assert.match(read('api/paypal/webhook.js'), /rpc\/record_order_stock[^\n]*\.catch\(\(\) => \{\}\)/);
  // the approved price tables themselves are untouched by the admin rebuild
  assert.doesNotMatch(read('shared/checkout-terms.js'), /markets\?\.\[/);
  assert.match(read('supabase/migrations/008_admin_p0.sql'), /create unique index if not exists inventory_movements_order_once/);
});
