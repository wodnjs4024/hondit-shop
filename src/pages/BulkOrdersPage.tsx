import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { bulkProducts, formatSgd, type BulkCategory, type BulkProduct } from "../data/bulkProducts";
import { fetchBulkProducts } from "../lib/bulkApi";
import { addToCart } from "../lib/cart";

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
              All listed prices include Singapore EMS shipping. Available to individual, group and business buyers.
            </p>
          </div>
          <aside className="bulk-note">
            <span>Singapore delivery only</span>
            <strong>Pack-based ordering</strong>
            <p>Products are ordered by pack quantity so totals remain clear before payment.</p>
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
                      <dt>1 pack</dt>
                      <dd>{product.packQuantity} units</dd>
                    </div>
                    <div>
                      <dt>Pack total</dt>
                      <dd>{formatSgd(product.packPriceSgd)}</dd>
                    </div>
                  </dl>
                  <p className="shipping-pill">Singapore EMS shipping included</p>
                  <div className="bulk-card__actions">
                    <button className="button button--primary" type="button" onClick={() => addToCart(product.slug, 1)}>
                      Add 1 pack to cart
                    </button>
                    <Link className="button button--ghost" to={`/bulk-orders/${product.slug}`}>
                      View details
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
