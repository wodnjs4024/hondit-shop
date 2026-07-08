import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { adminFetch } from "../lib/bulkApi";
import { formatSgd } from "../data/bulkProducts";

type DashboardOrder = {
  id: string;
  order_number: string;
  customer_name: string;
  order_type: string;
  total_units: number;
  total_sgd: number;
  payment_status: string;
  order_status: string;
  created_at: string;
};

type Summary = {
  totals: Record<string, number>;
  popularProducts?: Array<{ label: string; count: number; units: number; revenueSgd: number }>;
  countries?: Array<{ label: string; count: number; units: number; revenueSgd: number }>;
  sources?: Array<{ label: string; count: number; units: number; revenueSgd: number }>;
  recentOrders: DashboardOrder[];
  checkoutAttempts?: DashboardOrder[];
};

export function AdminDashboardPage() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const load = () => {
    adminFetch<Summary>("/api/admin/summary")
      .then((data) => {
        setSummary(data);
        setLastUpdated(new Date());
      })
      .catch((err) => setError(err.message));
  };

  useEffect(() => {
    load();
    const timer = window.setInterval(load, 30000);
    return () => window.clearInterval(timer);
  }, []);

  if (error) return <AdminNotice message={error} />;

  const totals = summary?.totals || {};
  const cards = [
    ["Paid orders", totals.totalOrders || 0],
    ["Unpaid checkout attempts", totals.checkoutAttempts || 0],
    ["Paid", totals.paid || 0],
    ["Preparing", totals.preparing || 0],
    ["Packed", totals.packed || 0],
    ["Shipped", totals.shipped || 0],
    ["Delivered", totals.delivered || 0],
    ["Cancelled / refunded", totals.closed || 0],
    ["Total paid SGD", formatSgd(totals.totalPaidSgd || 0)],
  ];

  return (
    <>
      <div className="admin-heading">
        <p className="eyebrow">ADMIN DASHBOARD</p>
        <h1>Bulk order operations</h1>
        <p className="admin-muted">
          Auto-refreshes every 30 seconds.
          {lastUpdated ? ` Last updated ${lastUpdated.toLocaleTimeString("en-SG")}.` : ""}
        </p>
        <button className="button button--ghost" type="button" onClick={load}>Refresh now</button>
      </div>
      <div className="admin-stat-grid">
        {cards.map(([label, value]) => (
          <article key={label}>
            <span>{label}</span>
            <strong>{value}</strong>
          </article>
        ))}
      </div>
      <section className="admin-panel">
        <h2>Recent paid orders</h2>
        <p className="admin-muted">Only completed PayPal payments appear here and count toward sales.</p>
        <AdminOrderTable orders={summary?.recentOrders || []} />
      </section>
      <section className="admin-panel">
        <h2>Unpaid checkout attempts</h2>
        <p className="admin-muted">
          These customers opened PayPal checkout but did not complete payment. Do not prepare or ship these orders.
        </p>
        <AdminOrderTable orders={summary?.checkoutAttempts || []} />
      </section>
      <div className="admin-detail-grid">
        <AdminInsightTable title="Popular products" rows={summary?.popularProducts || []} valueLabel="Units" />
        <AdminInsightTable title="Customer countries" rows={summary?.countries || []} valueLabel="Orders" />
      </div>
      <AdminInsightTable title="Traffic sources" rows={summary?.sources || []} valueLabel="Orders" />
    </>
  );
}

export function AdminNotice({ message }: { message: string }) {
  return (
    <div className="admin-panel">
      <h1>Setup required</h1>
      <p>{message}</p>
    </div>
  );
}

export function AdminOrderTable({ orders }: { orders: DashboardOrder[] }) {
  if (!orders.length) return <p>No orders yet.</p>;

  return (
    <div className="admin-table-wrap">
      <table className="admin-table">
        <thead>
          <tr>
            <th>Order number</th>
            <th>Date</th>
            <th>Customer</th>
            <th>Type</th>
            <th>Units</th>
            <th>Total</th>
            <th>Payment</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id}>
              <td><Link to={`/admin/orders/${order.id}`}>{order.order_number}</Link></td>
              <td>{new Date(order.created_at).toLocaleDateString("en-SG")}</td>
              <td>{order.customer_name}</td>
              <td>{order.order_type}</td>
              <td>{order.total_units}</td>
              <td>{formatSgd(order.total_sgd)}</td>
              <td>{order.payment_status}</td>
              <td>{order.order_status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function AdminInsightTable({ title, rows, valueLabel }: { title: string; rows: Array<{ label: string; count: number; units: number; revenueSgd: number }>; valueLabel: string }) {
  return (
    <section className="admin-panel admin-insight">
      <h2>{title}</h2>
      {rows.length ? (
        <table className="admin-table admin-table--compact">
          <thead><tr><th>Name</th><th>{valueLabel}</th><th>Revenue</th></tr></thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.label}>
                <td>{row.label}</td>
                <td>{valueLabel === "Units" ? row.units : row.count}</td>
                <td>{formatSgd(row.revenueSgd)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : <p>No data yet.</p>}
    </section>
  );
}
