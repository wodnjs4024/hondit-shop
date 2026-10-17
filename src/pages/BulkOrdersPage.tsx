import {functionalParams} from '../../shared/tracking-policy.js';
import {selectionUrl} from '../../shared/sales-tools.js';
import {orderPanelCopy} from '../data/orderPanelCopy';
import {salesPresentationCopy} from '../data/salesPresentationCopy';
import {shippingSummary} from '../../shared/shipping-summary.js';
import {checkoutFlowCopy} from "../data/checkoutFlowCopy";
import {validQuantity} from "../../shared/sales-tools.js";
import {sgTerms} from "../../shared/page-sales.js";
import {useEffect,useState} from 'react';
import {Link,useSearchParams} from 'react-router-dom';
import {V23Page} from '../components/v23/SiteChrome';
import {QuantityReview} from '../components/QuantityReview';
import {ProductSalesSummary} from '../components/ProductSalesSummary';
import {ConsultationPanel} from '../components/ConsultationPanel';
import {v23Products,type StorefrontProduct} from '../data/v23SiteData';
import {loadStorefrontProducts} from '../lib/storefrontApi';
import {markets,marketText,marketProductText,marketCountryName,isStorefrontProductAllowedForMarket,useMarket,type MarketCode} from '../lib/market';
import {purchasePurposes,purposeLabels} from '../../shared/purchase-context.js';
export function BulkOrdersPage(){
 const {market,language,setMarket}=useMarket();const [params,setParams]=useSearchParams();const t=(s:string)=>marketText(language,s);const c=checkoutFlowCopy(language);
 const [products,setProducts]=useState<StorefrontProduct[]>(v23Products);const slug=params.get('product')||'diffuser-350g';
 const setSlug=(value:string)=>setParams(current=>{const next=functionalParams(current);next.set('product',value);next.delete('quantity');return next;});
 const purpose=purchasePurposes.includes(params.get('purpose')||'')?params.get('purpose')!:'personal_gift';
 const setPurpose=(value:string)=>setParams(current=>{const next=functionalParams(current);next.set('purpose',value);return next;});
 const [quantities,setQuantities]=useState<Record<string,string>>({});
 useEffect(()=>{loadStorefrontProducts().then(setProducts).catch(()=>undefined)},[]);
 const available=products.filter(p=>isStorefrontProductAllowedForMarket(p,market));const selected=available.find(p=>p.slug===slug)||available[0];
 useEffect(()=>{if(params.has('product')&&selected&&selected.slug!==slug)setSlug(selected.slug);},[slug,selected?.slug,market.code]);
 const lines=available.filter(p=>/^\d+$/.test(quantities[p.slug]||'')&&Number(quantities[p.slug])>0&&Number(quantities[p.slug])<=9999).map(p=>({name:p.name,quantity:Number(quantities[p.slug])}));
 return <V23Page><main className="bundle-entry">
  <header className="bundle-entry__intro"><p className="v23-eyebrow">HONDIT · {market.code}</p><h1>{t('Overseas bundle orders')}</h1><p className="checkout-path">{c.steps}</p><p>{c.scope}</p><p>{t('International delivery is offered as MOQ bundles, not individual small-quantity shipping. Group purchases are welcome.')}</p></header>
  <section className="bundle-entry__selectors"><label>{t('Market')}<select value={market.code} onChange={e=>setMarket(e.target.value as MarketCode)}>{Object.values(markets).map(m=><option key={m.code} value={m.code}>{marketCountryName(m,language)}{!['BN','MO'].includes(m.code)&&` · ${m.currency}`}</option>)}</select></label><label>{t('Products')}<select value={selected?.slug||''} onChange={e=>setSlug(e.target.value)}>{available.map(p=><option key={p.slug} value={p.slug}>{marketProductText(language,p.name)}</option>)}</select></label><label>{t('Purpose')}<select value={purpose} onChange={e=>setPurpose(e.target.value)}>{purchasePurposes.map(p=><option key={p} value={p}>{t(purposeLabels[p])}</option>)}</select></label></section>
  {selected&&<section className="bundle-entry__review"><figure><img src={selected.image} alt={marketProductText(language,selected.name)} width="640" height="640"/><figcaption><Link to={`/products/${selected.slug}?${new URLSearchParams({...Object.fromEntries(functionalParams(params)),market:market.code,lang:language,product:selected.slug})}`}>{marketProductText(language,selected.name)} →</Link></figcaption></figure><div><QuantityReview key={selected.slug} product={selected} purpose={purpose}/><details className="pdp-conditions"><summary>{orderPanelCopy(language).conditions}</summary><ProductSalesSummary product={selected} showContact={false}/></details></div></section>}
  <section className="bundle-entry__consult">{market.code==='SG'&&<p>{t(shippingSummary(market.code,selected))}</p>}<details><summary>{t('Need a mixed commercial order?')}</summary><p className="route-status">{t('Consultation required')}</p><div className="bundle-entry__selectors">{available.map(p=><label key={p.slug}>{marketProductText(language,p.name)}<input type="number" min="0" max="9999" step="1" value={quantities[p.slug]||''} onChange={e=>setQuantities(q=>({...q,[p.slug]:e.target.value}))}/></label>)}</div><ConsultationPanel lines={lines} reason="combination" presetPurpose={t(purposeLabels[purpose])} summaryDetails={t('Overseas bundle orders')}/></details>
  {['HK','MO'].includes(market.code)&&<Link to="/bulk-orders/cleansing-mix">{t('Cleansing Mix Order')} →</Link>}
  <section className="bundle-pickup-entry" aria-labelledby="bundle-pickup-title"><h2 id="bundle-pickup-title">{salesPresentationCopy(language).pickupNav}</h2><p>{salesPresentationCopy(language).pickupShort}</p><Link className="hd-textlink" to={`/jeju/pickup?market=${market.code}&lang=${language}`}>{salesPresentationCopy(language).pickupAction} →</Link></section></section>
 </main></V23Page>;
}
