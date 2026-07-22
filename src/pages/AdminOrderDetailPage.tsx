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
const paymentStatuses = ["pending_payment", "payment_failed", "payment_cancelled", "completed", "pending_review", "failed", "cancelled", "refunded", "reversed"];

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

function statusLabel(value: unknown, labels: Record<string, string>) {
  const key = String(value || "");
  return labels[key] ? `${labels[key]} (${key})` : key || "-";
}

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
    payment_failure_reason: "",
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
          payment_failure_reason: String(data.order.payment_failure_reason || ""),
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
      `Customer name: ${order.customer_name || ""}`,
      `Customer email: ${order.customer_email || ""}`,
      `Customer phone: ${order.customer_phone || ""}`,
      `Company name: ${order.company_name || ""}`,
      `Customer country: ${order.country_code}`,
      `Shipping address: ${[order.address_line_1, order.address_line_2, order.city, order.postal_code].filter(Boolean).join(", ")}`,
      `Payment amount: ${formatSgd(Number(order.total_sgd || 0))}`,
      `Currency: ${order.currency}`,
      `PayPal order ID: ${order.paypal_order_id || ""}`,
      `PayPal capture ID: ${order.paypal_capture_id || ""}`,
      `Payment status: ${order.payment_status}`,
      `Payment failure reason: ${order.payment_failure_reason || order.internal_note || ""}`,
      `Order status: ${order.order_status}`,
      `Updated at: ${order.updated_at || ""}`,
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
      setActionError("PayPal 결제가 완료된 주문만 환불할 수 있습니다.");
      return;
    }
    if (!detail?.order.paypal_capture_id) {
      setActionError("이 주문에는 PayPal 캡처 ID가 없습니다. 실제 결제된 주문이 아니므로 PayPal에서 환불할 금액이 없습니다.");
      return;
    }
    if (!window.confirm("이 주문을 PayPal에서 실제 환불 처리할까요? 결제 금액이 고객에게 돌아가는 작업입니다.")) return;
    const reason = form.refund_reason || form.internal_note || "관리자 전체 환불";
    try {
      await adminFetch(`/api/admin/orders/${orderId}/refund`, {
        method: "POST",
        body: JSON.stringify({ reason }),
      });
      load();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "주문을 환불하지 못했습니다.");
    }
  };

  const quickUpdate = async (order_status: string, payment_status = form.payment_status) => {
    const paid = form.payment_status === "completed";
    if (["paid", "address_check", "preparing", "packed", "shipped", "delivered"].includes(order_status) && !paid) {
      setActionError("아직 결제 완료가 아닌 주문입니다. 상품 준비, 배송, 결제 완료 처리를 하면 안 됩니다.");
      return;
    }
    if (order_status === "cancelled" && !window.confirm("이 미결제 주문 시도를 취소 처리할까요? 실제 환불은 발생하지 않습니다.")) return;
    if (order_status === "refunded" && !window.confirm("외부에서 실제 환불이 끝난 경우에만 환불 완료로 표시하세요.")) return;
    setActionError("");
    await adminFetch(`/api/admin/orders/${orderId}`, {
      method: "PATCH",
      body: JSON.stringify({
        ...form,
        order_status,
        payment_status,
        internal_note: form.internal_note || `관리자 빠른 처리: ${orderStatusLabels[order_status] || order_status}`,
      }),
    });
    load();
  };

  if (error) return <AdminNotice message={error} />;
  if (!detail) return <AdminNotice message="주문 정보를 불러오는 중입니다." />;

  const { order, items, paymentEvents, history } = detail;
  const paymentStatus = String(order.payment_status || "");
  const orderStatus = String(order.order_status || "");
  const isPaid = paymentStatus === "completed";
  const isPending = ["pending_payment", "payment_failed", "payment_cancelled", "pending", "failed", "cancelled"].includes(paymentStatus);
  const isRefunded = paymentStatus === "refunded" || orderStatus === "refunded";
  const isCancelled = ["cancelled", "payment_cancelled"].includes(paymentStatus) || orderStatus === "cancelled";
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
        <p className="eyebrow">주문 상세</p>
        <h1>{order.order_number}</h1>
        <div className="admin-page-actions">
          <Link className="button button--ghost" to="/admin">관리자 홈</Link>
          <Link className="button button--ghost" to="/admin/orders">주문 목록</Link>
        </div>
      </div>
      <section className="admin-panel admin-action-panel">
        <div>
          <p className="eyebrow">운영 처리</p>
          <h2>주문 처리 센터</h2>
          {isPending ? (
            <p className="admin-muted">고객이 PayPal 결제창까지 열었지만 결제를 완료하지 않은 기록입니다. 기록은 남기되, 상품 준비나 배송은 하지 마세요.</p>
          ) : (
            <p className="admin-muted">PayPal 결제 완료 주문만 배송 처리할 수 있습니다. 실제 환불은 PayPal 캡처 ID가 있는 주문에서만 실행됩니다.</p>
          )}
        </div>
        <div className="admin-action-grid">
          {canFulfill && (
            <>
              <button className="button button--ghost" type="button" onClick={() => quickUpdate("address_check", "completed")}>주소 확인 중</button>
              <button className="button button--ghost" type="button" onClick={() => quickUpdate("preparing", "completed")}>상품 준비 시작</button>
              <button className="button button--ghost" type="button" onClick={() => quickUpdate("packed", "completed")}>포장 완료</button>
              <button className="button button--ghost" type="button" onClick={() => quickUpdate("shipped", "completed")}>배송 시작</button>
              <button className="button button--ghost" type="button" onClick={() => quickUpdate("delivered", "completed")}>배송 완료</button>
            </>
          )}
          {canCancelUnpaid && (
            <button className="button button--danger" type="button" onClick={() => quickUpdate("cancelled", "cancelled")}>미결제 시도 취소</button>
          )}
          {canRefundInPayPal && <button className="button button--danger button--refund" type="button" onClick={refundPayPal}>PayPal 실제 환불 실행</button>}
        </div>
        {!canFulfill && !canCancelUnpaid && !canRefundInPayPal && (
          <p className="admin-muted">이미 종료된 주문이거나 현재 바로 처리할 수 있는 버튼이 없습니다.</p>
        )}
        {actionError && <p className="form-error">{actionError}</p>}
      </section>
      <div className="admin-detail-grid">
        <section className="admin-panel">
          <h2>고객 / 배송 정보</h2>
          <dl className="evidence-list">
            <div><dt>이름</dt><dd>{order.customer_name}</dd></div>
            <div><dt>이메일</dt><dd>{order.customer_email}</dd></div>
            <div><dt>전화번호</dt><dd>{order.customer_phone}</dd></div>
            <div><dt>회사명</dt><dd>{order.company_name || "-"}</dd></div>
            <div><dt>국가</dt><dd>{order.country_code || "SG"}</dd></div>
            <div><dt>주소</dt><dd>{[order.address_line_1, order.address_line_2, order.city, order.postal_code].filter(Boolean).join(", ")}</dd></div>
          </dl>
        </section>
        <section className="admin-panel">
          <h2>결제 기록</h2>
          <dl className="evidence-list">
            <div><dt>총액</dt><dd>{formatSgd(Number(order.total_sgd || 0))}</dd></div>
            <div><dt>PayPal order ID</dt><dd>{order.paypal_order_id}</dd></div>
            <div><dt>PayPal capture ID</dt><dd>{order.paypal_capture_id}</dd></div>
            <div><dt>주문 상태</dt><dd>{statusLabel(order.order_status, orderStatusLabels)}</dd></div>
            <div><dt>결제 상태</dt><dd>{statusLabel(order.payment_status, paymentStatusLabels)}</dd></div>
            <div><dt>실패/취소 사유</dt><dd>{order.payment_failure_reason || order.internal_note || "-"}</dd></div>
            <div><dt>생성일</dt><dd>{order.created_at || "-"}</dd></div>
            <div><dt>수정일</dt><dd>{order.updated_at || "-"}</dd></div>
            <div><dt>환불일</dt><dd>{order.refunded_at || "-"}</dd></div>
          </dl>
        </section>
      </div>

      <section className="admin-panel">
        <h2>주문 상품</h2>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead><tr><th>상품</th><th>팩</th><th>개수</th><th>금액</th></tr></thead>
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
        <h2>주문 증빙 기록</h2>
        <pre>{evidence}</pre>
        <div className="bulk-card__actions">
          <button className="button button--primary" type="button" onClick={() => window.print()}>주문 기록 인쇄</button>
          <button className="button button--ghost" type="button" onClick={exportOrderCsv}>CSV로 내보내기</button>
          <button className="button button--quiet" type="button" onClick={() => navigator.clipboard.writeText(String(order.order_number))}>주문번호 복사</button>
          <button className="button button--quiet" type="button" onClick={() => navigator.clipboard.writeText(String(order.paypal_capture_id || ""))}>PayPal 캡처 ID 복사</button>
        </div>
      </section>

      <form className="admin-panel admin-form" onSubmit={submit}>
        <h2>고객 정보 / 배송 / 상태 수정</h2>
        <label>고객명<input value={form.customer_name} onChange={(event) => setForm({ ...form, customer_name: event.target.value })} /></label>
        <label>이메일<input value={form.customer_email} onChange={(event) => setForm({ ...form, customer_email: event.target.value })} /></label>
        <label>전화번호<input value={form.customer_phone} onChange={(event) => setForm({ ...form, customer_phone: event.target.value })} /></label>
        <label>회사명<input value={form.company_name} onChange={(event) => setForm({ ...form, company_name: event.target.value })} /></label>
        <label>주소 1<input value={form.address_line_1} onChange={(event) => setForm({ ...form, address_line_1: event.target.value })} /></label>
        <label>주소 2<input value={form.address_line_2} onChange={(event) => setForm({ ...form, address_line_2: event.target.value })} /></label>
        <label>도시 / 구역<input value={form.city} onChange={(event) => setForm({ ...form, city: event.target.value })} /></label>
        <label>우편번호<input value={form.postal_code} onChange={(event) => setForm({ ...form, postal_code: event.target.value })} /></label>
        <label>주문 상태<select value={form.order_status} onChange={(event) => setForm({ ...form, order_status: event.target.value })}>{orderStatuses.map((status) => <option key={status} value={status}>{statusLabel(status, orderStatusLabels)}</option>)}</select></label>
        <label>결제 상태<select value={form.payment_status} onChange={(event) => setForm({ ...form, payment_status: event.target.value })}>
          {paymentStatuses.map((status) => <option key={status} value={status}>{statusLabel(status, paymentStatusLabels)}</option>)}
        </select></label>
        <label>배송사<input value={form.tracking_carrier} onChange={(event) => setForm({ ...form, tracking_carrier: event.target.value })} /></label>
        <label>운송장 번호<input value={form.tracking_number} onChange={(event) => setForm({ ...form, tracking_number: event.target.value })} /></label>
        <label>배송일<input type="date" value={form.shipped_at} onChange={(event) => setForm({ ...form, shipped_at: event.target.value })} /></label>
        <label>배송 메모<textarea value={form.shipping_note} onChange={(event) => setForm({ ...form, shipping_note: event.target.value })} /></label>
        <label>취소 사유<textarea value={form.cancellation_reason} onChange={(event) => setForm({ ...form, cancellation_reason: event.target.value })} /></label>
        <label>환불 사유<textarea value={form.refund_reason} onChange={(event) => setForm({ ...form, refund_reason: event.target.value })} /></label>
        <label>결제 실패 사유<textarea value={form.payment_failure_reason} onChange={(event) => setForm({ ...form, payment_failure_reason: event.target.value })} /></label>
        <label>내부 메모<textarea value={form.internal_note} onChange={(event) => setForm({ ...form, internal_note: event.target.value })} /></label>
        <button className="button button--primary" type="submit">변경사항 저장</button>
      </form>

      <section className="admin-panel">
        <h2>결제 이벤트</h2>
        {paymentEvents.length ? (
          paymentEvents.map((event) => (
            <p key={String(event.id)}>{event.event_type} / {event.paypal_capture_id || "-"} / 검증됨: {String(event.verified)}</p>
          ))
        ) : (
          <p>아직 결제 이벤트가 없습니다.</p>
        )}
        <h2>상태 변경 기록</h2>
        {history.length ? (
          history.map((entry) => <p key={String(entry.id)}>{entry.created_at}: {statusLabel(entry.previous_status, orderStatusLabels)} -&gt; {statusLabel(entry.new_status, orderStatusLabels)} {entry.note}</p>)
        ) : (
          <p>아직 상태 변경 기록이 없습니다.</p>
        )}
      </section>
    </>
  );
}

