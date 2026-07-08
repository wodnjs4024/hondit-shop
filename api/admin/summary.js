import { json, supabase, verifyAdmin } from "../_utils.js";

function countWhere(orders, key, value) {
  return orders.filter((order) => order[key] === value).length;
}

function topCounts(rows, key, labelKey = key) {
  const map = new Map();
  rows.forEach((row) => {
    const label = row[labelKey] || row[key] || "Unknown";
    const current = map.get(label) || { label, count: 0, units: 0, revenueSgd: 0 };
    current.count += 1;
    current.units += Number(row.total_units || 0);
    current.revenueSgd += Number(row.line_total_sgd || row.total_sgd || 0);
    map.set(label, current);
  });
  return Array.from(map.values())
    .sort((a, b) => b.units + b.count - (a.units + a.count))
    .slice(0, 6)
    .map((item) => ({ ...item, revenueSgd: Number(item.revenueSgd.toFixed(2)) }));
}

export default async function handler(req, res) {
  if (req.method !== "GET") return json(res, 405, { error: "Method not allowed" });

  try {
    await verifyAdmin(req);
    const orders = await supabase("/orders?select=*&order=created_at.desc&limit=200");
    const items = await supabase("/order_items?select=product_slug,product_name_snapshot,total_units,line_total_sgd&order=created_at.desc&limit=500");
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
      popularProducts: topCounts(items, "product_slug", "product_name_snapshot"),
      countries: topCounts(orders, "country_code"),
      sources: topCounts(orders.map((order) => ({
        ...order,
        traffic_source: [order.utm_source, order.utm_medium, order.utm_campaign].filter(Boolean).join(" / ") || order.referrer || "Direct / unknown",
      })), "traffic_source"),
    });
  } catch (error) {
    return json(res, 401, { error: error.message || "Admin access failed" });
  }
}
