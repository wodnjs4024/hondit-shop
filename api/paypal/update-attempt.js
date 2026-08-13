import { json, readBody, supabase } from "../_utils.js";

const allowedStatuses = new Set(["payment_failed", "payment_cancelled"]);
const allowedReasonCodes = new Set([
  "buyer_closed_paypal",
  "paypal_sdk_error",
  "paypal_sdk_init_error",
  "order_creation_failed",
  "capture_failed",
  "capture_not_completed",
  "amount_or_currency_mismatch",
  "network_error",
  "unknown_payment_error",
]);

export default async function handler(req, res) {
  if (req.method !== "POST") return json(res, 405, { error: "Method not allowed" });

  try {
    const { orderNumber, paypalOrderId, status, reason, reasonCode, checkoutStep, clientContext } = await readBody(req);
    if (!orderNumber) return json(res, 400, { error: "Order number is required" });
    if (!allowedStatuses.has(status)) return json(res, 400, { error: "Unsupported payment attempt status" });

    const rows = await supabase(`/orders?order_number=eq.${encodeURIComponent(orderNumber)}&select=*`);
    if (!rows.length) return json(res, 404, { error: "Order not found" });
    const order = rows[0];
    if (order.payment_status === "completed") return json(res, 409, { error: "Completed orders cannot be marked as failed or cancelled" });
    if (
      status === "payment_failed" &&
      order.payment_status === "payment_failed" &&
      String(order.payment_failure_reason || "").startsWith("[")
    ) {
      return json(res, 200, {
        orderNumber,
        status,
        preservedServerDiagnostic: true,
        reason: order.payment_failure_reason,
      });
    }

    const now = new Date().toISOString();
    const normalizedReasonCode = allowedReasonCodes.has(reasonCode)
      ? reasonCode
      : status === "payment_cancelled" ? "buyer_closed_paypal" : "unknown_payment_error";
    const normalizedStep = String(checkoutStep || "unknown").slice(0, 60);
    const message = reason || (status === "payment_cancelled" ? "Buyer closed or cancelled PayPal" : "PayPal checkout could not be completed");
    const failureReason = `[${normalizedReasonCode}] [${normalizedStep}] ${String(message).slice(0, 400)}`;
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
        raw_payload: {
          status,
          reason_code: normalizedReasonCode,
          checkout_step: normalizedStep,
          reason: String(message).slice(0, 400),
          client_context: clientContext && typeof clientContext === "object" ? clientContext : {},
        },
      }),
    }).catch(() => {});

    return json(res, 200, { orderNumber, status, reasonCode: normalizedReasonCode, checkoutStep: normalizedStep });
  } catch (error) {
    return json(res, 400, { error: error.message || "Could not update payment attempt" });
  }
}
