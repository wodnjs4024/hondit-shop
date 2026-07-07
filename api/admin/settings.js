import { json, readBody, supabase, verifyAdmin } from "../_utils.js";

const defaultSettings = {
  id: 1,
  legal_business_name: "",
  business_registration_number: "",
  business_address: "",
  customer_service_email: "",
  paypal_mode: process.env.PAYPAL_ENV || "sandbox",
  checkout_enabled: true,
};

export default async function handler(req, res) {
  try {
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
  } catch (error) {
    return json(res, 401, { error: error.message || "Admin access failed" });
  }
}
