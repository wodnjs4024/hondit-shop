import { type FormEvent, useState } from "react";
import { Link } from "react-router-dom";
import { getAdminToken } from "../lib/bulkApi";

/* Password forms for the admin. Passwords go to /api/admin/password and on to Supabase Auth; nothing is kept here. */

async function post(path: string, body: unknown, token?: string) {
  const response = await fetch(path, { method: "POST", headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) }, body: JSON.stringify(body) });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || "처리하지 못했습니다. 잠시 후 다시 해 주세요.");
  return data;
}

function NewPasswordFields({ value, confirm, onValue, onConfirm }: { value: string; confirm: string; onValue: (v: string) => void; onConfirm: (v: string) => void }) {
  return (
    <>
      <label>새 비밀번호<input type="password" autoComplete="new-password" minLength={8} required value={value} onChange={(e) => onValue(e.target.value)} /><small>8자 이상. 외우기 쉬운 문장형도 좋습니다 (예: 제주돌향기2026!)</small></label>
      <label>새 비밀번호 한 번 더<input type="password" autoComplete="new-password" required value={confirm} onChange={(e) => onConfirm(e.target.value)} /></label>
      {confirm && value !== confirm && <p className="form-error">두 비밀번호가 다릅니다.</p>}
    </>
  );
}

/* 운영 설정: signed-in change. */
export function AdminPasswordPanel() {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; text: string } | null>(null);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (next !== confirm) return;
    setBusy(true);
    setResult(null);
    try {
      await post("/api/admin/password", { currentPassword: current, newPassword: next }, getAdminToken());
      setResult({ ok: true, text: "비밀번호를 바꿨습니다. 다음 로그인부터 새 비밀번호를 쓰세요." });
      setCurrent(""); setNext(""); setConfirm("");
    } catch (error) {
      setResult({ ok: false, text: (error as Error).message });
    } finally {
      setBusy(false);
    }
  };

  return (
    <form className="admin-panel admin-form" onSubmit={submit}>
      <h2>비밀번호 변경</h2>
      <label>지금 비밀번호<input type="password" autoComplete="current-password" required value={current} onChange={(e) => setCurrent(e.target.value)} /></label>
      <NewPasswordFields value={next} confirm={confirm} onValue={setNext} onConfirm={setConfirm} />
      {result && <p className={result.ok ? "form-success" : "form-error"} role="status">{result.text}</p>}
      <button className="button button--primary" type="submit" disabled={busy || !next || next !== confirm}>{busy ? "바꾸는 중…" : "비밀번호 바꾸기"}</button>
    </form>
  );
}

/* Login page: ask for the reset email. */
export function AdminForgotPassword() {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; text: string } | null>(null);

  if (!open) return <button className="button button--ghost" type="button" onClick={() => setOpen(true)}>비밀번호를 잊으셨나요?</button>;

  const send = async () => {
    setBusy(true);
    setResult(null);
    try {
      await post("/api/admin/password-reset", { email, origin: window.location.origin });
      setResult({ ok: true, text: "관리자로 등록된 이메일이면 재설정 메일을 보냈습니다. 메일함(스팸함 포함)에서 링크를 눌러 새 비밀번호를 정해 주세요." });
    } catch (error) {
      setResult({ ok: false, text: (error as Error).message });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="admin-forgot">
      <label>관리자 이메일<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></label>
      {result && <p className={result.ok ? "form-success" : "form-error"} role="status">{result.text}</p>}
      <button className="button button--ghost" type="button" disabled={busy || !email} onClick={send}>{busy ? "보내는 중…" : "재설정 메일 받기"}</button>
    </div>
  );
}

/* /admin/reset-password: the page the emailed link opens. */
export function AdminResetPasswordPage() {
  const params = new URLSearchParams(window.location.hash.replace(/^#/, ""));
  const [token] = useState(params.get("access_token") || "");
  const linkError = params.get("error_description");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  // The one-time token is not left in the address bar or browser history.
  if (window.location.hash) window.history.replaceState(null, "", window.location.pathname);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (next !== confirm) return;
    setBusy(true);
    setError("");
    try {
      await post("/api/admin/password", { mode: "recovery", accessToken: token, newPassword: next });
      setDone(true);
    } catch (failure) {
      setError((failure as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="admin-login">
      <form onSubmit={submit}>
        <p className="eyebrow">ADMIN</p>
        <h1>새 비밀번호 정하기</h1>
        {done ? (
          <>
            <p className="form-success">비밀번호를 바꿨습니다. 새 비밀번호로 로그인해 주세요.</p>
            <Link className="button button--primary" to="/admin/login">로그인하러 가기</Link>
          </>
        ) : !token ? (
          <>
            <p className="form-error">{linkError ? "재설정 링크가 만료됐거나 이미 사용됐습니다." : "재설정 링크로 들어와 주세요."} 로그인 화면에서 메일을 다시 받아 주세요.</p>
            <Link className="button button--ghost" to="/admin/login">로그인 화면으로</Link>
          </>
        ) : (
          <>
            <NewPasswordFields value={next} confirm={confirm} onValue={setNext} onConfirm={setConfirm} />
            {error && <p className="form-error">{error}</p>}
            <button className="button button--primary" type="submit" disabled={busy || !next || next !== confirm}>{busy ? "저장 중…" : "새 비밀번호 저장"}</button>
          </>
        )}
      </form>
    </main>
  );
}
