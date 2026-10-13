import {assertShippingMatches} from "../../shared/shipping.js";
import {validateCapturedPayment} from '../_markets.js';
import {paypal} from "../_utils.js";
import { getPayPalAccessToken, json, notifyTelegramNewOrder, readBody, supabase } from "../_utils.js";

async function verifyWebhook(req, event) {
  if (!process.env.PAYPAL_WEBHOOK_ID) return false;
  const { token, base } = await getPayPalAccessToken();
  const response = await fetch(`${base}/v1/notifications/verify-webhook-signature`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      auth_algo: req.headers["paypal-auth-algo"],
      cert_url: req.headers["paypal-cert-url"],
      transmission_id: req.headers["paypal-transmission-id"],
      transmission_sig: req.headers["paypal-transmission-sig"],
      transmission_time: req.headers["paypal-transmission-time"],
      webhook_id: process.env.PAYPAL_WEBHOOK_ID,
      webhook_event: event,
    }),
  });
  const data = await response.json().catch(() => ({}));
  return response.ok && data.verification_status === "SUCCESS";
}

export default async function handler(req, res) {
  if (process.env.VERCEL_ENV === "preview" && !["GET", "HEAD", "OPTIONS"].includes(req.method)) { res.status(403).json({ error: "Read-only preview: payments and data changes are disabled." }); return; }
  if (req.method !== "POST") return json(res, 405, { error: "Method not allowed" });

  try {
    const event = await readBody(req);
    const verified = await verifyWebhook(req, event);
    const paypalOrderId = event?.resource?.supplementary_data?.related_ids?.order_id || event?.resource?.id || null;
    const captureId = event?.resource?.id || null;
    const amount = Number(event?.resource?.amount?.value || 0);
    const currency = event?.resource?.amount?.currency_code || "SGD";

    let order = null;
    if (paypalOrderId) {
      const rows = await supabase(`/orders?paypal_order_id=eq.${encodeURIComponent(paypalOrderId)}&select=*`);
      order = rows[0] || null;
    }

    await supabase("/payment_events", {
      method: "POST",
      body: JSON.stringify({
        order_id: order?.id || null,
        provider: "paypal",
        provider_event_id: event.id || captureId,
        event_type: event.event_type || "PAYPAL.WEBHOOK",
        paypal_order_id: paypalOrderId,
        paypal_capture_id: captureId,
        amount_sgd: amount || null,
        currency,
        verified,
        raw_payload: event,
      }),
    }).catch(() => null);

    if (verified && order && event.event_type === "PAYMENT.CAPTURE.COMPLETED") {
      if(event.resource?.supplementary_data?.related_ids?.order_id!==order.paypal_order_id) return json(res,409,{error:'Webhook order mismatch'});
      validateCapturedPayment(event.resource,order.total_sgd,order.currency||'SGD');
      if(['completed','refunded','partially_refunded'].includes(order.payment_status)) return json(res,200,{received:true,preserved:true});
      try { if(String(order.internal_note||'').startsWith('[shipping:v1]')) { const details=await paypal(`/v2/checkout/orders/${encodeURIComponent(order.paypal_order_id)}`,{method:'GET'});assertShippingMatches(order,details); } }
      catch {await supabase(`/orders?id=eq.${encodeURIComponent(order.id)}`,{method:'PATCH',body:JSON.stringify({order_status:'address_check',internal_note:`${order.internal_note||''} Webhook shipping verification requires manual review. Address unchanged.`})});return json(res,409,{error:'Shipping verification requires review'});}

      await supabase(`/orders?id=eq.${encodeURIComponent(order.id)}`, {
        method: "PATCH",
        body: JSON.stringify({
          payment_status: "completed",
          order_status: order.order_status === "pending_payment" ? "paid" : order.order_status,
          paypal_capture_id: captureId,
          paid_at: order.paid_at || new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }),
      });

      if (order.payment_status !== "completed") {
        const items = await supabase(`/order_items?order_id=eq.${encodeURIComponent(order.id)}&select=product_name_snapshot,volume_snapshot,total_units,line_total_sgd`).catch(() => []);
        await notifyTelegramNewOrder(
          {
            ...order,
            payment_status: "completed",
            order_status: order.order_status === "pending_payment" ? "paid" : order.order_status,
            paypal_capture_id: captureId,
          },
          items,
        ).catch(() => {
          console.error("Telegram notification failed; verified order preserved");
        });
      }
    }

    return json(res, 200, { received: true });
  } catch (error) {
    return json(res, 400, { error: error.message || "Webhook failed" });
  }
}
