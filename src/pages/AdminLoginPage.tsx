import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginAdmin } from "../lib/bulkApi";

export function AdminLoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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
        <p>Sign in with the Supabase Auth admin account created by the hondit team.</p>
        <label>Email<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} /></label>
        <label>Password<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} /></label>
        {error && <p className="form-error">{error}</p>}
        <button className="button button--primary" disabled={loading} type="submit">
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </main>
  );
}
