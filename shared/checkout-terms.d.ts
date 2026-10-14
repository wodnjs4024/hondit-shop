export type CheckoutCondition={market:string;sku:string;channel:string;version:string;priceApproval:string;shippingApproval:string;paymentApproval:string;unitMinor:number|null;billingCurrency:string|null;minimum:number;maximum:number|null;shippingIncluded:boolean|null};
export type CheckoutDecision={priceApproval:string;market:string;sku:string;quantity:number;displayCurrency:string;referenceDigits:number;referenceUnitMinor:number|null;referenceTotalMinor:number|null;status:string;reason:string;billingCurrency:string|null;unitMinor:number|null;totalMinor:number|null;version:string|null;shippingIncluded:boolean|null};
export const checkoutConditions:readonly CheckoutCondition[];
export function paypalCurrencyDigits(currency:string):number;
export function approvedUnitPrice(product:any,market:string,conditions?:readonly CheckoutCondition[]):number|null;
export function resolveCheckoutTerms(product:any,market:string,quantity:string|number,conditions?:readonly CheckoutCondition[]):CheckoutDecision;
export function resolveCheckoutCart(lines:{product:any;quantity:number}[],market:string,conditions?:readonly CheckoutCondition[]):CheckoutDecision|{status:string;reason:string};
