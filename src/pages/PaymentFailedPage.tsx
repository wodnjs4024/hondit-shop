import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { links } from "../data/siteData";
import { formatSgd } from "../data/bulkProducts";
import { fetchPublicOrder, type PublicOrder } from "../lib/bulkApi";
import { V23Page } from "../components/v23/SiteChrome";

export function PaymentFailedPage() {
  const { orderNumber = "" } = useParams();
  const [order, setOrder] = useState<PublicOrder | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!orderNumber) return;
    fetchPublicOrder(orderNumber)
      .then((data) => setOrder(data.order))
      .catch((orderError) => setError(orderError.message));
  }, [orderNumber]);

  const retryHref = useMemo(() => {
    const firstSlug = order?.items?.[0]?.product_slug;
    return firstSlug ? `/bulk-orders/${firstSlug}` : "/bulk-orders";
  }, [order]);

  return (
    <V23Page>
    <main className="bulk-page v23-operational-page">
      <section className="payment-failed section-shell">
        <div className="section-inner section-inner--narrow">
          <p className="eyebrow">PAYMENT NOT COMPLETED</p>
          <h1>Payment could not be completed.</h1>
          <p>You can:</p>
          <ol className="payment-failed__steps">
            <li>Try another PayPal account or card</li>
            <li>Contact hondit for assistance</li>
            <li>Purchase through Shopee SG</li>
          </ol>

          {error && <p className="form-error">{error}</p>}

          <div className="order-record-card payment-failed__record">
            <span>Order attempt</span>
            <strong>{orderNumber}</strong>
            {order && (
              <dl>
                <div><dt>Payment status</dt><dd>{order.payment_status}</dd></div>
                <div><dt>Failure reason</dt><dd>{order.payment_failure_reason || "Payment was not completed."}</dd></div>
                <div><dt>Total payment</dt><dd>{formatSgd(order.total_sgd)}</dd></div>
                <div><dt>Email</dt><dd>{order.customer_email || "-"}</dd></div>
              </dl>
            )}
          </div>

          <div className="bulk-card__actions">
            <Link className="button button--primary" to={retryHref}>Try Payment Again</Link>
            <Link className="button button--ghost" to="/contact">Contact hondit</Link>
            <a className="button button--quiet" href={links.shopeeStore} target="_blank" rel="noreferrer">Shop on Shopee SG</a>
          </div>
        </div>
      </section>
    </main>
    </V23Page>
  );
}
