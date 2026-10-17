import {isDiffuser,diffuserQuantity} from '../shared/diffuser-quantity.js';
import {resolveCheckoutTerms} from '../shared/checkout-terms.js';
import { cleanProductUsage } from "../shared/page-sales.js";
import { defaultProducts } from "./_bulk-data.js";
import { formatOrderAmount } from "./_markets.js";

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

export function getPayPalMode() {
  const mode = String(
    process.env.PAYPAL_MODE ||
      process.env.PAYPAL_ENV ||
      process.env.VITE_PAYPAL_MODE ||
      process.env.VITE_PAYPAL_ENV ||
      "sandbox",
  )
    .trim()
    .toLowerCase();
  return mode === "live" ? "live" : "sandbox";
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
  const defaultProduct = defaultProducts.find((entry) => entry.slug === product.slug);
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
    usage: cleanProductUsage(product.usage || []),
    galleryImages: product.gallery_images ?? product.galleryImages ?? [],
    detailImages: product.detail_images ?? product.detailImages ?? [],
    detailHighlights: product.detail_highlights ?? product.detailHighlights ?? [],
    detailHowToUse: cleanProductUsage(product.detail_how_to_use ?? product.detailHowToUse ?? []),
    marketUnitPrices: product.market_unit_prices ?? product.marketUnitPrices ?? defaultProduct?.marketUnitPrices,
    ...productManagementFields(product),
  };
}

/* Fields added by migration 008. Rows from before 008 (or the static fallback) produce today's behaviour:
   published, no per-language overrides, no market overrides, stock = packs x MOQ when packs are set, otherwise untracked. */
function productManagementFields(product) {
  const packs = Number(product.inventory_packs ?? product.inventoryPacks ?? 0);
  const moq = Number(product.pack_quantity ?? product.packQuantity ?? 1);
  const rawStock = product.stock_units ?? product.stockUnits;
  const contents = {};
  for (const row of product.product_contents || []) {
    contents[row.language] = { name: row.name || "", shortDescription: row.short_description || "", description: row.description || "", highlights: row.highlights || [], howTo: row.how_to || [] };
  }
  const markets = {};
  for (const row of product.product_markets || []) markets[row.market] = row.mode;
  const media = (product.product_media || [])
    .map((row) => ({ url: row.url, storagePath: row.storage_path || null, role: row.role || "gallery", sortOrder: Number(row.sort_order ?? 100), alt: row.alt || {} }))
    .sort((a, b) => a.sortOrder - b.sortOrder);
  return {
    sku: product.sku ?? null,
    status: product.status ?? (product.active === false ? "hidden" : "published"),
    stockUnits: rawStock !== undefined && rawStock !== null ? Number(rawStock) : packs > 0 ? packs * moq : null,
    contents: product.contents ?? contents,
    media: product.media ?? media,
    markets: product.markets ?? markets,
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
    gallery_images: Array.isArray(product.galleryImages) ? product.galleryImages : [],
    detail_images: Array.isArray(product.detailImages) ? product.detailImages : [],
    detail_highlights: Array.isArray(product.detailHighlights) ? product.detailHighlights : [],
    detail_how_to_use: Array.isArray(product.detailHowToUse) ? product.detailHowToUse : [],
    updated_at: new Date().toISOString(),
  };
}

/* Products with their per-language text, photos and market overrides (migration 008).
   Before 008 is applied the embedded tables do not exist, so the plain product rows are read exactly as before. */
async function readProductRows(filter) {
  try {
    return await supabase(`/products?select=*,product_contents(*),product_media(*),product_markets(*)${filter}`);
  } catch (error) {
    if (!/relationship|product_contents|product_media|product_markets|schema cache/i.test(String(error.message || ""))) throw error;
    return supabase(`/products?select=*${filter}`);
  }
}

export async function getProducts({ includeInactive = false } = {}) {
  try {
    const filter = includeInactive ? "&order=sort_order.asc" : "&active=eq.true&purchase_enabled=eq.true&order=sort_order.asc";
    const data = await readProductRows(filter);
    return data.map(toClientProduct).filter((product) => includeInactive || !["draft", "hidden"].includes(product.status));
  } catch (error) {
    if (String(error.message || "").includes("Missing environment")) return defaultProducts;
    throw error;
  }
}

/* Storefront list: published and sold-out products (sold-out stays visible but cannot be bought). */
export async function getStorefrontProducts() {
  try {
    const data = await readProductRows("&active=eq.true&order=sort_order.asc");
    return data.map(toClientProduct).filter((product) => !["draft", "hidden"].includes(product.status));
  } catch (error) {
    if (String(error.message || "").includes("Missing environment")) return defaultProducts;
    throw error;
  }
}

/* A draft snapshot laid over a product, for the admin preview and the editor. Never touches prices. */
export function applyProductSnapshot(product, snapshot = {}) {
  const base = snapshot.base || {};
  const media = Array.isArray(snapshot.media) ? snapshot.media.filter((item) => item && item.url) : product.media;
  const main = media?.find((item) => item.role === "main")?.url;
  return {
    ...product,
    name: snapshot.contents?.en?.name || base.name || product.name,
    category: base.category || product.category,
    volumeLabel: base.volumeLabel ?? product.volumeLabel,
    sku: base.sku || product.sku,
    sortOrder: base.sortOrder ?? product.sortOrder,
    packQuantity: base.packQuantity ?? product.packQuantity,
    status: base.status || product.status,
    imageUrl: main || product.imageUrl,
    contents: snapshot.contents || product.contents,
    media: media || [],
    markets: snapshot.markets || product.markets,
  };
}

