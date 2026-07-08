import { json, supabase, verifyAdmin } from "../../_utils.js";

function escapeLike(value) {
  return String(value || "").replace(/[%*_]/g, "");
}

export default async function handler(req, res) {
  if (req.method !== "GET") return json(res, 405, { error: "Method not allowed" });

  try {
    await verifyAdmin(req);
    const status = req.query?.status ? String(req.query.status) : "";
    const paymentStatus = req.query?.paymentStatus ? String(req.query.paymentStatus) : "";
    const orderStatus = req.query?.orderStatus ? String(req.query.orderStatus) : status;
    const orderType = req.query?.orderType ? escapeLike(req.query.orderType) : "";
    const from = req.query?.from ? String(req.query.from) : "";
    const to = req.query?.to ? String(req.query.to) : "";
    const search = req.query?.search ? escapeLike(req.query.search) : escapeLike(req.query?.q);
    const params = ["select=*", "order=created_at.desc", "limit=200"];

    if (paymentStatus) params.push(`payment_status=eq.${encodeURIComponent(paymentStatus)}`);
    if (orderStatus) params.push(`order_status=eq.${encodeURIComponent(orderStatus)}`);
    if (orderType) params.push(`order_type=ilike.*${encodeURIComponent(orderType)}*`);
    if (from) params.push(`created_at=gte.${encodeURIComponent(`${from}T00:00:00.000Z`)}`);
    if (to) params.push(`created_at=lte.${encodeURIComponent(`${to}T23:59:59.999Z`)}`);
    if (search) {
      params.push(`or=(order_number.ilike.*${encodeURIComponent(search)}*,customer_email.ilike.*${encodeURIComponent(search)}*,customer_name.ilike.*${encodeURIComponent(search)}*)`);
    }

    const orders = await supabase(`/orders?${params.join("&")}`);
    return json(res, 200, { orders });
  } catch (error) {
    return json(res, 401, { error: error.message || "Could not load orders" });
  }
}
