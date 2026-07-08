import { json, paypal, readBody, supabase, verifyAdmin } from "../../../_utils.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return json(res, 405, { error: "Method not allowed" });

  try {
    const admin = await verifyAdmin(req);
    const orderId = req.query?.orderId ? String(req.query.orderId) : "";
    const body = await readBody(req);
    const reason = String(body.reason || "Admin PayPal refund").trim();
    if (!orderId) return json(res, 400, { error: "Order ID is required" });

    const orders = await supabase(`/orders?id=eq.${encodeURIComponent(orderId)}&select=*`);
    const order = orders[0];
    if (!order) return json(res, 404, { error: "Order not found" });
    if (!order.paypal_capture_id) return json(res, 400, { error: "PayPal capture ID is missing" });
    if (order.payment_status === "refunded") return json(res, 409, { error: "Order is already marked as refunded" });

    const refund = await paypal(`/v2/payments/captures/${encodeURIComponent(order.paypal_capture_id)}/refund`, {
      method: "POST",
      body: JSON.stringify({
        amount: {
          value: Number(order.total_sgd).toFixed(2),
          currency_code: order.currency || "SGD",
        },
        note_to_payer: "hondit order refund",
      }),
    });

    const now = new Date().toISOString();
    await supabase(`/orders?id=eq.${encodeURIComponent(order.id)}`, {
      method: "PATCH",
      body: JSON.stringify({
        payment_status: "refunded",
        order_status: "refunded",
        refund_reason: reason,
        refunded_at: now,
        updated_at: now,
      }),
    });

    await supabase("/payment_events", {
      method: "POST",
      body: JSON.stringify({
        order_id: order.id,
        provider: "paypal",
        provider_event_id: refund.id,
        event_type: "PAYMENT.CAPTURE.REFUNDED",
        paypal_order_id: order.paypal_order_id,
        paypal_capture_id: order.paypal_capture_id,
        amount_sgd: Number(refund.amount?.value || order.total_sgd),
        currency: refund.amount?.currency_code || order.currency || "SGD",
        verified: true,
        raw_payload: refund,
      }),
    });

    await supabase("/order_status_history", {
      method: "POST",
      body: JSON.stringify({
        order_id: order.id,
        previous_status: order.order_status,
        new_status: "refunded",
        changed_by: admin.user.id,
        note: reason,
      }),
    });

    return json(res, 200, { refund });
  } catch (error) {
    return json(res, 400, { error: error.message || "Could not refund order" });
  }
}
