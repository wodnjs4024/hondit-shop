import {checkoutChargeCopy} from '../data/checkoutChargeCopy';
import {CheckoutAvailability} from "./CheckoutAvailability";
import {checkoutFlowCopy} from "../data/checkoutFlowCopy";
import {orderPanelCopy} from "../data/orderPanelCopy";
import {Link} from 'react-router-dom';
import {resolveCheckoutTerms} from '../../shared/checkout-terms.js';
import {isDiffuser} from '../../shared/diffuser-quantity.js';
import {selectionUrl} from '../../shared/sales-tools.js';
import {sgTerms} from '../../shared/page-sales.js';
import {DiffuserQuantitySelector,usePurchaseQuantity} from './DiffuserQuantitySelector';
import {marketText,useMarket,formatCurrency} from '../lib/market';
import type {StorefrontProduct} from '../data/v23SiteData';

const Arrow = () => <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true"><path d="M3 8h9M8.5 4.5 12 8l-3.5 3.5" fill="none" stroke="currentColor" strokeWidth="1.4" /></svg>;

/* Stepped order panel: quantity → price → how to pay. Amounts and routing come only from resolveCheckoutTerms. */
export function QuantityReview({product,purpose='unspecified'}:{product:StorefrontProduct;purpose?:string}) {
 const {market,language}=useMarket();const t=(s:string)=>marketText(language,s);const c=checkoutFlowCopy(language);const o=orderPanelCopy(language);
 const [quantity,setQuantity]=usePurchaseQuantity(product.slug,String((market.code==='SG'?sgTerms(product)?.moq:null)??product.bulkMoq));
 const charges=checkoutChargeCopy(language);
 const d=resolveCheckoutTerms(product,market.code,quantity),direct=d.status==='direct';
 const input={slug:product.slug,quantity,market:market.code,language,reason:'payment_request',purpose};
 const valid=d.status!=='unavailable';
 const money=(minor:number|null|undefined,currency=d.displayCurrency)=>minor===null||minor===undefined||!currency?'—':formatCurrency(minor/10**d.referenceDigits,currency,market.locale);
 const diffuser=isDiffuser(product);
 const optionPrice=(q:string)=>{const r=resolveCheckoutTerms(product,market.code,q);return r.referenceUnitMinor===null||!r.displayCurrency?undefined:`${o.perUnit} ${formatCurrency(r.referenceUnitMinor/10**r.referenceDigits,r.displayCurrency,market.locale)}`;};
 const total=direct?d.totalMinor:d.referenceTotalMinor;
 return <section className="quantity-review order-panel" aria-label={direct?charges.final:charges.estimated}>
  <div className="order-panel__core">
   <h2 className="order-panel__title">{direct?charges.final:charges.estimated}</h2>
   <ol className="order-steps">
    <li className="order-step order-step--qty">
     <h3 className="order-step__title">{o.qty}</h3>
     {diffuser?<DiffuserQuantitySelector value={quantity} onChange={setQuantity} optionPrices={{trial:optionPrice('10'),general:optionPrice('20')}}/>:<label className="order-qty-field">{t('Order quantity')}<input type="number" inputMode="numeric" min="1" max="9999" step="1" value={quantity} onChange={e=>setQuantity(e.target.value)}/></label>}
     {!valid&&!diffuser&&<p role="alert">{t('Quantity must be a whole number from 1 to 9999.')}</p>}
    </li>
    <li className="order-step order-step--price">
     <h3 className="order-step__title">{o.price}</h3>
     <dl className="order-lines">
      <div><dt>{o.unit}</dt><dd>{money(d.referenceUnitMinor)}</dd></div>
      <div><dt>{o.subtotal}{valid&&d.quantity?<small> · {d.quantity} {o.units}</small>:null}</dt><dd>{valid?money(direct?d.productTotalMinor:d.referenceTotalMinor):'—'}</dd></div>
      <div><dt>{o.shipping}</dt><dd className={direct&&d.shippingIncluded?'is-included':'is-pending'}>{direct?(d.shippingIncluded?o.included:money(d.shippingMinor)):o.confirm}</dd></div>
      <div><dt>{o.tax}</dt><dd className="is-note">{o.taxValue}</dd></div>
     </dl>
     <div className="order-total"><span>{direct?o.total:o.estimate}</span><output aria-live="polite">{valid?money(total):'—'}</output></div>
     {!direct&&valid&&<p className="order-note">{t('Reference display currency')}: {d.displayCurrency} · {t('Final billing currency')}: {t('To be confirmed before payment')}</p>}
    </li>
    <li className="order-step order-step--pay">
     <h3 className="order-step__title">{o.pay}</h3>
     <CheckoutAvailability status={d.status} reason={d.reason}/>
     {valid&&<div className="v23-actions order-actions">
      <Link className="button button--primary order-cta" to={selectionUrl(direct?`/bulk-orders/${product.slug}`:'/contact',input)}><span>{direct?c.pay:charges.quote}</span><i aria-hidden="true"><Arrow/></i></Link>
      <Link className="button button--ghost order-secondary" to={selectionUrl('/partners',{...input,purpose:'resale'})+'#resale-calculator'}>{t('Resale economics review')} →</Link>
     </div>}
    </li>
   </ol>
  </div>
 </section>;
}
