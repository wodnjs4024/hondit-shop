// Dashboard figures from orders. Definitions (also shown in the admin):
//   live order    = not flagged is_test, not a sandbox payment, and not the hidden live-payment-test product
//   paid          = payment_status completed / refunded / partially_refunded (money was captured)
//   net revenue   = captured amount - refunded amount, per currency, by paid_at (never added across currencies)
//   to ship       = paid, not refunded, order_status paid / address_check / preparing / packed
//   unanswered    = inquiries with status new or read
const PAID = ["completed", "refunded", "partially_refunded"];
const TO_SHIP = ["paid", "address_check", "preparing", "packed"];
const TEST_SLUGS = ["live-payment-test"];

export function isTestOrder(order) {
  if (order.is_test === true) return true;
  if (order.environment === "sandbox") return true;
  return (order.order_items || []).some((item) => TEST_SLUGS.includes(item.product_slug));
}

function money(value) {
  const n = Number(value || 0);
  return Number.isFinite(n) ? n : 0;
}

export function netAmount(order) {
  const total = money(order.total_sgd);
  if (order.payment_status === "refunded") return Math.max(0, total - (order.refunded_amount === null || order.refunded_amount === undefined ? total : money(order.refunded_amount)));
  return Math.max(0, total - money(order.refunded_amount));
}

function addTo(map, key, value) {
  map[key] = Number(((map[key] || 0) + value).toFixed(2));
}

function top(rows, n = 6) {
  return Object.entries(rows).map(([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value).slice(0, n);
}

export function summarizeOrders(orders, inquiries, now = new Date()) {
  const day = 24 * 60 * 60 * 1000;
  const since30 = now.getTime() - 30 * day;
  const since7 = now.getTime() - 7 * day;
  const live = orders.filter((order) => !isTestOrder(order));
  const tests = orders.filter(isTestOrder);
  const paid = live.filter((order) => PAID.includes(order.payment_status));
  const paidAt = (order) => new Date(order.paid_at || order.created_at).getTime();

  const revenueAll = {}, revenue30 = {}, refunds = {};
  for (const order of paid) {
    const currency = order.currency || "SGD";
    addTo(revenueAll, currency, netAmount(order));
    if (paidAt(order) >= since30) addTo(revenue30, currency, netAmount(order));
    const refunded = money(order.total_sgd) - netAmount(order);
    if (refunded > 0) addTo(refunds, currency, refunded);
  }
  const products = {}, countries = {}, sources = {};
  for (const order of paid) {
    for (const item of order.order_items || []) addTo(products, item.product_name_snapshot || item.product_slug, Number(item.total_units || 0));
    addTo(countries, order.country_code || "-", 1);
    addTo(sources, order.utm_source || (order.referrer ? "referral" : "direct"), 1);
  }
  const toShip = paid.filter((order) => order.payment_status === "completed" && TO_SHIP.includes(order.order_status));
  const attempts30 = live.filter((order) => !PAID.includes(order.payment_status) && new Date(order.created_at).getTime() >= since30);

  return {
    definitions: {
      revenue: "결제 완료 금액 − 환불 금액, 테스트 거래 제외, 통화별(서로 더하지 않음), 결제 시각 기준",
      newOrders: "최근 7일 결제 완료 주문 수(테스트 제외)",
      toShip: "결제 완료 후 아직 발송 전(결제확인·주소확인·준비·포장) 주문",
      unanswered: "상태가 '신규' 또는 '읽음'인 문의",
    },
    kpi: {
      revenue30,
      revenueAll,
      newOrders7: paid.filter((order) => paidAt(order) >= since7).length,
      toShip: toShip.length,
      unanswered: inquiries === null ? null : inquiries.filter((row) => ["new", "read"].includes(row.status)).length,
    },
    toShipOrders: toShip.slice(0, 10),
    recentOrders: paid.slice(0, 8),
    details: {
      paidOrders: paid.length,
      refundedOrders: paid.filter((order) => order.payment_status !== "completed" || money(order.refunded_amount) > 0).length,
      refunds,
      attempts30: attempts30.length,
      failed30: attempts30.filter((order) => order.payment_status === "payment_failed").length,
      cancelled30: attempts30.filter((order) => order.payment_status === "payment_cancelled").length,
      testOrders: tests.length,
      popularProducts: top(products),
      countries: top(countries),
      sources: top(sources),
    },
  };
}
