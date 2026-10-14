import {resolveCheckoutTerms} from './checkout-terms.js';
export function customerConditionLabel(product,market,quantity){const q=quantity??product.bulkMoq??product.packQuantity??20;return resolveCheckoutTerms(product,market,q).status==='direct'?'Order the listed MOQ bundle':'Request payment with these selections';}
