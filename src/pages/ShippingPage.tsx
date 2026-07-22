import { Link } from "react-router-dom";
import { V23Page, V23PageHero } from "../components/v23/SiteChrome";

export function ShippingPage() {
  return (
    <V23Page>
      <main className="v23-shipping-page">
        <V23PageHero
          eyebrow="SHIPPING TO SINGAPORE"
          title="Two order routes. Two clear delivery windows."
          description="Shopee orders typically take 5-10 days. Confirmed bulk shipments typically take 3-5 days after dispatch."
          image="/images/jeju-wind-coast-v2.webp"
          imageAlt="Wind moving through grasses on a Jeju coast."
        />
        <section className="v23-shipping-compare">
          <article>
            <p className="v23-eyebrow"><span /> INDIVIDUAL PURCHASE</p>
            <h2>Shop through Shopee SG</h2>
            <ul>
              <li>Typical delivery: 5-10 days</li>
              <li>Familiar Singapore checkout and payment methods</li>
              <li>Live vouchers and product availability</li>
              <li>Order tracking inside Shopee</li>
            </ul>
            <Link to="/products">Choose a product →</Link>
          </article>
          <article>
            <p className="v23-eyebrow"><span /> LARGER PURCHASE</p>
            <h2>Pay through PayPal</h2>
            <ul>
              <li>Typical delivery after dispatch: 3-5 days</li>
              <li>Product-specific MOQ and quantity steps</li>
              <li>Singapore EMS included in listed bulk prices</li>
              <li>Server-verified capture when merchant credentials are connected</li>
            </ul>
            <Link to="/bulk-orders">Open bulk checkout →</Link>
          </article>
        </section>
        <section className="v23-timing-notes">
          <div><p className="v23-eyebrow is-light"><span /> TIMING NOTES</p><h2>What can change the delivery date?</h2></div>
          <article><b>Dispatch day</b><p>Orders placed close to weekends or holidays may begin moving on the next working day.</p></article>
          <article><b>Customs and carrier handover</b><p>Inspection, flight capacity and local handover can add time.</p></article>
          <article><b>Bulk size and stock</b><p>Larger paid orders may require additional preparation before dispatch.</p></article>
          <article><b>Tracking</b><p>For Shopee purchases, use the order page. For a paid bulk order, use the EMS tracking details supplied after dispatch.</p></article>
        </section>
        <section className="v23-route-banner">
          <h2>Need help with an order?</h2>
          <p>Use Shopee chat for a Shopee transaction, or prepare a message for the hondit team.</p>
          <Link to="/contact">Go to contact →</Link>
        </section>
      </main>
    </V23Page>
  );
}
