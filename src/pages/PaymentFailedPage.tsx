import {useEffect,useMemo,useState} from 'react';
import {Link,Navigate,useParams} from 'react-router-dom';
import {V23Page} from '../components/v23/SiteChrome';
import {OrderLookupNotice} from '../components/OrderLookupNotice';
import {EMAIL} from '../data/v23SiteData';
import {orderSupportCopy} from '../data/orderSupportCopy';
import {fetchPublicOrder,fetchRetryProducts,type PublicOrder} from '../lib/bulkApi';
import type {BulkProduct} from '../data/bulkProducts';
import {formatCurrency,marketText,useMarket} from '../lib/market';
import {orderRetry} from '../../shared/order-retry.js';

export function PaymentFailedPage(){
 const {orderNumber=''}=useParams(),{language}=useMarket(),c=orderSupportCopy(language);
 const [order,setOrder]=useState<PublicOrder|null>(null),[error,setError]=useState('');
 const [products,setProducts]=useState<BulkProduct[]|null>(null),[checking,setChecking]=useState(true);
 useEffect(()=>{
  let active=true;setOrder(null);setError('');setProducts(null);setChecking(true);
  fetchPublicOrder(orderNumber).then(async data=>{
   if(!active)return;setOrder(data.order);
   if(['payment_failed','payment_cancelled'].includes(data.order.payment_status)){
    try{const rows=await fetchRetryProducts();if(active)setProducts(rows);}catch{/* No confirmed catalogue means no checkout retry. */}
   }
   if(active)setChecking(false);
  }).catch(()=>{if(active){setError('lookup_unavailable');setChecking(false);}});
  return ()=>{active=false;};
 },[orderNumber]);
 const retry=useMemo(()=>orderRetry(order,products),[order,products]);
 const manualPaymentHref=useMemo(()=>{
  const amount=order?.currency?formatCurrency(order.total_sgd,order.currency):'';
  const lines=[c.reference+': '+orderNumber,order?.country_code?c.market+': '+order.country_code:'',order?.currency?c.currency+': '+order.currency:'',amount?c.total+': '+amount:'',...(order?.items||[]).map(i=>`${i.product_name_snapshot} ${i.volume_snapshot||''}: ${i.total_units}`),'',c.request].filter(Boolean);
  return `mailto:${EMAIL}?subject=${encodeURIComponent(c.subject)}&body=${encodeURIComponent(lines.join('\n'))}`;
 },[order,orderNumber,c]);
 if(!order)return <V23Page><OrderLookupNotice orderNumber={orderNumber} loading={!error}/></V23Page>;
 if(order.payment_status==='completed')return <Navigate to={'/order-complete/'+orderNumber+(retry.knownParams?'?'+retry.knownParams:'')} replace/>;
 if(!['payment_failed','payment_cancelled'].includes(order.payment_status)){
  const pending=['pending','pending_payment'].includes(order.payment_status);
  return <V23Page><main className="product-guide-page"><h1>{pending?marketText(language,'Payment verification pending'):c.status}</h1><p>{pending?marketText(language,'We could not confirm the payment status. Do not pay again; contact HONDIT with your order reference.'):c.statusBody}</p><p>{c.reference}: {orderNumber}</p><p>{marketText(language,'Payment status')}: {order.payment_status}</p><a href={manualPaymentHref}>{c.contact}</a></main></V23Page>;
 }
 return <V23Page><main className="bulk-page v23-operational-page"><section className="payment-failed section-shell"><div className="section-inner section-inner--narrow">
  <p className="eyebrow">{marketText(language,'PAYMENT NOT COMPLETED')}</p>
  <h1>{marketText(language,'Payment could not be completed.','결제가 완료되지 않았습니다.')}</h1>
  <div className="order-record-card payment-failed__record"><span>{c.reference}</span><strong>{orderNumber}</strong><dl>
   <div><dt>{marketText(language,'Payment status')}</dt><dd>{order.payment_status}</dd></div>
   {order.currency&&<div><dt>{c.total}</dt><dd>{formatCurrency(order.total_sgd,order.currency)}</dd></div>}
   {order.country_code&&<div><dt>{c.market}</dt><dd>{order.country_code}</dd></div>}
  </dl><ul>{order.items.map((i,index)=><li key={index}>{i.product_name_snapshot} {i.volume_snapshot} · {i.total_units} {marketText(language,'units')}</li>)}</ul></div>
  {checking?<p role="status">{c.checking}</p>:!retry.href&&<p role="status">{c.changed}</p>}
  {(!order.retry_context?.language||!order.retry_context?.purpose)&&<p>{c.missing}</p>}
  <div className="bulk-card__actions">
   {!checking&&retry.href&&<Link className="button button--primary" to={retry.href}>{c.retry}</Link>}
   <a className="button button--ghost" href={manualPaymentHref}>{c.contact}</a>
  </div>
 </div></section></main></V23Page>;
}
