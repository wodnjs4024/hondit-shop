import { json, supabase, verifyAdmin } from "./_utils.js";

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
    const orders = await supabase("/orders?select=*&order=created_at.desc&limit=500");
    const capturedOrders = orders.filter((order) => order.payment_status === "completed" || order.paypal_capture_id);
    const completedOrders = orders.filter((order) => order.payment_status === "completed");
    const attempts = orders.filter((order) => order.payment_status !== "completed" && !order.paypal_capture_id);
    const count = (status) => orders.filter((order) => order.payment_status === status).length;
    const revenueByCurrency = completedOrders.reduce((totals, order) => {
      const currency = order.currency || "SGD";
      totals[currency] = Number(((totals[currency] || 0) + Number(order.total_sgd || 0)).toFixed(2));
      return totals;
    }, {});
    return json(res, 200, {
      totals: {
        totalOrders: completedOrders.length,
        capturedPayments: capturedOrders.length,
        refundedPayments: count("refunded"),
        checkoutAttempts: attempts.length,
        pendingPayment: count("pending_payment"),
        paymentFailed: count("payment_failed"),
        paymentCancelled: count("payment_cancelled"),
        paid: completedOrders.length,
        preparing: completedOrders.filter((order) => order.order_status === "preparing").length,
        packed: completedOrders.filter((order) => order.order_status === "packed").length,
        shipped: completedOrders.filter((order) => order.order_status === "shipped").length,
        delivered: completedOrders.filter((order) => order.order_status === "delivered").length,
        closed: capturedOrders.filter((order) => ["cancelled", "refunded"].includes(order.order_status) || ["cancelled", "refunded"].includes(order.payment_status)).length,
        totalPaidSgd: Number(completedOrders.reduce((sum, order) => sum + Number(order.total_sgd || 0), 0).toFixed(2)),
        revenueByCurrency,
      },
      recentOrders: completedOrders.slice(0, 8),
      checkoutAttempts: attempts.slice(0, 20),
      popularProducts: [], countries: [], sources: [],
    });
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
  const path = String(req.query?.path || new URL(req.url, "https://hondit.local").searchParams.get("path") || "");
  if (path === "summary") return paymentSummary(req, res);
  if (path === "orders") return ordersIndex(req, res);
  const legacy = await import("./admin.js");
  return legacy.default(req, res);
}
