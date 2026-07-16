import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { BULK_QTY_STEP, bulkProducts, formatSgd, getBulkMoq, getBulkTotal, type BulkProduct } from "../data/bulkProducts";
import { honditImages } from "../data/siteData";
import { fetchBulkProducts } from "../lib/bulkApi";
import { Footer } from "../sections/Footer";

const businessUses = [
  ["Product Selection", "Five eligible bulk products only: two diffusers and three cleansing products."],
  ["Careful Packing", "Orders are prepared from Korea with product labels and quantities checked before shipment."],
  ["Direct Checkout", "Pay by PayPal or international card after confirming quantity and shipping details."],
  ["Singapore Delivery", "Free Singapore EMS shipping is included in the listed bulk price."],
];

export function BulkOrdersPage() {
  const [products, setProducts] = useState<BulkProduct[]>(bulkProducts);

  useEffect(() => {
    fetchBulkProducts().then(setProducts);
  }, []);

  const visibleProducts = useMemo(
    () =>
      products
        .filter((product) => product.active && product.purchaseEnabled)
        .sort((a, b) => a.sortOrder - b.sortOrder),
    [products],
  );

  const totalUnits = visibleProducts.reduce((sum, product) => sum + getBulkMoq(product), 0);

  return (
    <>
      <main className="editorial-page bulk-page bulk-page-v2">
        <section className="editorial-hero editorial-hero--bulk">
          <img className="editorial-hero__image" src={honditImages.fullLineShipping} alt="" width="1920" height="1080" loading="eager" decoding="async" />
          <div className="editorial-hero__copy">
            <p className="eyebrow">BULK ORDERS</p>
            <h1>Bulk Orders for Business</h1>
            <p>For larger quantities, retail testing, events and business enquiries. Select one of five eligible products and confirm the order directly.</p>
            <div className="bulk-hero-icons">
              {["5 eligible products", "SGD pricing", "Free Singapore EMS", "PayPal or card"].map((item) => (
                <span key={item}>{item}</span>
              ))}
            </div>
          </div>
        </section>

        <section className="editorial-section bulk-guide">
          <div className="editorial-container bulk-guide__grid">
            <article className="bulk-price-table">
              <h2>MOQ & Pricing Guide</h2>
              <p>Wholesale pricing for bulk orders. Free Singapore EMS shipping is included in the listed price.</p>
              <div className="bulk-table" role="table" aria-label="Bulk order price guide">
                <div role="row">
                  <strong>Product</strong>
                  <strong>MOQ</strong>
                  <strong>Unit Price</strong>
                  <strong>MOQ Total</strong>
                </div>
                {visibleProducts.map((product) => (
                  <Link role="row" to={`/bulk-orders/${product.slug}`} key={product.slug}>
                    <span>
                      <img src={product.imageUrl} alt="" loading="lazy" decoding="async" />
                      {product.name}
                    </span>
                    <span>{getBulkMoq(product)}</span>
                    <span>{formatSgd(product.unitPriceSgd)}</span>
                    <span>{formatSgd(getBulkTotal(product, getBulkMoq(product)))}</span>
                  </Link>
                ))}
              </div>
              <small>Prices are in SGD. Ordering directly here excludes Shopee marketplace fees.</small>
            </article>

            <aside className="quick-quote">
              <h2>Quick Quote</h2>
              <p>Select a product to choose quantity and checkout by PayPal or credit/debit card.</p>
              {visibleProducts.map((product) => (
                <Link to={`/bulk-orders/${product.slug}`} key={product.slug}>
                  <img src={product.imageUrl} alt="" loading="lazy" decoding="async" />
                  <span>{product.name}</span>
                  <strong>{getBulkMoq(product)}+</strong>
                </Link>
              ))}
              <div>
                <span>Total MOQ quantity</span>
                <strong>{totalUnits} units</strong>
              </div>
              <Link className="button button--dark" to="/contact">Request a Quote</Link>
            </aside>
          </div>
        </section>

        <section className="business-cards editorial-container">
          {businessUses.map(([title, body], index) => (
            <article key={title}>
              <img
                src={index === 0 ? honditImages.fullLineReal : index === 1 ? honditImages.fullLineShipping : index === 2 ? honditImages.cleansingTrio : honditImages.diffuser350Stone}
                alt=""
                loading="lazy"
                decoding="async"
              />
              <h3>{title}</h3>
              <p>{body}</p>
            </article>
          ))}
        </section>

        <section className="how-it-works">
          {[
            ["1", "Inquiry", "Share your requirements or choose a product."],
            ["2", "Quantity", "Select MOQ or increase in steps of 10."],
            ["3", "Payment", "Complete payment via PayPal or card."],
            ["4", "Delivery", "We prepare and deliver your order safely."],
          ].map(([number, title, body]) => (
            <article key={number}>
              <strong>{number}</strong>
              <h3>{title}</h3>
              <p>{body}</p>
            </article>
          ))}
        </section>
      </main>
      <Footer />
    </>
  );
}
