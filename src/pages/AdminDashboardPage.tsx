import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { formatCurrency } from "../lib/market";
import { adminFetch } from "../lib/bulkApi";

export type DashboardOrder = {
  id: string;
  order_number: string;
  customer_name: string;
  customer_email?: string;
  company_name?: string | null;
  country_code?: string | null;
  order_type: string;
  total_units: number;
  total_sgd: number;
  currency?: string | null;
  payment_status: string;
  payment_failure_reason?: string | null;
  internal_note?: string | null;
  paypal_order_id?: string | null;
  order_status: string;
  created_at: string;
  updated_at?: string | null;
};

export const orderStatusLabels: Record<string, string> = {
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

export const paymentStatusLabels: Record<string, string> = {
  pending_payment: "결제 대기",
  payment_failed: "결제 실패",
  payment_cancelled: "고객 결제 취소",
  completed: "PayPal 결제 완료",
  pending_review: "결제 확인 중",
  failed: "실패",
  cancelled: "취소됨",
  refunded: "환불됨",
  reversed: "취소/반전됨",
};

export function adminStatusLabel(value: unknown, labels: Record<string, string>) {
  const key = String(value || "");
  return labels[key] ? `${labels[key]} (${key})` : key || "-";
}

export function formatAdminOrderMoney(value: unknown, currency?: string | null) {
  return formatCurrency(Number(value || 0), currency || "SGD");
}

type Row = { label: string; value: number };

const countryNamesKo: Record<string, string> = { SG: "싱가포르", HK: "홍콩", MO: "마카오", TW: "대만", JP: "일본", TH: "태국", MY: "말레이시아", BN: "브루나이" };
function countryLabel(code?: string | null) {
  const normalized = String(code || "").toUpperCase();
  return countryNamesKo[normalized] || normalized || "-";
}
type DashboardSummary = {
  definitions: Record<string, string>;
  kpi: { revenue30: Record<string, number>; revenueAll: Record<string, number>; newOrders7: number; toShip: number; unanswered: number | null };
  toShipOrders: DashboardOrder[];
  recentOrders: DashboardOrder[];
  details: { paidOrders: number; refundedOrders: number; refunds: Record<string, number>; attempts30: number; failed30: number; cancelled30: number; testOrders: number; popularProducts: Row[]; countries: Row[]; sources: Row[] };
};

const byCurrency = (map: Record<string, number>) => {
  const entries = Object.entries(map || {});
  return entries.length ? entries.map(([currency, value]) => formatAdminOrderMoney(value, currency)).join(" · ") : "—";
};

function RowsTable({ title, rows, unit }: { title: string; rows: Row[]; unit: string }) {
  return (
    <section className="admin-panel admin-insight">
      <h3>{title}</h3>
      {rows.length ? (
        <table className="admin-table admin-table--compact">
          <tbody>{rows.map((row) => <tr key={row.label}><td>{row.label}</td><td>{row.value} {unit}</td></tr>)}</tbody>
        </table>
      ) : <p className="admin-muted">아직 데이터가 없습니다.</p>}
    </section>
  );
}

/* Main screen: four things to act on. Everything else lives under "상세 통계". */
export function AdminDashboardPage() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const load = () => {
    adminFetch<DashboardSummary>("/api/admin/summary")
      .then((data) => { setSummary(data); setLastUpdated(new Date()); setError(""); })
      .catch((err) => setError(err.message));
  };
  useEffect(() => {
    load();
    const timer = window.setInterval(load, 60000);
    return () => window.clearInterval(timer);
  }, []);

  if (error) return <AdminNotice message={error} />;
  const kpi = summary?.kpi;
  const d = summary?.details;

  return (
    <>
      <div className="admin-heading admin-heading--dashboard">
        <div>
          <p className="eyebrow">대시보드</p>
          <h1>오늘 확인할 것</h1>
          <p className="admin-muted">테스트 거래는 빼고 계산합니다.{lastUpdated ? ` 마지막 업데이트 ${lastUpdated.toLocaleTimeString("ko-KR")}` : ""}</p>
        </div>
        <button className="button button--ghost" type="button" onClick={load}>새로고침</button>
      </div>

      <div className="admin-kpis">
        <article className="admin-kpi admin-kpi--money" title={summary?.definitions.revenue}>
          <span>실매출 (최근 30일)</span>
          <strong>{kpi ? byCurrency(kpi.revenue30) : "…"}</strong>
          <small>전체 기간: {kpi ? byCurrency(kpi.revenueAll) : "…"}</small>
        </article>
        <Link className="admin-kpi" to="/admin/orders" title={summary?.definitions.newOrders}>
          <span>신규 주문 (7일)</span><strong>{kpi?.newOrders7 ?? "…"}</strong><small>결제 완료 기준</small>
        </Link>
        <Link className={`admin-kpi${kpi?.toShip ? " is-attention" : ""}`} to="/admin/orders?orderStatus=paid" title={summary?.definitions.toShip}>
          <span>배송 처리 대기</span><strong>{kpi?.toShip ?? "…"}</strong><small>결제 완료 · 아직 발송 전</small>
        </Link>
        <Link className={`admin-kpi${kpi?.unanswered ? " is-attention" : ""}`} to="/admin/inquiries" title={summary?.definitions.unanswered}>
          <span>미답변 문의</span><strong>{kpi ? kpi.unanswered ?? "—" : "…"}</strong><small>{kpi && kpi.unanswered === null ? "문의 기능 준비 중(DB 업데이트 후)" : "신규 · 읽음 상태"}</small>
        </Link>
      </div>

      {!!summary?.toShipOrders.length && (
        <section className="admin-panel">
          <h2>배송 처리할 주문</h2>
          <AdminOrderTable orders={summary.toShipOrders} />
        </section>
      )}

      <section className="admin-panel">
        <h2>최근 결제 완료 주문</h2>
        <AdminOrderTable orders={summary?.recentOrders || []} />
      </section>

      <details className="admin-panel admin-details">
        <summary>상세 통계 · 결제 시도 · 테스트 거래</summary>
        {d && (
          <>
            <ul className="admin-detail-list">
              <li>결제 완료 주문 <strong>{d.paidOrders}</strong></li>
              <li>환불이 있는 주문 <strong>{d.refundedOrders}</strong> ({byCurrency(d.refunds)})</li>
              <li>최근 30일 결제 시도(미완료) <strong>{d.attempts30}</strong> · 실패 {d.failed30} · 고객 취소 {d.cancelled30}</li>
              <li>매출에서 뺀 테스트 거래 <strong>{d.testOrders}</strong></li>
            </ul>
            <div className="admin-insight-grid">
              <RowsTable title="많이 팔린 상품" rows={d.popularProducts} unit="개" />
              <RowsTable title="주문 국가" rows={d.countries} unit="건" />
              <RowsTable title="유입 경로 (UTM)" rows={d.sources} unit="건" />
            </div>
            <p className="admin-muted">기준: {summary?.definitions.revenue}</p>
          </>
        )}
      </details>
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
  if (!orders.length) return <p>표시할 주문이 없습니다.</p>;

  return (
    <div className="admin-table-wrap">
      <table className="admin-table">
        <thead>
          <tr>
            <th>주문번호</th>
            <th>생성일</th>
            <th>국가 / 통화</th>
            <th>고객</th>
            <th>회사</th>
            <th>이메일</th>
            <th>유형</th>
            <th>개수</th>
            <th>총액</th>
            <th>결제 상태</th>
            <th>실패·취소 원인</th>
            <th>PayPal order ID</th>
            <th>주문 상태</th>
            <th>수정일</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id}>
              <td>
                <Link to={`/admin/orders/${order.id}`}>{order.order_number}</Link>
              </td>
              <td>{new Date(order.created_at).toLocaleDateString("ko-KR")}</td>
              <td>
                {countryLabel(order.country_code)}
                <br />
                <small>{order.currency || "SGD"}</small>
              </td>
              <td>{order.customer_name}</td>
              <td>{order.company_name || "-"}</td>
              <td>{order.customer_email || "-"}</td>
              <td>{order.order_type}</td>
              <td>{order.total_units}</td>
              <td>{formatAdminOrderMoney(order.total_sgd, order.currency)}</td>
              <td>{adminStatusLabel(order.payment_status, paymentStatusLabels)}</td>
              <td>{order.payment_failure_reason || "-"}</td>
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
