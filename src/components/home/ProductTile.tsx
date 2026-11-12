import {selectionUrl} from '../../../shared/sales-tools.js';
import {functionalParams} from '../../../shared/tracking-policy.js';
import {salesPresentationCopy} from '../../data/salesPresentationCopy';
import {pickupRequestTotal} from '../../../shared/contact-copy.js';
import { Link } from "react-router-dom";
import type { StorefrontProduct } from "../../data/v23SiteData";
import { getMarketUnitPrice, marketText, useMarket } from "../../lib/market";
import { productDetail, productMainImage, productName, productPriceLabel } from "../../lib/productText";
import { catalogCopy } from "../../data/catalogCopy";

/** Product tile shared by the home rail and the product list: photo, name and price, short terms, then the order and detail links. */
export function ProductTile({ product, query }: { product: StorefrontProduct; query: string }) {
  const { market, language } = useMarket();
  const params=functionalParams(query);
  const input={slug:product.slug,quantity:params.get("product")===product.slug?params.get("quantity")??product.bulkMoq:product.bulkMoq,market:market.code,language,purpose:params.get("purpose")??"unspecified"};
  const detail=selectionUrl(`/products/${product.slug}`,input);
  const name = productName(product, language);
  /* Both diffusers can be collected at Jeju Airport; the amount comes from the shared pickup price table. */
  const pickupSize = product.slug === "diffuser-350g" ? "350g" : product.slug === "diffuser-500g" ? "500g" : null;
  const outOfStock = product.status === "soldout" || (typeof product.stockQuantity === "number" && product.stockQuantity < product.bulkMoq);
  return <li>
    <article className="hd-tile v23-product-card" data-item-id={product.slug} data-item-name={name} data-item-category={product.category}
      data-item-price={getMarketUnitPrice(product, market)} data-currency={market.currency}>
      <Link className="hd-tile__media" to={detail} tabIndex={-1} aria-hidden="true">
        <img src={productMainImage(product)} alt="" width={880} height={1100} loading="lazy" decoding="async" sizes="(max-width: 639px) 70vw, 22vw" />
        {outOfStock && <span className="hd-tile__badge">{marketText(language, "OUT OF STOCK", "OUT OF STOCK")}</span>}
      </Link>
      <div className="tile-info">
        <div className="tile-info__head">
          <h3><Link to={detail}>{name}</Link></h3>
          <p className="tile-info__desc">{productDetail(product, language)}</p>
        </div>
        <dl className="tile-info__spec">
          <div><dt>{product.quoteOnly ? catalogCopy(language).quoteTitle : marketText(language, `${market.currency} BULK UNIT PRICE`, `${market.currency} BULK UNIT PRICE`)}</dt><dd className="tile-info__price">{productPriceLabel(product, market, language)}</dd></div>
          <div><dt>{marketText(language, "Minimum")}</dt><dd>{product.bulkMoq}{language === "ko" ? "" : " "}{marketText(language, "units")}</dd></div>
        </dl>
        <div className="tile-info__buy">
          <Link className="tile-btn tile-btn--solid" to={selectionUrl("/bulk-orders",input)}>{marketText(language, "Overseas bundle orders")} →</Link>
          <Link className="tile-btn tile-btn--line" to={detail}>{marketText(language, "View details", "View details")}</Link>
        </div>
        {((market.hasShopee && product.shopee) || pickupSize) && <div className="tile-info__alt">
          {market.hasShopee && product.shopee && <a className="tile-alt" href={product.shopee} target="_blank" rel="noreferrer"><small>{marketText(language, "Retail")}</small>{marketText(language, "Buy on Shopee")} ↗</a>}
          {pickupSize&&<Link className="tile-alt" to={selectionUrl("/jeju/pickup",{...input,quantity:1,fulfillment:"jeju_pickup"})}><small>{salesPresentationCopy(language).pickupNav}</small>{`KRW\u00a0${pickupRequestTotal(1,pickupSize).toLocaleString('en-US')}`} →</Link>}
        </div>}
      </div>
    </article>
  </li>;
}
