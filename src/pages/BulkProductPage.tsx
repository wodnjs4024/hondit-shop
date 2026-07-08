import { useEffect, useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { BULK_QTY_STEP, bulkProducts, formatSgd, getBulkMaxUnits, getBulkMoq, getBulkProduct, getBulkTotal, getStockStatus, normalizeBulkQuantity, type BulkProduct } from "../data/bulkProducts";
import { useCart } from "../context/CartContext";
import { fetchBulkProducts } from "../lib/bulkApi";
import { ProductReviews } from "../components/ProductReviews";

export function BulkProductPage() {
  const { slug = "" } = useParams();
  const navigate = useNavigate();
  const [products, setProducts] = useState<BulkProduct[]>(bulkProducts);
  const [packCount, setPackCount] = useState(0);
  const [adding, setAdding] = useState(false);
  const { addItem } = useCart();

  useEffect(() => {
    fetchBulkProducts().then(setProducts);
  }, []);

  const product = products.find((entry) => entry.slug === slug && entry.active) || getBulkProduct(slug);
  if (!product) return <Navigate to="/bulk-orders" replace />;

  const moq = getBulkMoq(product);
  const maxUnits = getBulkMaxUnits(product);
  const quantity = normalizeBulkQuantity(product, packCount || moq);
  const totalUnits = quantity;
  const totalSgd = getBulkTotal(product, quantity);
  const stockStatus = getStockStatus(product);
  const soldOut = stockStatus === "Sold out";

  const add = () => {
    setAdding(true);
    addItem(product, quantity);
    window.setTimeout(() => setAdding(false), 650);
  };
  const buyNow = () => {
    addItem(product, quantity);
    navigate("/cart");
  };

  return (
    <main className="bulk-page">
      <section className="bulk-detail section-shell">
        <div className="section-inner section-inner--wide bulk-detail__grid">
          <figure className="bulk-detail__image">
            <img src={product.imageUrl} alt={product.name} />
          </figure>

          <div className="bulk-detail__content">
            <Link className="text-link" to="/bulk-orders">Back to Bulk Orders</Link>
            <p className="eyebrow">{product.category.toUpperCase()} BULK ORDER</p>
            <h1>{product.name}</h1>
            <p className="bulk-detail__volume">{product.volumeLabel}</p>
            <p>{product.description}</p>
            <p className="bulk-price-explainer">
              Bulk prices are lower because they exclude the marketplace fees applied on Shopee. Ordering directly here passes those savings on to you.
            </p>

            <dl className="bulk-price-list bulk-price-list--detail">
              <div><dt>Unit price</dt><dd>{formatSgd(product.unitPriceSgd)}</dd></div>
              <div><dt>Minimum</dt><dd>{moq} units</dd></div>
              <div><dt>Step</dt><dd>{BULK_QTY_STEP} units</dd></div>
              <div><dt>Shipping</dt><dd>Free Singapore EMS included</dd></div>
            </dl>

            <p className={`stock-pill stock-pill--${stockStatus.toLowerCase().replaceAll(" ", "-")}`}>{stockStatus}</p>
            <p className="shipping-pill">Minimum {moq} units. Increase in steps of {BULK_QTY_STEP}.{maxUnits ? ` Available up to ${maxUnits} units.` : ""}</p>

            <div className="pack-stepper" aria-label="Order quantity">
              <span>Order quantity</span>
              <div>
                <button type="button" disabled={soldOut} onClick={() => setPackCount((value) => normalizeBulkQuantity(product, (value || moq) - BULK_QTY_STEP))}>-</button>
                <input
                  aria-label="Units"
                  disabled={soldOut}
                  inputMode="numeric"
                  value={quantity}
                  onChange={(event) => setPackCount(normalizeBulkQuantity(product, Number(event.target.value)))}
                />
                <button type="button" disabled={soldOut} onClick={() => setPackCount((value) => normalizeBulkQuantity(product, (value || moq) + BULK_QTY_STEP))}>+</button>
              </div>
              <em>Total units</em>
            </div>

            <div className="bulk-total-box">
              <span>Total product units</span>
              <strong>{totalUnits}</strong>
              <span>Total payment amount</span>
              <strong>{formatSgd(totalSgd)}</strong>
            </div>

            <div className="bulk-card__actions">
              <button className="button button--primary" type="button" onClick={add} disabled={soldOut || adding}>
                {adding ? "Added" : "Add to Cart"}
              </button>
              <button className="button button--ghost" type="button" onClick={buyNow} disabled={soldOut}>Buy Now</button>
            </div>
            {soldOut && <a className="text-link" href={`/contact?type=restock&product=${product.slug}`}>Notify me when restocked</a>}

            <section className="bulk-product-info">
              <h2>Product composition</h2>
              <div className="product-card__chips">
                {product.features.map((feature) => <span key={feature}>{feature}</span>)}
              </div>
              <h2>Use and order notes</h2>
              <ul>
                {product.usage.map((item) => <li key={item}>{item}</li>)}
                <li>Orders are currently available for delivery within Singapore only.</li>
                <li>All listed prices include Singapore EMS shipping.</li>
              </ul>
            </section>
          </div>
        </div>
        <div className="section-inner section-inner--wide">
          <ProductReviews product={product} />
        </div>
      </section>
    </main>
  );
}
