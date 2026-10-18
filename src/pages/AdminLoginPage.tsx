import { FormEvent, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginAdmin, setAdminToken } from "../lib/bulkApi";
import { AdminForgotPassword } from "./AdminPasswordForms";

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
      setError(loginError instanceof Error && /not registered/i.test(loginError.message) ? "관리자로 등록된 계정이 아닙니다." : "이메일 또는 비밀번호가 맞지 않습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="admin-login">
      <form onSubmit={submit}>
        <p className="eyebrow">ADMIN</p>
        <h1>HONDIT 관리자</h1>
        <p>관리자 계정으로 로그인해 주세요.</p>
        <label>이메일<input type="email" autoComplete="username" value={email} onChange={(event) => setEmail(event.target.value)} /></label>
        <label>비밀번호<input type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} /></label>
        {error && <p className="form-error">{error}</p>}
        {stagingToken && (
          <button className="button button--ghost" type="button" onClick={() => { setAdminToken(stagingToken); navigate("/admin"); }}>
            테스트 환경으로 들어가기 (가짜 데이터)
          </button>
        )}
        <button className="button button--primary" disabled={loading} type="submit">
          {loading ? "로그인 중…" : "로그인"}
        </button>
        <AdminForgotPassword />
      </form>
    </main>
  );
}
