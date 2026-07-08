import { useEffect, useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { bulkProducts, formatSgd, getBulkProduct, type BulkProduct } from "../data/bulkProducts";
import { fetchBulkProducts } from "../lib/bulkApi";
import { addToCart } from "../lib/cart";
import { ProductReviews } from "../components/ProductReviews";

export function BulkProductPage() {
  const { slug = "" } = useParams();
  const navigate = useNavigate();
  const [products, setProducts] = useState<BulkProduct[]>(bulkProducts);
  const [packCount, setPackCount] = useState(1);

  useEffect(() => {
    fetchBulkProducts().then(setProducts);
  }, []);

  const product = products.find((entry) => entry.slug === slug && entry.active) || getBulkProduct(slug);
  if (!product) return <Navigate to="/bulk-orders" replace />;

  const totalUnits = packCount * product.packQuantity;
  const totalSgd = packCount * product.packPriceSgd;

  const add = () => addToCart(product.slug, packCount);
  const buyNow = () => {
    add();
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

            <dl className="bulk-price-list bulk-price-list--detail">
              <div><dt>Unit price</dt><dd>{formatSgd(product.unitPriceSgd)}</dd></div>
              <div><dt>1 pack</dt><dd>{product.packQuantity} units</dd></div>
              <div><dt>1 pack total</dt><dd>{formatSgd(product.packPriceSgd)}</dd></div>
              <div><dt>Shipping</dt><dd>Singapore EMS included</dd></div>
            </dl>

            <div className="pack-stepper" aria-label="Pack quantity">
              <span>Pack quantity</span>
              <div>
                <button type="button" onClick={() => setPackCount((value) => Math.max(1, value - 1))}>-</button>
                <strong>{packCount}</strong>
                <button type="button" onClick={() => setPackCount((value) => value + 1)}>+</button>
              </div>
              <em>{totalUnits} units total</em>
            </div>

            <div className="bulk-total-box">
              <span>Total product units</span>
              <strong>{totalUnits}</strong>
              <span>Total payment amount</span>
              <strong>{formatSgd(totalSgd)}</strong>
            </div>

            <div className="bulk-card__actions">
              <button className="button button--primary" type="button" onClick={add}>Add to Cart</button>
              <button className="button button--ghost" type="button" onClick={buyNow}>Buy Now</button>
            </div>

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
