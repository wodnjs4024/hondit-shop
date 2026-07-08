import { FormEvent, useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { formatSgd } from "../data/bulkProducts";
import { adminFetch } from "../lib/bulkApi";
import { AdminNotice } from "./AdminDashboardPage";
import { downloadCsv } from "./AdminOrdersPage";

type AdminOrderDetail = {
  order: Record<string, string | number | boolean | null>;
  items: Array<Record<string, string | number | null>>;
  paymentEvents: Array<Record<string, string | number | boolean | null>>;
  history: Array<Record<string, string | null>>;
};

const orderStatuses = ["pending_payment", "paid", "address_check", "preparing", "packed", "shipped", "delivered", "cancelled", "refunded"];

export function AdminOrderDetailPage() {
  const { orderId = "" } = useParams();
  const [detail, setDetail] = useState<AdminOrderDetail | null>(null);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    order_status: "paid",
    payment_status: "pending",
    customer_name: "",
    customer_email: "",
    customer_phone: "",
    company_name: "",
    address_line_1: "",
    address_line_2: "",
    city: "",
    postal_code: "",
    tracking_carrier: "",
    tracking_number: "",
    shipped_at: "",
    shipping_note: "",
    cancellation_reason: "",
    refund_reason: "",
    internal_note: "",
  });
  const [actionError, setActionError] = useState("");

  const load = () => {
    adminFetch<AdminOrderDetail>(`/api/admin/orders/${orderId}`)
      .then((data) => {
        setDetail(data);
        setForm({
          order_status: String(data.order.order_status || "paid"),
          payment_status: String(data.order.payment_status || "pending"),
          customer_name: String(data.order.customer_name || ""),
          customer_email: String(data.order.customer_email || ""),
          customer_phone: String(data.order.customer_phone || ""),
          company_name: String(data.order.company_name || ""),
          address_line_1: String(data.order.address_line_1 || ""),
          address_line_2: String(data.order.address_line_2 || ""),
          city: String(data.order.city || ""),
          postal_code: String(data.order.postal_code || ""),
          tracking_carrier: String(data.order.tracking_carrier || ""),
          tracking_number: String(data.order.tracking_number || ""),
          shipped_at: String(data.order.shipped_at || "").slice(0, 10),
          shipping_note: String(data.order.shipping_note || ""),
          cancellation_reason: String(data.order.cancellation_reason || ""),
          refund_reason: String(data.order.refund_reason || ""),
          internal_note: "",
        });
      })
      .catch((err) => setError(err.message));
  };

  useEffect(load, [orderId]);

  const evidence = useMemo(() => {
    if (!detail) return "";
    const { order, items } = detail;
    return [
      "Order Record",
      `Order number: ${order.order_number}`,
      `Order date: ${order.created_at}`,
      `Paid at: ${order.paid_at || ""}`,
      `Customer country: ${order.country_code}`,
      `Payment amount: ${formatSgd(Number(order.total_sgd || 0))}`,
      `Currency: ${order.currency}`,
      `PayPal order ID: ${order.paypal_order_id || ""}`,
      `PayPal capture ID: ${order.paypal_capture_id || ""}`,
      `Payment status: ${order.payment_status}`,
      `Order status: ${order.order_status}`,
      `Tracking carrier: ${order.tracking_carrier || ""}`,
      `Tracking number: ${order.tracking_number || ""}`,
      "",
      "Items",
      ...items.map((item) => `${item.product_name_snapshot} ${item.volume_snapshot} / ${item.pack_count} packs / ${item.total_units} units / ${formatSgd(Number(item.line_total_sgd || 0))}`),
    ].join("\n");
  }, [detail]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    await adminFetch(`/api/admin/orders/${orderId}`, {
      method: "PATCH",
      body: JSON.stringify(form),
    });
    load();
  };

  const refundPayPal = async () => {
    setActionError("");
    if (form.payment_status !== "completed") {
      setActionError("Only completed PayPal payments can be refunded.");
      return;
    }
    if (!detail?.order.paypal_capture_id) {
      setActionError("This order has no PayPal capture ID. It was not paid, so there is nothing to refund in PayPal.");
      return;
    }
    if (!window.confirm("Refund this order in PayPal? This should only be used when you really want to return the payment.")) return;
    const reason = form.refund_reason || form.internal_note || "Admin full refund";
    try {
      await adminFetch(`/api/admin/orders/${orderId}/refund`, {
        method: "POST",
        body: JSON.stringify({ reason }),
      });
      load();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Could not refund order.");
    }
  };

  const quickUpdate = async (order_status: string, payment_status = form.payment_status) => {
    const paid = form.payment_status === "completed";
    if (["paid", "address_check", "preparing", "packed", "shipped", "delivered"].includes(order_status) && !paid) {
      setActionError("This checkout has not been paid. Do not prepare, ship or mark it as paid.");
      return;
    }
    if (order_status === "cancelled" && !window.confirm("Cancel this unpaid checkout attempt? This will keep it out of active order operations.")) return;
    if (order_status === "refunded" && !window.confirm("Mark this order as refunded only if the refund was actually completed outside this screen.")) return;
    setActionError("");
    await adminFetch(`/api/admin/orders/${orderId}`, {
      method: "PATCH",
      body: JSON.stringify({
        ...form,
        order_status,
        payment_status,
        internal_note: form.internal_note || `Admin quick action: ${order_status}`,
      }),
    });
    load();
  };

  if (error) return <AdminNotice message={error} />;
  if (!detail) return <AdminNotice message="Loading order..." />;

  const { order, items, paymentEvents, history } = detail;
  const paymentStatus = String(order.payment_status || "");
  const orderStatus = String(order.order_status || "");
  const isPaid = paymentStatus === "completed";
  const isPending = paymentStatus === "pending";
  const isRefunded = paymentStatus === "refunded" || orderStatus === "refunded";
  const isCancelled = paymentStatus === "cancelled" || orderStatus === "cancelled";
  const hasPayPalCapture = Boolean(order.paypal_capture_id);
  const canFulfill = isPaid && !isRefunded && !isCancelled;
  const canCancelUnpaid = isPending && !isCancelled;
  const canRefundInPayPal = isPaid && hasPayPalCapture && !isRefunded;

  const exportOrderCsv = () => {
    downloadCsv(`hondit-order-${order.order_number}.csv`, evidence.replaceAll("\n", "\r\n"));
  };

  return (
    <>
      <div className="admin-heading">
        <p className="eyebrow">ORDER DETAIL</p>
        <h1>{order.order_number}</h1>
        <div className="admin-page-actions">
          <Link className="button button--ghost" to="/admin">Admin home</Link>
          <Link className="button button--ghost" to="/admin/orders">All orders</Link>
        </div>
      </div>
      <section className="admin-panel admin-action-panel">
        <div>
          <p className="eyebrow">OPERATIONS</p>
          <h2>Order control center</h2>
          {isPending ? (
            <p className="admin-muted">This customer opened PayPal checkout but did not complete payment. Do not prepare or ship this order.</p>
          ) : (
            <p className="admin-muted">Use these buttons only after PayPal payment is completed. Refunds require a PayPal capture ID.</p>
          )}
        </div>
        <div className="admin-action-grid">
          {canFulfill && (
            <>
              <button className="button button--ghost" type="button" onClick={() => quickUpdate("address_check", "completed")}>Address check</button>
              <button className="button button--ghost" type="button" onClick={() => quickUpdate("preparing", "completed")}>Start preparing</button>
              <button className="button button--ghost" type="button" onClick={() => quickUpdate("packed", "completed")}>Mark packed</button>
              <button className="button button--ghost" type="button" onClick={() => quickUpdate("shipped", "completed")}>Mark shipped</button>
              <button className="button button--ghost" type="button" onClick={() => quickUpdate("delivered", "completed")}>Mark delivered</button>
            </>
          )}
          {canCancelUnpaid && (
            <button className="button button--danger" type="button" onClick={() => quickUpdate("cancelled", "cancelled")}>Cancel unpaid attempt</button>
          )}
          {canRefundInPayPal && <button className="button button--danger" type="button" onClick={refundPayPal}>Refund in PayPal</button>}
        </div>
        {!canFulfill && !canCancelUnpaid && !canRefundInPayPal && (
          <p className="admin-muted">No direct action is available for this closed or unpaid record.</p>
        )}
        {actionError && <p className="form-error">{actionError}</p>}
      </section>
      <div className="admin-detail-grid">
        <section className="admin-panel">
          <h2>Customer and shipping</h2>
          <dl className="evidence-list">
            <div><dt>Name</dt><dd>{order.customer_name}</dd></div>
            <div><dt>Email</dt><dd>{order.customer_email}</dd></div>
            <div><dt>Phone</dt><dd>{order.customer_phone}</dd></div>
            <div><dt>Address</dt><dd>{order.address_line_1} {order.address_line_2} {order.city} {order.postal_code}</dd></div>
          </dl>
        </section>
        <section className="admin-panel">
          <h2>Payment record</h2>
          <dl className="evidence-list">
            <div><dt>Total</dt><dd>{formatSgd(Number(order.total_sgd || 0))}</dd></div>
            <div><dt>PayPal order ID</dt><dd>{order.paypal_order_id}</dd></div>
            <div><dt>PayPal capture ID</dt><dd>{order.paypal_capture_id}</dd></div>
            <div><dt>Payment status</dt><dd>{order.payment_status}</dd></div>
            <div><dt>Refunded at</dt><dd>{order.refunded_at || "-"}</dd></div>
          </dl>
        </section>
      </div>

      <section className="admin-panel">
        <h2>Items</h2>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead><tr><th>Product</th><th>Packs</th><th>Units</th><th>Total</th></tr></thead>
            <tbody>
              {items.map((item) => (
                <tr key={String(item.id)}>
                  <td>{item.product_name_snapshot} {item.volume_snapshot}</td>
                  <td>{item.pack_count}</td>
                  <td>{item.total_units}</td>
                  <td>{formatSgd(Number(item.line_total_sgd || 0))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="admin-panel order-evidence">
        <h2>Order Evidence</h2>
        <pre>{evidence}</pre>
        <div className="bulk-card__actions">
          <button className="button button--primary" type="button" onClick={() => window.print()}>Print Order Record</button>
          <button className="button button--ghost" type="button" onClick={exportOrderCsv}>Export Order CSV</button>
          <button className="button button--quiet" type="button" onClick={() => navigator.clipboard.writeText(String(order.order_number))}>Copy Order Number</button>
          <button className="button button--quiet" type="button" onClick={() => navigator.clipboard.writeText(String(order.paypal_capture_id || ""))}>Copy PayPal Capture ID</button>
        </div>
      </section>

      <form className="admin-panel admin-form" onSubmit={submit}>
        <h2>Customer, shipping and status</h2>
        <label>Customer name<input value={form.customer_name} onChange={(event) => setForm({ ...form, customer_name: event.target.value })} /></label>
        <label>Email<input value={form.customer_email} onChange={(event) => setForm({ ...form, customer_email: event.target.value })} /></label>
        <label>Phone<input value={form.customer_phone} onChange={(event) => setForm({ ...form, customer_phone: event.target.value })} /></label>
        <label>Company<input value={form.company_name} onChange={(event) => setForm({ ...form, company_name: event.target.value })} /></label>
        <label>Address line 1<input value={form.address_line_1} onChange={(event) => setForm({ ...form, address_line_1: event.target.value })} /></label>
        <label>Address line 2<input value={form.address_line_2} onChange={(event) => setForm({ ...form, address_line_2: event.target.value })} /></label>
        <label>City / District<input value={form.city} onChange={(event) => setForm({ ...form, city: event.target.value })} /></label>
        <label>Postal code<input value={form.postal_code} onChange={(event) => setForm({ ...form, postal_code: event.target.value })} /></label>
        <label>Order status<select value={form.order_status} onChange={(event) => setForm({ ...form, order_status: event.target.value })}>{orderStatuses.map((status) => <option key={status}>{status}</option>)}</select></label>
        <label>Payment status<select value={form.payment_status} onChange={(event) => setForm({ ...form, payment_status: event.target.value })}>
          {["pending", "completed", "pending_review", "failed", "cancelled", "refunded", "reversed"].map((status) => <option key={status}>{status}</option>)}
        </select></label>
        <label>Tracking carrier<input value={form.tracking_carrier} onChange={(event) => setForm({ ...form, tracking_carrier: event.target.value })} /></label>
        <label>Tracking number<input value={form.tracking_number} onChange={(event) => setForm({ ...form, tracking_number: event.target.value })} /></label>
        <label>Shipped date<input type="date" value={form.shipped_at} onChange={(event) => setForm({ ...form, shipped_at: event.target.value })} /></label>
        <label>Shipping note<textarea value={form.shipping_note} onChange={(event) => setForm({ ...form, shipping_note: event.target.value })} /></label>
        <label>Cancellation reason<textarea value={form.cancellation_reason} onChange={(event) => setForm({ ...form, cancellation_reason: event.target.value })} /></label>
        <label>Refund reason<textarea value={form.refund_reason} onChange={(event) => setForm({ ...form, refund_reason: event.target.value })} /></label>
        <label>Internal note<textarea value={form.internal_note} onChange={(event) => setForm({ ...form, internal_note: event.target.value })} /></label>
        <button className="button button--primary" type="submit">Save order status</button>
      </form>

      <section className="admin-panel">
        <h2>Payment events</h2>
        {paymentEvents.length ? (
          paymentEvents.map((event) => (
            <p key={String(event.id)}>{event.event_type} / {event.paypal_capture_id || "-"} / verified: {String(event.verified)}</p>
          ))
        ) : (
          <p>No payment events yet.</p>
        )}
        <h2>Status history</h2>
        {history.length ? (
          history.map((entry) => <p key={String(entry.id)}>{entry.created_at}: {entry.previous_status || "-"} -&gt; {entry.new_status} {entry.note}</p>)
        ) : (
          <p>No status changes yet.</p>
        )}
      </section>
    </>
  );
}

