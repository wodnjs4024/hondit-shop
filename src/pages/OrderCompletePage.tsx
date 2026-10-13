import {v23Products} from "../data/v23SiteData";
import { marketText, useMarket } from "../lib/market";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { fetchPublicOrder, type PublicOrder } from "../lib/bulkApi";
import { trackEvent } from "../lib/analytics";
import { V23Page } from "../components/v23/SiteChrome";
import { formatCurrency, marketCountryName, markets } from "../lib/market";

export function OrderCompletePage() {
  const { language } = useMarket();
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
          checkout_stage: "purchase_complete",
          order_status: data.order.order_status,
          payment_status: data.order.payment_status,
          items: data.order.items.map((item) => ({
            item_id: item.product_slug || item.product_name_snapshot,
            item_name: item.product_name_snapshot,
            quantity: item.total_units,
            price: item.total_units ? item.line_total_sgd / item.total_units : 0,
          })),
        });
      })
      .catch((orderError) => setError(orderError.message));
  }, [orderNumber]);

  return (
    <V23Page>
    <main className="bulk-page v23-operational-page">
      <section className="order-complete section-shell">
        <div className="section-inner section-inner--narrow">
          <p className="eyebrow">{marketText(language,"ORDER COMPLETE")}</p>
          <h1>{marketText(language,"Your order is confirmed.")}</h1>
          <p>{marketText(language,"Your PayPal payment has been received. Please save your order number for future reference.")}</p>
          <p>{marketText(language,"If your email, phone number or shipping address is incorrect, contact hondit immediately with your order number before shipment.")}</p>

          {error && <p className="form-error">{marketText(language,error)}</p>}

          <div className="order-record-card">
            <span>{marketText(language,"Order number")}</span>
            <strong>{orderNumber}</strong>
            {order && (
              <>
                <dl>
                  <div><dt>{marketText(language,"Payment status")}</dt><dd>{order.payment_status}</dd></div>
                  <div><dt>{marketText(language,"Order status")}</dt><dd>{order.order_status}</dd></div>
                  <div><dt>{marketText(language,"Total units")}</dt><dd>{order.total_units}</dd></div>
                  <div><dt>{marketText(language,"Total payment")}</dt><dd>{formatCurrency(order.total_sgd, order.currency || "SGD")}</dd></div>
                  <div><dt>{marketText(language,"Name")}</dt><dd>{order.customer_name || "-"}</dd></div>
                  <div><dt>{marketText(language,"Company")}</dt><dd>{order.company_name || "-"}</dd></div>
                  <div><dt>{marketText(language,"Email")}</dt><dd>{order.customer_email || "-"}</dd></div>
                  <div><dt>{marketText(language,"Phone")}</dt><dd>{order.customer_phone || "-"}</dd></div>
                  <div><dt>{marketText(language,"Market")}</dt><dd>{order.country_code && markets[order.country_code as keyof typeof markets] ? marketCountryName(markets[order.country_code as keyof typeof markets], language) : order.country_code || "-"}</dd></div>
                  <div>
                    <dt>{marketText(language,"Shipping address")}</dt>
                    <dd>{[order.address_line_1, order.address_line_2, order.city, order.postal_code].filter(Boolean).join(", ")}</dd>
                  </div>
                </dl>
                <div className="order-items-compact">
                  {order.items.map((item) => (
                    <p key={`${item.product_name_snapshot}-${item.volume_snapshot}`}>
                      {item.product_name_snapshot} {item.volume_snapshot} / {item.total_units}{marketText(language,"units")}</p>
                  ))}
                </div>
              </>
            )}
          </div>

          {order&&<section><h2>{marketText(language,"Product care & follow-up")}</h2>{v23Products.filter(p=>order.items.some(item=>item.product_slug===p.slug)).map(p=><p key={p.slug}><Link to={`/guide/${p.slug}`}>{marketText(language,p.name)} →</Link></p>)}</section>}
          <div className="bulk-card__actions">
            <Link className="button button--primary" to="/bulk-orders">{marketText(language,"Continue Shopping")}</Link>
            <Link className="button button--ghost" to="/contact">{marketText(language,"Contact hondit")}</Link>
            <button className="button button--quiet" type="button" onClick={() => window.print()}>{marketText(language,"Print Order Receipt")}</button>
          </div>
        </div>
      </section>
    </main>
    </V23Page>
  );
}
