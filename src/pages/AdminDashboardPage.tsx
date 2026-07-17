import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { formatSgd } from "../data/bulkProducts";
import { adminFetch } from "../lib/bulkApi";

export type DashboardOrder = {
  id: string;
  order_number: string;
  customer_name: string;
  customer_email?: string;
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
    ["전체 주문", totals.totalOrders || 0],
    ["미결제 시도", totals.checkoutAttempts || 0],
    ["결제 완료", totals.paid || 0],
    ["상품 준비", totals.preparing || 0],
    ["포장 완료", totals.packed || 0],
    ["배송 시작", totals.shipped || 0],
    ["배송 완료", totals.delivered || 0],
    ["취소 / 환불", totals.closed || 0],
    ["결제 완료 매출", formatSgd(totals.totalPaidSgd || 0)],
  ];

  return (
    <>
      <div className="admin-heading admin-heading--dashboard">
        <div>
          <p className="eyebrow">운영 대시보드</p>
          <h1>hondit 운영 콘솔</h1>
          <p className="admin-muted">
            주문, 결제, 배송, 상품, 리뷰, 분석을 한 곳에서 확인합니다.
            {lastUpdated ? ` 마지막 업데이트: ${lastUpdated.toLocaleTimeString("ko-KR")}` : ""}
          </p>
        </div>
        <button className="button button--ghost" type="button" onClick={load}>
          지금 새로고침
        </button>
      </div>

      <section className="admin-ops-grid" aria-label="운영 바로가기">
        <Link to="/admin/orders">
          <span>01</span>
          <strong>주문 / 배송 / 환불</strong>
          <p>결제 상태, 주소 확인, 운송장, 환불 처리를 관리합니다.</p>
        </Link>
        <Link to="/admin/products">
          <span>02</span>
          <strong>상품 / 이미지 관리</strong>
          <p>상품명, 가격, MOQ, 재고, 대표 이미지와 상세 이미지를 수정합니다.</p>
        </Link>
        <Link to="/admin/reviews">
          <span>03</span>
          <strong>리뷰 관리</strong>
          <p>구매자 리뷰를 승인, 숨김, 삭제 처리합니다.</p>
        </Link>
        <Link to="/admin/settings">
          <span>04</span>
          <strong>운영 설정</strong>
          <p>사업자 정보, 결제 사용 여부, 고객 응대 정보를 관리합니다.</p>
        </Link>
      </section>

      <div className="admin-stat-grid">
        {cards.map(([label, value]) => (
          <article key={label}>
            <span>{label}</span>
            <strong>{value}</strong>
          </article>
        ))}
      </div>

      <section className="admin-panel admin-panel--analytics">
        <div>
          <p className="eyebrow">Analytics</p>
          <h2>방문자와 클릭 데이터</h2>
          <p className="admin-muted">
            Google Analytics 원본 화면은 보안 로그인 때문에 그대로 삽입할 수 없습니다. 대신 바로 열 수 있는 링크와
            확인 항목을 관리자 안에 모아두었습니다.
          </p>
        </div>
        <div className="admin-analytics-grid">
          <a href="https://analytics.google.com/analytics/web/" target="_blank" rel="noreferrer">
            <strong>GA4 열기</strong>
            <span>국가, 유입 채널, 페이지, 이벤트 확인</span>
          </a>
          <a href="https://vercel.com/hondit/hondit-shop/analytics" target="_blank" rel="noreferrer">
            <strong>Vercel Analytics</strong>
            <span>실시간 방문과 성능 확인</span>
          </a>
          <a href="https://hondit-shop.vercel.app/?utm_source=instagram&utm_medium=bio&utm_campaign=instagram_bio_launch" target="_blank" rel="noreferrer">
            <strong>Instagram Bio 테스트 URL</strong>
            <span>UTM 유입 확인용 주소</span>
          </a>
        </div>
        <ul className="admin-warning-list">
          <li>국가별 방문자는 GA4의 국가 보고서에서 확인합니다.</li>
          <li>상품 클릭은 GA4 이벤트에서 shopee, bulk, product 관련 이벤트로 확인합니다.</li>
          <li>완전한 숫자 카드를 관리자에 직접 넣으려면 GA Data API 권한과 서비스 계정 연결이 추가로 필요합니다.</li>
        </ul>
      </section>

      <section className="admin-panel">
        <h2>최근 결제 완료 주문</h2>
        <p className="admin-muted">실제로 결제가 완료된 주문만 상품 준비와 배송 대상으로 봅니다.</p>
        <AdminOrderTable orders={summary?.recentOrders || []} />
      </section>

      <section className="admin-panel admin-panel--warning">
        <h2>미결제 또는 실패한 결제 시도</h2>
        <p className="admin-muted">고객이 결제창까지 갔지만 결제를 완료하지 않은 기록입니다. 상품 준비나 배송은 하지 않습니다.</p>
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
  if (!orders.length) return <p>표시할 주문이 없습니다.</p>;

  return (
    <div className="admin-table-wrap">
      <table className="admin-table">
        <thead>
          <tr>
            <th>주문번호</th>
            <th>생성일</th>
            <th>고객</th>
            <th>이메일</th>
            <th>유형</th>
            <th>개수</th>
            <th>총액</th>
            <th>결제 상태</th>
            <th>실패 / 취소 사유</th>
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
              <td>{order.customer_name}</td>
              <td>{order.customer_email || "-"}</td>
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
      ) : (
        <p>아직 데이터가 없습니다.</p>
      )}
    </section>
  );
}
