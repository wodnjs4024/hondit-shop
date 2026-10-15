import {CheckoutAvailability} from "./CheckoutAvailability";
import {checkoutFlowCopy} from "../data/checkoutFlowCopy";
import {Link} from 'react-router-dom';
import {resolveCheckoutTerms} from '../../shared/checkout-terms.js';
import {isDiffuser} from '../../shared/diffuser-quantity.js';
import {selectionUrl} from '../../shared/sales-tools.js';
import {sgTerms} from '../../shared/page-sales.js';
import {DiffuserQuantitySelector,usePurchaseQuantity} from './DiffuserQuantitySelector';
import {marketText,useMarket,formatCurrency} from '../lib/market';
import type {StorefrontProduct} from '../data/v23SiteData';
export function QuantityReview({product,purpose='unspecified'}:{product:StorefrontProduct;purpose?:string}) {
 const {market,language}=useMarket();const t=(s:string)=>marketText(language,s);const c=checkoutFlowCopy(language);
 const [quantity,setQuantity]=usePurchaseQuantity(product.slug,String((market.code==='SG'?sgTerms(product)?.moq:null)??product.bulkMoq));
 const d=resolveCheckoutTerms(product,market.code,quantity),direct=d.status==='direct';
 const input={slug:product.slug,quantity,market:market.code,language,reason:'payment_request',purpose};
 const valid=d.status!=='unavailable';
 return <section className="quantity-review sales-tools-section">
  <h2>{t('Selected product amount')}</h2>
  {isDiffuser(product)?<DiffuserQuantitySelector value={quantity} onChange={setQuantity}/>:<label>{t('Order quantity')}<input type="number" min="1" max="9999" step="1" value={quantity} onChange={e=>setQuantity(e.target.value)}/></label>}
  {d.referenceTotalMinor!==null&&valid?<output aria-live="polite">{formatCurrency(d.referenceTotalMinor/10**d.referenceDigits,d.displayCurrency,market.locale)}</output>:!isDiffuser(product)&&<p role="alert">{t('Quantity must be a whole number from 1 to 9999.')}</p>}
  <CheckoutAvailability status={d.status} reason={d.reason}/>
  {!direct&&valid&&<p>{t('Reference display currency')}: {d.displayCurrency} · {t('Final billing currency')}: {t('To be confirmed before payment')}</p>}
  {valid&&<div className="v23-actions"><Link className="button button--primary" to={selectionUrl(direct?`/bulk-orders/${product.slug}`:'/contact',input)}>{direct?c.pay:c.ask}</Link><Link className="button button--ghost" to={selectionUrl('/partners',{...input,purpose:'resale'})+'#resale-calculator'}>{t('Resale economics review')} →</Link></div>}
 </section>;
}
