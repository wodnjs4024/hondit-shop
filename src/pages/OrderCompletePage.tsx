import {getAnalyticsConsent,subscribeAnalyticsConsent} from '../lib/analyticsConsent';
import {OrderLookupNotice} from '../components/OrderLookupNotice';
import {v23Products} from "../data/v23SiteData";
import { marketText, useMarket } from "../lib/market";
import { useEffect, useState, useSyncExternalStore } from "react";
import { Link, useParams } from "react-router-dom";
import { fetchPublicOrder, type PublicOrder } from "../lib/bulkApi";
import { trackPurchaseOnce } from "../lib/analytics";
import { V23Page } from "../components/v23/SiteChrome";
import { formatCurrency, marketCountryName, markets } from "../lib/market";

export function OrderCompletePage() {
  const { language } = useMarket();
  const consent=useSyncExternalStore(subscribeAnalyticsConsent,getAnalyticsConsent,()=> 'unset' as const);
  const { orderNumber = "" } = useParams();
  const [order, setOrder] = useState<PublicOrder | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!orderNumber) return;
    setOrder(null);setError("");let active=true;
    fetchPublicOrder(orderNumber)
      .then((data) => {
        if(!active)return;setOrder(data.order);

      })
      .catch((orderError) => {if(active)setError(orderError.message);});
    return ()=>{active=false;};
  }, [orderNumber]);

  useEffect(()=>{if(!order)return;
        if(order.payment_status === "completed") trackPurchaseOnce(order.order_number, {
          transaction_id: order.order_number,
          value: order.total_sgd,
          currency: order.currency || "SGD",
          checkout_stage: "purchase_complete",
          order_status: order.order_status,
          payment_status: order.payment_status,
          items: order.items.map((item) => ({
            item_id: item.product_slug || item.product_name_snapshot,
            item_name: item.product_name_snapshot,
            quantity: item.total_units,
            price: item.total_units ? item.line_total_sgd / item.total_units : 0,
          })),
        });
  },[order,consent]);

  if(!order)return <V23Page><OrderLookupNotice orderNumber={orderNumber} loading={!error}/></V23Page>;
  return (
    <V23Page>
    <main className="bulk-page v23-operational-page">
      <section className="order-complete section-shell">
        <div className="section-inner section-inner--narrow">
          <p className="eyebrow">{marketText(language,order?.payment_status === "completed"?"ORDER COMPLETE":"Payment verification pending")}</p>
          <h1>{marketText(language,order?.payment_status === "completed"?"Your order is confirmed.":"Payment verification pending")}</h1>
          <p>{marketText(language,order?.payment_status === "completed"?"Your PayPal payment has been received. Please save your order number for future reference.":"We could not confirm the payment status. Do not pay again; contact HONDIT with your order reference.")}</p>
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
                  <div><dt>{marketText(language,"Market")}</dt><dd>{order.country_code && markets[order.country_code as keyof typeof markets] ? marketCountryName(markets[order.country_code as keyof typeof markets], language) : order.country_code || "-"}</dd></div>
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
            <button disabled={order?.payment_status!=="completed"} className="button button--quiet" type="button" onClick={() => window.print()}>{marketText(language,"Print Order Receipt")}</button>
          </div>
        </div>
      </section>
    </main>
    </V23Page>
  );
}
