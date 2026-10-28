import {useRef} from 'react';
import {checkoutChargeCopy} from '../data/checkoutChargeCopy';
import {CheckoutAvailability} from "./CheckoutAvailability";
import {checkoutFlowCopy} from "../data/checkoutFlowCopy";
import {orderPanelCopy} from "../data/orderPanelCopy";
import {catalogCopy} from "../data/catalogCopy";
import {Link} from 'react-router-dom';
import {termsFor} from '../../shared/market-overrides.js';
import {isDiffuser} from '../../shared/diffuser-quantity.js';
import {selectionUrl} from '../../shared/sales-tools.js';
import {sgTerms} from '../../shared/page-sales.js';
import {DiffuserQuantitySelector,usePurchaseQuantity} from './DiffuserQuantitySelector';
import {OrderBar} from './OrderBar';
import {marketText,useMarket,formatCurrency} from '../lib/market';
import type {StorefrontProduct} from '../data/v23SiteData';

const Arrow = () => <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true"><path d="M3 8h9M8.5 4.5 12 8l-3.5 3.5" fill="none" stroke="currentColor" strokeWidth="1.4" /></svg>;

/*
 * Stepped order panel: quantity → what the price is made of → one decision block (total + action).
 * Each amount appears once. Amounts and routing come only from the approved checkout terms (termsFor).
 */
