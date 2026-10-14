import {useEffect,useState} from 'react';
import {Link} from 'react-router-dom';
import {V23CatalogGrid} from '../components/v23/CatalogGrid';
import {V23Page,V23PageHero} from '../components/v23/SiteChrome';
import {SHOPEE,v23Products} from '../data/v23SiteData';
import {loadStorefrontProducts} from '../lib/storefrontApi';
import {isStorefrontProductAllowedForMarket,marketCountryName,marketText,useMarket} from '../lib/market';
export function ProductsPage(){
 const {market,language}=useMarket();const t=(s:string)=>marketText(language,s);
 const [products,setProducts]=useState(v23Products);useEffect(()=>{loadStorefrontProducts().then(setProducts).catch(()=>undefined)},[]);
 const available=products.filter(p=>isStorefrontProductAllowedForMarket(p,market));
 const care=available.some(p=>p.category==='CARE');
 const description=t(care?'Vegan cleansing care and Jeju volcanic-stone diffusers for {country}. Choose a product and quantity to review the applicable order conditions.':'Jeju volcanic-stone diffusers for {country}. Select quantity and confirm the final amount and shipping terms.').replace('{country}',marketCountryName(market,language));
 const route=t('Product and quantity determine the checkout route. Eligible bundles can proceed directly; other selections require final price and shipping confirmation.');
 return <V23Page><main className="v23-products-page">
  <V23PageHero eyebrow={t('THE HONDIT EDIT')} title={t(care?'Care shaped by water. Scent grounded in stone.':'Jeju volcanic-stone diffusers')} description={description} image="/images/jeju-water-basalt-v2.webp" imageAlt={t('Clear Jeju water flowing across dark volcanic basalt.')}/>
  <section className="v23-confidence">
   <article><small>{t('{count} products').replace('{count}',String(available.length))}</small><b>{t(care?'Care and scent products':'Jeju volcanic-stone diffusers')}</b></article>
   <article><small>{t(market.code==='SG'?'Approved product price':'Reference product prices')}</small><b>{t('Confirm final amount and shipping before payment.')}</b></article>
   <article><small>{t('Overseas bundle orders')}</small><b>{t('Review order conditions')}</b></article>
  </section>
  <section className="v23-products-section"><div className="v23-section-heading is-cream"><div><p className="v23-eyebrow"><span/>{t('SHOP BY RITUAL')}</p><h2>{t('Find your')}<br/><em>{t('everyday fit.')}</em></h2></div></div><V23CatalogGrid/></section>
  <section className="v23-route-guide">
   <div><p className="v23-eyebrow is-light"><span/>{t('CHOOSE YOUR ROUTE')}</p><h2>{t('Overseas bundle order conditions')}</h2></div>
   <article><small>{t('BUSINESS AND GROUPS')}</small><b>{t('Overseas bundle orders')}</b><p>{route}</p><Link to="/bulk-orders">{t('Review order conditions')}</Link></article>
   {market.hasShopee&&<article><small>{t('INDIVIDUAL RETAIL')}</small><b>Shopee Singapore</b><p>{t('Use Shopee for live retail prices, vouchers, familiar checkout and order tracking.')}</p><a href={SHOPEE} target="_blank" rel="noreferrer">{t('View Shopee store ↗')}</a></article>}
  </section>
 </main></V23Page>;
}
