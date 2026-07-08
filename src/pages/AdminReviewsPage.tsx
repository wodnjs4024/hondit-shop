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

export function AdminReviewsPage() {
  const [reviews, setReviews] = useState<ReviewRow[]>([]);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  const load = () => {
    const query = status ? `?status=${encodeURIComponent(status)}` : "";
    adminFetch<{ reviews: ReviewRow[] }>(`/api/admin/reviews${query}`)
      .then((data) => setReviews(data.reviews))
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
        <p className="eyebrow">REVIEWS</p>
        <h1>Verified buyer reviews</h1>
        <p className="admin-muted">Approve reviews before they become visible on product pages. No customer account is required.</p>
      </div>

      <form className="admin-filters">
        <select value={status} onChange={(event) => setStatus(event.target.value)}>
          <option value="">All review statuses</option>
          {["pending", "approved", "hidden", "deleted"].map((item) => <option key={item}>{item}</option>)}
        </select>
        <button className="button button--ghost" type="button" onClick={load}>Refresh now</button>
      </form>

      <section className="admin-review-list">
        {reviews.length ? reviews.map((review) => (
          <article className="admin-panel admin-review-card" key={review.id}>
            <div>
              <p className="eyebrow">{review.status}</p>
              <h2>{review.product_name_snapshot}</h2>
              <p>{review.order_number} / {review.customer_email}</p>
            </div>
            <div className="review-card">
              <strong>{"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}</strong>
              {review.title && <h3>{review.title}</h3>}
              <p>{review.body}</p>
              <em>{review.display_name} / {new Date(review.submitted_at).toLocaleDateString("en-SG")}</em>
            </div>
            <div className="admin-action-grid">
              <button className="button button--ghost" type="button" onClick={() => update(review, "approved")}>Approve</button>
              <button className="button button--ghost" type="button" onClick={() => update(review, "hidden")}>Hide</button>
              <button className="button button--danger" type="button" onClick={() => update(review, "deleted")}>Delete</button>
            </div>
          </article>
        )) : <AdminNotice message="No reviews found." />}
      </section>
    </>
  );
}
