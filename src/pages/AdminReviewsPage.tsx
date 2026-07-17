import { useEffect, useState } from "react";
import { adminFetch } from "../lib/bulkApi";
import { AdminNotice } from "./AdminDashboardPage";

type ReviewRow = {
  id: string;
  order_number: string;
  product_name_snapshot: string;
  display_name: string;
  customer_email: string;
  rating: number;
  title?: string | null;
  body: string;
  status: string;
  submitted_at: string;
  admin_note?: string | null;
};

const reviewStatuses = ["pending", "approved", "hidden", "deleted"];
const reviewStatusLabel: Record<string, string> = {
  pending: "승인 대기",
  approved: "노출 중",
  hidden: "숨김",
  deleted: "삭제됨",
};

export function AdminReviewsPage() {
  const [reviews, setReviews] = useState<ReviewRow[]>([]);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  const load = () => {
    const query = status ? `?status=${encodeURIComponent(status)}` : "";
    adminFetch<{ reviews: ReviewRow[] }>(`/api/admin/reviews${query}`)
      .then((data) => {
        setReviews(data.reviews);
        setError("");
      })
      .catch((err) => setError(err.message));
  };

  useEffect(load, [status]);

  const update = async (review: ReviewRow, nextStatus: string) => {
    await adminFetch(`/api/admin/reviews/${review.id}`, {
      method: "PATCH",
      body: JSON.stringify({ status: nextStatus, admin_note: review.admin_note || "" }),
    });
    load();
  };

  if (error) return <AdminNotice message={error} />;

  return (
    <>
      <div className="admin-heading">
        <p className="eyebrow">리뷰 관리</p>
        <h1>구매자 리뷰 승인</h1>
        <p className="admin-muted">고객 계정 없이 작성된 리뷰도 관리자 승인 후에만 상품 페이지에 노출됩니다.</p>
      </div>

      <form className="admin-filters">
        <select value={status} onChange={(event) => setStatus(event.target.value)}>
          <option value="">모든 리뷰 상태</option>
          {reviewStatuses.map((item) => (
            <option key={item} value={item}>{reviewStatusLabel[item]} ({item})</option>
          ))}
        </select>
        <button className="button button--ghost" type="button" onClick={load}>새로고침</button>
      </form>

      <section className="admin-review-list">
        {reviews.length ? reviews.map((review) => (
          <article className="admin-panel admin-review-card" key={review.id}>
            <div>
              <p className="eyebrow">{reviewStatusLabel[review.status] || review.status}</p>
              <h2>{review.product_name_snapshot}</h2>
              <p>{review.order_number} / {review.customer_email}</p>
            </div>
            <div className="review-card">
              <strong aria-label={`${review.rating} out of 5 stars`}>
                {"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}
              </strong>
              {review.title && <h3>{review.title}</h3>}
              <p>{review.body}</p>
              <em>{review.display_name} / {new Date(review.submitted_at).toLocaleDateString("ko-KR")}</em>
            </div>
            <div className="admin-action-grid">
              <button className="button button--ghost" type="button" onClick={() => update(review, "approved")}>승인</button>
              <button className="button button--ghost" type="button" onClick={() => update(review, "hidden")}>숨김</button>
              <button className="button button--danger" type="button" onClick={() => update(review, "deleted")}>삭제</button>
            </div>
          </article>
        )) : <AdminNotice message="표시할 리뷰가 없습니다." />}
      </section>
    </>
  );
}
