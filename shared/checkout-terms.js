import {resolveDeliveryCharge} from './delivery-charge.js';
import {isDiffuser,diffuserQuantity,sgTrialUnitMinor,proposedTrialPrices} from './diffuser-quantity.js';
import {sgTerms} from './page-sales.js';
import {parseMinor,currencyDigits} from './sales-tools.js';
const cleansing=['foam-oil','foaming-cleanser','cleansing-water'];
const diffusers=['diffuser-350g','diffuser-500g'];
const allowed={SG:[...cleansing,...diffusers],HK:[...cleansing,...diffusers],MO:[...cleansing,...diffusers],JP:diffusers,TW:diffusers,TH:diffusers,MY:diffusers,BN:diffusers};
// Malaysia is billed in SGD (approved 2026-10-19): PayPal settles MYR only for Malaysian accounts.
const currencies={SG:'SGD',HK:'HKD',MO:'HKD',JP:'JPY',TW:'TWD',TH:'THB',MY:'SGD',BN:'SGD'};
// Approved by the owner on 2026-10-18: the prices shown in these markets include EMS delivery.
// PayPal minor units (JPY and TWD have none). Diffusers 20-9999 units. 10-unit trial prices outside Singapore remain proposals.
// 2026-10-19: Malaysia added at the Singapore SGD prices; cleansers payable from 30 units in steps of 10 (delivery included).
const deliveredMarkets=Object.freeze({
 HK:{'diffuser-350g':12800,'diffuser-500g':28000,'foam-oil':5500,'foaming-cleanser':5500,'cleansing-water':5500},
 MO:{'diffuser-350g':12800,'diffuser-500g':28000,'foam-oil':5500,'foaming-cleanser':5500,'cleansing-water':5500},
 TW:{'diffuser-350g':480,'diffuser-500g':1050},
 JP:{'diffuser-350g':2400,'diffuser-500g':5200},
 TH:{'diffuser-350g':55000,'diffuser-500g':120000},
 BN:{'diffuser-350g':2100,'diffuser-500g':4600},
 MY:{'diffuser-350g':2100,'diffuser-500g':4600},
});
const cleansingStep=10;
function generalTerms(market,sku){
 if(market==='SG')return sgTerms({slug:sku});
 const unitMinor=deliveredMarkets[market]?.[sku];
 return unitMinor?{unitMinor,moq:cleansing.includes(sku)?30:20}:null;
}
const versions=(market)=>{
 const tag=market.toLowerCase();
 const diffuser=market==='SG'
  ?{general:'sg-general-delivered-2026-10-15',generalDelivery:'sg-general-included-2026-10-15',payment:'existing-live-config'}
  :market==='MY'
   ?{general:'my-general-delivered-2026-10-19',generalDelivery:'my-general-included-2026-10-19',payment:'confirmed'}
   :{general:`${tag}-general-delivered-2026-10-18`,generalDelivery:`${tag}-general-included-2026-10-18`,payment:'confirmed'};
 return {...diffuser,cleansing:`${tag}-cleansing-delivered-2026-10-19`,cleansingDelivery:`${tag}-cleansing-included-2026-10-19`};
};
export const checkoutConditions=Object.freeze(Object.entries(allowed).flatMap(([market,skus])=>skus.map(sku=>{
 const sg=generalTerms(market,sku),v=versions(market),billing=currencies[market];
 const isCleansing=cleansing.includes(sku);
 // General unit prices cover the MOQ and up (cleansers in steps of 10); delivery is included across that range.
 return Object.freeze({market,sku,channel:'international_bundle',version:sg?(isCleansing?v.cleansing:v.general):'legacy-awaiting-confirmation-v1',priceApproval:sg?'approved':'pending',shippingApproval:sg?'confirmed':'pending',paymentApproval:sg?v.payment:'pending',unitMinor:sg?.unitMinor??null,billingCurrency:sg?billing:null,minimum:sg?.moq??(isCleansing?30:20),maximum:sg?9999:null,step:isCleansing?cleansingStep:null,shippingIncluded:sg?true:null,deliveryRules:sg?[{minimum:sg.moq,maximum:9999,approval:'confirmed',mode:'included',currency:billing,version:isCleansing?v.cleansingDelivery:v.generalDelivery}]:[]});
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
 const displayCurrency=trial?({BN:'BND',MO:'MOP',MY:'MYR'}[market]??currency):currency;
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
 if(q<c.minimum||(c.maximum!==null&&q>c.maximum)||(c.step&&(q-c.minimum)%c.step!==0))return {...result,reason:'quantity_condition_scope'};
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
