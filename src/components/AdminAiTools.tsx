import { useEffect, useState } from "react";
import { adminFetch } from "../lib/bulkApi";

/* GPT helpers for the admin. Drafts only: the owner reads, edits and sends them. */

type Draft = { language: string; reply: string; replyKo: string; summaryKo: string; ownerChecks: string[] };

let statusCache: Promise<boolean> | null = null;
export function useAiConfigured() {
  const [configured, setConfigured] = useState<boolean | null>(null);
  useEffect(() => {
    statusCache ??= adminFetch<{ configured: boolean }>("/api/admin/ai/status").then((d) => d.configured).catch(() => false);
    statusCache.then(setConfigured);
  }, []);
  return configured;
}

export function AiReplyDraft({ inquiryId, onUse }: { inquiryId: string; onUse: (text: string) => void }) {
  const configured = useAiConfigured();
  const [draft, setDraft] = useState<Draft | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => { setDraft(null); setError(""); }, [inquiryId]);

  if (configured === false) return <p className="admin-muted admin-ai__off">GPT 답변 초안: OpenAI 키를 연결하면 이 자리에 버튼이 생깁니다.</p>;
  if (configured === null) return null;

  const make = async () => {
    setBusy(true); setError(""); setCopied(false);
    try {
      const data = await adminFetch<{ draft: Draft }>("/api/admin/ai/reply", { method: "POST", body: JSON.stringify({ inquiryId }) });
      setDraft(data.draft);
    } catch (failure) {
      setError((failure as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const copy = async () => {
    if (!draft) return;
    try { await navigator.clipboard.writeText(draft.reply); setCopied(true); } catch { setCopied(false); }
  };

  return (
    <section className="admin-ai">
      <div className="admin-ai__head">
        <strong>GPT 답변 초안</strong>
        <button className="button button--ghost" type="button" onClick={make} disabled={busy}>{busy ? "작성 중… (10초 정도)" : draft ? "다시 만들기" : "답변 초안 만들기"}</button>
      </div>
      {error && <p className="form-error">{error}</p>}
      {draft && (
        <>
          {draft.summaryKo && <p className="admin-ai__summary"><b>고객이 원하는 것:</b> {draft.summaryKo}</p>}
          {draft.ownerChecks.length > 0 && (
            <div className="admin-ai__checks">
              <b>보내기 전에 확인할 것</b>
              <ul>{draft.ownerChecks.map((item) => <li key={item}>{item}</li>)}</ul>
            </div>
          )}
          <div className="admin-ai__columns">
            <div><small>고객에게 보낼 답변 ({draft.language || "고객 언어"})</small><pre>{draft.reply}</pre></div>
            <div><small>한국어 번역 (확인용)</small><pre>{draft.replyKo}</pre></div>
          </div>
          <div className="admin-row-actions">
            <button className="button button--primary" type="button" onClick={() => onUse(draft.reply)}>답장 칸에 넣기</button>
            <button className="button button--ghost" type="button" onClick={copy}>{copied ? "복사됨 ✓" : "복사 (메신저용)"}</button>
          </div>
          <p className="admin-muted">가격·수량 규칙은 사이트의 실제 결제 조건에서만 가져옵니다. 그래도 보내기 전에 한 번 읽어 주세요.</p>
        </>
      )}
    </section>
  );
}

type Text = { name: string; shortDescription: string; description: string; highlights: string[]; howTo: string[] };

export function AiTranslateButton({ source, onResult }: { source: Text | undefined; onResult: (translations: Record<string, Text>) => void }) {
  const configured = useAiConfigured();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  if (!configured) return null;

  const run = async () => {
    if (!source?.name && !source?.description) { setMessage({ ok: false, text: "한국어 탭에 상품명이나 설명을 먼저 써 주세요." }); return; }
    if (!window.confirm("한국어 문구로 영어·일본어·중국어·말레이어·태국어 칸을 새로 채울까요? 지금 그 칸에 있는 문구는 바뀝니다 (게시 전까지는 고객에게 보이지 않습니다).")) return;
    setBusy(true); setMessage(null);
    try {
      const data = await adminFetch<{ translations: Record<string, Text> }>("/api/admin/ai/translate", { method: "POST", body: JSON.stringify({ source }) });
      onResult(data.translations);
      setMessage({ ok: true, text: "5개 언어를 채웠습니다. 각 언어 탭에서 확인한 뒤 임시저장해 주세요." });
    } catch (failure) {
      setMessage({ ok: false, text: (failure as Error).message });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="admin-ai__translate">
      <button className="button button--ghost" type="button" onClick={run} disabled={busy}>{busy ? "번역 중… (20초 정도)" : "GPT로 5개 언어 자동 번역"}</button>
      {message && <small className={message.ok ? "form-success" : "form-error"}>{message.text}</small>}
    </div>
  );
}
