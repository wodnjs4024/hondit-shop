import {assertShippingMatches} from "../../shared/shipping.js";
import { json, notifyTelegramNewOrder, paypal, readBody, recordOrderStock, supabase } from "../_utils.js";
import { validateCapturedPayment } from "../_markets.js";

function findCapture(captureResponse) {
  return captureResponse?.purchase_units?.[0]?.payments?.captures?.[0] || null;
}

function captureFailureCode(message) {
  const normalized = String(message || "").toLowerCase();
  if (normalized.includes("was not completed")) return "capture_not_completed";
  if (normalized.includes("amount does not match")) return "amount_or_currency_mismatch";
  if (normalized.includes("does not match hondit order")) return "paypal_order_mismatch";
  if (normalized.includes("fetch") || normalized.includes("network") || normalized.includes("timeout")) return "network_error";
  return "capture_api_failed";
}

export default async function handler(req, res) {
  if (process.env.VERCEL_ENV === "preview" && !["GET", "HEAD", "OPTIONS"].includes(req.method)) { res.status(403).json({ error: "Read-only preview: payments and data changes are disabled." }); return; }
  if (req.method !== "POST") return json(res, 405, { error: "Method not allowed" });

  let order = null;
  let paypalOrderId = "";
  let captureStarted = false;
  let verifiedCapture = null;
  try {
    const body = await readBody(req);
    paypalOrderId = body.paypalOrderId;
    const { orderNumber } = body;
    if (!paypalOrderId || !orderNumber) return json(res, 400, { error: "PayPal order ID and order number are required" });

    const orderRows = await supabase(`/orders?order_number=eq.${encodeURIComponent(orderNumber)}&select=*`);
    if (!orderRows.length) return json(res, 404, { error: "Order not found" });
    order = orderRows[0];
    if (order.paypal_order_id !== paypalOrderId) return json(res, 409, { error: "PayPal order ID does not match hondit order" });

    // Verify before any financial capture; never replace the site's saved address.
    if (order.payment_status === 'completed') return json(res, 200, { orderNumber: order.order_number, paymentStatus: 'completed' });
    if (String(order.internal_note||'').startsWith('[shipping:v1]')) {
    const approved = await paypal(`/v2/checkout/orders/${encodeURIComponent(paypalOrderId)}`, { method: 'GET' });
    assertShippingMatches(order, approved);
    }
    captureStarted = true;
    const captureResponse = await paypal(`/v2/checkout/orders/${encodeURIComponent(paypalOrderId)}/capture`, {
      method: "POST",
      body: JSON.stringify({}),
    });
    if(String(order.internal_note||'').startsWith('[shipping:v1]')) assertShippingMatches(order, captureResponse);
    const capture = findCapture(captureResponse);
    const expectedCurrency = order.currency || "SGD";
    const { paidAmount, paidCurrency } = validateCapturedPayment(capture, order.total_sgd, expectedCurrency);
    verifiedCapture = capture;

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
    }).catch(() => {});

    await supabase("/order_status_history", {
      method: "POST",
      body: JSON.stringify({
        order_id: order.id,
        previous_status: order.order_status,
        new_status: "paid",
        note: "PayPal payment captured and verified",
      }),
    }).catch(() => {});

    // Stock is deducted once per order (the database ignores repeats); a failure here never changes the payment result.
    await recordOrderStock(order.id).catch(() => {});

    const items = await supabase(`/order_items?order_id=eq.${encodeURIComponent(order.id)}&select=product_name_snapshot,volume_snapshot,total_units,line_total_sgd`).catch(() => []);
    await notifyTelegramNewOrder(
      {
        ...order,
        paypal_capture_id: capture.id,
        payment_status: "completed",
        order_status: "paid",
        paid_at: now,
      },
      items,
    ).catch(() => {
      console.error("Telegram notification failed; verified order preserved");
    });

    return json(res, 200, { orderNumber });
  } catch (error) {
    // A lost response or database error after capture cannot prove a payment failure.
    // The existing verified webhook can reconcile; otherwise staff must check PayPal.
    if (captureStarted) {
      console.error('PAYMENT_REVIEW_REQUIRED: capture response or persistence needs reconciliation');
      if(order?.id) await supabase('/payment_events',{method:'POST',body:JSON.stringify({order_id:order.id,provider:'paypal',provider_event_id:verifiedCapture?.id||paypalOrderId,event_type:'CHECKOUT.ORDER.REVIEW_REQUIRED',paypal_order_id:paypalOrderId,paypal_capture_id:verifiedCapture?.id||null,amount_sgd:Number(order.total_sgd),currency:order.currency||'SGD',verified:Boolean(verifiedCapture),raw_payload:{reason_code:'capture_or_persistence_uncertain'}})}).catch(()=>{});
      return json(res,409,{code:'PAYMENT_REVIEW_REQUIRED',error:'Payment verification pending. Do not pay again; contact HONDIT with your order reference.'});
    }
    if (String(error.message).startsWith('Shipping verification failed')) {
      if (order) await supabase(`/orders?id=eq.${encodeURIComponent(order.id)}`, {method:'PATCH',body:JSON.stringify({order_status:'address_check',internal_note:`${order.internal_note||''} Shipping verification requires manual review. No address was overwritten.`})}).catch(()=>{});
      return json(res,409,{error:'Shipping verification failed. Please contact hondit before retrying.'});
    }
    if (order?.id) {
      const now = new Date().toISOString();
      const failureReason = error.message || "Could not capture PayPal order";
      const reasonCode = captureFailureCode(failureReason);
      await supabase(`/orders?id=eq.${encodeURIComponent(order.id)}&payment_status=neq.completed`, {
        method: "PATCH",
        body: JSON.stringify({
          payment_status: "payment_failed",
          order_status: order.order_status === "paid" ? "paid" : "pending_payment",
          payment_failure_reason: `[${reasonCode}] [capture] ${failureReason}`,
          updated_at: now,
        }),
      }).catch(() =>
        supabase(`/orders?id=eq.${encodeURIComponent(order.id)}&payment_status=neq.completed`, {
          method: "PATCH",
          body: JSON.stringify({
            payment_status: "payment_failed",
            order_status: order.order_status === "paid" ? "paid" : "pending_payment",
            internal_note: `PayPal capture failed (${reasonCode}): ${failureReason}`,
            updated_at: now,
          }),
        }),
      );

      await supabase("/payment_events", {
        method: "POST",
        body: JSON.stringify({
          order_id: order.id,
          provider: "paypal",
          provider_event_id: paypalOrderId || null,
          event_type: "CHECKOUT.ORDER.CAPTURE_FAILED",
          paypal_order_id: paypalOrderId || order.paypal_order_id,
          amount_sgd: Number(order.total_sgd || 0),
          currency: order.currency || "SGD",
          verified: false,
          raw_payload: { reason_code: reasonCode, checkout_step: "capture", error: failureReason },
        }),
      }).catch(() => {});
    }
    return json(res, 400, { error: error.message || "Could not capture PayPal order" });
  }
}
