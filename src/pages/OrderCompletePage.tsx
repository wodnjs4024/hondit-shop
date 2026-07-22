import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { formatSgd } from "../data/bulkProducts";
import { fetchPublicOrder, type PublicOrder } from "../lib/bulkApi";
import { trackEvent } from "../lib/analytics";
import { V23Page } from "../components/v23/SiteChrome";

export function OrderCompletePage() {
  const { orderNumber = "" } = useParams();
  const [order, setOrder] = useState<PublicOrder | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!orderNumber) return;
    fetchPublicOrder(orderNumber)
      .then((data) => {
        setOrder(data.order);
        trackEvent("purchase", {
          transaction_id: data.order.order_number,
          value: data.order.total_sgd,
          currency: data.order.currency || "SGD",
        });
      })
      .catch((orderError) => setError(orderError.message));
  }, [orderNumber]);

  return (
    <V23Page>
    <main className="bulk-page v23-operational-page">
      <section className="order-complete section-shell">
        <div className="section-inner section-inner--narrow">
          <p className="eyebrow">ORDER COMPLETE</p>
          <h1>Your order is confirmed.</h1>
          <p>Your PayPal payment has been received. Please save your order number for future reference.</p>
          <p>If your email, phone number or shipping address is incorrect, contact hondit immediately with your order number before shipment.</p>

          {error && <p className="form-error">{error}</p>}

          <div className="order-record-card">
            <span>Order number</span>
            <strong>{orderNumber}</strong>
            {order && (
              <>
                <dl>
                  <div><dt>Payment status</dt><dd>{order.payment_status}</dd></div>
                  <div><dt>Order status</dt><dd>{order.order_status}</dd></div>
                  <div><dt>Total units</dt><dd>{order.total_units}</dd></div>
                  <div><dt>Total payment</dt><dd>{formatSgd(order.total_sgd)}</dd></div>
                  <div><dt>Name</dt><dd>{order.customer_name || "-"}</dd></div>
                  <div><dt>Email</dt><dd>{order.customer_email || "-"}</dd></div>
                  <div><dt>Phone</dt><dd>{order.customer_phone || "-"}</dd></div>
                  <div>
                    <dt>Shipping address</dt>
                    <dd>{[order.address_line_1, order.address_line_2, order.city, order.postal_code].filter(Boolean).join(", ")}</dd>
                  </div>
                </dl>
                <div className="order-items-compact">
                  {order.items.map((item) => (
                    <p key={`${item.product_name_snapshot}-${item.volume_snapshot}`}>
                      {item.product_name_snapshot} {item.volume_snapshot} / {item.total_units} units
                    </p>
                  ))}
                </div>
              </>
            )}
          </div>

          <div className="bulk-card__actions">
            <Link className="button button--primary" to="/bulk-orders">Continue Shopping</Link>
            <Link className="button button--ghost" to="/contact">Contact hondit</Link>
            <button className="button button--quiet" type="button" onClick={() => window.print()}>Print Order Receipt</button>
          </div>
        </div>
      </section>
    </main>
    </V23Page>
  );
}
