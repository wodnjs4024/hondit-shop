import {
  getProducts,
  json,
  paypal,
  readBody,
  requireEnv,
  supabase,
  toDbProduct,
  verifyAdmin,
} from "../_utils.js";

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
  const path = url.pathname.replace(/^\/api\/admin\/?/, "");
  return path.split("/").filter(Boolean);
}

function escapeLike(value) {
  return String(value || "").replace(/[%*_]/g, "");
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
  const items = await supabase("/order_items?select=product_slug,product_name_snapshot,total_units,line_total_sgd&order=created_at.desc&limit=500");
  const paidOrders = orders.filter((order) => order.payment_status === "completed");
  const revenueSgd = paidOrders.reduce((sum, order) => sum + Number(order.total_sgd || 0), 0);

  return json(res, 200, {
    totals: {
      totalOrders: orders.length,
      pendingPayment: countWhere(orders, "payment_status", "pending"),
      paid: paidOrders.length,
      preparing: countWhere(orders, "order_status", "preparing"),
      packed: countWhere(orders, "order_status", "packed"),
      shipped: countWhere(orders, "order_status", "shipped"),
      delivered: countWhere(orders, "order_status", "delivered"),
      closed: orders.filter((order) => ["cancelled", "refunded"].includes(order.order_status)).length,
      totalPaidSgd: Number(revenueSgd.toFixed(2)),
    },
    recentOrders: orders.slice(0, 8),
    popularProducts: topCounts(items, "product_slug", "product_name_snapshot"),
    countries: topCounts(orders, "country_code"),
    sources: topCounts(orders.map((order) => ({
      ...order,
      traffic_source: [order.utm_source, order.utm_medium, order.utm_campaign].filter(Boolean).join(" / ") || order.referrer || "Direct / unknown",
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
      tracking_carrier: body.tracking_carrier || null,
      tracking_number: body.tracking_number || null,
      shipped_at: body.shipped_at || null,
      shipping_note: body.shipping_note || null,
      cancellation_reason: body.cancellation_reason || null,
      refund_reason: body.refund_reason || null,
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
    return json(res, 404, { error: "Admin endpoint not found" });
  } catch (error) {
    return json(res, 400, { error: error.message || "Admin request failed" });
  }
}
