import { Link } from "react-router-dom";
import type { StorefrontProduct } from "../../data/v23SiteData";
import { formatMarketUnitMoney, marketProductText, marketText, useMarket } from "../../lib/market";

/** Product tile shared by the home rail and the product list: photo, name and price, short terms, one order action. */
export function ProductTile({ product, query }: { product: StorefrontProduct; query: string }) {
  const { market, language } = useMarket();
  const name = marketProductText(language, product.name);
  const outOfStock = typeof product.stockQuantity === "number" && product.stockQuantity < product.bulkMoq;
  return <li>
    <article className="hd-tile v23-product-card" data-item-id={product.slug} data-item-name={name} data-item-category={product.category}
      data-item-price={product.marketUnitPrices?.[market.code] ?? product.bulkUnitPrice} data-currency={market.currency}>
      <Link className="hd-tile__media" to={`/products/${product.slug}${query}`} tabIndex={-1} aria-hidden="true">
        <img src={product.image} alt="" width={880} height={1100} loading="lazy" decoding="async" sizes="(max-width: 639px) 70vw, 22vw" />
        <span className="hd-tile__badge">{outOfStock ? marketText(language, "OUT OF STOCK", "OUT OF STOCK") : marketProductText(language, product.badge)}</span>
      </Link>
      <div className="hd-tile__body">
        <h3><Link to={`/products/${product.slug}${query}`}>{name}</Link></h3>
        <p className="hd-tile__price"><span>{formatMarketUnitMoney(product, market)}</span></p>
        <p className="hd-tile__desc">{marketProductText(language, product.detail)}</p>
        <p className="hd-tile__terms">{marketText(language, `${market.currency} BULK UNIT PRICE`, `${market.currency} BULK UNIT PRICE`)} · {marketText(language, "Minimum")} {product.bulkMoq} {marketText(language, "units")}</p>
        <div className="hd-tile__actions">
          <Link className="hd-btn hd-btn--solid" to={`/bulk-orders?product=${product.slug}`}>{marketText(language, "Overseas bundle orders")}</Link>
        </div>
        <div className="hd-tile__links">
          <Link className="hd-textlink" to={`/products/${product.slug}${query}`}>{marketText(language, "View details", "View details")}</Link>
          {market.hasShopee && <details className="hd-tile__retail"><summary>Shopee</summary><a href={product.shopee} target="_blank" rel="noreferrer">{marketText(language, "Buy on Shopee")} ↗</a></details>}
        </div>
      </div>
    </article>
  </li>;
}
