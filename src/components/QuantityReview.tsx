import {Link} from 'react-router-dom';
import {resolveCheckoutTerms} from '../../shared/checkout-terms.js';
import {isDiffuser} from '../../shared/diffuser-quantity.js';
import {selectionUrl} from '../../shared/sales-tools.js';
import {sgTerms} from '../../shared/page-sales.js';
import {DiffuserQuantitySelector,usePurchaseQuantity} from './DiffuserQuantitySelector';
import {marketText,useMarket,formatCurrency} from '../lib/market';
import type {StorefrontProduct} from '../data/v23SiteData';
export function QuantityReview({product,purpose='unspecified'}:{product:StorefrontProduct;purpose?:string}) {
 const {market,language}=useMarket();const t=(s:string)=>marketText(language,s);
 const [quantity,setQuantity]=usePurchaseQuantity(product.slug,String((market.code==='SG'?sgTerms(product)?.moq:null)??product.bulkMoq));
 const d=resolveCheckoutTerms(product,market.code,quantity),direct=d.status==='direct';
 const input={slug:product.slug,quantity,market:market.code,language,reason:'payment_request',purpose};
 const valid=d.status!=='unavailable';
 return <section className="quantity-review sales-tools-section">
  <h2>{t('Selected product amount')}</h2>
  {isDiffuser(product)?<DiffuserQuantitySelector value={quantity} onChange={setQuantity}/>:<label>{t('Order quantity')}<input type="number" min="1" max="9999" step="1" value={quantity} onChange={e=>setQuantity(e.target.value)}/></label>}
  {d.referenceTotalMinor!==null&&valid?<output aria-live="polite">{formatCurrency(d.referenceTotalMinor/10**d.referenceDigits,d.displayCurrency,market.locale)}</output>:!isDiffuser(product)&&<p role="alert">{t('Quantity must be a whole number from 1 to 9999.')}</p>}
  {valid&&<p className="route-status">{t(d.priceApproval==='approved'?'Approved product price':'Proposed or legacy reference price — confirmation required')}</p>}
  {!direct&&valid&&<p>{t('Reference display currency')}: {d.displayCurrency} · {t('Final billing currency')}: {t('To be confirmed before payment')}</p>}
  <p>{t(direct?'Existing checkout rules apply; final availability and payment settings are checked on the order page.':'Shipping and payment require confirmation. Extra freight may apply; your selection is kept in the payment request.')}</p>
  {valid&&<div className="v23-actions"><Link className="button button--primary" to={selectionUrl(direct?`/bulk-orders/${product.slug}`:'/contact',input)}>{t(direct?'Continue to delivery and PayPal ->':'Request payment with these selections')}</Link><Link className="button button--ghost" to={selectionUrl('/partners',{...input,purpose:'resale'})+'#resale-calculator'}>{t('Resale economics review')} →</Link></div>}
 </section>;
}
