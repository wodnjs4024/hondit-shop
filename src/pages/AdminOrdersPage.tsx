import { FormEvent, useEffect, useState } from "react";
import { adminFetch } from "../lib/bulkApi";
import { AdminNotice, AdminOrderTable } from "./AdminDashboardPage";

type OrderRow = {
  id: string;
  order_number: string;
  customer_name: string;
  customer_email: string;
  order_type: string;
  total_units: number;
  total_sgd: number;
  payment_status: string;
  order_status: string;
  created_at: string;
};

const paymentStatuses = ["", "pending", "completed", "pending_review", "failed", "cancelled", "refunded", "reversed"];
const orderStatuses = ["", "pending_payment", "paid", "preparing", "packed", "shipped", "delivered", "cancelled", "refunded"];

export function AdminOrdersPage() {
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({ q: "", paymentStatus: "", orderStatus: "", orderType: "", from: "", to: "" });

  const load = () => {
    const params = new URLSearchParams(Object.entries(filters).filter(([, value]) => value));
    adminFetch<{ orders: OrderRow[] }>(`/api/admin/orders?${params.toString()}`)
      .then((data) => setOrders(data.orders))
      .catch((err) => setError(err.message));
  };

  useEffect(load, []);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    load();
  };

  const exportCsv = () => {
    const header = ["order_number", "created_at", "customer_name", "customer_email", "order_type", "total_units", "total_sgd", "payment_status", "order_status"];
    const rows = orders.map((order) => header.map((key) => JSON.stringify(String(order[key as keyof OrderRow] ?? ""))).join(","));
    downloadCsv(`hondit-orders-${Date.now()}.csv`, [header.join(","), ...rows].join("\n"));
  };

  if (error) return <AdminNotice message={error} />;

  return (
    <>
      <div className="admin-heading">
        <p className="eyebrow">ORDERS</p>
        <h1>Order management</h1>
      </div>
      <form className="admin-filters" onSubmit={submit}>
        <input placeholder="Search order, customer or email" value={filters.q} onChange={(event) => setFilters({ ...filters, q: event.target.value })} />
        <input type="date" value={filters.from} onChange={(event) => setFilters({ ...filters, from: event.target.value })} />
        <input type="date" value={filters.to} onChange={(event) => setFilters({ ...filters, to: event.target.value })} />
        <select value={filters.paymentStatus} onChange={(event) => setFilters({ ...filters, paymentStatus: event.target.value })}>
          {paymentStatuses.map((status) => <option key={status} value={status}>{status || "All payment statuses"}</option>)}
        </select>
        <select value={filters.orderStatus} onChange={(event) => setFilters({ ...filters, orderStatus: event.target.value })}>
          {orderStatuses.map((status) => <option key={status} value={status}>{status || "All order statuses"}</option>)}
        </select>
        <input placeholder="Order type" value={filters.orderType} onChange={(event) => setFilters({ ...filters, orderType: event.target.value })} />
        <button className="button button--primary" type="submit">Apply</button>
        <button className="button button--ghost" type="button" onClick={exportCsv}>Export Filtered Orders CSV</button>
      </form>
      <section className="admin-panel">
        <AdminOrderTable orders={orders} />
      </section>
    </>
  );
}

export function downloadCsv(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
