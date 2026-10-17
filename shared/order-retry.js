import {resolveCheckoutTerms,paypalCurrencyDigits} from './checkout-terms.js';
import {parseMinor} from './sales-tools.js';
import {marketIds,languageIds,productIds} from './tracking-policy.js';
import {purchasePurposes} from './purchase-context.js';

// Only server-written public transaction facts leave the private note.
export function publicRetryContext(note='') {
 const out={};
 const sales=String(note).match(/\[sales:v1 fulfillment=(international_bundle|jeju_pickup) purpose=([a-z_]+)(?: language=([a-zA-Z-]+))?\]/);
 if(sales){out.fulfillment=sales[1];if(purchasePurposes.includes(sales[2]))out.purpose=sales[2];if(languageIds.includes(sales[3]))out.language=sales[3];}
 try{
  const c=JSON.parse(String(note).match(/\[checkout:v2 (\{[^\n]*?\})\]/)?.[1]||'null');
  if(c&&typeof c.version==='string'&&typeof c.shippingVersion==='string'&&['SGD','HKD','JPY','TWD','THB','MYR','KRW','BND','MOP','USD'].includes(c.billingCurrency)&&['quantity','totalMinor','productTotalMinor'].every(k=>Number.isSafeInteger(c[k])&&c[k]>0)&&typeof c.shippingIncluded==='boolean'){
   out.condition=Object.fromEntries(['version','shippingVersion','billingCurrency','quantity','totalMinor','productTotalMinor','shippingIncluded'].map(k=>[k,c[k]]));
  }
 }catch{/* Missing historical facts never become current defaults. */}
 return out;
}

export function orderRetry(order,products) {
 const context=order?.retry_context||{},params=new URLSearchParams();
 if(marketIds.includes(order?.country_code))params.set('market',order.country_code);
 if(languageIds.includes(context.language))params.set('lang',context.language);
 if(purchasePurposes.includes(context.purpose))params.set('purpose',context.purpose);
 if(context.fulfillment==='international_bundle')params.set('fulfillment',context.fulfillment);
 const no=(reason)=>({href:null,reason,knownParams:params.toString()});
 if(!order||!['payment_failed','payment_cancelled'].includes(order.payment_status))return no('not_retryable');
 if(order.items?.length!==1)return no('composition');
 if(!params.has('market')||context.fulfillment!=='international_bundle')return no('missing_context');
 const item=order.items[0],q=item.total_units,sku=item.product_slug;
 if(!productIds.includes(sku)||!Number.isSafeInteger(q)||q<1||q!==order.total_units)return no('invalid_item');
 const product=products?.find(p=>(p.apiSlug||p.slug)===sku);
 if(!product)return no('product_unconfirmed');
 const d=resolveCheckoutTerms(product,order.country_code,q),saved=context.condition;
 if(d.status!=='direct'||!saved)return no('conditions_unconfirmed');
 if(order.currency!==d.billingCurrency)return no('conditions_changed');
 const total=parseMinor(order.total_sgd,order.currency),subtotal=parseMinor(item.line_total_sgd,order.currency);
 if(d.billingCurrency!==order.currency||paypalCurrencyDigits(order.currency)!==d.referenceDigits||d.totalMinor!==total||d.productTotalMinor!==subtotal||saved.quantity!==q||saved.totalMinor!==total||saved.productTotalMinor!==subtotal||saved.billingCurrency!==order.currency||saved.version!==d.version||saved.shippingVersion!==d.shippingVersion||saved.shippingIncluded!==d.shippingIncluded)return no('conditions_changed');
 params.set('product',sku);params.set('quantity',String(q));
 return {href:'/bulk-orders/'+sku+'?'+params,reason:'confirmed',knownParams:params.toString()};
}
