import { defaultProducts } from "./_bulk-data.js";

export function json(res, status, data) {
  res.status(status).setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(data));
}

export async function readBody(req) {
  if (req.body && typeof req.body === "object") return req.body;
  if (typeof req.body === "string") return JSON.parse(req.body || "{}");
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const raw = Buffer.concat(chunks).toString("utf8");
  return raw ? JSON.parse(raw) : {};
}

export function requireEnv(keys) {
  const missing = keys.filter((key) => !process.env[key]);
  if (missing.length) {
    throw new Error(`Missing environment variables: ${missing.join(", ")}`);
  }
}

function supabaseHeaders(service = true) {
  const key = service ? process.env.SUPABASE_SERVICE_ROLE_KEY : process.env.VITE_SUPABASE_ANON_KEY;
  return {
    apikey: key || "",
    Authorization: `Bearer ${key || ""}`,
    "Content-Type": "application/json",
    Prefer: "return=representation",
  };
}

export async function supabase(path, options = {}) {
  requireEnv(["SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"]);
  const response = await fetch(`${process.env.SUPABASE_URL}/rest/v1${path}`, {
    ...options,
    headers: {
      ...supabaseHeaders(true),
      ...(options.headers || {}),
    },
  });
  const text = await response.text();
  const data = text ? JSON.parse(text) : null;
  if (!response.ok) throw new Error(data?.message || data?.error || "Supabase request failed");
  return data;
}

export function toClientProduct(product) {
  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    category: product.category,
    volumeLabel: product.volume_label ?? product.volumeLabel,
    shortDescription: product.short_description ?? product.shortDescription,
    description: product.description,
    imageUrl: product.image_url ?? product.imageUrl,
    unitPriceSgd: Number(product.unit_price_sgd ?? product.unitPriceSgd),
    packQuantity: Number(product.pack_quantity ?? product.packQuantity),
    packPriceSgd: Number(product.pack_price_sgd ?? product.packPriceSgd),
    unitWeightKg: Number(product.unit_weight_kg ?? product.unitWeightKg ?? 0),
    inventoryPacks: Number(product.inventory_packs ?? product.inventoryPacks ?? 0),
    active: Boolean(product.active),
    purchaseEnabled: Boolean(product.purchase_enabled ?? product.purchaseEnabled),
    sortOrder: Number(product.sort_order ?? product.sortOrder ?? 0),
    features: product.features || [],
    usage: product.usage || [],
  };
}

export function toDbProduct(product) {
  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    category: product.category,
    volume_label: product.volumeLabel,
    short_description: product.shortDescription,
    description: product.description,
    image_url: product.imageUrl,
    unit_price_sgd: product.unitPriceSgd,
    pack_quantity: product.packQuantity,
    pack_price_sgd: product.packPriceSgd,
    unit_weight_kg: product.unitWeightKg,
    inventory_packs: product.inventoryPacks,
    active: product.active,
    purchase_enabled: product.purchaseEnabled,
    sort_order: product.sortOrder,
    features: Array.isArray(product.features) ? product.features : [],
    usage: Array.isArray(product.usage) ? product.usage : [],
    updated_at: new Date().toISOString(),
  };
}

export async function getProducts({ includeInactive = false } = {}) {
  try {
    const filter = includeInactive ? "" : "?active=eq.true&purchase_enabled=eq.true&order=sort_order.asc";
    const data = await supabase(`/products${filter || "?order=sort_order.asc"}`);
    return data.map(toClientProduct);
  } catch (error) {
    if (String(error.message || "").includes("Missing environment")) return defaultProducts;
    throw error;
  }
}

export function calculateCart(cart, products) {
  const lines = cart.map((item) => {
    const product = products.find((entry) => entry.slug === item.slug && entry.active && entry.purchaseEnabled);
    if (!product) throw new Error(`Product is not available: ${item.slug}`);
    const moq = Number(product.packQuantity || 1);
    const step = 10;
    const maxUnits = Number(product.inventoryPacks || 0) > 0 ? Number(product.inventoryPacks) * moq : 0;
    const requested = Math.max(moq, Math.floor(Number(item.packCount) || moq));
    let quantity = moq + Math.floor((requested - moq) / step) * step;
    if (maxUnits > 0 && quantity > maxUnits) {
      quantity = moq + Math.floor((maxUnits - moq) / step) * step;
    }
    if (maxUnits > 0 && maxUnits < moq) throw new Error(`Product is sold out: ${product.slug}`);
    quantity = Math.max(moq, quantity);
    return {
      product,
      packCount: quantity,
      totalUnits: quantity,
      lineTotalSgd: Number((product.unitPriceSgd * quantity).toFixed(2)),
    };
  });
  const totalPacks = lines.reduce((sum, line) => sum + Math.ceil(line.totalUnits / Math.max(1, line.product.packQuantity)), 0);
  const totalUnits = lines.reduce((sum, line) => sum + line.totalUnits, 0);
  const totalSgd = Number(lines.reduce((sum, line) => sum + line.lineTotalSgd, 0).toFixed(2));
  return { lines, totalPacks, totalUnits, totalSgd };
}

