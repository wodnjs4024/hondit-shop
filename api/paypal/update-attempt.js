import { json, readBody, supabase } from "../_utils.js";

const allowedStatuses = new Set(["payment_failed", "payment_cancelled"]);

export default async function handler(req, res) {
  if (req.method !== "POST") return json(res, 405, { error: "Method not allowed" });

  try {
    const { orderNumber, paypalOrderId, status, reason } = await readBody(req);
    if (!orderNumber) return json(res, 400, { error: "Order number is required" });
    if (!allowedStatuses.has(status)) return json(res, 400, { error: "Unsupported payment attempt status" });

    const rows = await supabase(`/orders?order_number=eq.${encodeURIComponent(orderNumber)}&select=*`);
    if (!rows.length) return json(res, 404, { error: "Order not found" });
    const order = rows[0];
    if (order.payment_status === "completed") return json(res, 409, { error: "Completed orders cannot be marked as failed or cancelled" });

    const now = new Date().toISOString();
    const failureReason = reason || (status === "payment_cancelled" ? "Customer cancelled PayPal checkout" : "PayPal checkout could not be completed");
    const payload = {
      payment_status: status,
      order_status: "pending_payment",
      payment_failure_reason: failureReason,
      paypal_order_id: paypalOrderId || order.paypal_order_id || null,
      updated_at: now,
    };

    await supabase(`/orders?id=eq.${encodeURIComponent(order.id)}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }).catch(() =>
      supabase(`/orders?id=eq.${encodeURIComponent(order.id)}`, {
        method: "PATCH",
        body: JSON.stringify({
          payment_status: status,
          order_status: "pending_payment",
          paypal_order_id: payload.paypal_order_id,
          internal_note: `Payment attempt ${status}: ${failureReason}`,
          updated_at: now,
        }),
      }),
    );

    await supabase("/payment_events", {
      method: "POST",
      body: JSON.stringify({
        order_id: order.id,
        provider: "paypal",
        provider_event_id: paypalOrderId || order.paypal_order_id || orderNumber,
        event_type: status === "payment_cancelled" ? "CHECKOUT.ORDER.CANCELLED" : "CHECKOUT.ORDER.FAILED",
        paypal_order_id: paypalOrderId || order.paypal_order_id,
        amount_sgd: Number(order.total_sgd || 0),
        currency: order.currency || "SGD",
        verified: false,
        raw_payload: { status, reason: failureReason },
      }),
    }).catch(() => {});

    return json(res, 200, { orderNumber, status });
  } catch (error) {
    return json(res, 400, { error: error.message || "Could not update payment attempt" });
  }
}
