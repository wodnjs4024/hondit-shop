import { FormEvent, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
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

const orderStatuses = ["pending_payment", "paid", "preparing", "packed", "shipped", "delivered", "cancelled", "refunded"];

export function AdminOrderDetailPage() {
  const { orderId = "" } = useParams();
  const [detail, setDetail] = useState<AdminOrderDetail | null>(null);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ order_status: "paid", tracking_carrier: "", tracking_number: "", shipped_at: "", internal_note: "" });

  const load = () => {
    adminFetch<AdminOrderDetail>(`/api/admin/orders/${orderId}`)
      .then((data) => {
        setDetail(data);
        setForm({
          order_status: String(data.order.order_status || "paid"),
          tracking_carrier: String(data.order.tracking_carrier || ""),
          tracking_number: String(data.order.tracking_number || ""),
          shipped_at: String(data.order.shipped_at || "").slice(0, 10),
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

  if (error) return <AdminNotice message={error} />;
  if (!detail) return <AdminNotice message="Loading order..." />;

  const { order, items, paymentEvents, history } = detail;

  const exportOrderCsv = () => {
    downloadCsv(`hondit-order-${order.order_number}.csv`, evidence.replaceAll("\n", "\r\n"));
  };

  return (
    <>
      <div className="admin-heading">
        <p className="eyebrow">ORDER DETAIL</p>
        <h1>{order.order_number}</h1>
      </div>
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
        <h2>Shipping and status</h2>
        <label>Order status<select value={form.order_status} onChange={(event) => setForm({ ...form, order_status: event.target.value })}>{orderStatuses.map((status) => <option key={status}>{status}</option>)}</select></label>
        <label>Tracking carrier<input value={form.tracking_carrier} onChange={(event) => setForm({ ...form, tracking_carrier: event.target.value })} /></label>
        <label>Tracking number<input value={form.tracking_number} onChange={(event) => setForm({ ...form, tracking_number: event.target.value })} /></label>
        <label>Shipped date<input type="date" value={form.shipped_at} onChange={(event) => setForm({ ...form, shipped_at: event.target.value })} /></label>
        <label>Internal note<textarea value={form.internal_note} onChange={(event) => setForm({ ...form, internal_note: event.target.value })} /></label>
        <button className="button button--primary" type="submit">Save order status</button>
      </form>

      <section className="admin-panel">
        <h2>Payment events</h2>
        {paymentEvents.map((event) => <p key={String(event.id)}>{event.event_type} · {event.paypal_capture_id} · verified: {String(event.verified)}</p>)}
        <h2>Status history</h2>
        {history.map((entry) => <p key={String(entry.id)}>{entry.created_at}: {entry.previous_status} → {entry.new_status} {entry.note}</p>)}
      </section>
    </>
  );
}
