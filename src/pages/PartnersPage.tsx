import {useEffect,useState} from 'react';
import {v23Products,type StorefrontProduct} from '../data/v23SiteData';
import {loadStorefrontProducts} from '../lib/storefrontApi';
import {ProductComparison} from '../components/SalesDiscovery';
import {useSearchParams} from 'react-router-dom';
import { Link } from 'react-router-dom';
import { V23Page } from '../components/v23/SiteChrome';
import { BusinessPlanner } from '../components/BusinessPlanner';
import {DiffuserComparison} from '../components/ProductFactsDisplay';
import { discoveryText } from '../data/discoveryCopy';
import { partnerFlowCopy } from '../data/partnerFlowCopy';
import { marketText, marketProductText, isStorefrontProductAllowedForMarket, useMarket } from '../lib/market';
export function PartnersPage() {
 const [params]=useSearchParams();const showResale=params.get("purpose")==="resale";
 const {market,language}=useMarket();const [products,setProducts]=useState<StorefrontProduct[]>(v23Products);useEffect(()=>{loadStorefrontProducts().then(setProducts).catch(()=>undefined)},[]);const t=(s:string)=>marketText(language,s);const d=(key:Parameters<typeof discoveryText>[1])=>discoveryText(language,key);
 return <V23Page><main className="partner-discovery">
 <section className="discovery-hero"><div><p className="v23-eyebrow">{marketText(language,"HONDIT / PARTNERS")}</p><h1>{t('Store & business purchase guide')}</h1><p>{t('Check products, approved prices and support materials. Order eligible bundles directly; contact us only for additional requests.')}</p><div className="discovery-hero-actions"><Link to="/bulk-orders">{t("Overseas bundle orders")}</Link><Link to="/contact?reason=partner">{t("Contact for additional requests")}</Link><Link to="/products">{d('view')}</Link></div></div><figure><img src="/images/diffuser-500g.webp" alt={marketProductText(language,'Volcanic Diffuser 500g')} width="880" height="1100" fetchPriority="high"/><figcaption>STONEJEJU · 500g</figcaption></figure></section>

 <section className="discovery-section"><div className="discovery-heading"><p className="v23-eyebrow">{marketText(language,"01 / PURPOSE")}</p><h2>{d('spaces')}</h2></div><div className="discovery-paths">{(['shop','stay','gift'] as const).map((key,i)=><article className="discovery-path" key={key}><span className="discovery-number">0{i+1}</span><h3>{d(key)}</h3><p>{d(`${key}Body`)}</p></article>)}</div></section>
 <section className="partner-flow" aria-labelledby="partner-flow-title"><h2 id="partner-flow-title">{partnerFlowCopy(language).title}</h2><ol>{partnerFlowCopy(language).steps.map(([title,body],i)=><li key={title}><span aria-hidden="true">{String(i+1).padStart(2,'0')}</span><strong>{title}</strong><p>{body}</p></li>)}</ol><p className="partner-flow__other"><Link to="/contact?reason=partner">{partnerFlowCopy(language).other} →</Link></p></section>
 {market.code==='SG'?<ProductComparison products={products.filter(p=>isStorefrontProductAllowedForMarket(p,market))}/>:<p className="business-order-note">{t('Approved terms unavailable for this selection. Contact us to confirm.')}</p>}<p className="business-order-note">{t("No consultation is required for an eligible direct order. Additional quantities, combinations or support requests can be sent by message.")}</p>
 <section className="discovery-section partner-faq"><div className="discovery-heading"><p className="v23-eyebrow">{marketText(language,"03 / QUESTIONS")}</p><h2>{d('questions')}</h2></div>{(['q1','q2','q3'] as const).map((key,i)=><details key={key}><summary>{d(key)}</summary><p>{i===1?t('Samples, mixed MOQ, consignment and returns are not confirmed offers. No sales or income is guaranteed.'):i===0?t('No consultation is required for an eligible direct order. Additional quantities, combinations or support requests can be sent by message.'):d('a3')}</p></details>)}</section>
 <section className="discovery-section"><h2>{t('Sales support materials')}</h2><p>{t('Resale is permitted. Import and shipping requirements are checked separately for each destination.')}</p><p>{t('Product photos, specifications and published use guidance are available. Supply, dispatch timing, import rules and shipping are confirmed per order.')}</p><div className="support-examples">{['350g','500g'].map(size=><Link key={size} to={'/products/diffuser-'+size}><img src={'/images/diffuser-'+size+'.webp'} alt={marketProductText(language,'Volcanic Diffuser '+size)} width="260" height="260"/>{size} · {t('Product specifications')} →</Link>)}</div><DiffuserComparison/></section>
 <details className="partner-tools" open={showResale||undefined}><summary>{t("Review introduction tools")}</summary><BusinessPlanner/></details>
 </main></V23Page>;
}
