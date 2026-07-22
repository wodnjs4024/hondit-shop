import { randomUUID } from "node:crypto";
import {
  getProducts,
  json,
  paypal,
  readBody,
  requireEnv,
  supabase,
  toDbProduct,
  verifyAdmin,
} from "./_utils.js";

const defaultSettings = {
  id: 1,
  legal_business_name: "",
  business_registration_number: "",
  business_address: "",
  customer_service_email: "",
  paypal_mode: process.env.PAYPAL_ENV || "sandbox",
  checkout_enabled: true,
};

function segments(req) {
  const url = new URL(req.url, "https://hondit.local");
  const rewrittenPath = url.searchParams.get("path");
  const path = rewrittenPath || url.pathname.replace(/^\/api\/admin\/?/, "");
  return path.split("/").filter(Boolean);
}

function escapeLike(value) {
  return String(value || "").replace(/[%*_]/g, "");
}

function queryValue(req, key) {
  const value = req.query?.[key];
  if (Array.isArray(value)) return value[0] || "";
  if (value) return String(value);
  return new URL(req.url, "https://hondit.local").searchParams.get(key) || "";
}

function cleanRequired(value, maxLength) {
  return String(value ?? "").trim().slice(0, maxLength);
}

function cleanOptional(value, maxLength) {
  const cleaned = cleanRequired(value, maxLength);
  return cleaned || null;
}

function countWhere(orders, key, value) {
  return orders.filter((order) => order[key] === value).length;
}

function topCounts(rows, key, labelKey = key) {
  const map = new Map();
  rows.forEach((row) => {
    const label = row[labelKey] || row[key] || "Unknown";
    const current = map.get(label) || { label, count: 0, units: 0, revenueSgd: 0 };
    current.count += 1;
    current.units += Number(row.total_units || 0);
    current.revenueSgd += Number(row.line_total_sgd || row.total_sgd || 0);
    map.set(label, current);
  });
  return Array.from(map.values())
    .sort((a, b) => b.units + b.count - (a.units + a.count))
    .slice(0, 6)
    .map((item) => ({ ...item, revenueSgd: Number(item.revenueSgd.toFixed(2)) }));
}

