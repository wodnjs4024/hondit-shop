import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { SHOPEE } from "../data/v23SiteData";
import { fetchPublicOrder, type PublicOrder } from "../lib/bulkApi";
import { V23Page } from "../components/v23/SiteChrome";
import { formatCurrency, marketText, useMarket } from "../lib/market";

export function PaymentFailedPage() {
  const { orderNumber = "" } = useParams();
  const { market, language } = useMarket();
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
            <h1>{marketText(language, "Payment could not be completed.", "결제가 완료되지 않았습니다.")}</h1>
            <p>{marketText(language, "You can:", "다음 방법을 이용할 수 있습니다.")}</p>
            <ol className="payment-failed__steps">
              <li>{marketText(language, "Try another PayPal account or card", "다른 PayPal 계정 또는 카드로 다시 시도")}</li>
              <li>{marketText(language, "Contact hondit for assistance", "hondit에 문의")}</li>
              {market.hasShopee && <li>{marketText(language, `Purchase through Shopee ${market.shortLabel}`, `${market.koreanLabel} Shopee 구매로 전환`)}</li>}
            </ol>

            {error && <p className="form-error">{error}</p>}

            <div className="order-record-card payment-failed__record">
              <span>{marketText(language, "Order attempt", "주문 시도")}</span>
              <strong>{orderNumber}</strong>
              {order && (
                <dl>
                  <div><dt>Payment status</dt><dd>{order.payment_status}</dd></div>
                  <div><dt>Failure reason</dt><dd>{order.payment_failure_reason || "Payment was not completed."}</dd></div>
                  <div><dt>Total payment</dt><dd>{formatCurrency(order.total_sgd, order.currency || market.currency, market.locale)}</dd></div>
                  <div><dt>Email</dt><dd>{order.customer_email || "-"}</dd></div>
                </dl>
              )}
            </div>

            <div className="bulk-card__actions">
              <Link className="button button--primary" to={retryHref}>{marketText(language, "Try Payment Again", "결제 다시 시도")}</Link>
              <Link className="button button--ghost" to="/contact">{marketText(language, "Contact hondit", "hondit 문의")}</Link>
              {market.hasShopee && (
                <a className="button button--quiet" href={SHOPEE} target="_blank" rel="noreferrer">
                  {marketText(language, `Shop on Shopee ${market.shortLabel}`, `${market.koreanLabel} Shopee 구매`)}
                </a>
              )}
            </div>
          </div>
        </section>
      </main>
    </V23Page>
  );
}
