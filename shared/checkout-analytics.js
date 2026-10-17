import {resolveCheckoutCart,resolveCheckoutTerms,paypalCurrencyDigits} from './checkout-terms.js';
export function checkoutAnalytics(lines,market){
 const cart=resolveCheckoutCart(lines,market);
 if(cart.status!=='direct')return null;
 const currency=cart.billingCurrency,digits=paypalCurrencyDigits(currency);
 return {value:cart.totalMinor/10**digits,currency,quantity:lines.reduce((n,l)=>n+l.quantity,0),items:lines.map(line=>{
  const d=resolveCheckoutTerms(line.product,market,line.quantity);
  return {item_id:line.product.slug,quantity:line.quantity,price:d.unitMinor/10**paypalCurrencyDigits(d.billingCurrency)};
 })};
}