export function QuantityReview({product,purpose='unspecified'}:{product:StorefrontProduct;purpose?:string}) {
 const {market,language}=useMarket();const t=(s:string)=>marketText(language,s);const c=checkoutFlowCopy(language);const o=orderPanelCopy(language);
 const [quantity,setQuantity]=usePurchaseQuantity(product.slug,String((market.code==='SG'?sgTerms(product)?.moq:null)??product.bulkMoq));
 const charges=checkoutChargeCopy(language);
 const d=termsFor(product,market.code,quantity),direct=d.status==='direct';
 const input={slug:product.slug,quantity,market:market.code,language,reason:'payment_request',purpose};
 const valid=d.status!=='unavailable';
 const money=(minor:number|null|undefined,currency=d.displayCurrency)=>minor===null||minor===undefined||!currency?'—':formatCurrency(minor/10**d.referenceDigits,currency,market.locale);
 const diffuser=isDiffuser(product);
 const optionPrice=(q:string)=>{const r=termsFor(product,market.code,q);return r.referenceUnitMinor===null||!r.displayCurrency?undefined:`${o.perUnit} ${formatCurrency(r.referenceUnitMinor/10**r.referenceDigits,r.displayCurrency,market.locale)}`;};
 const total=direct?d.totalMinor:d.referenceTotalMinor;
 const units=valid&&d.quantity?`${d.quantity} ${o.units}`:'';
 const ctaTo=selectionUrl(direct?`/bulk-orders/${product.slug}`:'/contact',input);
 const ctaLabel=direct?c.pay:charges.quote;
 const commit=useRef<HTMLDivElement>(null);
 if(product.quoteOnly){
  // Added in the admin, no approved price yet: quantity and an enquiry, never a price.
  const k=catalogCopy(language);
  const quoteTo=selectionUrl('/contact',{...input,reason:'product'});
  return <section className="quantity-review order-panel" aria-label={k.quoteTitle}>
   <div className="order-panel__core">
    <h2 className="order-panel__title">{k.quoteTitle}</h2>
    <ol className="order-steps">
     <li className="order-step order-step--qty">
      <h3 className="order-step__title">{o.qty}</h3>
      <label className="order-qty-field">{t('Order quantity')}<input type="number" inputMode="numeric" min={product.bulkMoq} max="9999" step="1" value={quantity} onChange={e=>setQuantity(e.target.value)}/></label>
      <p className="order-note">{t('Minimum')} {product.bulkMoq} {o.units}</p>
     </li>
     <li className="order-step order-step--pay">
      <div className="order-commit" ref={commit}>
       <h3 className="order-step__title">{k.quoteTitle}</h3>
       <p className="order-note">{k.quoteNote}</p>
       {valid?<div className="v23-actions order-actions"><Link className="button button--primary order-cta" to={quoteTo}><span>{k.quoteCta}</span><i aria-hidden="true"><Arrow/></i></Link></div>
        :<p role="alert">{d.reason==='quantity_condition_scope'?`${t('Minimum')} ${product.bulkMoq} ${o.units}`:t('Quantity must be a whole number from 1 to 9999.')}</p>}
      </div>
     </li>
    </ol>
   </div>
   {valid&&<OrderBar watch={commit} label={k.quoteTitle} detail={units} amount={k.priceOnRequest} cta={{label:k.quoteCta,to:quoteTo}}/>}
  </section>;
 }
 return <section className="quantity-review order-panel" aria-label={direct?charges.final:charges.estimated}>
  <div className="order-panel__core">
   <h2 className="order-panel__title">{direct?charges.final:charges.estimated}</h2>
   <ol className="order-steps">
    <li className="order-step order-step--qty">
     <h3 className="order-step__title">{o.qty}</h3>
     {diffuser?<DiffuserQuantitySelector product={product} value={quantity} onChange={setQuantity} optionPrices={{trial:optionPrice('10'),general:optionPrice('20')}}/>:<label className="order-qty-field">{t('Order quantity')}<input type="number" inputMode="numeric" min="1" max="9999" step="1" value={quantity} onChange={e=>setQuantity(e.target.value)}/></label>}
     {!valid&&!diffuser&&<p role="alert">{t('Quantity must be a whole number from 1 to 9999.')}</p>}
    </li>
    <li className="order-step order-step--price">
     <h3 className="order-step__title">{o.price}</h3>
     <dl className="order-lines">
      <div><dt>{o.unit}{units&&<small> × {units}</small>}</dt><dd>{money(d.referenceUnitMinor)}</dd></div>
      {direct&&!d.shippingIncluded&&<div><dt>{o.subtotal}</dt><dd>{money(d.productTotalMinor)}</dd></div>}
      <div><dt>{o.shipping}</dt><dd className={direct&&d.shippingIncluded?'is-included':'is-pending'}>{direct?(d.shippingIncluded?o.included:money(d.shippingMinor)):o.confirm}</dd></div>
      <div><dt>{o.tax}</dt><dd className="is-note">{o.taxValue}</dd></div>
     </dl>
    </li>
    <li className="order-step order-step--pay">
     <div className="order-commit" ref={commit}>
      <h3 className="order-step__title">{o.pay}</h3>
      <div className="order-total"><span>{direct?o.total:o.estimate}{units&&<small>{units}</small>}</span><output aria-live="polite">{valid?money(total,direct?d.billingCurrency??d.displayCurrency:d.displayCurrency):'—'}</output></div>
      {direct&&d.fixedBilling&&<p className="order-note">{t('Reference display currency')}: {money(d.referenceTotalMinor)} · PayPal: {money(d.totalMinor,d.billingCurrency!)} · {d.fixedBilling.basisDate}</p>}
      {!direct&&valid&&<p className="order-note">{t('Reference display currency')}: {d.displayCurrency} · {t('Final billing currency')}: {t('To be confirmed before payment')}</p>}
      <CheckoutAvailability status={d.status} reason={d.reason}/>
      {valid&&<div className="v23-actions order-actions">
       <Link className="button button--primary order-cta" to={ctaTo}><span>{ctaLabel}</span><i aria-hidden="true"><Arrow/></i></Link>
       <Link className="button button--ghost order-secondary" to={selectionUrl('/partners',{...input,purpose:'resale'})+'#resale-calculator'}>{t('Resale economics review')} →</Link>
      </div>}
     </div>
    </li>
   </ol>
  </div>
  {valid&&<OrderBar watch={commit} label={direct?o.total:o.estimate} detail={units} amount={money(total)} cta={{label:ctaLabel,to:ctaTo}}/>}
 </section>;
}