async function login(req, res) {
  if (req.method !== "POST") return json(res, 405, { error: "Method not allowed" });
  requireEnv(["SUPABASE_URL", "VITE_SUPABASE_ANON_KEY"]);
  const { email, password } = await readBody(req);
  if (!email || !password) return json(res, 400, { error: "Email and password are required" });

  const response = await fetch(`${process.env.SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: {
      apikey: process.env.VITE_SUPABASE_ANON_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });
  const data = await response.json();
  if (!response.ok || !data.access_token || !data.user?.id) {
    return json(res, 401, { error: "Admin login failed" });
  }

  const profiles = await supabase(`/admin_profiles?user_id=eq.${encodeURIComponent(data.user.id)}&select=user_id,email,role`);
  if (!profiles.length) return json(res, 403, { error: "This account is not registered as a hondit admin" });
  return json(res, 200, { accessToken: data.access_token });
}

async function summary(req, res) {
  if (req.method !== "GET") return json(res, 405, { error: "Method not allowed" });
  await verifyAdmin(req);
  const orders = await supabase("/orders?select=*&order=created_at.desc&limit=200");
  const items = await supabase("/order_items?select=order_id,product_slug,product_name_snapshot,total_units,line_total_sgd&order=created_at.desc&limit=500");
  const paidOrders = orders.filter((order) => order.payment_status === "completed");
  const checkoutAttempts = orders.filter((order) => order.payment_status !== "completed");
  const paidOrderIds = new Set(paidOrders.map((order) => order.id));
  const paidItems = items.filter((item) => paidOrderIds.has(item.order_id));
  const revenueSgd = paidOrders.reduce((sum, order) => sum + Number(order.total_sgd || 0), 0);

  return json(res, 200, {
    totals: {
      totalOrders: paidOrders.length,
      checkoutAttempts: checkoutAttempts.length,
      pendingPayment: countWhere(checkoutAttempts, "payment_status", "pending_payment"),
      paid: paidOrders.length,
      preparing: countWhere(orders, "order_status", "preparing"),
      packed: countWhere(orders, "order_status", "packed"),
      shipped: countWhere(orders, "order_status", "shipped"),
      delivered: countWhere(orders, "order_status", "delivered"),
      closed: orders.filter((order) => ["cancelled", "refunded"].includes(order.order_status)).length,
      totalPaidSgd: Number(revenueSgd.toFixed(2)),
    },
    recentOrders: paidOrders.slice(0, 8),
    checkoutAttempts: checkoutAttempts.slice(0, 5),
    popularProducts: topCounts(paidItems, "product_slug", "product_name_snapshot"),
    countries: topCounts(paidOrders, "country_code"),
    sources: topCounts(paidOrders.map((order) => ({
      ...order,
      traffic_source:
        [order.utm_source, order.utm_medium, order.utm_campaign, order.utm_content, order.utm_term].filter(Boolean).join(" / ") ||
        order.referrer ||
        "Direct / unknown",
    })), "traffic_source"),
  });
}

async function ordersIndex(req, res) {
  if (req.method !== "GET") return json(res, 405, { error: "Method not allowed" });
  await verifyAdmin(req);
  const status = req.query?.status ? String(req.query.status) : "";
  const paymentStatus = req.query?.paymentStatus ? String(req.query.paymentStatus) : "";
  const orderStatus = req.query?.orderStatus ? String(req.query.orderStatus) : status;
  const orderType = req.query?.orderType ? escapeLike(req.query.orderType) : "";
  const from = req.query?.from ? String(req.query.from) : "";
  const to = req.query?.to ? String(req.query.to) : "";
  const search = req.query?.search ? escapeLike(req.query.search) : escapeLike(req.query?.q);
  const params = ["select=*", "order=created_at.desc", "limit=200"];
  if (paymentStatus) params.push(`payment_status=eq.${encodeURIComponent(paymentStatus)}`);
  if (orderStatus) params.push(`order_status=eq.${encodeURIComponent(orderStatus)}`);
  if (orderType) params.push(`order_type=ilike.*${encodeURIComponent(orderType)}*`);
  if (from) params.push(`created_at=gte.${encodeURIComponent(`${from}T00:00:00.000Z`)}`);
  if (to) params.push(`created_at=lte.${encodeURIComponent(`${to}T23:59:59.999Z`)}`);
  if (search) params.push(`or=(order_number.ilike.*${encodeURIComponent(search)}*,customer_email.ilike.*${encodeURIComponent(search)}*,customer_name.ilike.*${encodeURIComponent(search)}*)`);
  const orders = await supabase(`/orders?${params.join("&")}`);
  return json(res, 200, { orders });
}

async function orderDetail(req, res, orderId) {
  const admin = await verifyAdmin(req);
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
      customer_name: body.customer_name || undefined,
      customer_email: body.customer_email || undefined,
      customer_phone: body.customer_phone || undefined,
      company_name: body.company_name || null,
      address_line_1: body.address_line_1 || undefined,
      address_line_2: body.address_line_2 || null,
      city: body.city || undefined,
      postal_code: body.postal_code || undefined,
      tracking_carrier: body.tracking_carrier || null,
      tracking_number: body.tracking_number || null,
      shipped_at: body.shipped_at || null,
      shipping_note: body.shipping_note || null,
      cancellation_reason: body.cancellation_reason || null,
      refund_reason: body.refund_reason || null,
      payment_failure_reason: body.payment_failure_reason || null,
      internal_note: body.internal_note || null,
      updated_at: new Date().toISOString(),
    };
    if (payload.order_status === "cancelled" && !body.payment_status) payload.payment_status = "cancelled";
    if (payload.order_status === "refunded" && !body.payment_status) payload.payment_status = "refunded";
    if (payload.order_status === "delivered" && !payload.shipped_at) payload.shipped_at = new Date().toISOString();
    let saved = await supabase(`/orders?id=eq.${encodeURIComponent(orderId)}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }).catch(() => {
      const { payment_failure_reason, ...fallbackPayload } = payload;
      if (payment_failure_reason && !fallbackPayload.internal_note) {
        fallbackPayload.internal_note = `Payment failure reason: ${payment_failure_reason}`;
      }
      return supabase(`/orders?id=eq.${encodeURIComponent(orderId)}`, {
        method: "PATCH",
        body: JSON.stringify(fallbackPayload),
      });
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
}

async function refundOrder(req, res, orderId) {
  if (req.method !== "POST") return json(res, 405, { error: "Method not allowed" });
  const admin = await verifyAdmin(req);
  const body = await readBody(req);
  const reason = String(body.reason || "Admin PayPal refund").trim();
  const orders = await supabase(`/orders?id=eq.${encodeURIComponent(orderId)}&select=*`);
  const order = orders[0];
  if (!order) return json(res, 404, { error: "Order not found" });
  if (!order.paypal_capture_id) return json(res, 400, { error: "PayPal capture ID is missing" });
  if (order.payment_status === "refunded") return json(res, 409, { error: "Order is already marked as refunded" });

  const refund = await paypal(`/v2/payments/captures/${encodeURIComponent(order.paypal_capture_id)}/refund`, {
    method: "POST",
    body: JSON.stringify({
      amount: { value: Number(order.total_sgd).toFixed(2), currency_code: order.currency || "SGD" },
      note_to_payer: "hondit order refund",
    }),
  });

  const now = new Date().toISOString();
  await supabase(`/orders?id=eq.${encodeURIComponent(order.id)}`, {
    method: "PATCH",
    body: JSON.stringify({ payment_status: "refunded", order_status: "refunded", refund_reason: reason, refunded_at: now, updated_at: now }),
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
    body: JSON.stringify({ order_id: order.id, previous_status: order.order_status, new_status: "refunded", changed_by: admin.user.id, note: reason }),
  });
  return json(res, 200, { refund });
}

async function products(req, res) {
  await verifyAdmin(req);
  if (req.method === "GET") return json(res, 200, { products: await getProducts({ includeInactive: true }) });
  if (req.method === "PATCH") {
    const { products = [] } = await readBody(req);
    const saved = await supabase("/products?on_conflict=id", {
      method: "POST",
      headers: { Prefer: "resolution=merge-duplicates,return=representation" },
      body: JSON.stringify(products.map(toDbProduct)),
    });
    return json(res, 200, { products: saved });
  }
  return json(res, 405, { error: "Method not allowed" });
}

async function settings(req, res) {
  await verifyAdmin(req);
  if (req.method === "GET") {
    const rows = await supabase("/site_settings?id=eq.1&select=*");
    return json(res, 200, { settings: rows[0] || defaultSettings });
  }
  if (req.method === "PATCH") {
    const { settings = {} } = await readBody(req);
    const payload = { ...defaultSettings, ...settings, id: 1, updated_at: new Date().toISOString() };
    const rows = await supabase("/site_settings?on_conflict=id", {
      method: "POST",
      headers: { Prefer: "resolution=merge-duplicates,return=representation" },
      body: JSON.stringify(payload),
    });
    return json(res, 200, { settings: rows[0] });
  }
  return json(res, 405, { error: "Method not allowed" });
}

async function reviewsIndex(req, res) {
  if (req.method !== "GET") return json(res, 405, { error: "Method not allowed" });
  await verifyAdmin(req);
  const status = req.query?.status ? String(req.query.status) : "";
  const params = ["select=*", "order=submitted_at.desc", "limit=200"];
  if (status) params.push(`status=eq.${encodeURIComponent(status)}`);
  return json(res, 200, { reviews: await supabase(`/reviews?${params.join("&")}`) });
}

async function reviewDetail(req, res, reviewId) {
  await verifyAdmin(req);
  if (!reviewId) return json(res, 400, { error: "Review ID is required" });
  if (req.method === "PATCH") {
    const body = await readBody(req);
    const status = String(body.status || "");
    if (!["pending", "approved", "hidden", "deleted"].includes(status)) return json(res, 400, { error: "Invalid review status" });
    const now = new Date().toISOString();
    const saved = await supabase(`/reviews?id=eq.${encodeURIComponent(reviewId)}`, {
      method: "PATCH",
      body: JSON.stringify({ status, admin_note: body.admin_note || null, approved_at: status === "approved" ? now : null, updated_at: now }),
    });
    return json(res, 200, { review: saved[0] });
  }
  if (req.method === "DELETE") {
    const saved = await supabase(`/reviews?id=eq.${encodeURIComponent(reviewId)}`, {
      method: "PATCH",
      body: JSON.stringify({ status: "deleted", updated_at: new Date().toISOString() }),
    });
    return json(res, 200, { review: saved[0] });
  }
  return json(res, 405, { error: "Method not allowed" });
}

const inquiryStatuses = new Set(["new", "read", "replied", "archived", "spam"]);

async function inquiriesIndex(req, res) {
  await verifyAdmin(req);
  if (req.method === "GET") {
    const status = queryValue(req, "status");
    const params = ["select=*", "order=created_at.desc", "limit=500"];
    if (status) params.push(`status=eq.${encodeURIComponent(status)}`);
    return json(res, 200, { inquiries: await supabase(`/inquiries?${params.join("&")}`) });
  }

  if (req.method === "PATCH") {
    const body = await readBody(req);
    const id = cleanRequired(body.id, 100);
    const status = cleanRequired(body.status, 30);
    if (!id || !inquiryStatuses.has(status)) return json(res, 422, { error: "Choose a valid enquiry and status." });

    const now = new Date().toISOString();
    const payload = {
      status,
      admin_note: cleanOptional(body.adminNote ?? body.admin_note, 2000),
      read_at: status === "new" ? null : now,
      replied_at: status === "replied" ? now : null,
      updated_at: now,
    };
    const saved = await supabase(`/inquiries?id=eq.${encodeURIComponent(id)}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
    return json(res, 200, { inquiry: saved[0] });
  }

  return json(res, 405, { error: "Method not allowed" });
}

function emailConfiguration() {
  return {
    apiKey: process.env.RESEND_API_KEY?.trim() || "",
    from: process.env.SUPPORT_FROM_EMAIL?.trim() || "",
    replyTo: process.env.SUPPORT_REPLY_TO?.trim() || process.env.CUSTOMER_SERVICE_EMAIL?.trim() || "hondit.official@gmail.com",
    connected: Boolean(process.env.RESEND_API_KEY?.trim() && process.env.SUPPORT_FROM_EMAIL?.trim()),
  };
}

async function sendSupportEmail({ to, subject, body }) {
  const config = emailConfiguration();
  if (!config.connected) return { sent: false, error: "Email provider is not connected. The reply was saved as a draft." };
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${config.apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: config.from,
      to: [to],
      reply_to: config.replyTo,
      subject,
      text: body,
    }),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok || !data.id) return { sent: false, error: data.message || "The email provider rejected the message." };
  return { sent: true, providerId: data.id };
}

async function inquiryReplies(req, res) {
  await verifyAdmin(req);
  const inquiryIdFromQuery = cleanRequired(queryValue(req, "inquiry"), 100);

  if (req.method === "GET") {
    if (!inquiryIdFromQuery) return json(res, 200, { replies: [] });
    const replies = await supabase(`/inquiry_replies?inquiry_id=eq.${encodeURIComponent(inquiryIdFromQuery)}&select=*&order=created_at.desc`);
    return json(res, 200, { replies });
  }

  if (req.method === "POST") {
    const body = await readBody(req);
    const inquiryId = cleanRequired(body.inquiryId || body.inquiry_id, 100);
    const subject = cleanRequired(body.subject, 180);
    const replyBody = cleanRequired(body.body, 5000);
    if (!inquiryId || !subject || replyBody.length < 5) return json(res, 422, { error: "Choose an enquiry and complete the reply." });

    const inquiries = await supabase(`/inquiries?id=eq.${encodeURIComponent(inquiryId)}&select=*`);
    const inquiry = inquiries[0];
    if (!inquiry) return json(res, 404, { error: "The enquiry no longer exists." });

    const now = new Date().toISOString();
    const result = await sendSupportEmail({ to: inquiry.email, subject, body: replyBody });
    const reply = await supabase("/inquiry_replies", {
      method: "POST",
      body: JSON.stringify({
        id: randomUUID(),
        inquiry_id: inquiryId,
        sender_email: emailConfiguration().replyTo,
        recipient_email: inquiry.email,
        subject,
        body: replyBody,
        status: result.sent ? "sent" : "draft",
        provider_id: result.sent ? result.providerId : null,
        error_message: result.sent ? null : result.error,
        created_at: now,
        sent_at: result.sent ? now : null,
      }),
    });

    await supabase(`/inquiries?id=eq.${encodeURIComponent(inquiryId)}`, {
      method: "PATCH",
      body: JSON.stringify({
        status: result.sent ? "replied" : "read",
        read_at: inquiry.read_at || now,
        replied_at: result.sent ? now : inquiry.replied_at || null,
        updated_at: now,
      }),
    });

    return json(res, result.sent ? 201 : 202, {
      ok: true,
      sent: result.sent,
      message: result.sent ? "Reply sent and recorded." : result.error,
      reply: reply[0],
    });
  }

  return json(res, 405, { error: "Method not allowed" });
}

export default async function handler(req, res) {
  try {
    const parts = segments(req);
    if (parts[0] === "login") return login(req, res);
    if (parts[0] === "summary") return summary(req, res);
    if (parts[0] === "orders" && parts.length === 1) return ordersIndex(req, res);
    if (parts[0] === "orders" && parts[2] === "refund") return refundOrder(req, res, parts[1]);
    if (parts[0] === "orders" && parts[1]) return orderDetail(req, res, parts[1]);
    if (parts[0] === "products") return products(req, res);
    if (parts[0] === "settings") return settings(req, res);
    if (parts[0] === "reviews" && parts.length === 1) return reviewsIndex(req, res);
    if (parts[0] === "reviews" && parts[1]) return reviewDetail(req, res, parts[1]);
    if (parts[0] === "inquiries" && parts[1] === "reply") return inquiryReplies(req, res);
    if (parts[0] === "inquiries") return inquiriesIndex(req, res);
    return json(res, 404, { error: "Admin endpoint not found" });
  } catch (error) {
    return json(res, 400, { error: error.message || "Admin request failed" });
  }
}
