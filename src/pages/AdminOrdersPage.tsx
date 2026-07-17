import { FormEvent, useEffect, useRef, useState } from "react";
import { adminFetch } from "../lib/bulkApi";
import {
  AdminNotice,
  AdminOrderTable,
  adminStatusLabel,
  orderStatusLabels,
  paymentStatusLabels,
  type DashboardOrder,
} from "./AdminDashboardPage";

type OrderRow = DashboardOrder & {
  customer_phone?: string;
  company_name?: string | null;
  country_code?: string;
  address_line_1?: string;
  address_line_2?: string | null;
  city?: string;
  postal_code?: string;
  total_packs?: number;
  currency?: string;
  paypal_capture_id?: string | null;
  tracking_carrier?: string | null;
  tracking_number?: string | null;
  paid_at?: string | null;
  shipped_at?: string | null;
};

const paymentStatuses = [
  "",
  "pending_payment",
  "payment_failed",
  "payment_cancelled",
  "completed",
  "pending_review",
  "failed",
  "cancelled",
  "refunded",
  "reversed",
];

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
        setError("");

        if (notificationStatusRef.current === "granted") {
          newPaidOrders.forEach((order) => {
            new Notification("hondit 새 결제 완료 주문", {
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
      "updated_at",
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
      "payment_failure_reason",
      "internal_note",
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
        <p className="eyebrow">주문 관리</p>
        <h1>주문 / 배송 / 환불</h1>
        <p className="admin-muted">
          현재 {orders.length}건이 표시됩니다. 30초마다 자동 새로고침됩니다.
          {lastUpdated ? ` 마지막 업데이트: ${lastUpdated.toLocaleTimeString("ko-KR")}` : ""}
        </p>
      </div>

      <section className="admin-panel admin-panel--warning">
        <h2>운영 기준</h2>
        <ul className="admin-warning-list">
          <li>PayPal 결제 상태가 completed인 주문만 상품 준비와 배송을 진행하세요.</li>
          <li>pending_payment, payment_failed, payment_cancelled는 고객의 결제 시도 기록입니다.</li>
          <li>실제 환불은 주문 상세의 PayPal 실제 환불 버튼 또는 PayPal 관리자 화면에서 처리합니다.</li>
        </ul>
      </section>

      <form className="admin-filters" onSubmit={submit}>
        <input placeholder="주문번호, 고객명, 이메일 검색" value={filters.q} onChange={(event) => setFilters({ ...filters, q: event.target.value })} />
        <input type="date" value={filters.from} onChange={(event) => setFilters({ ...filters, from: event.target.value })} />
        <input type="date" value={filters.to} onChange={(event) => setFilters({ ...filters, to: event.target.value })} />
        <select value={filters.paymentStatus} onChange={(event) => setFilters({ ...filters, paymentStatus: event.target.value })}>
          {paymentStatuses.map((status) => (
            <option key={status} value={status}>
              {status ? adminStatusLabel(status, paymentStatusLabels) : "모든 결제 상태"}
            </option>
          ))}
        </select>
        <select value={filters.orderStatus} onChange={(event) => setFilters({ ...filters, orderStatus: event.target.value })}>
          {orderStatuses.map((status) => (
            <option key={status} value={status}>
              {status ? adminStatusLabel(status, orderStatusLabels) : "모든 주문 상태"}
            </option>
          ))}
        </select>
        <input placeholder="주문 유형" value={filters.orderType} onChange={(event) => setFilters({ ...filters, orderType: event.target.value })} />
        <button className="button button--primary" type="submit">필터 적용</button>
        <button className="button button--ghost" type="button" onClick={load}>지금 새로고침</button>
        <button className="button button--ghost" type="button" onClick={enableNotifications}>
          {notificationStatus === "granted" ? "브라우저 알림 켜짐" : "브라우저 알림 켜기"}
        </button>
        <button className="button button--ghost" type="button" onClick={exportCsv}>CSV 다운로드</button>
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
