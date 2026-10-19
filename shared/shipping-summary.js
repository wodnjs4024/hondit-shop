import {isDiffuser} from './diffuser-quantity.js';
import {sgTerms} from './page-sales.js';
export function shippingSummary(marketCode,product){
 if(marketCode==='SG'&&!product)return "SG diffuser orders of 10 or 20+ units and single cleansing product orders of 30+ units (in steps of 10) include international shipping. Mixed orders require confirmation.";
 if(marketCode==='SG'&&product&&isDiffuser(product))return "International shipping is included for SG diffuser trial orders (10 units) and general orders (20 or more). No extra international shipping charge.";
 return marketCode==='SG'&&(!product||sgTerms(product))?"EMS shipping is included for 30 or more units in steps of 10. Mixed products in one order require confirmation.":'Shipping coverage depends on the product, quantity and packaging. Confirm the applicable shipping terms; delivery charges are not assumed to be included.';
}
