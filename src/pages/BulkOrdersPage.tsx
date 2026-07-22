import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { V23Page, V23PageHero } from "../components/v23/SiteChrome";
import { v23Products, type StorefrontProduct } from "../data/v23SiteData";
import { loadStorefrontProducts } from "../lib/storefrontApi";

export function BulkOrdersPage() {
  const [params] = useSearchParams();
  const [products, setProducts] = useState<StorefrontProduct[]>(v23Products);
  const requested = params.get("product") || products[0]?.slug || "";
  const [selectedSlug, setSelectedSlug] = useState(requested);

  useEffect(() => {
    loadStorefrontProducts().then((items) => {
      setProducts(items);
      if (!selectedSlug && items[0]) setSelectedSlug(items[0].slug);
    }).catch(() => undefined);
  }, [selectedSlug]);

  useEffect(() => {
    if (requested) setSelectedSlug(requested);
  }, [requested]);

  const selected = useMemo(() => products.find((product) => product.slug === selectedSlug) || products[0], [products, selectedSlug]);

  return (
    <V23Page>
      <main className="v23-bulk-page">
        <V23PageHero
          eyebrow="DIRECT BULK CHECKOUT"
          title="Build the order. Pay securely with PayPal."
          description="Choose a product, review its MOQ and SGD total, add Singapore delivery details and continue to PayPal. Sandbox stays server-verified, so secret keys are never exposed in the browser."
          image="/images/hondit-collection-hero.webp"
          imageAlt="hondit care and volcanic diffuser collection prepared for ordering."
        />
        <section className="v23-bulk-steps">
          <article><span>01</span><b>Choose one product</b><p>MOQ and approved quantity increments are checked automatically.</p></article>
          <article><span>02</span><b>Add delivery details</b><p>Required Singapore delivery information is saved only with the order.</p></article>
          <article><span>03</span><b>Pay in sandbox</b><p>The existing server creates and captures PayPal orders.</p></article>
          <article><span>04</span><b>Manage the order</b><p>The result appears in hondit's protected admin console.</p></article>
        </section>

        <section className="v23-bulk-checkout">
          <div className="v23-bulk-list">
            <p className="v23-eyebrow"><span /> 01 - PRODUCT</p>
            <h2>Choose a bulk product.</h2>
            {products.map((product) => (
              <button key={product.slug} type="button" className={selected?.slug === product.slug ? "is-selected" : ""} onClick={() => setSelectedSlug(product.slug)}>
                <img src={product.image} alt="" />
                <span><small>{product.category}</small><b>{product.shortName}</b><em>S${product.bulkUnitPrice.toFixed(2)} each - MOQ {product.bulkMoq}</em></span>
              </button>
            ))}
          </div>
          <aside className="v23-bulk-summary">
            {selected && (
              <>
                <p className="v23-eyebrow"><span /> PAYPAL CHECKOUT</p>
                <img src={selected.image} alt={selected.name} />
                <h2>{selected.name}</h2>
                <dl>
                  <div><dt>Minimum</dt><dd>{selected.bulkMoq} units</dd></div>
                  <div><dt>Unit price</dt><dd>S${selected.bulkUnitPrice.toFixed(2)}</dd></div>
                  <div><dt>Minimum total</dt><dd>S${(selected.bulkUnitPrice * selected.bulkMoq).toFixed(2)}</dd></div>
                  <div><dt>Delivery</dt><dd>Singapore EMS included</dd></div>
                </dl>
                <Link to={`/bulk-orders/${selected.apiSlug}`}>Continue to delivery and PayPal -&gt;</Link>
              </>
            )}
          </aside>
        </section>

        <section className="v23-route-banner">
          <h2>Need a mixed commercial order?</h2>
          <p>Use Contact for mixed quantities, special delivery instructions or a formal invoice request.</p>
          <Link to="/contact">Go to contact -&gt;</Link>
        </section>
      </main>
    </V23Page>
  );
}
