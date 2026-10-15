import {salesPresentationCopy} from '../../data/salesPresentationCopy';
import {pickupRequestTotal} from '../../../shared/contact-copy.js';
import { Link } from "react-router-dom";
import type { StorefrontProduct } from "../../data/v23SiteData";
import { formatMarketUnitMoney, marketProductText, marketText, useMarket } from "../../lib/market";

/** Product tile shared by the home rail and the product list: photo, name and price, short terms, then the order and detail links. */
export function ProductTile({ product, query }: { product: StorefrontProduct; query: string }) {
  const { market, language } = useMarket();
  const name = marketProductText(language, product.name);
  const outOfStock = typeof product.stockQuantity === "number" && product.stockQuantity < product.bulkMoq;
  return <li>
    <article className="hd-tile v23-product-card" data-item-id={product.slug} data-item-name={name} data-item-category={product.category}
      data-item-price={product.marketUnitPrices?.[market.code] ?? product.bulkUnitPrice} data-currency={market.currency}>
      <Link className="hd-tile__media" to={`/products/${product.slug}${query}`} tabIndex={-1} aria-hidden="true">
        <img src={product.image} alt="" width={880} height={1100} loading="lazy" decoding="async" sizes="(max-width: 639px) 70vw, 22vw" />
        {outOfStock && <span className="hd-tile__badge">{marketText(language, "OUT OF STOCK", "OUT OF STOCK")}</span>}
      </Link>
      <div className="hd-tile__body">
        <h3><Link to={`/products/${product.slug}${query}`}>{name}</Link></h3>
        <p className="hd-tile__price"><span>{formatMarketUnitMoney(product, market)}</span></p>
        <p className="hd-tile__desc">{marketProductText(language, product.detail)}</p>
        <p className="hd-tile__terms">{marketText(language, `${market.currency} BULK UNIT PRICE`, `${market.currency} BULK UNIT PRICE`)} · {marketText(language, "Minimum")} {product.bulkMoq} {marketText(language, "units")}</p>
        <div className="hd-tile__links">
          <Link className="hd-textlink hd-textlink--order" to={`/bulk-orders?product=${product.slug}`}>{marketText(language, "Overseas bundle orders")} →</Link>
          <Link className="hd-textlink" to={`/products/${product.slug}${query}`}>{marketText(language, "View details", "View details")}</Link>
          {product.slug==='diffuser-350g'&&<Link className="hd-textlink hd-tile__pickup" to={`/jeju/pickup?market=${market.code}&lang=${language}`}>{salesPresentationCopy(language).pickupNav} · KRW {pickupRequestTotal(1).toLocaleString('en-US')} →</Link>}
          {market.hasShopee && <details className="hd-tile__retail"><summary>Shopee</summary><a href={product.shopee} target="_blank" rel="noreferrer">{marketText(language, "Buy on Shopee")} ↗</a></details>}
        </div>
      </div>
    </article>
  </li>;
}
