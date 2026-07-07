import { json, readBody, requireEnv, supabase } from "../_utils.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return json(res, 405, { error: "Method not allowed" });

  try {
    requireEnv(["SUPABASE_URL", "VITE_SUPABASE_ANON_KEY"]);
    const { email, password } = await readBody(req);
    if (!email || !password) return json(res, 400, { error: "Email and password are required" });

    const response = await fetch(`${process.env.SUPABASE_URL}/auth/v1/token?grant_type=password`, {
      method: "POST",
      headers: {
        apikey: process.env.VITE_SUPABASE_ANON_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });
    const data = await response.json();
    if (!response.ok || !data.access_token || !data.user?.id) {
      return json(res, 401, { error: "Admin login failed" });
    }

    const profiles = await supabase(`/admin_profiles?user_id=eq.${encodeURIComponent(data.user.id)}&select=user_id,email,role`);
    if (!profiles.length) return json(res, 403, { error: "This account is not registered as a hondit admin" });

    return json(res, 200, { accessToken: data.access_token });
  } catch (error) {
    return json(res, 500, { error: error.message || "Admin login failed" });
  }
}
