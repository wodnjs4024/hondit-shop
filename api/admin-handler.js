import { json, supabase, verifyAdmin } from "./_utils.js";

async function paymentSummary(req, res) {
  try {
    await verifyAdmin(req);
    const orders = await supabase("/orders?select=*&order=created_at.desc&limit=500");
    const paidOrders = orders.filter((order) => order.payment_status === "completed" || order.paypal_capture_id);
    const attempts = orders.filter((order) => order.payment_status !== "completed" && !order.paypal_capture_id);
    const count = (status) => orders.filter((order) => order.payment_status === status).length;
    const revenueByCurrency = paidOrders.reduce((totals, order) => {
      const currency = order.currency || "SGD";
      totals[currency] = Number(((totals[currency] || 0) + Number(order.total_sgd || 0)).toFixed(2));
      return totals;
    }, {});
    return json(res, 200, {
      totals: {
        totalOrders: paidOrders.length,
        checkoutAttempts: attempts.length,
        pendingPayment: count("pending_payment"),
        paymentFailed: count("payment_failed"),
        paymentCancelled: count("payment_cancelled"),
        paid: paidOrders.length,
        preparing: paidOrders.filter((order) => order.order_status === "preparing").length,
        packed: paidOrders.filter((order) => order.order_status === "packed").length,
        shipped: paidOrders.filter((order) => order.order_status === "shipped").length,
        delivered: paidOrders.filter((order) => order.order_status === "delivered").length,
        closed: paidOrders.filter((order) => ["cancelled", "refunded"].includes(order.order_status)).length,
        totalPaidSgd: Number(paidOrders.reduce((sum, order) => sum + Number(order.total_sgd || 0), 0).toFixed(2)),
        revenueByCurrency,
      },
      recentOrders: paidOrders.slice(0, 8),
      checkoutAttempts: attempts.slice(0, 20),
      popularProducts: [], countries: [], sources: [],
    });
  } catch (error) {
    return json(res, 401, { error: error.message || "Admin summary failed" });
  }
}

export default async function handler(req, res) {
  const path = String(req.query?.path || new URL(req.url, "https://hondit.local").searchParams.get("path") || "");
  if (path === "summary") return paymentSummary(req, res);
  const legacy = await import("./admin.js");
  return legacy.default(req, res);
}
