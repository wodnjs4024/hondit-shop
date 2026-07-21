import { Link } from "react-router-dom";
import { Footer } from "../sections/Footer";

const shopeeStoreUrl = "https://shopee.sg/hondit.office.sg";

const shippingRows = [
  {
    route: "Retail via Shopee",
    payment: "Shopee Singapore",
    origin: "Ships from Korea",
    area: "Shopee-supported destinations",
    estimate: "5-10 days",
    tracking: "Shopee order tracking",
    duties: "Handled under Shopee Singapore order rules",
  },
  {
    route: "Bulk via PayPal",
    payment: "PayPal checkout on hondit",
    origin: "Prepared for Singapore EMS",
    area: "Singapore only",
    estimate: "3-5 days after dispatch",
    tracking: "EMS tracking number entered by admin after shipment",
    duties: "Singapore EMS shipping is included in the listed bulk price",
  },
];

const shippingSteps = [
  {
    label: "01",
    title: "Choose your route",
    copy: "Use Shopee for single items, live vouchers and marketplace checkout. Use Bulk Orders for larger direct PayPal checkout.",
  },
  {
    label: "02",
    title: "Confirm payment",
    copy: "Shopee confirms retail orders. hondit creates direct bulk orders only after server-verified PayPal capture.",
  },
  {
    label: "03",
    title: "Prepare from Korea",
    copy: "Orders are prepared from Korea. Bulk EMS delivery is already included in the listed unit price.",
  },
  {
    label: "04",
    title: "Track delivery",
    copy: "Retail tracking stays in Shopee. Bulk EMS tracking is added by the hondit admin team after dispatch.",
  },
];

export function ShippingPage() {
  return (
    <>
      <main className="approved-shipping-page">
        <section className="approved-shipping-hero">
          <div className="section-inner section-inner--wide approved-shipping-hero__inner">
            <p className="approved-kicker"><span>Delivery guide</span></p>
            <h1>Two delivery routes, clearly separated.</h1>
            <p>
              Retail orders follow Shopee Singapore delivery rules. Bulk orders are prepared for Singapore EMS after PayPal payment
              verification and dispatch.
            </p>
          </div>
        </section>

        <section className="approved-shipping-routes section-inner section-inner--wide">
          <article className="approved-shipping-card">
            <p className="approved-kicker"><span>Retail</span></p>
            <h2>Shop through Shopee SG.</h2>
            <p>Best for individual purchases, Shopee vouchers and marketplace buyer protection.</p>
            <dl>
              <div><dt>Delivery</dt><dd>5-10 days</dd></div>
              <div><dt>Tracking</dt><dd>Inside Shopee Singapore</dd></div>
              <div><dt>Payment</dt><dd>Shopee checkout</dd></div>
            </dl>
            <a className="approved-shipping-link" href={shopeeStoreUrl} target="_blank" rel="noreferrer">
              Shop on Shopee SG ↗
            </a>
          </article>

          <article className="approved-shipping-card approved-shipping-card--dark">
            <p className="approved-kicker"><span>Bulk order</span></p>
            <h2>Direct checkout for larger quantities.</h2>
            <p>Best for business, group, hospitality or reseller orders shipped within Singapore.</p>
            <dl>
              <div><dt>Delivery</dt><dd>3-5 days after dispatch</dd></div>
              <div><dt>Tracking</dt><dd>EMS tracking added by admin</dd></div>
              <div><dt>Payment</dt><dd>PayPal or eligible card</dd></div>
            </dl>
            <Link className="approved-shipping-link" to="/bulk-orders">
              Open bulk checkout →
            </Link>
          </article>
        </section>

        <section className="approved-shipping-details">
          <div className="section-inner section-inner--wide">
            <div className="approved-shipping-details__head">
              <p className="approved-kicker"><span>Shipping comparison</span></p>
              <h2>Know where each order is handled.</h2>
              <p>These rules keep retail marketplace orders and direct bulk orders easy to tell apart.</p>
            </div>
            <div className="approved-shipping-table-wrap">
              <table className="approved-shipping-table">
                <thead>
                  <tr>
                    <th>Route</th>
                    <th>Payment</th>
                    <th>Origin</th>
                    <th>Delivery area</th>
                    <th>Estimated time</th>
                    <th>Tracking</th>
                    <th>Duties / import tax</th>
                  </tr>
                </thead>
                <tbody>
                  {shippingRows.map((row) => (
                    <tr key={row.route}>
                      <td>{row.route}</td>
                      <td>{row.payment}</td>
                      <td>{row.origin}</td>
                      <td>{row.area}</td>
                      <td>{row.estimate}</td>
                      <td>{row.tracking}</td>
                      <td>{row.duties}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section className="approved-shipping-process">
          <div className="section-inner section-inner--wide approved-shipping-process__grid">
            <div>
              <p className="approved-kicker"><span>How it works</span></p>
              <h2>From order route to delivery update.</h2>
            </div>
            <div className="approved-shipping-step-list">
              {shippingSteps.map((step) => (
                <article key={step.label}>
                  <span>{step.label}</span>
                  <h3>{step.title}</h3>
                  <p>{step.copy}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
