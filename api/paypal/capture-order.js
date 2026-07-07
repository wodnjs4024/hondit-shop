import { json, paypal, readBody, supabase } from "../_utils.js";

function findCapture(captureResponse) {
  return captureResponse?.purchase_units?.[0]?.payments?.captures?.[0] || null;
}

export default async function handler(req, res) {
  if (req.method !== "POST") return json(res, 405, { error: "Method not allowed" });

  try {
    const { paypalOrderId, orderNumber } = await readBody(req);
    if (!paypalOrderId || !orderNumber) return json(res, 400, { error: "PayPal order ID and order number are required" });

    const orderRows = await supabase(`/orders?order_number=eq.${encodeURIComponent(orderNumber)}&select=*`);
    if (!orderRows.length) return json(res, 404, { error: "Order not found" });
    const order = orderRows[0];
    if (order.paypal_order_id !== paypalOrderId) return json(res, 409, { error: "PayPal order ID does not match hondit order" });

    const captureResponse = await paypal(`/v2/checkout/orders/${encodeURIComponent(paypalOrderId)}/capture`, {
      method: "POST",
      body: JSON.stringify({}),
    });
    const capture = findCapture(captureResponse);
    if (!capture || capture.status !== "COMPLETED") throw new Error("PayPal capture was not completed");

    const paidAmount = Number(capture.amount?.value || 0);
    const paidCurrency = capture.amount?.currency_code;
    if (paidCurrency !== "SGD" || Math.abs(paidAmount - Number(order.total_sgd)) > 0.01) {
      throw new Error("PayPal paid amount does not match the hondit order total");
    }

    const now = new Date().toISOString();
    await supabase(`/orders?id=eq.${encodeURIComponent(order.id)}`, {
      method: "PATCH",
      body: JSON.stringify({
        paypal_capture_id: capture.id,
        paypal_payer_id: captureResponse?.payer?.payer_id || null,
        payment_status: "completed",
        order_status: "paid",
        paid_at: now,
        updated_at: now,
      }),
    });

    await supabase("/payment_events", {
      method: "POST",
      body: JSON.stringify({
        order_id: order.id,
        provider: "paypal",
        provider_event_id: capture.id,
        event_type: "CHECKOUT.ORDER.APPROVED",
        paypal_order_id: paypalOrderId,
        paypal_capture_id: capture.id,
        amount_sgd: paidAmount,
        currency: paidCurrency,
        verified: true,
        raw_payload: captureResponse,
      }),
    });

    await supabase("/order_status_history", {
      method: "POST",
      body: JSON.stringify({
        order_id: order.id,
        previous_status: order.order_status,
        new_status: "paid",
        note: "PayPal Sandbox payment captured",
      }),
    });

    return json(res, 200, { orderNumber });
  } catch (error) {
    return json(res, 400, { error: error.message || "Could not capture PayPal order" });
  }
}
