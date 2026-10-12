import { Link } from 'react-router-dom';
import { sgTerms } from '../../shared/page-sales.js';
import { discoveryText } from '../data/discoveryCopy';
import type { StorefrontProduct } from '../data/v23SiteData';
import { formatMarketUnitMoney, formatMarketLineMoney, marketProductText, useMarket } from '../lib/market';

export function PurchasePaths() {
 const {language}=useMarket(); const t=(key:Parameters<typeof discoveryText>[1])=>discoveryText(language,key);
 return <section className="discovery-section"><div className="discovery-heading"><p className="v23-eyebrow">HONDIT / 01</p><h2>{t('choose')}</h2></div><div className="discovery-paths">{([
 ['personal','personalBody','view','/products'],['bulk','bulkBody','order','/bulk-orders'],['partner','partnerBody','talk','/partners']
 ] as const).map(([title,body,cta,to],i)=><Link className="discovery-path" to={to} key={title}><span className="discovery-number">0{i+1}</span><h3>{t(title)}</h3><p>{t(body)}</p><strong>{t(cta)}</strong></Link>)}</div></section>;
}
export function ProductComparison({products}:{products:StorefrontProduct[]}) {
 const {market,language}=useMarket();const t=(key:Parameters<typeof discoveryText>[1])=>discoveryText(language,key);
 return <section className="discovery-section"><div className="discovery-heading"><p className="v23-eyebrow">HONDIT / 02</p><h2>{t('compare')}</h2><p>{t('compareBody')}</p></div><div className="discovery-table-wrap" tabIndex={0} role="region" aria-label={t('compare')}><table className="discovery-table"><thead><tr>{(['product','unit','minimum','amount'] as const).map(key=><th key={key} scope="col">{t(key)}</th>)}</tr></thead><tbody>{products.map(product=>{const moq=(market.code==='SG'?sgTerms(product)?.moq:undefined)??product.bulkMoq;return <tr key={product.slug}><th scope="row"><Link to={`/products/${product.slug}`}><img src={product.image} alt="" width="64" height="64" loading="lazy"/><span>{marketProductText(language,product.name)}<small>{marketProductText(language,product.detail)}</small></span></Link></th><td>{formatMarketUnitMoney(product,market)}</td><td>{moq}</td><td>{formatMarketLineMoney(product,moq,market)}</td></tr>})}</tbody></table></div></section>;
}
