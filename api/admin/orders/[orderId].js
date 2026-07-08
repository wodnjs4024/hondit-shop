import { json, readBody, supabase, verifyAdmin } from "../../_utils.js";

export default async function handler(req, res) {
  try {
    const admin = await verifyAdmin(req);
    const orderId = req.query?.orderId ? String(req.query.orderId) : "";
    if (!orderId) return json(res, 400, { error: "Order ID is required" });

    if (req.method === "GET") {
      const orders = await supabase(`/orders?id=eq.${encodeURIComponent(orderId)}&select=*`);
      if (!orders.length) return json(res, 404, { error: "Order not found" });

      const [items, paymentEvents, history] = await Promise.all([
        supabase(`/order_items?order_id=eq.${encodeURIComponent(orderId)}&select=*&order=created_at.asc`),
        supabase(`/payment_events?order_id=eq.${encodeURIComponent(orderId)}&select=*&order=created_at.desc`),
        supabase(`/order_status_history?order_id=eq.${encodeURIComponent(orderId)}&select=*&order=created_at.desc`),
      ]);

      return json(res, 200, { order: orders[0], items, paymentEvents, history });
    }

    if (req.method === "PATCH") {
      const currentRows = await supabase(`/orders?id=eq.${encodeURIComponent(orderId)}&select=id,order_status`);
      if (!currentRows.length) return json(res, 404, { error: "Order not found" });

      const body = await readBody(req);
      const payload = {
        order_status: body.order_status,
        payment_status: body.payment_status || undefined,
        tracking_carrier: body.tracking_carrier || null,
        tracking_number: body.tracking_number || null,
        shipped_at: body.shipped_at || null,
        internal_note: body.internal_note || null,
        updated_at: new Date().toISOString(),
      };

      if (payload.order_status === "cancelled" && !body.payment_status) payload.payment_status = "cancelled";
      if (payload.order_status === "refunded" && !body.payment_status) payload.payment_status = "refunded";
      if (payload.order_status === "delivered" && !payload.shipped_at) payload.shipped_at = new Date().toISOString();

      const saved = await supabase(`/orders?id=eq.${encodeURIComponent(orderId)}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      });

      if (body.order_status && body.order_status !== currentRows[0].order_status) {
        await supabase("/order_status_history", {
          method: "POST",
          body: JSON.stringify({
            order_id: orderId,
            previous_status: currentRows[0].order_status,
            new_status: body.order_status,
            changed_by: admin.user.id,
            note: body.internal_note || "Admin status update",
          }),
        });
      }

      return json(res, 200, { order: saved[0] });
    }

    return json(res, 405, { error: "Method not allowed" });
  } catch (error) {
    return json(res, 401, { error: error.message || "Could not load order" });
  }
}
