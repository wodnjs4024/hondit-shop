import {salesPresentationCopy} from '../../data/salesPresentationCopy';
import {pickupRequestTotal} from '../../../shared/contact-copy.js';
import { Link } from "react-router-dom";
import type { StorefrontProduct } from "../../data/v23SiteData";
import { marketText, useMarket } from "../../lib/market";
import { productDetail, productMainImage, productName, productPriceLabel } from "../../lib/productText";
import { catalogCopy } from "../../data/catalogCopy";

/** Product tile shared by the home rail and the product list: photo, name and price, short terms, then the order and detail links. */
export function ProductTile({ product, query }: { product: StorefrontProduct; query: string }) {
  const { market, language } = useMarket();
  const name = productName(product, language);
  /* Both diffusers can be collected at Jeju Airport; the amount comes from the shared pickup price table. */
  const pickupSize = product.slug === "diffuser-350g" ? "350g" : product.slug === "diffuser-500g" ? "500g" : null;
  const outOfStock = product.status === "soldout" || (typeof product.stockQuantity === "number" && product.stockQuantity < product.bulkMoq);
  return <li>
    <article className="hd-tile v23-product-card" data-item-id={product.slug} data-item-name={name} data-item-category={product.category}
      data-item-price={product.marketUnitPrices?.[market.code] ?? product.bulkUnitPrice} data-currency={market.currency}>
      <Link className="hd-tile__media" to={`/products/${product.slug}${query}`} tabIndex={-1} aria-hidden="true">
        <img src={productMainImage(product)} alt="" width={880} height={1100} loading="lazy" decoding="async" sizes="(max-width: 639px) 70vw, 22vw" />
        {outOfStock && <span className="hd-tile__badge">{marketText(language, "OUT OF STOCK", "OUT OF STOCK")}</span>}
      </Link>
      <div className="hd-tile__body">
        <h3><Link to={`/products/${product.slug}${query}`}>{name}</Link></h3>
        <p className="hd-tile__price"><span>{productPriceLabel(product, market, language)}</span></p>
        <p className="hd-tile__desc">{productDetail(product, language)}</p>
        <p className="hd-tile__terms">{product.quoteOnly ? catalogCopy(language).quoteTitle : marketText(language, `${market.currency} BULK UNIT PRICE`, `${market.currency} BULK UNIT PRICE`)} · {marketText(language, "Minimum")} {product.bulkMoq} {marketText(language, "units")}</p>
        <div className="hd-tile__links">
          <p className="hd-tile__primary">
            <Link className="hd-textlink hd-textlink--order" to={`/bulk-orders?product=${product.slug}`}>{marketText(language, "Overseas bundle orders")} →</Link>
            <Link className="hd-textlink" to={`/products/${product.slug}${query}`}>{marketText(language, "View details", "View details")}</Link>
          </p>
          {market.hasShopee && product.shopee && <details className="hd-tile__retail"><summary>Shopee</summary><a href={product.shopee} target="_blank" rel="noreferrer">{marketText(language, "Buy on Shopee")} ↗</a></details>}
          {pickupSize&&<Link className="hd-textlink hd-tile__pickup" to={`/jeju/pickup?market=${market.code}&lang=${language}`}>{salesPresentationCopy(language).pickupNav} · KRW {pickupRequestTotal(1,pickupSize).toLocaleString('en-US')} →</Link>}
        </div>
      </div>
    </article>
  </li>;
}
