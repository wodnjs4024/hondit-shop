import {checkoutChargeCopy} from '../data/checkoutChargeCopy';
import {resolveCheckoutTerms} from '../../shared/checkout-terms.js';
import {isDiffuser} from '../../shared/diffuser-quantity.js';
import {customerConditionLabel} from "../../shared/customer-conditions.js";
import {shippingSummary} from "../../shared/shipping-summary.js";
import { Link } from "react-router-dom";
import { sgTerms } from "../../shared/page-sales.js";
import { getMarketUnitPrice, marketCountryName, marketText, useMarket } from "../lib/market";
type Item = { slug:string; apiSlug?:string; bulkMoq?:number; packQuantity?:number; bulkUnitPrice?:number; unitPriceSgd?:number; marketUnitPrices?:Partial<Record<"SG"|"HK"|"JP"|"TW"|"BN"|"MO"|"TH"|"MY",number>> };
export function ProductSalesSummary({product,showContact=true,quantity}: {product:Item;showContact?:boolean;quantity?:string}) {
 const {market,language}=useMarket();const charges=checkoutChargeCopy(language); const approved=market.code==='SG'?sgTerms(product):null;
 const moq=approved?.moq ?? product.bulkMoq ?? product.packQuantity ?? 1;
 const selected=quantity!==undefined?resolveCheckoutTerms(product,market.code,quantity):null;
 const unit=selected?.referenceUnitMinor!==null&&selected?.referenceUnitMinor!==undefined?selected.referenceUnitMinor/10**selected.referenceDigits:getMarketUnitPrice(product,market);
 const chosen=selected?.referenceTotalMinor;
 const diffuser=isDiffuser(product);
 const money=(n:number)=>new Intl.NumberFormat(market.locale,{style:"currency",currency:selected?.displayCurrency??market.currency,minimumFractionDigits:market.currency==="JPY"?0:2,maximumFractionDigits:market.currency==="JPY"?0:2}).format(n);
 const t=(en:string,ko:string,ja:string)=>language==='ja'?ja:marketText(language,en,ko);
 return <aside className="product-sales-summary" aria-label={t('Bulk purchase conditions','대량구매 조건','まとめ買い条件')}>
  <div className="product-sales-summary__heading"><span>{marketCountryName(market,language)} · {selected?.displayCurrency??market.currency}</span><b>{marketText(language,customerConditionLabel(product,market.code,quantity))}</b></div>
  <dl><div><dt>{diffuser&&!quantity?marketText(language,'General order unit price (20+)'):t('Unit price','개당 단가','単価')}</dt><dd>{money(unit)}</dd></div>
   <div><dt>{diffuser&&quantity!=='10'?marketText(language,'General order minimum'):t('Minimum quantity','최소 주문수량','最低注文数')}</dt><dd>{quantity==='10'?10:moq} {t('units','개','個')}</dd></div>
   <div className="product-sales-summary__total"><dt>{quantity?marketText(language,'Selected product amount'):t('Minimum product amount','최소 상품금액','最低商品代金')}</dt><dd>{chosen!==null&&chosen!==undefined?money(chosen/10**selected!.referenceDigits):quantity?"—":money(approved ? approved.unitMinor*moq/100 : unit*moq)}</dd></div>
   <div><dt>{t('Quantity increment','추가 주문단위','追加注文単位')}</dt><dd>{diffuser?<>1 {marketText(language,'unit')}</>:<>10 {t('units','개','個')}</>}</dd></div>
  </dl>
  <div className="product-sales-summary__notes"><p><b>{t('Shipping','배송','配送')}</b> {selected?.status==='direct'&&selected.shippingIncluded?charges.included:marketText(language,selected&&selected.status!=='direct'?'Shipping and payment require confirmation. Extra freight may apply; your selection is kept in the payment request.':shippingSummary(market.code,product))}</p>
   <p><b>{t('Tax & customs','세금·통관비','税金・通関費用')}</b> {t('Excluded; payable by the recipient where applicable.','별도이며 발생 시 수취인 부담입니다.','含まれません。発生する場合は受取人の負担です。')}</p>
   <p><Link to="/shipping">{marketText(language,"Shipping")}</Link> · <Link to="/policy/refund">{marketText(language,"Refund Policy")}</Link></p>
  </div>{showContact&&<Link to={`/contact?product=${product.slug}&quantity=${quantity??moq}&reason=product&market=${market.code}&lang=${language}`}>{t('Ask about this order →','이 주문 조건 문의 →','注文条件を問い合わせる →')}</Link>}
 </aside>;
}
