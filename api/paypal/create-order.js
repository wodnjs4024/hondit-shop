import {purchaseContext,purchaseRoute} from "../../shared/purchase-context.js";
import {normalizeShipping, paypalShipping} from "../../shared/shipping.js";
import { sgCheckoutNeedsInquiry, sgTerms } from "../../shared/page-sales.js";
import { livePaymentTestProduct } from "../_bulk-data.js";
import { calculateCart, createOrderNumber, getProducts, json, paypal, readBody, supabase } from "../_utils.js";
import { formatPayPalAmount, getMarketLineTotal, getMarketUnitPrice, isBulkProductAllowedForMarket, resolveMarket } from "../_markets.js";

function validateCheckout(body) {
  const required = ["orderType", "customerName", "customerEmail", "customerPhone", "addressLine1", "city"];
  const missing = required.filter((key) => !String(body[key] || "").trim());
  if (missing.length) throw new Error(`Missing checkout fields: ${missing.join(", ")}`);
  if (typeof body.customerEmail !== 'string' || body.customerEmail.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.customerEmail.trim())) throw new Error('Invalid order email');
  if (typeof body.customerPhone !== 'string' || body.customerPhone.trim().length > 40) throw new Error('Invalid delivery phone');
  if (!Array.isArray(body.cart) || !body.cart.length) throw new Error("Cart is empty");
}

