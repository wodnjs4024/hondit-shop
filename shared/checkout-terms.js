import {resolveDeliveryCharge} from './delivery-charge.js';
import {isDiffuser,diffuserQuantity,sgTrialUnitMinor,proposedTrialPrices} from './diffuser-quantity.js';
import {sgTerms} from './page-sales.js';
import {parseMinor,currencyDigits} from './sales-tools.js';
const cleansing=['foam-oil','foaming-cleanser','cleansing-water'];
const diffusers=['diffuser-350g','diffuser-500g'];
const allowed={SG:[...cleansing,...diffusers],HK:[...cleansing,...diffusers],MO:[...cleansing,...diffusers],JP:diffusers,TW:diffusers,TH:diffusers,MY:diffusers,BN:diffusers};
const currencies={SG:'SGD',HK:'HKD',MO:'HKD',JP:'JPY',TW:'TWD',TH:'THB',MY:'MYR',BN:'SGD'};
export const checkoutConditions=Object.freeze(Object.entries(allowed).flatMap(([market,skus])=>skus.map(sku=>{
 const sg=market==='SG'?sgTerms({slug:sku}):null;
 // General unit prices cover 20+; delivery coverage is independently bounded.
 return Object.freeze({market,sku,channel:'international_bundle',version:sg?'sg-existing-moq-v1':'legacy-awaiting-confirmation-v1',priceApproval:sg?'approved':'pending',shippingApproval:sg?'existing-moq-scope':'pending',paymentApproval:sg?'existing-live-config':'pending',unitMinor:sg?.unitMinor??null,billingCurrency:sg?'SGD':null,minimum:sg?.moq??(cleansing.includes(sku)?30:20),maximum:sg?9999:null,shippingIncluded:sg?true:null,deliveryRules:sg?[{minimum:sg.moq,maximum:sg.moq,approval:'existing-moq-scope',mode:'included',currency:'SGD',version:'sg-existing-moq-delivery-v1'}]:[]});
})).concat(Object.entries(allowed).flatMap(([market,skus])=>skus.filter(sku=>diffusers.includes(sku)).map(sku=>Object.freeze({market,sku,channel:'international_bundle',version:market==='SG'?'sg-trial-delivered-2026-10-15':'trial-proposed-2026-10-13',priceApproval:market==='SG'?'approved':'proposed',shippingApproval:market==='SG'?'confirmed':'pending',paymentApproval:market==='SG'?'existing-live-config':'pending',unitMinor:market==='SG'?sgTrialUnitMinor[sku]:null,billingCurrency:market==='SG'?'SGD':null,minimum:10,maximum:10,shippingIncluded:market==='SG'?true:null})))));
export function paypalCurrencyDigits(currency){return ['JPY','TWD'].includes(currency)?0:currencyDigits(currency);}
export function approvedUnitPrice(product,market,conditions=checkoutConditions){
 const sku=product?.apiSlug||product?.slug;const matches=conditions.filter(c=>c.market===market&&c.sku===sku&&c.channel==='international_bundle'&&c.minimum!==10);
 if(matches.length!==1)return null;const c=matches[0];
 return c.priceApproval==='approved'&&c.billingCurrency===currencies[market]&&Number.isSafeInteger(c.unitMinor)&&c.unitMinor>0?c.unitMinor/10**paypalCurrencyDigits(c.billingCurrency):null;
}
export function resolveCheckoutTerms(product,market,quantity,conditions=checkoutConditions){
 const sku=product?.apiSlug||product?.slug;const currency=currencies[market];const q=Number(quantity);const diffuser=isDiffuser(product);const valid=/^\d{1,4}$/.test(String(quantity))&&q>0&&(!diffuser||diffuserQuantity(quantity).valid);
 const trial=diffuser&&q===10;
 const reference=trial?(market==='SG'?sgTrialUnitMinor[sku]/100:proposedTrialPrices[market]?.[sku==='diffuser-500g'?1:0]):market==='SG'?sgTerms(product)?.unitMinor/100:product?.marketUnitPrices?.[market];
 const displayCurrency=trial?({BN:'BND',MO:'MOP'}[market]??currency):currency;
 const digits=displayCurrency?currencyDigits(displayCurrency):2;const referenceMinor=displayCurrency&&Number.isFinite(reference)?parseMinor(reference,displayCurrency):null;
 const result={market,sku,quantity:q,displayCurrency,referenceDigits:digits,referenceUnitMinor:referenceMinor,referenceTotalMinor:valid&&referenceMinor!==null&&Number.isSafeInteger(q)&&q>0&&Number.isSafeInteger(referenceMinor*q)?referenceMinor*q:null,priceApproval:'pending',status:'request',reason:'conditions_pending',billingCurrency:null,unitMinor:null,totalMinor:null,version:null,shippingIncluded:null,classification:'quote_required',productTotalMinor:null,shippingMinor:null,shippingVersion:null};
 if(!currency||!allowed[market]?.includes(sku))return {...result,status:'unavailable',reason:'market_product_not_enabled'};
 if(!valid||!Number.isSafeInteger(q)||q<1||q>9999)return {...result,status:'unavailable',reason:'invalid_quantity'};
 if(!product||product.active===false||product.purchaseEnabled===false)return {...result,status:'unavailable',reason:'product_not_available'};
 const stock=product.stockQuantity??(Number(product.inventoryPacks)>0?product.inventoryPacks*product.packQuantity:undefined);
 if(stock!==undefined&&q>stock)return {...result,status:'unavailable',reason:'stock_limit'};
 const matches=conditions.filter(c=>c.market===market&&c.sku===sku&&c.channel==='international_bundle'&&(trial?c.minimum===10:c.minimum!==10));
 if(matches.length!==1)return {...result,reason:matches.length?'duplicate_conditions':'conditions_missing'};
 const c=matches[0];
 result.priceApproval=c.priceApproval;result.version=c.version;
 if(q<c.minimum||(c.maximum!==null&&q>c.maximum))return {...result,reason:'quantity_condition_scope'};
 if(c.priceApproval==='approved'&&c.billingCurrency&&Number.isSafeInteger(c.unitMinor)&&c.unitMinor>0){result.referenceUnitMinor=c.unitMinor;result.referenceTotalMinor=c.unitMinor*q;result.referenceDigits=paypalCurrencyDigits(c.billingCurrency);result.displayCurrency=c.billingCurrency;}
 if(c.priceApproval!=='approved'||!c.billingCurrency||!Number.isSafeInteger(c.unitMinor)||c.unitMinor<=0)return result;
 if(!['existing-live-config','confirmed'].includes(c.paymentApproval))return result;
 // Display and billing currencies may differ only with an explicitly approved amount.
 if(c.billingCurrency!==currency)return {...result,reason:'billing_currency_route_unconfirmed'};
 const delivery=resolveDeliveryCharge(c,q);
 if(!delivery.confirmed)return {...result,classification:'quote_required',reason:delivery.reason};
 const productTotal=c.unitMinor*q,total=productTotal+delivery.chargeMinor;
 if(!Number.isSafeInteger(total)||!Number.isSafeInteger(productTotal))return {...result,status:'unavailable',reason:'amount_overflow'};
 return {...result,status:'direct',classification:delivery.mode==='included'?'immediate_payment':'shipping_calculation_required',reason:'confirmed_scope',billingCurrency:c.billingCurrency,unitMinor:c.unitMinor,totalMinor:total,productTotalMinor:productTotal,shippingMinor:delivery.chargeMinor,shippingVersion:delivery.version,version:c.version,shippingIncluded:delivery.mode==='included',referenceDigits:paypalCurrencyDigits(c.billingCurrency),referenceUnitMinor:c.unitMinor,referenceTotalMinor:productTotal,displayCurrency:c.billingCurrency};
}
export function resolveCheckoutCart(lines,market,conditions=checkoutConditions){
 if(lines.length!==1)return {...resolveCheckoutTerms({},market,20,[]),priceApproval:'pending',status:'request',reason:'composition_shipping_scope'};
 return resolveCheckoutTerms(lines[0].product,market,lines[0].quantity,conditions);
}
