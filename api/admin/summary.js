import { json, supabase, verifyAdmin } from "../_utils.js";

function countWhere(orders, key, value) {
  return orders.filter((order) => order[key] === value).length;
}

export default async function handler(req, res) {
  if (req.method !== "GET") return json(res, 405, { error: "Method not allowed" });

  try {
    await verifyAdmin(req);
    const orders = await supabase("/orders?select=*&order=created_at.desc&limit=200");
    const paidOrders = orders.filter((order) => order.payment_status === "completed");
    const revenueSgd = paidOrders.reduce((sum, order) => sum + Number(order.total_sgd || 0), 0);

    return json(res, 200, {
      totals: {
        totalOrders: orders.length,
        pendingPayment: countWhere(orders, "payment_status", "pending"),
        paid: paidOrders.length,
        preparing: countWhere(orders, "order_status", "preparing"),
        packed: countWhere(orders, "order_status", "packed"),
        shipped: countWhere(orders, "order_status", "shipped"),
        delivered: countWhere(orders, "order_status", "delivered"),
        closed: orders.filter((order) => ["cancelled", "refunded"].includes(order.order_status)).length,
        totalPaidSgd: Number(revenueSgd.toFixed(2)),
      },
      recentOrders: orders.slice(0, 8),
    });
  } catch (error) {
    return json(res, 401, { error: error.message || "Admin access failed" });
  }
}
