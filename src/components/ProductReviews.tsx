import { FormEvent, useEffect, useState } from "react";
import type { BulkProduct } from "../data/bulkProducts";

type Review = {
  id: string;
  display_name: string;
  rating: number;
  title?: string | null;
  body: string;
  submitted_at: string;
};

const initialForm = {
  orderNumber: "",
  customerEmail: "",
  displayName: "",
  rating: "5",
  title: "",
  body: "",
};

export function ProductReviews({ product }: { product: BulkProduct }) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [form, setForm] = useState(initialForm);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const load = () => {
    fetch(`/api/reviews?productSlug=${encodeURIComponent(product.slug)}`)
      .then((response) => response.json())
      .then((data) => setReviews(Array.isArray(data.reviews) ? data.reviews : []))
      .catch(() => setReviews([]));
  };

  useEffect(load, [product.slug]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    setMessage("");
    const response = await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, productSlug: product.slug, rating: Number(form.rating) }),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      setError(data.error || "Could not submit review.");
      return;
    }
    setForm(initialForm);
    setMessage(data.message || "Review submitted for approval.");
  };

  return (
    <section className="review-section">
      <div className="review-section__intro">
        <p className="eyebrow">VERIFIED REVIEWS</p>
        <h2>What buyers say after ordering.</h2>
        <p>Reviews are submitted with an order number and email, then approved by hondit before appearing here.</p>
      </div>

      <div className="review-grid">
        <div className="review-list">
          {reviews.length ? reviews.map((review) => (
            <article className="review-card" key={review.id}>
              <div>
                <strong>{"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}</strong>
                <span>{new Date(review.submitted_at).toLocaleDateString("en-SG")}</span>
              </div>
              {review.title && <h3>{review.title}</h3>}
              <p>{review.body}</p>
              <em>{review.display_name}</em>
            </article>
          )) : (
            <div className="empty-state empty-state--compact">
              <h2>No approved reviews yet.</h2>
              <p>Be the first verified buyer to leave one after checkout.</p>
            </div>
          )}
        </div>

        <form className="review-form" onSubmit={submit}>
          <h3>Leave a verified review</h3>
          <label>Order number<input value={form.orderNumber} onChange={(event) => setForm({ ...form, orderNumber: event.target.value })} /></label>
          <label>Order email<input type="email" value={form.customerEmail} onChange={(event) => setForm({ ...form, customerEmail: event.target.value })} /></label>
          <label>Display name<input value={form.displayName} onChange={(event) => setForm({ ...form, displayName: event.target.value })} /></label>
          <label>Rating<select value={form.rating} onChange={(event) => setForm({ ...form, rating: event.target.value })}>
            {[5, 4, 3, 2, 1].map((rating) => <option key={rating} value={rating}>{rating} stars</option>)}
          </select></label>
          <label>Title<input value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} /></label>
          <label>Review<textarea value={form.body} onChange={(event) => setForm({ ...form, body: event.target.value })} /></label>
          {message && <p className="form-success">{message}</p>}
          {error && <p className="form-error">{error}</p>}
          <button className="button button--primary" type="submit">Submit for approval</button>
        </form>
      </div>
    </section>
  );
}
