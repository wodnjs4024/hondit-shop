// Operator market settings on top of the approved checkout terms.
// The terms themselves (prices, MOQ, delivery) are computed by checkout-terms.js unchanged; this layer can only
// narrow them: hide a product in a market, or turn direct payment into a quote request. It can never create a price
// or enable direct payment where the approved terms do not already allow it.
import { resolveCheckoutTerms, resolveCheckoutCart } from './checkout-terms.js';
import { applyReferencePrice, conditionsFor } from './price-versions.js';

export const marketModes = Object.freeze(['hidden', 'quote', 'direct']);

export function marketMode(product, market) {
  const mode = product?.markets?.[market];
  return marketModes.includes(mode) ? mode : null;
}

export function applyMarketOverride(decision, product, market) {
  const mode = marketMode(product, market);
  if (mode === 'hidden') return { ...decision, status: 'unavailable', reason: 'market_hidden_by_operator' };
  // Products without approved terms in code (new products) can only be enquired about, and only where the operator opened them.
  if (decision.reason === 'market_product_not_enabled' && (mode === 'quote' || mode === 'direct')) {
    const q = Number(decision.quantity);
    const minimum = Math.max(1, Number(product?.bulkMoq ?? product?.packQuantity ?? 1) || 1);
    if (!Number.isSafeInteger(q) || q < 1 || q > 9999) return { ...decision, reason: 'invalid_quantity' };
    if (q < minimum) return { ...decision, reason: 'quantity_condition_scope' };
    if (product?.active === false || product?.purchaseEnabled === false) return { ...decision, reason: 'product_not_available' };
    return { ...decision, status: 'request', reason: 'quote_only_product', referenceUnitMinor: null, referenceTotalMinor: null };
  }
  if (mode === 'quote' && decision.status === 'direct') {
    return { ...decision, status: 'request', reason: 'operator_quote_only', classification: 'quote_required', billingCurrency: null, unitMinor: null, totalMinor: null, productTotalMinor: null, shippingMinor: null };
  }
  return decision;
}

// Admin price versions (price-versions.js) apply only when the caller does not pass its own conditions.
export function termsFor(product, market, quantity, conditions) {
  const decision = resolveCheckoutTerms(product, market, quantity, conditions ?? conditionsFor(product, market));
  return applyMarketOverride(conditions ? decision : applyReferencePrice(decision, product, market), product, market);
}

export function cartTermsFor(lines, market, conditions) {
  if (lines.length === 1) return termsFor(lines[0].product, market, lines[0].quantity, conditions);
  const decision = resolveCheckoutCart(lines, market, conditions);
  return lines.some((line) => marketMode(line.product, market) === 'hidden') ? { ...decision, status: 'unavailable', reason: 'market_hidden_by_operator' } : decision;
}

/* Market visibility: an explicit operator setting wins; otherwise today's category rule decides. */
export function isVisibleInMarket(product, market, categoryAllowed) {
  const mode = marketMode(product, market);
  if (mode === 'hidden') return false;
  if (mode === 'quote' || mode === 'direct') return true;
  return Boolean(categoryAllowed);
}
