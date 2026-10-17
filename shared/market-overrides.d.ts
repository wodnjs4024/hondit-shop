import type { CheckoutCondition, CheckoutDecision } from './checkout-terms.js';
export type MarketMode = 'hidden' | 'quote' | 'direct';
export const marketModes: readonly MarketMode[];
export function marketMode(product: any, market: string): MarketMode | null;
export function applyMarketOverride(decision: CheckoutDecision, product: any, market: string): CheckoutDecision;
export function termsFor(product: any, market: string, quantity: string | number, conditions?: readonly CheckoutCondition[]): CheckoutDecision;
export function cartTermsFor(lines: { product: any; quantity: number }[], market: string, conditions?: readonly CheckoutCondition[]): CheckoutDecision;
export function isVisibleInMarket(product: any, market: string, categoryAllowed: boolean): boolean;
