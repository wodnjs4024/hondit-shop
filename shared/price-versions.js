// Admin price versions (migration 009) laid over the approved checkout terms.
// checkout-terms.js stays the source of every rule (MOQ, delivery, payment routing). A price version can only replace
// the unit amount of a slot that already exists there:
// - where the code has an approved, payable condition (SG today) the version becomes the charged price;
// - everywhere else it only replaces the reference price shown next to "request a quote".
// Products without versions get the frozen default conditions object, so today's behaviour is byte-for-byte unchanged.
import { checkoutConditions, paypalCurrencyDigits } from './checkout-terms.js';
import { currencyDigits } from './sales-tools.js';

export const priceKinds = Object.freeze(['general', 'trial']);
const generalCurrency = { SG: 'SGD', HK: 'HKD', MO: 'HKD', JP: 'JPY', TW: 'TWD', TH: 'THB', MY: 'SGD', BN: 'SGD' };
const trialCurrency = { ...generalCurrency, BN: 'BND', MO: 'MOP', MY: 'MYR' };

const isTrial = (condition) => condition.minimum === 10 && condition.maximum === 10;

/* Every product x market x kind the code knows about, with the currency its price is written in. */
export const priceSlots = Object.freeze(checkoutConditions.map((condition) => {
  const kind = isTrial(condition) ? 'trial' : 'general';
  return Object.freeze({ sku: condition.sku, market: condition.market, kind, currency: (kind === 'trial' ? trialCurrency : generalCurrency)[condition.market], chargeable: condition.priceApproval === 'approved' });
}));

export function priceSlot(sku, market, kind) {
  return priceSlots.find((slot) => slot.sku === sku && slot.market === market && slot.kind === kind) || null;
}

/* Exact major -> minor conversion; null when the amount has more decimals than the currency allows. */
export function amountToMinor(amount, digits) {
  const value = Number(amount);
  if (!Number.isFinite(value) || value <= 0) return null;
  const minor = Math.round(value * 10 ** digits);
  return Math.abs(minor - value * 10 ** digits) < 1e-6 && Number.isSafeInteger(minor) ? minor : null;
}

/* The version in force at `now` for each market and kind: latest effective_from that has started and was not cancelled. */
export function currentPrices(rows = [], now = Date.now()) {
  const prices = {};
  const at = typeof now === 'number' ? now : new Date(now).getTime();
  const live = rows
    .filter((row) => row && !row.cancelled_at && new Date(row.effective_from).getTime() <= at)
    .sort((a, b) => new Date(a.effective_from) - new Date(b.effective_from) || String(a.created_at || '').localeCompare(String(b.created_at || '')));
  for (const row of live) {
    prices[row.market] = { ...(prices[row.market] || {}), [row.kind]: { amount: Number(row.amount), currency: row.currency, version: row.version, effectiveFrom: row.effective_from } };
  }
  return prices;
}

export function priceFor(product, market, kind) {
  const value = product?.prices?.[market]?.[kind];
  const slot = priceSlot(product?.apiSlug || product?.slug, market, kind);
  return value && slot && value.currency === slot.currency && typeof value.version === 'string' && Number(value.amount) > 0 ? value : null;
}

/* The checkout conditions for one product in one market, with its approved slots repriced by the current version. */
export function conditionsFor(product, market) {
  const sku = product?.apiSlug || product?.slug;
  if (!product?.prices?.[market]) return checkoutConditions;
  let changed = false;
  const next = checkoutConditions.map((condition) => {
    if (condition.market !== market || condition.sku !== sku || condition.priceApproval !== 'approved' || !condition.billingCurrency) return condition;
    const version = priceFor(product, market, isTrial(condition) ? 'trial' : 'general');
    const minor = version && version.currency === condition.billingCurrency ? amountToMinor(version.amount, paypalCurrencyDigits(condition.billingCurrency)) : null;
    if (minor === null) return condition;
    changed = true;
    return Object.freeze({ ...condition, unitMinor: minor, version: version.version });
  });
  return changed ? Object.freeze(next) : checkoutConditions;
}

/* Quote-only slots: the version replaces the reference amount shown to the customer. Nothing becomes payable. */
export function applyReferencePrice(decision, product, market) {
  if (decision.status !== 'request' || decision.priceApproval === 'approved' || !decision.displayCurrency) return decision;
  const kind = decision.quantity === 10 && ['diffuser-350g', 'diffuser-500g'].includes(product?.apiSlug || product?.slug) ? 'trial' : 'general';
  const version = priceFor(product, market, kind);
  if (!version || version.currency !== decision.displayCurrency) return decision;
  const digits = currencyDigits(version.currency);
  const minor = amountToMinor(version.amount, digits);
  if (minor === null || !Number.isSafeInteger(minor * decision.quantity)) return decision;
  return { ...decision, referenceUnitMinor: minor, referenceTotalMinor: minor * decision.quantity, referenceDigits: digits, priceVersion: version.version };
}
