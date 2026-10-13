import { Link } from "react-router-dom";
import { sgTerms } from "../../shared/page-sales.js";
import { getMarketUnitPrice, marketCountryName, marketText, useMarket } from "../lib/market";
type Item = { slug:string; apiSlug?:string; bulkMoq?:number; packQuantity?:number; bulkUnitPrice?:number; unitPriceSgd?:number; marketUnitPrices?:Partial<Record<"SG"|"HK"|"JP"|"TW"|"BN"|"MO"|"TH"|"MY",number>> };
export function ProductSalesSummary({product}: {product:Item}) {
 const {market,language}=useMarket(); const approved=market.code==='SG'?sgTerms(product):null;
 const moq=approved?.moq ?? product.bulkMoq ?? product.packQuantity ?? 1;
 const unit=getMarketUnitPrice(product,market);
 const money=(n:number)=>new Intl.NumberFormat(market.locale,{style:"currency",currency:market.currency,minimumFractionDigits:market.currency==="JPY"?0:2,maximumFractionDigits:market.currency==="JPY"?0:2}).format(n);
 const t=(en:string,ko:string,ja:string)=>language==='ja'?ja:marketText(language,en,ko);
 return <aside className="product-sales-summary" aria-label={t('Bulk purchase conditions','대량구매 조건','まとめ買い条件')}>
  <div className="product-sales-summary__heading"><span>{marketCountryName(market,language)} · {market.currency}</span><b>{t('Direct bulk order','직접 대량판매','直接まとめ買い')}</b></div>
  <dl><div><dt>{t('Unit price','개당 단가','単価')}</dt><dd>{money(unit)}</dd></div>
   <div><dt>{t('Minimum quantity','최소 주문수량','最低注文数')}</dt><dd>{moq} {t('units','개','個')}</dd></div>
   <div className="product-sales-summary__total"><dt>{t('Minimum product amount','최소 상품금액','最低商品代金')}</dt><dd>{money(approved ? approved.unitMinor*moq/100 : unit*moq)}</dd></div>
   <div><dt>{t('Quantity increment','추가 주문단위','追加注文単位')}</dt><dd>10 {t('units','개','個')}</dd></div>
  </dl>
  <div className="product-sales-summary__notes"><p><b>{t('Shipping','배송','配送')}</b> {approved ? t('Singapore delivery included for this single-product MOQ bundle. Additional quantities or combinations require an enquiry.','싱가포르 단일 상품 MOQ 묶음 배송비 포함. 추가 수량·다품목 구성은 문의 후 확인합니다.','この商品の最低数量セットが対象です。追加数量・組み合わせはお問い合わせください。') : t(`${market.countryName} delivery: confirm the applicable quantity and packaging before ordering.`,`${market.koreanLabel} 배송: 주문 전 적용 수량·포장 범위를 확인해주세요.`,`${marketCountryName(market,language)}への配送条件・梱包範囲は注文前にご確認ください。`)}</p>
   <p><b>{t('Tax & customs','세금·통관비','税金・通関費用')}</b> {t('Excluded; payable by the recipient where applicable.','별도이며 발생 시 수취인 부담입니다.','含まれません。発生する場合は受取人の負担です。')}</p>
   <p>{t('Delivery time, returns and product precautions: confirm before ordering.','납기·교환/환불·제품 주의사항은 주문 전 확인해주세요.','納期・返品条件・製品の注意事項は注文前にご確認ください。')}</p>
  </div><Link to={`/contact?product=${product.slug}&quantity=${moq}&reason=product&market=${market.code}&lang=${language}`}>{t('Ask about this order →','이 주문 조건 문의 →','注文条件を問い合わせる →')}</Link>
 </aside>;
}
