import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  BULK_QTY_STEP,
  bulkProducts,
  formatSgd,
  getBulkMoq,
  getBulkTotal,
  type BulkProduct,
} from "../data/bulkProducts";
import { links } from "../data/siteData";
import { ExternalLink } from "../components/ExternalLink";
import { trackStoreClick } from "../lib/analytics";
import { fetchBulkProducts } from "../lib/bulkApi";
import { Footer } from "../sections/Footer";

const bulkProductOrder = ["diffuser-350g", "diffuser-500g", "foam-oil", "foaming-cleanser", "cleansing-water"];

const directSteps = [
  ["01", "Choose one product", "Each direct checkout is created for one product and its approved quantity."],
  ["02", "Confirm order details", "Review quantity, customer information and the Singapore delivery address."],
  ["03", "Pay through PayPal", "PayPal handles wallet or eligible card details; hondit does not store card data."],
  ["04", "Receive confirmation", "A completed capture creates the order record and confirmation number."],
];

const checkoutFaqs = [
  {
    question: "Can I pay without a PayPal account?",
    answer:
      "Eligible buyers may be offered credit or debit card payment by PayPal. Availability is determined by PayPal for each buyer and transaction.",
  },
  {
    question: "Can I mix products in one payment?",
    answer:
      "Direct checkout is currently created for one bulk product at a time. For mixed quantities, contact hondit before ordering.",
  },
  {
    question: "When is the order confirmed?",
    answer:
      "The order is confirmed only after PayPal capture is completed and hondit's server verifies the amount and currency.",
  },
  {
    question: "How long does delivery take?",
    answer:
      "Bulk orders are dispatched from Korea and delivery normally takes 3-5 days after dispatch for Singapore addresses.",
  },
];

function getBulkDisplayName(product: BulkProduct) {
  if (product.category === "diffuser") return `Volcanic Diffuser ${product.volumeLabel}`;
  const baseName = product.name.replace("J'essence ", "");
  return baseName.includes(product.volumeLabel) ? baseName : `${baseName} ${product.volumeLabel}`;
}

function getBulkCategoryLabel(product: BulkProduct) {
  return product.category === "diffuser" ? "SCENT" : "CARE";
}

