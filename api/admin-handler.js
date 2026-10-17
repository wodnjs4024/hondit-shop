import { json, supabase, verifyAdmin, previewWritesBlocked } from "./_utils.js";
import { summarizeOrders } from "./_admin-summary.js";

function queryValue(req, key) {
  const value = req.query?.[key];
  if (Array.isArray(value)) return value[0] || "";
  if (value) return String(value);
  return new URL(req.url, "https://hondit.local").searchParams.get(key) || "";
}

function escapeLike(value) {
  return String(value || "").replace(/[%*_]/g, "");
}

async function paymentSummary(req, res) {
  try {
    await verifyAdmin(req);
    const orders = await supabase("/orders?select=*,order_items(product_slug,product_name_snapshot,total_units,line_total_sgd)&order=created_at.desc&limit=2000");
    // The inquiry table only exists after migration 008; null tells the dashboard to show "not set up yet".
    const inquiries = await supabase("/inquiries?select=status&limit=2000").catch(() => null);
    return json(res, 200, summarizeOrders(orders, inquiries));
  } catch (error) {
    return json(res, 401, { error: error.message || "Admin summary failed" });
  }
}

async function ordersIndex(req, res) {
  try {
    if (req.method !== "GET") return json(res, 405, { error: "Method not allowed" });
    await verifyAdmin(req);
    const paymentStatus = queryValue(req, "paymentStatus") || "completed";
    const orderStatus = queryValue(req, "orderStatus") || queryValue(req, "status");
    const orderType = escapeLike(queryValue(req, "orderType"));
    const from = queryValue(req, "from");
    const to = queryValue(req, "to");
    const search = escapeLike(queryValue(req, "search") || queryValue(req, "q"));
    const params = ["select=*", "order=created_at.desc", "limit=500"];
    if (paymentStatus && paymentStatus !== "all") params.push(`payment_status=eq.${encodeURIComponent(paymentStatus)}`);
    if (orderStatus) params.push(`order_status=eq.${encodeURIComponent(orderStatus)}`);
    if (orderType) params.push(`order_type=ilike.*${encodeURIComponent(orderType)}*`);
    if (from) params.push(`created_at=gte.${encodeURIComponent(`${from}T00:00:00.000Z`)}`);
    if (to) params.push(`created_at=lte.${encodeURIComponent(`${to}T23:59:59.999Z`)}`);
    if (search) params.push(`or=(order_number.ilike.*${encodeURIComponent(search)}*,customer_email.ilike.*${encodeURIComponent(search)}*,customer_name.ilike.*${encodeURIComponent(search)}*)`);
    const orders = await supabase(`/orders?${params.join("&")}`);
    return json(res, 200, { orders });
  } catch (error) {
    return json(res, 500, { error: error.message || "Admin orders failed" });
  }
}

export default async function handler(req, res) {
  if (previewWritesBlocked(req.method)) { res.status(403).json({ error: "Read-only preview: payments and data changes are disabled." }); return; }
  const path = String(req.query?.path || new URL(req.url, "https://hondit.local").searchParams.get("path") || "");
  if (path === "summary") return paymentSummary(req, res);
  if (path === "orders") return ordersIndex(req, res);
  const legacy = await import("./admin.js");
  return legacy.default(req, res);
}