/* Writes are refused on every Preview deployment, except one explicitly wired to the staging database. */
const productionSupabaseRef = "vohlwqamyujzfqthhplk";
export function isStagingPreview() {
  return process.env.VERCEL_ENV === "preview" && process.env.HONDIT_STAGING === "1" && Boolean(process.env.SUPABASE_URL) && !process.env.SUPABASE_URL.includes(productionSupabaseRef);
}

export function previewWritesBlocked(method) {
  if (process.env.VERCEL_ENV !== "preview" || ["GET", "HEAD", "OPTIONS"].includes(method)) return false;
  return !isStagingPreview();
}

/* Staging preview only (Vercel-protected deployment + synthetic database): enter the admin without an account.
   Never true in production, on an ordinary preview, or when the database is the production project. */
export const STAGING_ADMIN_TOKEN = "staging-preview";
const stagingAdmin = { user: { id: "00000000-0000-4000-8000-0000000000aa", email: "staging-admin@hondit.test" }, profile: { user_id: "00000000-0000-4000-8000-0000000000aa", email: "staging-admin@hondit.test", role: "admin" } };

export function calculateCart(cart, products) {
  const requestedLines = cart.map((item) => {
    const product = products.find((entry) => entry.slug === item.slug && entry.active && entry.purchaseEnabled);
    if (!product) throw new Error(`Product is not available: ${item.slug}`);
    const moq = Number(product.packQuantity || 1);
    const step = 10;
    // null = stock not tracked; a number is the exact unit count (0 = sold out)
    const maxUnits = product.stockUnits ?? (Number(product.inventoryPacks || 0) > 0 ? Number(product.inventoryPacks) * moq : null);
    const requested = Number(item.packCount);
    if (!Number.isSafeInteger(requested)) throw new Error("Quantity must be a whole number");
    if (requested <= 0) throw new Error(`Quantity must be greater than zero: ${product.slug}`);
    const isCleansing = product.category === "cleansing";
    if (isCleansing && requested % step !== 0) throw new Error(`Cleansing quantities must be ordered in steps of ${step}`);
    if (isDiffuser(product) && !diffuserQuantity(item.packCount).valid) throw new Error("Choose a 10-unit trial or a whole-number quantity of at least 20");
    if (!isCleansing && !isDiffuser(product) && (requested < moq || (requested - moq) % step !== 0)) {
      throw new Error(`${product.name} requires at least ${moq} units in steps of ${step}`);
    }
    const quantity = requested;
    if (maxUnits !== null && maxUnits <= 0) throw new Error(`Product is sold out: ${product.slug}`);
    if (maxUnits !== null && quantity > maxUnits) throw new Error(`Requested quantity exceeds stock: ${product.slug}`);
    return {
      product,
      packCount: quantity,
      totalUnits: quantity,
      lineTotalSgd: isDiffuser(product) ? resolveCheckoutTerms(product,'SG',quantity).referenceTotalMinor/100 : Number((product.unitPriceSgd * quantity).toFixed(2)),
    };
  });
  const duplicateSlugs = requestedLines.filter((line, index) => requestedLines.findIndex((entry) => entry.product.slug === line.product.slug) !== index);
  if (duplicateSlugs.length) throw new Error("Duplicate products are not allowed in one order");
  const cleansingUnits = requestedLines
    .filter((line) => line.product.category === "cleansing")
    .reduce((sum, line) => sum + line.totalUnits, 0);
  if (cleansingUnits > 0 && cleansingUnits < 30) throw new Error("Cleansing products require at least 30 units in total");
  const lines = requestedLines;
  const nonCleansingPacks = lines
    .filter((line) => line.product.category !== "cleansing")
    .reduce((sum, line) => sum + Math.ceil(line.totalUnits / Math.max(1, line.product.packQuantity)), 0);
  const totalPacks = nonCleansingPacks + (cleansingUnits > 0 ? Math.ceil(cleansingUnits / 30) : 0);
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
  const base = getPayPalMode() === "live" ? "https://api-m.paypal.com" : "https://api-m.sandbox.paypal.com";
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

function adminBaseUrl() {
  const siteUrl = process.env.SITE_URL || process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL || "";
  return siteUrl ? (siteUrl.startsWith("http") ? siteUrl : `https://${siteUrl}`) : "";
}

export async function notifyTelegramNewInquiry(inquiry) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId || !inquiry) return { skipped: true };

  const adminUrl = `${adminBaseUrl()}/admin/inquiries`;
  const message = [
    "<b>New hondit enquiry</b>",
    "",
    `<b>Reference</b>: ${escapeTelegramText(inquiry.reference_number)}`,
    `<b>Type</b>: ${escapeTelegramText(inquiry.inquiry_type)}`,
    `<b>Name</b>: ${escapeTelegramText(inquiry.name)}`,
    `<b>Email</b>: ${escapeTelegramText(inquiry.email)}`,
    inquiry.company ? `<b>Company</b>: ${escapeTelegramText(inquiry.company)}` : "",
    inquiry.order_number ? `<b>Order</b>: ${escapeTelegramText(inquiry.order_number)}` : "",
    "",
    escapeTelegramText(inquiry.message),
    adminUrl ? `\n<a href="${escapeTelegramText(adminUrl)}">Open admin inbox</a>` : "",
  ].filter(Boolean).join("\n");

  const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text: message, parse_mode: "HTML", disable_web_page_preview: true }),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data?.description || "Telegram notification failed");
  return data;
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
    `<b>Total</b>: ${escapeTelegramText(formatOrderAmount(order.total_sgd || 0, order.currency || "SGD"))}`,
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
  if (token === STAGING_ADMIN_TOKEN) {
    if (isStagingPreview()) return stagingAdmin;
    throw new Error("Admin login required");
  }

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
