import { json, supabase } from "../../_utils.js";

export default async function handler(req, res) {
  if (req.method !== "GET") return json(res, 405, { error: "Method not allowed" });

  try {
    const orderNumber = req.query?.orderNumber ? String(req.query.orderNumber) : "";
    if (!orderNumber) return json(res, 400, { error: "Order number is required" });

    const orders = await supabase(
      `/orders?order_number=eq.${encodeURIComponent(orderNumber)}&select=id,order_number,payment_status,order_status,total_units,total_packs,total_sgd,currency,customer_name,country_code,city,postal_code`,
    );
    if (!orders.length) return json(res, 404, { error: "Order not found" });

    const items = await supabase(
      `/order_items?order_id=eq.${encodeURIComponent(orders[0].id)}&select=product_name_snapshot,volume_snapshot,pack_count,total_units,line_total_sgd`,
    );
    const { id, ...publicOrder } = orders[0];

    return json(res, 200, { order: { ...publicOrder, items } });
  } catch (error) {
    return json(res, 500, { error: error.message || "Could not load order" });
  }
}
