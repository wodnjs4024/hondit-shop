// Admin product management: list, create, draft, preview, publish, revert, stock, photo upload.
// Prices, MOQ of products with approved terms, delivery and payment validation are not editable here (phase 2).
import { checkoutConditions } from "../shared/checkout-terms.js";
import { getProducts, json, readBody, requireEnv, supabase, verifyAdmin } from "./_utils.js";

const LANGS = ["ko", "en", "ja", "zh", "ms", "th"];
const MARKETS = ["SG", "HK", "MO", "TW", "JP", "TH", "MY", "BN"];
const CATEGORIES = ["diffuser", "cleansing"];
const STATUSES = ["draft", "published", "soldout", "hidden"];

const hasApprovedTerms = (slug) => checkoutConditions.some((condition) => condition.sku === slug);
const enc = encodeURIComponent;

function text(value, max) {
  return String(value ?? "").trim().slice(0, max);
}
function lines(value, maxItems = 12, max = 300) {
  return (Array.isArray(value) ? value : []).map((item) => text(item, max)).filter(Boolean).slice(0, maxItems);
}

/* Accept only known keys and sane lengths; anything about price is dropped. */
export function cleanSnapshot(input, product) {
  const base = input?.base || {};
  const snapshot = {
    base: {
      category: CATEGORIES.includes(base.category) ? base.category : product.category,
      volumeLabel: text(base.volumeLabel ?? product.volumeLabel, 40),
      sku: text(base.sku ?? product.sku ?? "", 40).toUpperCase() || null,
      sortOrder: Number.isSafeInteger(Number(base.sortOrder)) ? Number(base.sortOrder) : product.sortOrder,
      status: STATUSES.includes(base.status) ? base.status : product.status || "draft",
      unitWeightKg: Number.isFinite(Number(base.unitWeightKg)) ? Math.max(0, Number(base.unitWeightKg)) : product.unitWeightKg,
    },
    contents: {},
    media: [],
    markets: {},
  };
  // MOQ belongs to the approved terms for the original products; only enquiry-only products may set it here.
  if (!hasApprovedTerms(product.slug) && Number.isSafeInteger(Number(base.packQuantity)) && Number(base.packQuantity) >= 1) {
    snapshot.base.packQuantity = Math.min(9999, Number(base.packQuantity));
  }
  for (const lang of LANGS) {
    const c = input?.contents?.[lang];
    if (!c) continue;
    const entry = { name: text(c.name, 120), shortDescription: text(c.shortDescription, 240), description: text(c.description, 4000), highlights: lines(c.highlights), howTo: lines(c.howTo) };
    if (entry.name || entry.shortDescription || entry.description || entry.highlights.length || entry.howTo.length) snapshot.contents[lang] = entry;
  }
  for (const [index, item] of (Array.isArray(input?.media) ? input.media : []).entries()) {
    const url = text(item?.url, 600);
    if (!url || !/^(\/images\/|\/media\/|https:\/\/)/.test(url)) continue;
    const alt = {};
    for (const lang of LANGS) if (item?.alt?.[lang]) alt[lang] = text(item.alt[lang], 200);
    snapshot.media.push({ url, storagePath: text(item?.storagePath, 300) || null, role: ["main", "gallery", "detail"].includes(item?.role) ? item.role : "gallery", sortOrder: index + 1, alt });
  }
  for (const market of MARKETS) {
    const mode = input?.markets?.[market];
    if (["hidden", "quote", "direct"].includes(mode)) snapshot.markets[market] = mode;
  }
  return snapshot;
}

async function findProduct(id) {
  const all = await getProducts({ includeInactive: true });
  return all.find((item) => item.id === id) || null;
}

async function list(res) {
  const products = await getProducts({ includeInactive: true });
  const drafts = await supabase("/product_revisions?state=eq.draft&select=product_id,created_at").catch(() => []);
  return json(res, 200, {
    products: products.map((product) => ({ ...product, hasApprovedTerms: hasApprovedTerms(product.slug), draftSavedAt: drafts.find((d) => d.product_id === product.id)?.created_at || null })),
  });
}

