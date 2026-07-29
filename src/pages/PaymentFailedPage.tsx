import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { V23Page } from "../components/v23/SiteChrome";
import { EMAIL } from "../data/v23SiteData";
import { fetchPublicOrder, type PublicOrder } from "../lib/bulkApi";
import { formatCurrency, marketText, useMarket } from "../lib/market";

function buildMailto(to: string, subject: string, lines: string[]) {
  return `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(lines.join("\n"))}`;
}

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

  const manualPaymentHref = useMemo(() => {
    const orderCurrency = order?.currency || market.currency;
    const productLines =
      order?.items?.map((item) => {
        const lineTotal = formatCurrency(item.line_total_sgd, orderCurrency, market.locale);
        return `- ${item.product_name_snapshot} ${item.volume_snapshot || ""}: ${item.total_units} units / ${lineTotal}`;
      }) || [];
    const shippingAddress = [
      order?.address_line_1,
      order?.address_line_2,
      order?.city,
      order?.country_code || market.countryName,
      order?.postal_code,
    ]
      .filter(Boolean)
      .join(", ");

    return buildMailto(EMAIL, `[hondit] Manual PayPal link request - ${orderNumber || "order attempt"}`, [
      "Hello hondit,",
      "",
      "PayPal/card checkout did not complete. Please send me a direct PayPal payment link for this order.",
      "",
      `Order number: ${orderNumber || "-"}`,
      `Market: ${market.label} / ${orderCurrency}`,
      `Total payment: ${order ? formatCurrency(order.total_sgd, orderCurrency, market.locale) : "-"}`,
      "Products:",
      ...(productLines.length ? productLines : ["-"]),
      "",
      `Name: ${order?.customer_name || "-"}`,
      `Email: ${order?.customer_email || "-"}`,
      `Phone / WhatsApp: ${order?.customer_phone || "-"}`,
      `Company: ${order?.company_name || "-"}`,
      `Shipping address: ${shippingAddress || "-"}`,
      `Failure reason: ${order?.payment_failure_reason || "Payment was not completed."}`,
      "",
      "Please reply with the PayPal payment link and next steps.",
    ]);
  }, [market, order, orderNumber]);

  return (
    <V23Page>
      <main className="bulk-page v23-operational-page">
        <section className="payment-failed section-shell">
          <div className="section-inner section-inner--narrow">
            <p className="eyebrow">PAYMENT NOT COMPLETED</p>
            <h1>{marketText(language, "Payment could not be completed.", "결제가 완료되지 않았습니다.")}</h1>
            <p>
              {marketText(
                language,
                "If PayPal or card checkout does not go through, email the purchase conditions to hondit. We will reply with a direct PayPal payment link.",
                "PayPal 또는 카드 결제가 진행되지 않으면 구매 조건을 hondit 메일로 보내주세요. 확인 후 직접 결제 가능한 PayPal 링크를 답장드립니다.",
              )}
            </p>
            <ol className="payment-failed__steps">
              <li>{marketText(language, "Review the product, quantity and total payment.", "상품, 수량, 총 결제액을 확인합니다.")}</li>
              <li>{marketText(language, "Email the purchase conditions to hondit.", "구매 조건을 hondit 메일로 보냅니다.")}</li>
              <li>{marketText(language, "Complete payment from the PayPal link we send back.", "답장으로 받은 PayPal 링크에서 결제를 완료합니다.")}</li>
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
              <Link className="button button--primary" to={retryHref}>
                {marketText(language, "Try Payment Again", "결제 다시 시도")}
              </Link>
              <a className="button button--ghost" href={manualPaymentHref}>
                {marketText(language, "Email Purchase Conditions", "구매조건 메일 보내기")}
              </a>
              <Link className="button button--quiet" to="/contact">
                {marketText(language, "Contact hondit", "hondit 문의")}
              </Link>
            </div>
          </div>
        </section>
      </main>
    </V23Page>
  );
}