export function createOrderNumber() {
  const date = new Date().toISOString().slice(0, 10).replaceAll("-", "");
  const random = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `HD-${date}-${random}`;
}

export async function getPayPalAccessToken() {
  requireEnv(["PAYPAL_CLIENT_ID", "PAYPAL_CLIENT_SECRET"]);
  const base = process.env.PAYPAL_ENV === "live" ? "https://api-m.paypal.com" : "https://api-m.sandbox.paypal.com";
  const credentials = Buffer.from(`${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`).toString("base64");
  const response = await fetch(`${base}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });
  const data = await response.json();
  if (!response.ok) throw new Error("PayPal authentication failed");
  return { token: data.access_token, base };
}

export async function paypal(path, options = {}) {
  const { token, base } = await getPayPalAccessToken();
  const response = await fetch(`${base}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data?.message || "PayPal request failed");
  return data;
}

function escapeTelegramText(value) {
  return String(value ?? "").replace(/[<>&]/g, (char) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;" })[char]);
}

function orderAdminUrl(order) {
  const siteUrl = process.env.SITE_URL || process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL || "";
  const baseUrl = siteUrl ? (siteUrl.startsWith("http") ? siteUrl : `https://${siteUrl}`) : "";
  return baseUrl && order?.id ? `${baseUrl}/admin/orders/${order.id}` : "";
}

export async function notifyTelegramNewOrder(order, items = []) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId || !order) return { skipped: true };

  const productLines = items.length
    ? items.map((item) => `- ${escapeTelegramText(item.product_name_snapshot)} ${escapeTelegramText(item.volume_snapshot || "")} x ${escapeTelegramText(item.total_units)}`).join("\n")
    : "- Product details are available in admin";
  const adminUrl = orderAdminUrl(order);
  const message = [
    "<b>New hondit bulk order</b>",
    "",
    `<b>Order</b>: ${escapeTelegramText(order.order_number)}`,
    `<b>Customer</b>: ${escapeTelegramText(order.customer_name)}`,
    `<b>Total</b>: S$${Number(order.total_sgd || 0).toFixed(2)}`,
    `<b>Units</b>: ${escapeTelegramText(order.total_units || "-")}`,
    `<b>Email</b>: ${escapeTelegramText(order.customer_email || "-")}`,
    `<b>Phone</b>: ${escapeTelegramText(order.customer_phone || "-")}`,
    "",
    productLines,
    adminUrl ? `\n<a href="${escapeTelegramText(adminUrl)}">Open order in admin</a>` : "",
  ].filter(Boolean).join("\n");

  const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text: message,
      parse_mode: "HTML",
      disable_web_page_preview: true,
    }),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data?.description || "Telegram notification failed");
  return data;
}

export async function verifyAdmin(req) {
  requireEnv(["SUPABASE_URL", "VITE_SUPABASE_ANON_KEY"]);
  const header = req.headers.authorization || req.headers.Authorization || "";
  const token = String(header).replace("Bearer ", "");
  if (!token) throw new Error("Admin login required");

  const userResponse = await fetch(`${process.env.SUPABASE_URL}/auth/v1/user`, {
    headers: {
      apikey: process.env.VITE_SUPABASE_ANON_KEY,
      Authorization: `Bearer ${token}`,
    },
  });
  const user = await userResponse.json();
  if (!userResponse.ok || !user.id) throw new Error("Admin login expired");

  const profiles = await supabase(`/admin_profiles?user_id=eq.${encodeURIComponent(user.id)}&select=user_id,email,role`);
  if (!profiles.length) throw new Error("This account is not registered as a hondit admin");
  return { user, profile: profiles[0] };
}