export function BulkOrdersPage() {
  const [products, setProducts] = useState<BulkProduct[]>(bulkProducts);
  const [selectedSlug, setSelectedSlug] = useState("");

  useEffect(() => {
    fetchBulkProducts().then(setProducts);
  }, []);

  const visibleProducts = useMemo(
    () =>
      products
        .filter((product) => product.active && product.purchaseEnabled)
        .sort((a, b) => bulkProductOrder.indexOf(a.slug) - bulkProductOrder.indexOf(b.slug)),
    [products],
  );

  useEffect(() => {
    if (!selectedSlug && visibleProducts.length > 0) {
      setSelectedSlug(visibleProducts[0].slug);
    }
  }, [selectedSlug, visibleProducts]);

  const selectedProduct = visibleProducts.find((product) => product.slug === selectedSlug);

  return (
    <>
      <main className="approved-bulk-page">
        <section className="approved-bulk-hero">
          <div className="approved-bulk-hero__inner">
            <p className="approved-kicker">DIRECT BULK CHECKOUT</p>
            <h1>Choose a product. Pay securely with PayPal.</h1>
            <p>
              For business, community, hospitality and reseller orders in Singapore. Review MOQ and included EMS
              shipping, then complete payment through PayPal or an eligible international card.
            </p>
          </div>
        </section>

        <section className="approved-bulk-steps" aria-label="Bulk checkout steps">
          {directSteps.map(([number, title, body]) => (
            <article key={number}>
              <strong>{number}</strong>
              <div>
                <h2>{title}</h2>
                <p>{body}</p>
              </div>
            </article>
          ))}
        </section>

        <section className="approved-bulk-market">
          <div className="approved-bulk-market__head">
            <div>
              <p className="approved-kicker">MOQ & PRICING</p>
              <h2>Select a bulk product</h2>
              <p>
                Current bulk prices include Singapore EMS shipping. Final stock and checkout availability are confirmed
                on the payment page.
              </p>
            </div>
            <aside className="approved-paypal-note" aria-label="Secure checkout">
              <span>SECURE CHECKOUT</span>
              <p>PayPal wallet - eligible credit/debit card</p>
              <strong>PayPal</strong>
            </aside>
          </div>

          <div className="approved-bulk-market__grid">
            <div className="approved-bulk-list" aria-label="Bulk product list">
              {visibleProducts.map((product) => {
                const moq = getBulkMoq(product);
                return (
                  <article
                    className={`approved-bulk-row ${selectedSlug === product.slug ? "is-selected" : ""}`}
                    key={product.slug}
                    onClick={() => setSelectedSlug(product.slug)}
                    onMouseEnter={() => setSelectedSlug(product.slug)}
                    onFocus={() => setSelectedSlug(product.slug)}
                  >
                    <img src={product.imageUrl} alt="" width="140" height="140" loading="lazy" decoding="async" />
                    <div>
                      <span>{getBulkCategoryLabel(product)}</span>
                      <h3>{getBulkDisplayName(product)}</h3>
                      <p>{product.shortDescription}</p>
                      <div className="approved-bulk-row__meta">
                        <strong>{formatSgd(product.unitPriceSgd)} / unit</strong>
                        <em>MOQ {moq}</em>
                        <em>add in {BULK_QTY_STEP}s</em>
                      </div>
                      <p className="approved-bulk-row__minimum">Minimum order: {formatSgd(getBulkTotal(product, moq))}</p>
                    </div>
                    <Link className="approved-bulk-row__button" to={`/bulk-orders/${product.slug}`}>
                      Select product
                    </Link>
                  </article>
                );
              })}
            </div>

            <aside className="approved-direct-card" aria-label="Direct order summary">
              <p className="approved-kicker">DIRECT ORDER</p>
              <span className="approved-direct-card__line" />
              {selectedProduct ? (
                <div className="approved-direct-card__selected">
                  <small>Selected product</small>
                  <h3>{getBulkDisplayName(selectedProduct)}</h3>
                  <p>
                    MOQ {getBulkMoq(selectedProduct)} - {formatSgd(selectedProduct.unitPriceSgd)} per unit
                  </p>
                  <strong>{formatSgd(getBulkTotal(selectedProduct, getBulkMoq(selectedProduct)))}</strong>
                  <p>Singapore EMS shipping is included. Delivery 3-5 days after dispatch.</p>
                  <Link to={`/bulk-orders/${selectedProduct.slug}`}>Continue to checkout</Link>
                </div>
              ) : (
                <div className="approved-direct-card__empty">
                  <h3>Select a product to continue.</h3>
                  <p>The checkout route, minimum amount and delivery summary will appear here.</p>
                </div>
              )}
              <div className="approved-direct-card__trust">
                <h3>Server-verified payment</h3>
                <p>
                  The production checkout creates and captures PayPal orders through hondit's server. Secret credentials
                  are never placed in page code.
                </p>
              </div>
            </aside>
          </div>
        </section>

        <section className="approved-bulk-faq">
          <div>
            <p className="approved-kicker">BEFORE PAYMENT</p>
            <h2>What direct checkout means.</h2>
          </div>
          <div className="approved-bulk-faq__items">
            {checkoutFaqs.map((item, index) => (
              <details key={item.question} open={index === 0}>
                <summary>{item.question}</summary>
                <p>{item.answer}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="approved-bulk-shopee">
          <div>
            <p className="approved-kicker">ORDERING ONLY ONE OR TWO?</p>
            <h2>Shopee may be the easier route.</h2>
          </div>
          <ExternalLink href={links.shopeeStore} onClick={() => trackStoreClick("bulk_shopee_fallback")}>
            Compare individual products
          </ExternalLink>
        </section>
      </main>
      <Footer />
    </>
  );
}
