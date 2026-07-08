import { Link } from "react-router-dom";
import { Footer } from "../sections/Footer";

const shippingRows = [
  {
    route: "Retail via Shopee",
    payment: "Shopee Singapore",
    origin: "Ships from Korea",
    area: "Shopee-supported destinations",
    estimate: "Operator to confirm exact delivery range",
    tracking: "Shopee order tracking",
    duties: "Operator to confirm customs/import tax responsibility",
  },
  {
    route: "Bulk via PayPal",
    payment: "PayPal checkout on hondit",
    origin: "Prepared for Singapore EMS",
    area: "Singapore only",
    estimate: "Operator to confirm exact delivery range",
    tracking: "EMS tracking number entered by admin after shipment",
    duties: "Operator to confirm if any additional import handling applies",
  },
];

export function ShippingPage() {
  return (
    <>
      <main className="bulk-page">
        <section className="policy-page section-shell">
          <div className="section-inner section-inner--wide">
            <p className="eyebrow">SHIPPING</p>
            <h1>Retail and bulk shipping routes.</h1>
            <p>Final shipping dates, tracking process and customs notes should be confirmed by the operator before launch.</p>
            <div className="shipping-table-wrap">
              <table className="shipping-table">
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
            <p className="setup-warning">Placeholder note: replace these operational estimates after shipping rules are finalized.</p>
            <Link className="button button--primary" to="/bulk-orders">View Bulk Orders</Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
