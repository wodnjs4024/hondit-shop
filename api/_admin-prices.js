// Admin price versions (phase 2). Every change is a new row in product_prices (migration 009):
// it can start now or later, a future one can be cancelled, nothing is edited or deleted, and orders already placed
// keep the amounts they were created with. Only slots that exist in shared/checkout-terms.js can be priced, and a
// price never turns a quote-only market into direct payment (shared/price-versions.js).
import { paypalCurrencyDigits } from "../shared/checkout-terms.js";
import { termsFor } from "../shared/market-overrides.js";
import { amountToMinor, priceSlot, priceSlots } from "../shared/price-versions.js";
import { getProducts, json, readBody, supabase, verifyAdmin } from "./_utils.js";

const enc = encodeURIComponent;
const LARGE_CHANGE = 0.3;
const DAY = 24 * 60 * 60 * 1000;

/* What the shop shows today without any admin version: the code price (SG) or the legacy reference price. */
function codeAmount(product, slot) {
  const base = { ...product, prices: undefined, marketUnitPrices: product.baseMarketUnitPrices ?? product.marketUnitPrices };
  const quantity = slot.kind === "trial" ? 10 : slot.sku.startsWith("diffuser") ? 20 : 30;
  const decision = termsFor(base, slot.market, quantity);
  return decision.referenceUnitMinor === null ? null : decision.referenceUnitMinor / 10 ** decision.referenceDigits;
}

function currentAmount(product, slot) {
  const version = product.prices?.[slot.market]?.[slot.kind];
  return version ? Number(version.amount) : codeAmount(product, slot);
}

async function overview(res) {
  const [products, rows] = await Promise.all([
    getProducts({ includeInactive: true }),
    supabase("/product_prices?select=*&order=created_at.desc&limit=500"),
  ]);
  const now = Date.now();
  const slots = priceSlots
    .map((slot) => {
      const product = products.find((item) => item.slug === slot.sku);
      if (!product) return null;
      const mine = rows.filter((row) => row.product_id === product.id && row.market === slot.market && row.kind === slot.kind);
      return {
        ...slot,
        productId: product.id,
        productName: product.name,
        codeAmount: codeAmount(product, slot),
        current: product.prices?.[slot.market]?.[slot.kind] ?? null,
        scheduled: mine.filter((row) => !row.cancelled_at && new Date(row.effective_from).getTime() > now).sort((a, b) => new Date(a.effective_from) - new Date(b.effective_from)),
      };
    })
    .filter(Boolean);
  return json(res, 200, { slots, history: rows, now: new Date(now).toISOString() });
}

async function addVersion(req, res, admin) {
  const body = await readBody(req);
  const products = await getProducts({ includeInactive: true });
  const product = products.find((item) => item.id === body.productId || item.slug === body.productId);
  if (!product) return json(res, 404, { error: "상품을 찾을 수 없습니다." });
  const slot = priceSlot(product.slug, body.market, body.kind);
  if (!slot) return json(res, 422, { error: "이 상품은 해당 국가·주문 방식의 가격이 없습니다." });
  const digits = paypalCurrencyDigits(slot.currency);
  const minor = amountToMinor(body.amount, digits);
  if (minor === null || Number(body.amount) > 1000000) {
    return json(res, 422, { error: digits ? `가격은 0보다 크고 소수점 ${digits}자리까지 입력해 주세요.` : "가격은 0보다 큰 정수로 입력해 주세요." });
  }
  const amount = minor / 10 ** digits;
  const now = Date.now();
  const start = body.effectiveFrom ? new Date(body.effectiveFrom).getTime() : now;
  if (!Number.isFinite(start) || start < now - 60 * 1000) return json(res, 422, { error: "적용 시작 시각은 지금 이후로 정해 주세요. 지난 주문 가격은 바뀌지 않습니다." });
  if (start > now + 365 * DAY) return json(res, 422, { error: "적용 시작은 1년 이내로 정해 주세요." });
  const current = currentAmount(product, slot);
  if (current !== null && Math.abs(amount - current) < 1e-9 && start <= now + 60 * 1000) return json(res, 422, { error: "지금 가격과 같습니다." });
  if (current && Math.abs(amount - current) / current > LARGE_CHANGE && body.confirmLargeChange !== true) {
    return json(res, 409, { code: "LARGE_CHANGE", error: `지금 가격(${current} ${slot.currency})보다 ${Math.round((Math.abs(amount - current) / current) * 100)}% 바뀝니다. 맞으면 한 번 더 확인해 주세요.`, current });
  }
  const stamp = new Date(start).toISOString().replace(/[-:TZ.]/g, "").slice(0, 14);
  const version = `adm-${slot.market.toLowerCase()}-${slot.sku}-${slot.kind}-${stamp}-${Math.random().toString(36).slice(2, 6)}`;
  const rows = await supabase("/product_prices", {
    method: "POST",
    body: JSON.stringify({
      product_id: product.id,
      market: slot.market,
      kind: slot.kind,
      currency: slot.currency,
      amount,
      version,
      effective_from: new Date(Math.max(start, now)).toISOString(),
      note: String(body.note ?? "").trim().slice(0, 200) || null,
      created_by: admin.user.id,
    }),
  });
  return json(res, 200, { version: rows[0], chargeable: slot.chargeable });
}

async function cancelVersion(res, id) {
  const rows = await supabase(`/product_prices?id=eq.${enc(id)}&cancelled_at=is.null&effective_from=gt.${enc(new Date().toISOString())}`, {
    method: "PATCH",
    body: JSON.stringify({ cancelled_at: new Date().toISOString() }),
  });
  if (!rows.length) return json(res, 409, { error: "이미 적용됐거나 취소된 가격은 취소할 수 없습니다. 새 가격을 추가해 주세요." });
  return json(res, 200, { version: rows[0] });
}

export async function adminPrices(req, res, parts) {
  const admin = await verifyAdmin(req);
  const [, id, action] = parts;
  if (!id && req.method === "GET") return overview(res);
  if (!id && req.method === "POST") return addVersion(req, res, admin);
  if (id && action === "cancel" && req.method === "POST") return cancelVersion(res, id);
  return json(res, 404, { error: "Admin price endpoint not found" });
}
