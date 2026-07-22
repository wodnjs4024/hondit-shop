import { calculateCart, createOrderNumber, getProducts, json, paypal, readBody, supabase } from "../_utils.js";

function validateCheckout(body) {
  const required = ["orderType", "customerName", "customerEmail", "customerPhone", "addressLine1", "city", "postalCode"];
  const missing = required.filter((key) => !String(body[key] || "").trim());
  if (missing.length) throw new Error(`Missing checkout fields: ${missing.join(", ")}`);
  if (body.countryCode !== "SG") throw new Error("Bulk checkout is currently available for Singapore delivery only");
  if (!Array.isArray(body.cart) || !body.cart.length) throw new Error("Cart is empty");
}

async function markFailed(order, reason) {
  if (!order?.id) return;
  const now = new Date().toISOString();
  const payload = {
    payment_status: "payment_failed",
    order_status: "pending_payment",
    payment_failure_reason: reason,
    internal_note: `PayPal order creation failed: ${reason}`,
    updated_at: now,
  };

  await supabase(`/orders?id=eq.${encodeURIComponent(order.id)}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  }).catch(() =>
    supabase(`/orders?id=eq.${encodeURIComponent(order.id)}`, {
      method: "PATCH",
      body: JSON.stringify({
        payment_status: "payment_failed",
        order_status: "pending_payment",
        internal_note: payload.internal_note,
        updated_at: now,
      }),
    }),
  );
}

async function ensureCheckoutEnabled() {
  const rows = await supabase("/site_settings?id=eq.1&select=checkout_enabled");
  if (rows?.[0]?.checkout_enabled === false) {
    throw new Error("Direct PayPal checkout is temporarily closed. Please contact hondit.");
  }
}

async function createOrderRow(orderPayload) {
  try {
    return await supabase("/orders", {
      method: "POST",
      body: JSON.stringify(orderPayload),
    });
  } catch (error) {
    const message = String(error?.message || "").toLowerCase();
    const isUtmColumnMismatch = message.includes("utm_content") || message.includes("utm_term") || message.includes("column");
    if (!isUtmColumnMismatch) throw error;

    const fallbackPayload = { ...orderPayload };
    delete fallbackPayload.utm_content;
    delete fallbackPayload.utm_term;
    return supabase("/orders", {
      method: "POST",
      body: JSON.stringify(fallbackPayload),
    });
  }
}

export default async function handler(req, res) {
  if (req.method !== "POST") return json(res, 405, { error: "Method not allowed" });

  let order = null;

  try {
    const body = await readBody(req);
    validateCheckout(body);
    await ensureCheckoutEnabled();

    const products = await getProducts();
    const summary = calculateCart(body.cart, products);
    const orderNumber = createOrderNumber();
    const attribution = body.attribution || {};

    const orderPayload = {
      order_number: orderNumber,
      order_type: body.orderType,
      customer_name: body.customerName.trim(),
      customer_email: body.customerEmail.trim(),
      customer_phone: body.customerPhone.trim(),
      company_name: body.companyName || null,
      country_code: "SG",
      address_line_1: body.addressLine1.trim(),
      address_line_2: body.addressLine2 || null,
      city: body.city.trim(),
      postal_code: body.postalCode.trim(),
      customer_note: body.customerNote || null,
      internal_note: "Free Singapore EMS shipping is included in the displayed bulk unit price.",
      utm_source: attribution.utm_source || attribution.traffic_source || null,
      utm_medium: attribution.utm_medium || attribution.traffic_medium || null,
      utm_campaign: attribution.utm_campaign || attribution.traffic_campaign || null,
      utm_content: attribution.utm_content || attribution.traffic_content || null,
      utm_term: attribution.utm_term || attribution.traffic_term || null,
      landing_page: attribution.landing_page || null,
      referrer: attribution.referrer || req.headers.referer || null,
      currency: "SGD",
      total_packs: summary.totalPacks,
      total_units: summary.totalUnits,
      total_sgd: summary.totalSgd,
      shipping_included: true,
      payment_provider: "paypal",
      payment_status: "pending_payment",
      order_status: "pending_payment",
    };

    const orderRows = await createOrderRow(orderPayload);
    order = orderRows[0];

    await supabase("/order_items", {
      method: "POST",
      body: JSON.stringify(
        summary.lines.map((line) => ({
          order_id: order.id,
          product_id: line.product.id,
          product_slug: line.product.slug,
          product_name_snapshot: line.product.name,
          volume_snapshot: line.product.volumeLabel,
          unit_price_sgd_snapshot: line.product.unitPriceSgd,
          pack_quantity_snapshot: line.product.packQuantity,
          pack_price_sgd_snapshot: Number((line.product.unitPriceSgd * line.product.packQuantity).toFixed(2)),
          pack_count: line.packCount,
          total_units: line.totalUnits,
          line_total_sgd: line.lineTotalSgd,
        })),
      ),
    });

    const paypalOrder = await paypal("/v2/checkout/orders", {
      method: "POST",
      body: JSON.stringify({
        intent: "CAPTURE",
        purchase_units: [
          {
            reference_id: orderNumber,
            description: "hondit Singapore bulk order",
            custom_id: order.id,
            amount: {
              currency_code: "SGD",
              value: summary.totalSgd.toFixed(2),
            },
          },
        ],
      }),
    });

    await supabase(`/orders?id=eq.${encodeURIComponent(order.id)}`, {
      method: "PATCH",
      body: JSON.stringify({ paypal_order_id: paypalOrder.id, updated_at: new Date().toISOString() }),
    });

    return json(res, 200, { paypalOrderId: paypalOrder.id, orderNumber });
  } catch (error) {
    await markFailed(order, error.message || "Could not create PayPal order");
    return json(res, 400, { error: error.message || "Could not create PayPal order" });
  }
}
