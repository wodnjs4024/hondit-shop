// Sales baseline: every amount, currency and routing decision the shop makes today, frozen before the admin rebuild.
// The storefront path (what customers see) and the server path (what PayPal is asked to charge) are both recorded
// for 5 products x 8 markets x 11 quantities, fed with the production /api/products response of 2026-10-17.
// Regenerate only on purpose, after an approved price change:  UPDATE_BASELINE=1 node --test tests/sales-baseline.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import Module from 'node:module';
import { buildSync } from 'esbuild';
import { resolveCheckoutTerms, resolveCheckoutCart } from '../shared/checkout-terms.js';
import { toClientProduct } from '../api/_utils.js';

const root = path.resolve(import.meta.dirname, '..');
const fixture = JSON.parse(fs.readFileSync(path.join(root, 'tests/fixtures/prod-api-products-2026-10-17.json'), 'utf8'));
const baselineFile = path.join(root, 'tests/fixtures/sales-baseline.json');
const marketsList = ['SG', 'HK', 'MO', 'TW', 'JP', 'TH', 'MY', 'BN'];
const quantities = ['1', '5', '9', '10', '11', '15', '19', '20', '21', '30', '100'];

const build = buildSync({
  stdin: { contents: 'export {loadStorefrontProducts} from "./src/lib/storefrontApi";export {markets,formatMarketUnitMoney,isStorefrontProductAllowedForMarket} from "./src/lib/market";', resolveDir: root, loader: 'ts' },
  bundle: true, write: false, platform: 'node', format: 'cjs', jsx: 'automatic', external: ['react', 'react-dom', 'react-router-dom'], logLevel: 'silent', define: { 'import.meta.env': '{"DEV":false,"MODE":"test"}' },
});
const runtime = new Module(path.join(root, 'baseline-runtime.cjs'));
runtime.paths = Module._nodeModulePaths(root);
runtime._compile(build.outputFiles[0].text, path.join(root, 'baseline-runtime.cjs'));
const { loadStorefrontProducts, markets, formatMarketUnitMoney, isStorefrontProductAllowedForMarket } = runtime.exports;

const pick = (d) => ({ status: d.status, reason: d.reason, displayCurrency: d.displayCurrency ?? null, referenceUnitMinor: d.referenceUnitMinor ?? null, referenceTotalMinor: d.referenceTotalMinor ?? null, billingCurrency: d.billingCurrency ?? null, unitMinor: d.unitMinor ?? null, totalMinor: d.totalMinor ?? null, shippingMinor: d.shippingMinor ?? null, shippingIncluded: d.shippingIncluded ?? null, version: d.version ?? null });

async function snapshot() {
  globalThis.fetch = async (url) => {
    if (String(url).includes('/api/products')) return { ok: true, status: 200, json: async () => fixture, text: async () => JSON.stringify(fixture) };
    throw new Error('unexpected fetch ' + url);
  };
  const storefront = await loadStorefrontProducts();
  const server = fixture.products.map(toClientProduct);
  const out = {};
  for (const product of storefront) {
    const sku = product.apiSlug || product.slug;
    const serverProduct = server.find((p) => p.slug === sku);
    for (const m of marketsList) {
      const market = markets[m];
      out[`${product.slug}|${m}|listing`] = { visible: Boolean(isStorefrontProductAllowedForMarket(product, market)), unitPrice: formatMarketUnitMoney(product, market), moq: product.bulkMoq ?? null, stock: product.stockQuantity ?? null, active: product.active ?? null, purchaseEnabled: product.purchaseEnabled ?? null };
      for (const q of quantities) {
        out[`${product.slug}|${m}|${q}|storefront`] = pick(resolveCheckoutTerms(product, m, q));
        out[`${product.slug}|${m}|${q}|server`] = serverProduct ? pick(resolveCheckoutCart([{ product: serverProduct, quantity: Number(q) }], m)) : null;
      }
    }
  }
  return out;
}

test('storefront and server pricing, currency and routing match the frozen baseline', async () => {
  const current = await snapshot();
  if (process.env.UPDATE_BASELINE === '1' || !fs.existsSync(baselineFile)) {
    fs.writeFileSync(baselineFile, JSON.stringify(current, null, 1) + '\n');
    return;
  }
  const baseline = JSON.parse(fs.readFileSync(baselineFile, 'utf8'));
  assert.deepEqual(Object.keys(current).sort(), Object.keys(baseline).sort(), 'the set of products/markets/quantities changed');
  for (const key of Object.keys(baseline)) assert.deepEqual(current[key], baseline[key], `changed: ${key}`);
});
