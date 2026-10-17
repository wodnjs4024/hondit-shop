import { FormEvent, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginAdmin, setAdminToken } from "../lib/bulkApi";

export function AdminLoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [stagingToken, setStagingToken] = useState<string | null>(null);

  /* Only the staging preview (synthetic data) answers with a token; production and ordinary previews never do. */
  useEffect(() => {
    fetch("/api/admin/staging").then((r) => (r.ok ? r.json() : null)).then((d) => setStagingToken(d?.staging ? d.token : null)).catch(() => undefined);
  }, []);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      await loginAdmin(email, password);
      navigate("/admin");
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="admin-login">
      <form onSubmit={submit}>
        <p className="eyebrow">ADMIN</p>
        <h1>hondit order management</h1>
        <p>Sign in with your hondit admin account.</p>
        <label>Email<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} /></label>
        <label>Password<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} /></label>
        {error && <p className="form-error">{error}</p>}
        {stagingToken && (
          <button className="button button--ghost" type="button" onClick={() => { setAdminToken(stagingToken); navigate("/admin"); }}>
            테스트 환경으로 들어가기 (가짜 데이터)
          </button>
        )}
        <button className="button button--primary" disabled={loading} type="submit">
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </main>
  );
}
