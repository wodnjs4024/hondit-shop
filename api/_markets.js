export const markets = {
  SG: {
    code: "SG",
    countryCode: "SG",
    countryName: "Singapore",
    currency: "SGD",
    sgdRate: 1,
    hasShopee: true,
    checkoutNote: "Singapore EMS shipping is included in the displayed bulk unit price.",
  },
  HK: {
    code: "HK",
    countryCode: "HK",
    countryName: "Hong Kong",
    currency: "HKD",
    sgdRate: 5.8,
    hasShopee: false,
    checkoutNote: "Hong Kong delivery is included in the displayed bulk unit price.",
  },
};

export function normalizeMarketCode(value) {
  const normalized = String(value || "").trim().toUpperCase();
  if (normalized === "SG" || normalized === "SINGAPORE") return "SG";
  if (normalized === "HK" || normalized === "HONGKONG" || normalized === "HONG KONG") return "HK";
  return null;
}

export function resolveMarket(body = {}) {
  const requested = normalizeMarketCode(body.market) || normalizeMarketCode(body.countryCode) || "SG";
  const market = markets[requested];
  if (!market) throw new Error("This delivery market is not available yet.");
  if (body.countryCode && normalizeMarketCode(body.countryCode) !== market.code) {
    throw new Error("Delivery country does not match the selected market.");
  }
  return market;
}

export function convertSgdToMarketAmount(value, market) {
  return Number((Number(value || 0) * market.sgdRate).toFixed(2));
}

export function getMarketUnitPrice(product, market) {
  const prices = product?.marketUnitPrices || product?.market_unit_prices || {};
  const fixed = prices?.[market.code] ?? prices?.[market.currency];
  if (Number.isFinite(Number(fixed))) return Number(fixed);
  return convertSgdToMarketAmount(product?.unitPriceSgd ?? product?.bulkUnitPrice ?? 0, market);
}

export function getMarketLineTotal(product, units, market) {
  return Number((getMarketUnitPrice(product, market) * Number(units || 0)).toFixed(2));
}

export function formatPayPalAmount(value) {
  return Number(value || 0).toFixed(2);
}

export function formatOrderAmount(value, currency = "SGD") {
  const amount = Number(value || 0).toFixed(2);
  if (currency === "HKD") return `HK$${amount}`;
  if (currency === "USD") return `$${amount}`;
  return `S$${amount}`;
}
