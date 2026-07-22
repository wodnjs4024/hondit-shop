import { useEffect, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { V23Page } from "../components/v23/SiteChrome";
import { v23Products, type StorefrontProduct } from "../data/v23SiteData";
import { loadStorefrontProduct } from "../lib/storefrontApi";

export function ProductDetailPage() {
  const { productId = "" } = useParams();
  const [product, setProduct] = useState<StorefrontProduct | undefined>(() => v23Products.find((item) => item.slug === productId));

  useEffect(() => {
    loadStorefrontProduct(productId).then(setProduct).catch(() => undefined);
  }, [productId]);

  if (!productId) return <Navigate to="/products" replace />;
  if (!product) {
    return (
      <V23Page>
        <main className="v23-not-found">
          <p className="v23-eyebrow"><span /> PRODUCTS</p>
          <h1>Product not found.</h1>
          <Link to="/products">Back to products</Link>
        </main>
      </V23Page>
    );
  }

  return (
    <V23Page>
      <main className="v23-product-detail">
        <section className="v23-product-detail-hero">
          <figure>
            <img src={product.image} alt={product.name} />
            {typeof product.stockQuantity === "number" && product.stockQuantity < product.bulkMoq && <span>Out of stock</span>}
          </figure>
          <div>
            <p className="v23-eyebrow"><span /> {product.category}</p>
            <h1>{product.name}</h1>
            <p>{product.description}</p>
            <strong>{product.price}</strong>
            <dl>
              <div><dt>Bulk MOQ</dt><dd>{product.bulkMoq} units</dd></div>
              <div><dt>Bulk unit</dt><dd>S${product.bulkUnitPrice.toFixed(2)}</dd></div>
              <div><dt>Route</dt><dd>Shopee or PayPal bulk checkout</dd></div>
            </dl>
            <div className="v23-actions">
              <a href={product.shopee} target="_blank" rel="noreferrer">Buy on Shopee ↗</a>
              <Link to={`/bulk-orders?product=${product.slug}`}>Bulk checkout →</Link>
            </div>
          </div>
        </section>

        <section className="v23-product-detail-grid">
          <article>
            <p className="v23-eyebrow"><span /> GOOD FOR</p>
            <h2>{product.goodFor}</h2>
          </article>
          <article>
            <p className="v23-eyebrow"><span /> HIGHLIGHTS</p>
            <ul>{product.highlights.map((item) => <li key={item}>{item}</li>)}</ul>
          </article>
          <article>
            <p className="v23-eyebrow"><span /> HOW TO USE</p>
            <ol>{product.howTo.map((item) => <li key={item}>{item}</li>)}</ol>
          </article>
        </section>
      </main>
    </V23Page>
  );
}
