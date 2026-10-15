import {customerConditionLabel} from "../../shared/customer-conditions.js";
import {shippingSummary} from "../../shared/shipping-summary.js";
import { Link } from 'react-router-dom';
import { sgTerms } from '../../shared/page-sales.js';
import { discoveryText } from '../data/discoveryCopy';
import type { StorefrontProduct } from '../data/v23SiteData';
import { formatMarketUnitMoney, formatMarketLineMoney, marketProductText, marketText, useMarket } from '../lib/market';

export function PurchasePaths() {
 const {market,language}=useMarket(); const t=(s:string)=>marketText(language,s);
 return <section className="discovery-section bundle-explanation"><div className="discovery-heading"><p className="v23-eyebrow">HONDIT / 01</p><h2>{t("Choose delivery separately from your purchase purpose.")}</h2><p>{t("International delivery is offered as MOQ bundles, not individual small-quantity shipping. Group purchases are welcome.")}</p></div><p>{t(shippingSummary(market.code))}</p><Link to="/bulk-orders">{t("Overseas bundle orders")} →</Link></section>;
}
export function ProductComparison({products,eyebrow=true}:{products:StorefrontProduct[];eyebrow?:boolean}) {
 const {market,language}=useMarket();const d=(key:Parameters<typeof discoveryText>[1])=>discoveryText(language,key);
 return <section className="discovery-section"><div className="discovery-heading">{eyebrow&&<p className="v23-eyebrow">HONDIT / 02</p>}<h2>{d('compare')}</h2><p>{market.code==='SG'?d('compareBody'):marketText(language,'Reference price · confirm transaction conditions')}</p></div><div className="discovery-table-wrap" tabIndex={0} role="region" aria-label={d('compare')}><table className="discovery-table"><thead><tr>{(['product','unit','minimum','amount'] as const).map(key=><th key={key} scope="col">{d(key)}</th>)}<th scope="col">{marketText(language,"Order availability")}</th></tr></thead><tbody>{products.map(product=>{const moq=(market.code==='SG'?sgTerms(product)?.moq:undefined)??product.bulkMoq;return <tr key={product.slug}><th scope="row"><Link to={`/products/${product.slug}`}><img src={product.image} alt="" width="64" height="64" loading="lazy"/><span>{marketProductText(language,product.name)}<small>{marketProductText(language,product.detail)}</small></span></Link></th><td>{formatMarketUnitMoney(product,market)}</td><td>{moq}</td><td>{formatMarketLineMoney(product,moq,market)}</td><td>{marketText(language,customerConditionLabel(product,market.code))}</td></tr>})}</tbody></table></div></section>;
}