async function detail(res, id) {
  const product = await findProduct(id);
  if (!product) return json(res, 404, { error: "상품을 찾을 수 없습니다." });
  const [drafts, revisions, movements] = await Promise.all([
    supabase(`/product_revisions?product_id=eq.${enc(id)}&state=eq.draft&select=*&limit=1`).catch(() => []),
    supabase(`/product_revisions?product_id=eq.${enc(id)}&state=neq.draft&select=id,state,note,created_at,published_at&order=created_at.desc&limit=10`).catch(() => []),
    supabase(`/inventory_movements?product_id=eq.${enc(id)}&select=delta,reason,note,order_id,created_at&order=created_at.desc&limit=20`).catch(() => []),
  ]);
  return json(res, 200, { product: { ...product, hasApprovedTerms: hasApprovedTerms(product.slug) }, draft: drafts[0] || null, revisions, movements });
}

async function create(req, res, admin) {
  const body = await readBody(req);
  const slug = text(body.slug, 60).toLowerCase();
  const name = text(body.name, 120);
  const category = CATEGORIES.includes(body.category) ? body.category : null;
  if (!/^[a-z0-9][a-z0-9-]{1,58}[a-z0-9]$/.test(slug)) return json(res, 422, { error: "주소 이름은 영문 소문자·숫자·하이픈 3~60자로 입력해 주세요." });
  if (!name || !category) return json(res, 422, { error: "상품명과 종류를 입력해 주세요." });
  if ((await findProduct(slug)) || (await getProducts({ includeInactive: true })).some((item) => item.slug === slug)) return json(res, 409, { error: "같은 주소 이름의 상품이 이미 있습니다." });
  const now = new Date().toISOString();
  const [row] = await supabase("/products", {
    method: "POST",
    body: JSON.stringify({
      id: slug, slug, name, category, sku: text(body.sku, 40).toUpperCase() || slug.toUpperCase(), status: "draft",
      volume_label: text(body.volumeLabel, 40), short_description: name, description: name, image_url: "/images/hondit-collection-hero.webp",
      unit_price_sgd: 0, pack_quantity: 1, pack_price_sgd: 0, inventory_packs: 0, stock_units: null,
      active: false, purchase_enabled: false, sort_order: 900, features: [], usage: [], created_at: now, updated_at: now,
    }),
  });
  await supabase("/product_revisions", { method: "POST", body: JSON.stringify({ product_id: row.id, state: "draft", snapshot: { base: { category, status: "draft" }, contents: { en: { name } }, media: [], markets: Object.fromEntries(MARKETS.map((m) => [m, "quote"])) }, created_by: admin.user.id }) });
  return json(res, 201, { product: row });
}

async function saveDraft(req, res, id, admin) {
  const product = await findProduct(id);
  if (!product) return json(res, 404, { error: "상품을 찾을 수 없습니다." });
  const { snapshot } = await readBody(req);
  const clean = cleanSnapshot(snapshot, product);
  await supabase(`/product_revisions?product_id=eq.${enc(id)}&state=eq.draft`, { method: "DELETE" });
  const [saved] = await supabase("/product_revisions", { method: "POST", body: JSON.stringify({ product_id: id, state: "draft", snapshot: clean, created_by: admin.user.id }) });
  return json(res, 200, { draft: saved });
}

async function publish(req, res, id, admin) {
  const product = await findProduct(id);
  if (!product) return json(res, 404, { error: "상품을 찾을 수 없습니다." });
  const body = await readBody(req);
  let snapshot = body.snapshot;
  if (!snapshot) {
    const drafts = await supabase(`/product_revisions?product_id=eq.${enc(id)}&state=eq.draft&select=snapshot&limit=1`);
    snapshot = drafts[0]?.snapshot;
  }
  if (!snapshot) return json(res, 409, { error: "게시할 임시저장 내용이 없습니다." });
  const clean = cleanSnapshot(snapshot, product);
  if (clean.base.status !== "draft" && !(clean.contents.en?.name || product.name)) return json(res, 422, { error: "영어 상품명이 필요합니다." });
  const saved = await supabase("/rpc/publish_product", { method: "POST", body: JSON.stringify({ p_product_id: id, p_snapshot: clean, p_by: admin.user.id, p_note: text(body.note, 200) || null }) });
  return json(res, 200, { product: saved });
}

