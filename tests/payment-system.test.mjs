import assert from "node:assert/strict";
import test from "node:test";
import {
  formatPayPalAmount,
  getMarketLineTotal,
  getMarketUnitPrice,
  isBulkProductAllowedForMarket,
  markets,
  resolveMarket,
  validateCapturedPayment,
} from "../api/_markets.js";
import { defaultProducts } from "../api/_bulk-data.js";

const diffuser = defaultProducts.find((product) => product.slug === "diffuser-350g");
const cleanser = defaultProducts.find((product) => product.category === "cleansing");

test("each market resolves to its correct country and currency", () => {
  const expected = { SG: "SGD", HK: "HKD", TW: "TWD", JP: "JPY" };
  for (const [code, currency] of Object.entries(expected)) {
    const market = resolveMarket({ market: code, countryCode: code });
    assert.equal(market.currency, currency);
    assert.equal(market.countryCode, code);
  }
});

test("PayPal amount formatting follows zero-decimal currency rules", () => {
  assert.equal(formatPayPalAmount(1234.56, "SGD"), "1234.56");
  assert.equal(formatPayPalAmount(1234.56, "HKD"), "1234.56");
  assert.equal(formatPayPalAmount(1234.56, "TWD"), "1235");
  assert.equal(formatPayPalAmount(1234.56, "JPY"), "1235");
});

test("country mismatch is rejected before PayPal order creation", () => {
  assert.throws(() => resolveMarket({ market: "TW", countryCode: "JP" }), /does not match/);
});

test("market-specific product restrictions are enforced", () => {
  assert.equal(isBulkProductAllowedForMarket(diffuser, markets.TW), true);
  assert.equal(isBulkProductAllowedForMarket(diffuser, markets.JP), true);
  assert.equal(isBulkProductAllowedForMarket(cleanser, markets.SG), true);
  assert.equal(isBulkProductAllowedForMarket(cleanser, markets.HK), true);
  assert.equal(isBulkProductAllowedForMarket(cleanser, markets.TW), false);
  assert.equal(isBulkProductAllowedForMarket(cleanser, markets.JP), false);
});

test("fixed market prices produce expected minimum totals", () => {
  const expected = { SG: 420, HK: 2560, TW: 9600, JP: 48000 };
  for (const [code, total] of Object.entries(expected)) {
    assert.equal(getMarketUnitPrice(diffuser, markets[code]), total / 20);
    assert.equal(getMarketLineTotal(diffuser, 20, markets[code]), total);
  }
});

test("capture validation accepts exact completed payments", () => {
  const result = validateCapturedPayment(
    { status: "COMPLETED", amount: { value: "9600", currency_code: "TWD" } },
    9600,
    "TWD",
  );
  assert.deepEqual(result, { paidAmount: 9600, paidCurrency: "TWD" });
});

test("capture validation rejects incomplete, wrong-currency and wrong-amount payments", () => {
  assert.throws(() => validateCapturedPayment({ status: "PENDING" }, 420, "SGD"), /not completed/);
  assert.throws(
    () => validateCapturedPayment({ status: "COMPLETED", amount: { value: "420", currency_code: "HKD" } }, 420, "SGD"),
    /does not match/,
  );
  assert.throws(
    () => validateCapturedPayment({ status: "COMPLETED", amount: { value: "419", currency_code: "SGD" } }, 420, "SGD"),
    /does not match/,
  );
});
