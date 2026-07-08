import { json, supabase, verifyAdmin } from "../../_utils.js";

export default async function handler(req, res) {
  if (req.method !== "GET") return json(res, 405, { error: "Method not allowed" });

  try {
    await verifyAdmin(req);
    const status = req.query?.status ? String(req.query.status) : "";
    const params = ["select=*", "order=submitted_at.desc", "limit=200"];
    if (status) params.push(`status=eq.${encodeURIComponent(status)}`);
    const reviews = await supabase(`/reviews?${params.join("&")}`);
    return json(res, 200, { reviews });
  } catch (error) {
    return json(res, 401, { error: error.message || "Could not load reviews" });
  }
}
