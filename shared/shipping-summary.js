import {sgTerms} from './page-sales.js';
export function shippingSummary(marketCode,product){
 return marketCode==='SG'&&(!product||sgTerms(product))?'EMS shipping is included only for the approved reference MOQ bundle. Additional quantities and combinations require confirmation.':'Shipping coverage depends on the product, quantity and packaging. Confirm the applicable shipping terms; delivery charges are not assumed to be included.';
}