async function discardDraft(res, id) {
  await supabase(`/product_revisions?product_id=eq.${enc(id)}&state=eq.draft`, { method: "DELETE" });
  return json(res, 200, { ok: true });
}

async function revert(req, res, id, admin) {
  const { revisionId } = await readBody(req);
  const rows = await supabase(`/product_revisions?id=eq.${enc(revisionId)}&product_id=eq.${enc(id)}&select=snapshot`);
  if (!rows[0]) return json(res, 404, { error: "이전 버전을 찾을 수 없습니다." });
  await supabase(`/product_revisions?product_id=eq.${enc(id)}&state=eq.draft`, { method: "DELETE" });
  const [saved] = await supabase("/product_revisions", { method: "POST", body: JSON.stringify({ product_id: id, state: "draft", snapshot: rows[0].snapshot, note: "이전 버전에서 불러옴", created_by: admin.user.id }) });
  return json(res, 200, { draft: saved });
}

async function stock(req, res, id, admin) {
  const body = await readBody(req);
  const delta = Number(body.delta);
  const reason = body.reason === "stock_in" ? "stock_in" : "adjust";
  if (!Number.isSafeInteger(delta) || delta === 0 || Math.abs(delta) > 100000) return json(res, 422, { error: "재고 변경 수량을 정수로 입력해 주세요." });
  const units = await supabase("/rpc/adjust_stock", { method: "POST", body: JSON.stringify({ p_product_id: id, p_delta: delta, p_reason: reason, p_note: text(body.note, 200) || null, p_by: admin.user.id }) });
  return json(res, 200, { stockUnits: units });
}

async function uploadUrl(req, res) {
  requireEnv(["SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"]);
  const body = await readBody(req);
  const type = ["image/webp", "image/jpeg", "image/png"].includes(body.contentType) ? body.contentType : null;
  if (!type) return json(res, 422, { error: "WebP·JPEG·PNG 사진만 올릴 수 있습니다." });
  const product = text(body.productId, 60).toLowerCase().replace(/[^a-z0-9-]/g, "") || "misc";
  const ext = type === "image/webp" ? "webp" : type === "image/png" ? "png" : "jpg";
  const path = `products/${product}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const response = await fetch(`${process.env.SUPABASE_URL}/storage/v1/object/upload/sign/product-media/${path}`, {
    method: "POST",
    headers: { apikey: process.env.SUPABASE_SERVICE_ROLE_KEY, Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`, "Content-Type": "application/json" },
    body: "{}",
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok || !data.url) return json(res, 502, { error: "사진 업로드 주소를 만들지 못했습니다. 저장소 설정을 확인해 주세요." });
  return json(res, 200, {
    uploadUrl: `${process.env.SUPABASE_URL}/storage/v1${data.url}`,
    publicUrl: `${process.env.SUPABASE_URL}/storage/v1/object/public/product-media/${path}`,
    storagePath: path,
    contentType: type,
  });
}

/* Routed from api/admin.js for paths that start with "catalog". */
export async function adminCatalog(req, res, parts) {
  const admin = await verifyAdmin(req);
  const [, id, action] = parts;
  if (!id && req.method === "GET") return list(res);
  if (!id && req.method === "POST") return create(req, res, admin);
  if (id === "upload-url" && req.method === "POST") return uploadUrl(req, res);
  if (id && !action && req.method === "GET") return detail(res, id);
  if (id && action === "draft" && req.method === "PUT") return saveDraft(req, res, id, admin);
  if (id && action === "draft" && req.method === "DELETE") return discardDraft(res, id);
  if (id && action === "publish" && req.method === "POST") return publish(req, res, id, admin);
  if (id && action === "revert" && req.method === "POST") return revert(req, res, id, admin);
  if (id && action === "stock" && req.method === "POST") return stock(req, res, id, admin);
  return json(res, 404, { error: "Admin catalog endpoint not found" });
}
