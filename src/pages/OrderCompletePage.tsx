import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { formatSgd } from "../data/bulkProducts";
import { fetchPublicOrder, type PublicOrder } from "../lib/bulkApi";
import { trackEvent } from "../lib/analytics";

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
    <main className="bulk-page">
      <section className="order-complete section-shell">
        <div className="section-inner section-inner--narrow">
          <p className="eyebrow">ORDER COMPLETE</p>
          <h1>Your order is confirmed.</h1>
          <p>Your PayPal payment has been received. Please save your order number for future reference.</p>

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
                  <div><dt>Shipping summary</dt><dd>Singapore, {order.city} {order.postal_code}</dd></div>
                </dl>
                <div className="order-items-compact">
                  {order.items.map((item) => (
                    <p key={`${item.product_name_snapshot}-${item.volume_snapshot}`}>
                      {item.product_name_snapshot} {item.volume_snapshot} · {item.total_units} units
                    </p>
                  ))}
                </div>
              </>
            )}
          </div>

          <div className="bulk-card__actions">
            <Link className="button button--primary" to="/bulk-orders">Continue Shopping</Link>
            <Link className="button button--ghost" to="/">Return to hondit</Link>
            <button className="button button--quiet" type="button" onClick={() => window.print()}>Print Order Receipt</button>
          </div>
        </div>
      </section>
    </main>
  );
}
