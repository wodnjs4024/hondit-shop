import { json, supabase, verifyAdmin } from "../../_utils.js";

function escapeLike(value) {
  return String(value || "").replace(/[%*_]/g, "");
}

export default async function handler(req, res) {
  if (req.method !== "GET") return json(res, 405, { error: "Method not allowed" });

  try {
    await verifyAdmin(req);
    const status = req.query?.status ? String(req.query.status) : "";
    const search = req.query?.search ? escapeLike(req.query.search) : "";
    const params = ["select=*", "order=created_at.desc", "limit=200"];

    if (status) params.push(`order_status=eq.${encodeURIComponent(status)}`);
    if (search) {
      params.push(`or=(order_number.ilike.*${encodeURIComponent(search)}*,customer_email.ilike.*${encodeURIComponent(search)}*,customer_name.ilike.*${encodeURIComponent(search)}*)`);
    }

    const orders = await supabase(`/orders?${params.join("&")}`);
    return json(res, 200, { orders });
  } catch (error) {
    return json(res, 401, { error: error.message || "Could not load orders" });
  }
}
