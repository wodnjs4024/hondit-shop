import { json, readBody, supabase, verifyAdmin } from "../../_utils.js";

export default async function handler(req, res) {
  try {
    await verifyAdmin(req);
    const reviewId = req.query?.reviewId ? String(req.query.reviewId) : "";
    if (!reviewId) return json(res, 400, { error: "Review ID is required" });

    if (req.method === "PATCH") {
      const body = await readBody(req);
      const status = String(body.status || "");
      if (!["pending", "approved", "hidden", "deleted"].includes(status)) return json(res, 400, { error: "Invalid review status" });
      const now = new Date().toISOString();
      const saved = await supabase(`/reviews?id=eq.${encodeURIComponent(reviewId)}`, {
        method: "PATCH",
        body: JSON.stringify({
          status,
          admin_note: body.admin_note || null,
          approved_at: status === "approved" ? now : null,
          updated_at: now,
        }),
      });
      return json(res, 200, { review: saved[0] });
    }

    if (req.method === "DELETE") {
      const saved = await supabase(`/reviews?id=eq.${encodeURIComponent(reviewId)}`, {
        method: "PATCH",
        body: JSON.stringify({ status: "deleted", updated_at: new Date().toISOString() }),
      });
      return json(res, 200, { review: saved[0] });
    }

    return json(res, 405, { error: "Method not allowed" });
  } catch (error) {
    return json(res, 401, { error: error.message || "Could not update review" });
  }
}
