import {sgTerms} from './page-sales.js';
import {purchaseRoute} from './purchase-context.js';
import {parseMinor,currencyDigits} from './sales-tools.js';
// Only explicitly approved SG terms are available in this schema-independent release.
export function approvedResaleTerms(product,market,quantity){
 const terms=market==='SG'?sgTerms(product):null;
 if(!terms||purchaseRoute([{product,quantity:Number(quantity)}],market)!=='direct')return null;
 return {...terms,currency:'SGD',quantity:Number(quantity),totalMinor:terms.unitMinor*Number(quantity)};
}
export function resaleEconomics(terms,input){
 if(!terms||!Number.isSafeInteger(terms.unitMinor)||terms.unitMinor<0||!Number.isSafeInteger(terms.quantity)||terms.quantity<1)return null;
 const values=['price','inbound','selling','fixed'].map(k=>parseMinor(input[k]??(k==='price'?'':'0'),terms.currency));
 if(values.some(v=>v===null))return null;
 const discount=String(input.discount??'0');if(!/^\d{1,3}(\.\d{1,2})?$/.test(discount))return null;
 const bps=Math.round(Number(discount)*100);if(bps>10000)return null;
 const [price,inbound,selling,fixed]=values;
 const revenue=Math.floor((price*(10000-bps)+5000)/10000);
 const purchase=terms.quantity*terms.unitMinor,initial=terms.quantity*(terms.unitMinor+inbound)+fixed;
 const unitDifference=revenue-terms.unitMinor-inbound-selling;
 const totalDifference=terms.quantity*unitDifference-fixed;
 const recovery=revenue>selling?Math.ceil(initial/(revenue-selling)):null;
 if(![revenue,purchase,initial,unitDifference,totalDifference].every(Number.isSafeInteger))return null;
 return {price,inbound,selling,fixed,discount:Number(discount),revenue,purchase,initial,unitDifference,totalDifference,margin:revenue?unitDifference/revenue*100:null,recovery,exceedsQuantity:recovery!==null&&recovery>terms.quantity,digits:currencyDigits(terms.currency)};
}
