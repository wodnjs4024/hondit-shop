import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { BULK_QTY_STEP, bulkProducts, formatSgd, getBulkMoq, getBulkTotal, getStockStatus, type BulkCategory, type BulkProduct } from "../data/bulkProducts";
import { fetchBulkProducts } from "../lib/bulkApi";

const filters: Array<{ label: string; value: "all" | BulkCategory }> = [
  { label: "All", value: "all" },
  { label: "Cleansing", value: "cleansing" },
  { label: "Diffuser", value: "diffuser" },
];

export function BulkOrdersPage() {
  const [products, setProducts] = useState<BulkProduct[]>(bulkProducts);
  const [category, setCategory] = useState<"all" | BulkCategory>("all");

  useEffect(() => {
    fetchBulkProducts().then(setProducts);
  }, []);

  const visibleProducts = useMemo(
    () =>
      products
        .filter((product) => product.active && product.purchaseEnabled)
        .filter((product) => category === "all" || product.category === category)
        .sort((a, b) => a.sortOrder - b.sortOrder),
    [category, products],
  );

  return (
    <main className="bulk-page">
      <section className="bulk-hero section-shell">
        <div className="section-inner section-inner--wide bulk-hero__grid">
          <div>
            <p className="eyebrow">BULK ORDERS</p>
            <h1>Direct orders for selected hondit products.</h1>
            <p>
              Bulk prices are lower because they exclude the marketplace fees applied on Shopee. Ordering directly here passes those savings on to you.
            </p>
          </div>
          <aside className="bulk-note">
            <span>Singapore delivery only</span>
            <strong>Free Singapore EMS shipping</strong>
            <p>Shipping is included in the displayed bulk price. No separate shipping fee is added at checkout.</p>
          </aside>
        </div>
      </section>

      <section className="bulk-catalog section-shell">
        <div className="section-inner section-inner--wide">
          <div className="bulk-filter" aria-label="Bulk product category filter">
            {filters.map((filter) => (
              <button
                className={category === filter.value ? "is-active" : ""}
                key={filter.value}
                type="button"
                onClick={() => setCategory(filter.value)}
              >
                {filter.label}
              </button>
            ))}
          </div>

          <div className="bulk-grid">
            {visibleProducts.map((product) => (
              <article className="bulk-card" key={product.slug}>
                <Link className="bulk-card__image" to={`/bulk-orders/${product.slug}`}>
                  <img src={product.imageUrl} alt={product.name} loading="lazy" decoding="async" />
                </Link>
                <div className="bulk-card__body">
                  <p className="bulk-card__category">{product.category}</p>
                  <h2>{product.name}</h2>
                  <p>{product.shortDescription}</p>
                  <p className={`stock-pill stock-pill--${getStockStatus(product).toLowerCase().replaceAll(" ", "-")}`}>{getStockStatus(product)}</p>
                  <dl className="bulk-price-list">
                    <div>
                      <dt>Volume</dt>
                      <dd>{product.volumeLabel}</dd>
                    </div>
                    <div>
                      <dt>Unit price</dt>
                      <dd>{formatSgd(product.unitPriceSgd)}</dd>
                    </div>
                    <div>
                      <dt>Minimum</dt>
                      <dd>{getBulkMoq(product)} units</dd>
                    </div>
                    <div>
                      <dt>MOQ total</dt>
                      <dd>{formatSgd(getBulkTotal(product, getBulkMoq(product)))}</dd>
                    </div>
                  </dl>
                  <p className="shipping-pill">Minimum {getBulkMoq(product)} units. Increase in steps of {BULK_QTY_STEP}. Free Singapore EMS shipping included.</p>
                  <div className="bulk-card__actions">
                    <Link className="button button--primary" to={`/bulk-orders/${product.slug}`} aria-disabled={getStockStatus(product) === "Sold out"}>
                      {getStockStatus(product) === "Sold out" ? "Notify me" : "Order this item"}
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
