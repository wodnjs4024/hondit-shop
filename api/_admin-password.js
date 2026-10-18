// Admin password: change it while signed in, or reset it from an emailed link.
// Passwords go straight to Supabase Auth and are never stored, logged or returned.
import { json, readBody, requireEnv, supabase } from "./_utils.js";

const MIN_LENGTH = 8;

function auth(path, options = {}) {
  return fetch(`${process.env.SUPABASE_URL}/auth/v1${path}`, {
    ...options,
    headers: { apikey: process.env.VITE_SUPABASE_ANON_KEY, "Content-Type": "application/json", ...(options.headers || {}) },
  });
}

function checkNew(password) {
  const value = String(password || "");
  if (value.length < MIN_LENGTH) return `새 비밀번호는 ${MIN_LENGTH}자 이상으로 정해 주세요.`;
  if (value.length > 72) return "새 비밀번호는 72자 이하로 정해 주세요.";
  return null;
}

async function adminUser(token) {
  const response = await auth("/user", { headers: { Authorization: `Bearer ${token}` } });
  const user = await response.json().catch(() => ({}));
  if (!response.ok || !user.id) return null;
  const profiles = await supabase(`/admin_profiles?user_id=eq.${encodeURIComponent(user.id)}&select=user_id`);
  return profiles.length ? user : null;
}

async function setPassword(token, password) {
  const response = await auth("/user", { method: "PUT", headers: { Authorization: `Bearer ${token}` }, body: JSON.stringify({ password }) });
  if (response.ok) return null;
  const data = await response.json().catch(() => ({}));
  if (/same|different/i.test(String(data.msg || data.message || data.error_description || ""))) return "지금 비밀번호와 다른 비밀번호로 정해 주세요.";
  if (/weak|short|characters/i.test(String(data.msg || data.message || ""))) return "더 긴 비밀번호로 정해 주세요.";
  return "비밀번호를 바꾸지 못했습니다. 잠시 후 다시 해 주세요.";
}

/* Signed in: current password is checked again before the change. Reset link: the link's one-time session is enough. */
export async function adminPassword(req, res) {
  if (req.method !== "POST") return json(res, 405, { error: "Method not allowed" });
  requireEnv(["SUPABASE_URL", "VITE_SUPABASE_ANON_KEY"]);
  const body = await readBody(req);
  const header = String(req.headers.authorization || req.headers.Authorization || "").replace("Bearer ", "");
  const recovery = body.mode === "recovery";
  const token = recovery ? String(body.accessToken || "") : header;
  if (!token || token === "staging-preview") return json(res, 401, { error: "다시 로그인해 주세요." });
  const user = await adminUser(token);
  if (!user) return json(res, 401, { error: recovery ? "재설정 링크가 만료됐습니다. 메일을 다시 받아 주세요." : "다시 로그인해 주세요." });
  const problem = checkNew(body.newPassword);
  if (problem) return json(res, 422, { error: problem });
  if (!recovery) {
    const check = await auth("/token?grant_type=password", { method: "POST", body: JSON.stringify({ email: user.email, password: String(body.currentPassword || "") }) });
    if (!check.ok) return json(res, 403, { error: "지금 비밀번호가 맞지 않습니다." });
  }
  const failed = await setPassword(token, String(body.newPassword));
  if (failed) return json(res, 422, { error: failed });
  return json(res, 200, { ok: true });
}

/* Sends Supabase's reset email to registered admins only. The answer is the same either way. */
export async function adminPasswordReset(req, res) {
  if (req.method !== "POST") return json(res, 405, { error: "Method not allowed" });
  requireEnv(["SUPABASE_URL", "VITE_SUPABASE_ANON_KEY"]);
  const body = await readBody(req);
  const email = String(body.email || "").trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return json(res, 422, { error: "이메일 주소를 확인해 주세요." });
  const profiles = await supabase(`/admin_profiles?email=ilike.${encodeURIComponent(email)}&select=user_id`).catch(() => []);
  if (profiles.length) {
    // The link only ever points back to this shop (production or one of its previews).
    const origin = /^https:\/\/hondit-shop(-[a-z0-9-]+)?\.vercel\.app$/.test(String(body.origin || "")) ? body.origin : "https://hondit-shop.vercel.app";
    await auth(`/recover?redirect_to=${encodeURIComponent(`${origin}/admin/reset-password`)}`, { method: "POST", body: JSON.stringify({ email }) }).catch(() => null);
  }
  return json(res, 200, { ok: true });
}
