import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { formatSgd } from "../data/bulkProducts";
import { adminFetch } from "../lib/bulkApi";

type DashboardOrder = {
  id: string;
  order_number: string;
  customer_name: string;
  order_type: string;
  total_units: number;
  total_sgd: number;
  payment_status: string;
  payment_failure_reason?: string | null;
  internal_note?: string | null;
  paypal_order_id?: string | null;
  order_status: string;
  created_at: string;
  updated_at?: string | null;
};

type InsightRow = {
  label: string;
  count: number;
  units: number;
  revenueSgd: number;
};

type Summary = {
  totals: Record<string, number>;
  popularProducts?: InsightRow[];
  countries?: InsightRow[];
  sources?: InsightRow[];
  recentOrders: DashboardOrder[];
  checkoutAttempts?: DashboardOrder[];
};

const orderStatusLabels: Record<string, string> = {
  pending_payment: "결제 대기",
  paid: "결제 완료",
  address_check: "주소 확인 중",
  preparing: "상품 준비 중",
  packed: "포장 완료",
  shipped: "배송 시작",
  delivered: "배송 완료",
  cancelled: "취소됨",
  refunded: "환불됨",
};

const paymentStatusLabels: Record<string, string> = {
  pending_payment: "결제 대기",
  payment_failed: "결제 실패",
  payment_cancelled: "고객 결제 취소",
  completed: "PayPal 결제 완료",
  pending_review: "결제 검토 중",
  failed: "실패",
  cancelled: "취소됨",
  refunded: "환불됨",
  reversed: "취소/반전됨",
};

export function adminStatusLabel(value: unknown, labels: Record<string, string>) {
  const key = String(value || "");
  return labels[key] ? `${labels[key]} (${key})` : key || "-";
}

export function AdminDashboardPage() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const load = () => {
    adminFetch<Summary>("/api/admin/summary")
      .then((data) => {
        setSummary(data);
        setLastUpdated(new Date());
        setError("");
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
    ["결제 완료 주문", totals.totalOrders || 0],
    ["미결제 시도", totals.checkoutAttempts || 0],
    ["결제 완료", totals.paid || 0],
    ["상품 준비 중", totals.preparing || 0],
    ["포장 완료", totals.packed || 0],
    ["배송 시작", totals.shipped || 0],
    ["배송 완료", totals.delivered || 0],
    ["취소 / 환불", totals.closed || 0],
    ["결제 완료 매출 SGD", formatSgd(totals.totalPaidSgd || 0)],
  ];

  return (
    <>
      <div className="admin-heading">
        <p className="eyebrow">관리자 대시보드</p>
        <h1>전체 주문 운영 현황</h1>
        <p className="admin-muted">
          30초마다 자동 새로고침됩니다.
          {lastUpdated ? ` 마지막 업데이트 ${lastUpdated.toLocaleTimeString("ko-KR")}.` : ""}
        </p>
        <button className="button button--ghost" type="button" onClick={load}>지금 새로고침</button>
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
        <h2>최근 결제 완료 주문</h2>
        <p className="admin-muted">PayPal 결제가 완료된 주문만 매출과 실제 처리 대상 주문으로 봅니다.</p>
        <AdminOrderTable orders={summary?.recentOrders || []} />
      </section>

      <section className="admin-panel admin-panel--warning">
        <h2>미결제 체크아웃 시도</h2>
        <p className="admin-muted">
          고객이 PayPal 결제창까지 열었지만 결제를 완료하지 않은 기록입니다. 이 주문은 상품 준비나 배송을 하지 마세요.
        </p>
        <AdminOrderTable orders={summary?.checkoutAttempts || []} />
      </section>

      <div className="admin-detail-grid">
        <AdminInsightTable title="인기 상품" rows={summary?.popularProducts || []} valueLabel="판매 개수" />
        <AdminInsightTable title="고객 국가" rows={summary?.countries || []} valueLabel="주문 수" />
      </div>
      <AdminInsightTable title="유입 경로" rows={summary?.sources || []} valueLabel="주문 수" />
    </>
  );
}

export function AdminNotice({ message }: { message: string }) {
  return (
    <div className="admin-panel">
      <h1>확인이 필요합니다</h1>
      <p>{message}</p>
    </div>
  );
}

export function AdminOrderTable({ orders }: { orders: DashboardOrder[] }) {
  if (!orders.length) return <p>아직 표시할 주문이 없습니다.</p>;

  return (
    <div className="admin-table-wrap">
      <table className="admin-table">
        <thead>
          <tr>
            <th>주문번호</th>
            <th>주문일</th>
            <th>고객</th>
            <th>유형</th>
            <th>개수</th>
            <th>총액</th>
            <th>결제 상태</th>
            <th>실패/취소 사유</th>
            <th>PayPal order ID</th>
            <th>주문 상태</th>
            <th>수정일</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id}>
              <td><Link to={`/admin/orders/${order.id}`}>{order.order_number}</Link></td>
              <td>{new Date(order.created_at).toLocaleDateString("ko-KR")}</td>
              <td>{order.customer_name}</td>
              <td>{order.order_type}</td>
              <td>{order.total_units}</td>
              <td>{formatSgd(order.total_sgd)}</td>
              <td>{adminStatusLabel(order.payment_status, paymentStatusLabels)}</td>
              <td>{order.payment_failure_reason || order.internal_note || "-"}</td>
              <td>{order.paypal_order_id || "-"}</td>
              <td>{adminStatusLabel(order.order_status, orderStatusLabels)}</td>
              <td>{order.updated_at ? new Date(order.updated_at).toLocaleString("ko-KR") : "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function AdminInsightTable({ title, rows, valueLabel }: { title: string; rows: InsightRow[]; valueLabel: string }) {
  return (
    <section className="admin-panel admin-insight">
      <h2>{title}</h2>
      {rows.length ? (
        <table className="admin-table admin-table--compact">
          <thead>
            <tr>
              <th>이름</th>
              <th>{valueLabel}</th>
              <th>매출</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.label}>
                <td>{row.label}</td>
                <td>{valueLabel === "판매 개수" ? row.units : row.count}</td>
                <td>{formatSgd(row.revenueSgd)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : <p>아직 데이터가 없습니다.</p>}
    </section>
  );
}