async function markFailed(order, reason, reasonCode = "order_creation_failed", checkoutStep = "create_order") {
  if (!order?.id) return;
  const now = new Date().toISOString();
  const payload = {
    payment_status: "payment_failed",
    order_status: "pending_payment",
    payment_failure_reason: `[${reasonCode}] [${checkoutStep}] ${reason}`,
    internal_note: `PayPal checkout failed (${reasonCode} / ${checkoutStep}): ${reason}`,
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

  await supabase("/payment_events", {
    method: "POST",
    body: JSON.stringify({
      order_id: order.id,
      provider: "paypal",
      provider_event_id: `${order.order_number}-${reasonCode}`,
      event_type: "CHECKOUT.ORDER.CREATE_FAILED",
      paypal_order_id: order.paypal_order_id || null,
      amount_sgd: Number(order.total_sgd || 0),
      currency: order.currency || "SGD",
      verified: false,
      raw_payload: { reason_code: reasonCode, checkout_step: checkoutStep, error: String(reason).slice(0, 400) },
    }),
  }).catch(() => {});
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
  if (process.env.VERCEL_ENV === "preview" && !["GET", "HEAD", "OPTIONS"].includes(req.method)) { res.status(403).json({ error: "Read-only preview: payments and data changes are disabled." }); return; }
  if (req.method !== "POST") return json(res, 405, { error: "Method not allowed" });

  let order = null;
  let checkoutStep = "validation";

  try {
    const body = await readBody(req);
    const salesContext=purchaseContext(body);
    if(salesContext.fulfillment!=="international_bundle") return json(res,403,{error:"Pickup payment is not approved"});
    const market = resolveMarket(body);
    validateCheckout(body);
    const shipping = normalizeShipping(body, market);
    await ensureCheckoutEnabled();

    const products = await getProducts();
    const checkoutProducts = body.cart.some((item) => item.slug === livePaymentTestProduct.slug)
      ? [...products, livePaymentTestProduct]
      : products;
    if (sgCheckoutNeedsInquiry(body.cart.map(item => ({ product: checkoutProducts.find(p => p.slug === item.slug), quantity: item.packCount })), market.code)) throw new Error("This Singapore quantity or combination requires an enquiry before payment.");
    const pricingProducts = market.code === "SG" ? checkoutProducts.map(p => sgTerms(p) ? {...p,packQuantity:sgTerms(p).moq} : p) : checkoutProducts;
    const summary = calculateCart(body.cart, pricingProducts);
    if (!body.cart.some(item=>item.slug===livePaymentTestProduct.slug) && purchaseRoute(summary.lines.map(line=>({product:line.product,quantity:line.totalUnits})),market.code)!=='direct') throw new Error('This quantity or combination requires consultation before payment.');
    const blockedProduct = summary.lines.find((line) => !isBulkProductAllowedForMarket(line.product, market));
    if (blockedProduct) {
      throw new Error(`${blockedProduct.product.name} is not available for ${market.countryName}.`);
    }
    const marketLines = summary.lines.map((line) => {
      const marketUnitPrice = getMarketUnitPrice(line.product, market);
      const marketLineTotal = getMarketLineTotal(line.product, line.totalUnits, market);
      return { ...line, marketUnitPrice, marketLineTotal };
    });
    const marketTotal = market.code === "SG" && marketLines.every(line => sgTerms(line.product))
      ? marketLines.reduce((sum, line) => sum + sgTerms(line.product).unitMinor * line.totalUnits, 0) / 100
      : Number(marketLines.reduce((sum, line) => sum + line.marketLineTotal, 0).toFixed(2));
    const marketTotalLabel = market.currency === "JPY" ? String(Math.round(marketTotal)) : marketTotal.toFixed(2);
    const orderNumber = createOrderNumber();
    const attribution = body.attribution || {};

    const orderPayload = {
      order_number: orderNumber,
      order_type: body.orderType,
      customer_name: shipping.name,
      customer_email: body.customerEmail.trim(),
      customer_phone: body.customerPhone.trim(),
      company_name: body.companyName || null,
      country_code: market.countryCode,
      address_line_1: shipping.line1,
      address_line_2: shipping.line2 || null,
      city: shipping.city,
      postal_code: shipping.postal,
      customer_note: body.customerNote || null,
      internal_note: `[shipping:v1] [sales:v1 fulfillment=${salesContext.fulfillment} purpose=${salesContext.purpose}] ${market.checkoutNote} Fixed ${market.currency} market total: ${marketTotalLabel}. Source SGD reference total: ${summary.totalSgd.toFixed(2)}.`,
      utm_source: attribution.utm_source || attribution.traffic_source || null,
      utm_medium: attribution.utm_medium || attribution.traffic_medium || null,
      utm_campaign: attribution.utm_campaign || attribution.traffic_campaign || null,
      utm_content: attribution.utm_content || attribution.traffic_content || null,
      utm_term: attribution.utm_term || attribution.traffic_term || null,
      landing_page: attribution.landing_page || null,
      referrer: attribution.referrer || req.headers.referer || null,
      currency: market.currency,
      total_packs: summary.totalPacks,
      total_units: summary.totalUnits,
      total_sgd: marketTotal,
      shipping_included: true,
      payment_provider: "paypal",
      payment_status: "pending_payment",
      order_status: "pending_payment",
    };

    checkoutStep = "database_order";
    const orderRows = await createOrderRow(orderPayload);
    order = orderRows[0];

    checkoutStep = "database_items";
    await supabase("/order_items", {
      method: "POST",
      body: JSON.stringify(
        marketLines.map((line) => ({
          order_id: order.id,
          product_id: line.product.slug === livePaymentTestProduct.slug ? null : line.product.id,
          product_slug: line.product.slug,
          product_name_snapshot: line.product.name,
          volume_snapshot: line.product.volumeLabel,
          unit_price_sgd_snapshot: line.marketUnitPrice,
          pack_quantity_snapshot: line.product.packQuantity,
          pack_price_sgd_snapshot: Number((line.marketUnitPrice * line.product.packQuantity).toFixed(2)),
          pack_count: line.packCount,
          total_units: line.totalUnits,
          line_total_sgd: line.marketLineTotal,
        })),
      ),
    });

    checkoutStep = "paypal_order_create";
    const paypalOrder = await paypal("/v2/checkout/orders", {
      method: "POST",
      body: JSON.stringify({
        intent: "CAPTURE",
        payment_source: { paypal: { experience_context: { shipping_preference: "SET_PROVIDED_ADDRESS" } } },
        purchase_units: [
          {
            reference_id: orderNumber,
            description: `hondit ${market.countryName} bulk order`,
            custom_id: order.id,
            shipping: paypalShipping(shipping),
            amount: {
              currency_code: market.currency,
              value: formatPayPalAmount(marketTotal, market.currency),
            },
          },
        ],
      }),
    });

    checkoutStep = "database_paypal_link";
    await supabase(`/orders?id=eq.${encodeURIComponent(order.id)}`, {
      method: "PATCH",
      body: JSON.stringify({ paypal_order_id: paypalOrder.id, updated_at: new Date().toISOString() }),
    });

    return json(res, 200, { paypalOrderId: paypalOrder.id, orderNumber });
  } catch (error) {
    const reasonCode = checkoutStep === "paypal_order_create"
      ? "paypal_order_api_failed"
      : checkoutStep.startsWith("database_")
        ? "checkout_database_failed"
        : "checkout_validation_failed";
    await markFailed(order, error.message || "Could not create PayPal order", reasonCode, checkoutStep);
    return json(res, 400, { error: error.message || "Could not create PayPal order" });
  }
}
