import { getPayPalAccessToken, getPayPalMode, json, supabase } from "../_utils.js";
import { formatPayPalAmount, markets } from "../_markets.js";

export default async function handler(req, res) {
  if (req.method !== "GET") return json(res, 405, { error: "Method not allowed" });

  const checks = {
    paypalCredentials: false,
    database: false,
    checkoutEnabled: false,
  };
  const errors = [];
  let checkoutEnabled = false;

  try {
    const token = await getPayPalAccessToken();
    checks.paypalCredentials = Boolean(token?.token && token?.base);
  } catch (error) {
    errors.push({ check: "paypalCredentials", message: error.message || "PayPal authentication failed" });
  }

  try {
    const rows = await supabase("/site_settings?id=eq.1&select=checkout_enabled");
    checks.database = true;
    checkoutEnabled = rows?.[0]?.checkout_enabled !== false;
    checks.checkoutEnabled = checkoutEnabled;
  } catch (error) {
    errors.push({ check: "database", message: error.message || "Database check failed" });
  }

  const currencies = Object.values(markets).map((market) => ({
    market: market.code,
    country: market.countryName,
    currency: market.currency,
    exampleAmount: formatPayPalAmount(1234.56, market.currency),
    zeroDecimal: market.currency === "JPY" || market.currency === "TWD",
  }));
  const healthy = checks.paypalCredentials && checks.database && checks.checkoutEnabled;

  return json(res, healthy ? 200 : 503, {
    healthy,
    mode: getPayPalMode(),
    checks,
    currencies,
    note: "Read-only readiness check. No PayPal order, database order or payment is created.",
    errors,
  });
}
