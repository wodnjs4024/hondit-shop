import { FormEvent, useEffect, useRef, useState } from "react";
import { adminFetch } from "../lib/bulkApi";
import { AdminNotice, AdminOrderTable } from "./AdminDashboardPage";

type OrderRow = {
  id: string;
  order_number: string;
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  company_name?: string | null;
  country_code?: string;
  address_line_1?: string;
  address_line_2?: string | null;
  city?: string;
  postal_code?: string;
  total_packs?: number;
  order_type: string;
  total_units: number;
  total_sgd: number;
  currency?: string;
  payment_status: string;
  order_status: string;
  paypal_order_id?: string | null;
  paypal_capture_id?: string | null;
  tracking_carrier?: string | null;
  tracking_number?: string | null;
  paid_at?: string | null;
  shipped_at?: string | null;
  created_at: string;
};

const paymentStatuses = ["", "pending", "completed", "pending_review", "failed", "cancelled", "refunded", "reversed"];
const orderStatuses = ["", "pending_payment", "paid", "address_check", "preparing", "packed", "shipped", "delivered", "cancelled", "refunded"];

export function AdminOrdersPage() {
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [filters, setFilters] = useState({ q: "", paymentStatus: "", orderStatus: "", orderType: "", from: "", to: "" });
  const [notificationStatus, setNotificationStatus] = useState(typeof Notification === "undefined" ? "unsupported" : Notification.permission);
  const knownOrderIds = useRef<Set<string>>(new Set());
  const hasLoadedOnce = useRef(false);
  const notificationStatusRef = useRef(notificationStatus);

  useEffect(() => {
    notificationStatusRef.current = notificationStatus;
  }, [notificationStatus]);

  const load = () => {
    const params = new URLSearchParams(Object.entries(filters).filter(([, value]) => value));
    adminFetch<{ orders: OrderRow[] }>(`/api/admin/orders?${params.toString()}`)
      .then((data) => {
        const nextIds = new Set(data.orders.map((order) => order.id));
        const newPaidOrders = data.orders.filter(
          (order) => hasLoadedOnce.current && !knownOrderIds.current.has(order.id) && order.payment_status === "completed",
        );
        setOrders(data.orders);
        setLastUpdated(new Date());
        knownOrderIds.current = nextIds;
        hasLoadedOnce.current = true;

        if (notificationStatusRef.current === "granted") {
          newPaidOrders.forEach((order) => {
            new Notification("New hondit order", {
              body: `${order.order_number} / ${order.customer_name} / S$${Number(order.total_sgd || 0).toFixed(2)}`,
            });
          });
        }
      })
      .catch((err) => setError(err.message));
  };

  const enableNotifications = async () => {
    if (typeof Notification === "undefined") {
      setNotificationStatus("unsupported");
      return;
    }
    const permission = await Notification.requestPermission();
    setNotificationStatus(permission);
  };

  useEffect(() => {
    load();
    const timer = window.setInterval(load, 30000);
    return () => window.clearInterval(timer);
  }, []);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    load();
  };

  const exportCsv = () => {
    const header = [
      "order_number",
      "created_at",
      "paid_at",
      "customer_name",
      "customer_email",
      "customer_phone",
      "company_name",
      "country_code",
      "address_line_1",
      "address_line_2",
      "city",
      "postal_code",
      "order_type",
      "total_packs",
      "total_units",
      "total_sgd",
      "currency",
      "payment_status",
      "order_status",
      "paypal_order_id",
      "paypal_capture_id",
      "tracking_carrier",
      "tracking_number",
      "shipped_at",
    ];
    const rows = orders.map((order) => header.map((key) => csvCell(order[key as keyof OrderRow])).join(","));
    downloadCsv(`hondit-orders-${Date.now()}.csv`, [header.join(","), ...rows].join("\n"));
  };

  if (error) return <AdminNotice message={error} />;

  return (
    <>
      <div className="admin-heading">
        <p className="eyebrow">ORDERS</p>
        <h1>Order management</h1>
        <p className="admin-muted">
          {orders.length} orders shown. Auto-refreshes every 30 seconds.
          {lastUpdated ? ` Last updated ${lastUpdated.toLocaleTimeString("en-SG")}.` : ""}
        </p>
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
        <button className="button button--ghost" type="button" onClick={load}>Refresh now</button>
        <button className="button button--ghost" type="button" onClick={enableNotifications}>
          {notificationStatus === "granted" ? "Browser alerts on" : "Enable browser alerts"}
        </button>
        <button className="button button--ghost" type="button" onClick={exportCsv}>Export Filtered Orders CSV</button>
      </form>
      <section className="admin-panel">
        <AdminOrderTable orders={orders} />
      </section>
    </>
  );
}

export function downloadCsv(filename: string, content: string) {
  const blob = new Blob([`\uFEFF${content}`], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function csvCell(value: unknown) {
  return JSON.stringify(String(value ?? ""));
}
