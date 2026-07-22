import { getPayPalMode, json, supabase } from "../_utils.js";

async function getCheckoutConfig() {
  const fallback = {
    checkoutEnabled: true,
    mode: getPayPalMode(),
  };

  try {
    const rows = await supabase("/site_settings?id=eq.1&select=checkout_enabled,paypal_mode");
    const settings = rows?.[0] || {};
    return {
      checkoutEnabled: settings.checkout_enabled !== false,
      mode: fallback.mode,
    };
  } catch (error) {
    if (String(error?.message || "").includes("Missing environment")) return fallback;
    return fallback;
  }
}

export default async function handler(req, res) {
  if (req.method !== "GET") return json(res, 405, { error: "Method not allowed" });

  const config = await getCheckoutConfig();
  return json(res, 200, {
    checkoutEnabled: config.checkoutEnabled,
    clientId: process.env.PAYPAL_CLIENT_ID || process.env.VITE_PAYPAL_CLIENT_ID || "",
    mode: String(config.mode || "sandbox").toLowerCase(),
  });
}
