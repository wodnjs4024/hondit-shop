import {functionalParams} from '../../shared/tracking-policy.js';
import {useEffect,useState} from 'react';
import {Link,useLocation} from 'react-router-dom';
import {V23CatalogGrid} from '../components/v23/CatalogGrid';
import {V23Page} from '../components/v23/SiteChrome';
import {SHOPEE,v23Products} from '../data/v23SiteData';
import {loadStorefrontProducts} from '../lib/storefrontApi';
import {isStorefrontProductAllowedForMarket,marketCountryName,marketText,useMarket} from '../lib/market';
export function ProductsPage(){
 const {market,language}=useMarket();const t=(s:string)=>marketText(language,s);
 const location=useLocation();const params=functionalParams(location.search);params.set('market',market.code);params.set('lang',language);const query=`?${params.toString()}`;
 const [products,setProducts]=useState(v23Products);useEffect(()=>{loadStorefrontProducts().then(setProducts).catch(()=>undefined)},[]);
 const available=products.filter(p=>isStorefrontProductAllowedForMarket(p,market));
 const care=available.some(p=>p.category==='CARE');
 const description=t(care?'Vegan cleansing care and Jeju volcanic-stone diffusers for {country}. Choose a product and quantity to review the applicable order conditions.':'Jeju volcanic-stone diffusers for {country}. Select quantity and confirm the final amount and shipping terms.').replace('{country}',marketCountryName(market,language));
 const route=t('Product and quantity determine the checkout route. Eligible bundles can proceed directly; other selections require final price and shipping confirmation.');
 return <V23Page><main className="v23-products-page hd-page">
  <header className="hd-page-head">
   <h1>{t(care?'Care shaped by water. Scent grounded in stone.':'Jeju volcanic-stone diffusers')}</h1>
   <p>{description}</p>
   <ul className="hd-page-head__facts">
    <li>{t('{count} products').replace('{count}',String(available.length))}</li>
    <li>{t(market.code==='SG'?'Approved product price':'Reference product prices')}</li>
    <li>{t('Confirm final amount and shipping before payment.')}</li>
   </ul>
  </header>
  <section className="hd-catalog" aria-labelledby="hd-catalog-title"><h2 id="hd-catalog-title" className="hd-visually-hidden">{t('Products')}</h2><V23CatalogGrid tiles query={query}/></section>
  <section className="hd-routes" aria-labelledby="hd-routes-title">
   <h2 id="hd-routes-title">{t('Overseas bundle order conditions')}</h2>
   <div className="hd-routes__grid">
    <article><h3>{t('Overseas bundle orders')}</h3><p>{route}</p><Link className="hd-textlink" to={`/bulk-orders${query}`}>{t('Review order conditions')}</Link></article>
    {market.hasShopee&&<article><h3>Shopee Singapore</h3><p>{t('Use Shopee for live retail prices, vouchers, familiar checkout and order tracking.')}</p><a className="hd-textlink" href={SHOPEE} target="_blank" rel="noreferrer">{t('View Shopee store ↗')}</a></article>}
   </div>
   <ul className="hd-paths">
    <li><Link to="/jeju/pickup"><span>{t('Jeju pickup information')}</span><span aria-hidden="true">→</span></Link></li>
    <li><Link to={`/partners${query}`}><span>{t('Store & business purchase guide')}</span><span aria-hidden="true">→</span></Link></li>
   </ul>
  </section>
 </main></V23Page>;
}
