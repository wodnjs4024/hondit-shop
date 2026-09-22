export const markets = {
  SG: {
    code: "SG",
    countryCode: "SG",
    countryName: "Singapore",
    currency: "SGD",
    sgdRate: 1,
    hasShopee: true,
    checkoutNote: "Singapore EMS shipping is included in the displayed bulk unit price.",
    allowedBulkCategories: ["cleansing", "diffuser"],
  },
  HK: {
    code: "HK",
    countryCode: "HK",
    countryName: "Hong Kong",
    currency: "HKD",
    sgdRate: 6.08,
    hasShopee: false,
    checkoutNote: "Hong Kong delivery is included in the displayed bulk unit price.",
    allowedBulkCategories: ["cleansing", "diffuser"],
  },
  TW: {
    code: "TW",
    countryCode: "TW",
    countryName: "Taiwan",
    currency: "TWD",
    sgdRate: 23.5,
    hasShopee: false,
    checkoutNote: "Taiwan EMS shipping is included in the displayed bulk unit price.",
    allowedBulkCategories: ["diffuser"],
  },
  JP: {
    code: "JP",
    countryCode: "JP",
    countryName: "Japan",
    currency: "JPY",
    sgdRate: 115,
    hasShopee: false,
    checkoutNote: "Japan EMS shipping is included in the displayed bulk unit price.",
    allowedBulkCategories: ["diffuser"],
  },
  BN: { code: "BN", countryCode: "BN", countryName: "Brunei", currency: "SGD", sgdRate: 1, hasShopee: false, checkoutNote: "Brunei EMS shipping is included in the displayed bulk unit price.", allowedBulkCategories: ["diffuser"] },
  MO: { code: "MO", countryCode: "MO", countryName: "Macau", currency: "HKD", sgdRate: 6.08, hasShopee: false, checkoutNote: "Macau EMS shipping is included in the displayed bulk unit price.", allowedBulkCategories: ["cleansing", "diffuser"] },
  ID: { code: "ID", countryCode: "ID", countryName: "Indonesia", currency: "SGD", sgdRate: 1, hasShopee: false, checkoutNote: "Indonesia EMS shipping is included in the displayed bulk unit price.", allowedBulkCategories: ["diffuser"] },
  TH: { code: "TH", countryCode: "TH", countryName: "Thailand", currency: "THB", sgdRate: 26.05, hasShopee: false, checkoutNote: "Thailand EMS shipping is included in the displayed bulk unit price.", allowedBulkCategories: ["diffuser"] },
  MY: { code: "MY", countryCode: "MY", countryName: "Malaysia", currency: "MYR", sgdRate: 3.217, hasShopee: false, checkoutNote: "Malaysia EMS shipping is included in the displayed bulk unit price.", allowedBulkCategories: ["diffuser"] },
  VN: { code: "VN", countryCode: "VN", countryName: "Vietnam", currency: "SGD", sgdRate: 1, hasShopee: false, checkoutNote: "Vietnam EMS shipping is included in the displayed bulk unit price.", allowedBulkCategories: ["diffuser"] },
};

export function normalizeMarketCode(value) {
  const normalized = String(value || "").trim().toUpperCase();
  if (normalized === "SG" || normalized === "SINGAPORE") return "SG";
  if (normalized === "HK" || normalized === "HONGKONG" || normalized === "HONG KONG") return "HK";
  if (normalized === "TW" || normalized === "TAIWAN" || normalized === "台灣" || normalized === "台湾") return "TW";
  if (normalized === "JP" || normalized === "JAPAN" || normalized === "日本") return "JP";
  if (normalized === "BN" || normalized === "BRUNEI") return "BN";
  if (normalized === "MO" || normalized === "MACAU" || normalized === "MACAO" || normalized === "澳門" || normalized === "澳门") return "MO";
  if (normalized === "ID" || normalized === "INDONESIA") return "ID";
  if (normalized === "TH" || normalized === "THAILAND") return "TH";
  if (normalized === "MY" || normalized === "MALAYSIA") return "MY";
  if (normalized === "VN" || normalized === "VIETNAM") return "VN";
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

export function isBulkProductAllowedForMarket(product, market) {
  const allowed = market.allowedBulkCategories || ["cleansing", "diffuser"];
  return allowed.includes(product?.category);
}

export function formatPayPalAmount(value, currency = "SGD") {
  if (currency === "JPY" || currency === "TWD") return String(Math.round(Number(value || 0)));
  return Number(value || 0).toFixed(2);
}

export function validateCapturedPayment(capture, expectedAmount, expectedCurrency) {
  if (!capture || capture.status !== "COMPLETED") throw new Error("PayPal capture was not completed");
  const paidAmount = Number(capture.amount?.value || 0);
  const paidCurrency = capture.amount?.currency_code;
  if (paidCurrency !== expectedCurrency || Math.abs(paidAmount - Number(expectedAmount)) > 0.01) {
    throw new Error("PayPal paid amount does not match the hondit order total");
  }
  return { paidAmount, paidCurrency };
}

export function formatOrderAmount(value, currency = "SGD") {
  if (currency === "JPY") return `¥${Math.round(Number(value || 0))}`;
  const amount = Number(value || 0).toFixed(2);
  if (currency === "HKD") return `HK$${amount}`;
  if (currency === "TWD") return `NT$${amount}`;
  if (currency === "MYR") return `RM${amount}`;
  if (currency === "THB") return `฿${amount}`;
  if (currency === "USD") return `$${amount}`;
  return `S$${amount}`;
}
