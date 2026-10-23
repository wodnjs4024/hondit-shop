import { useEffect, useState } from "react";
import { adminFetch } from "../lib/bulkApi";
import { AdminNotice } from "./AdminDashboardPage";
import { formatKst } from "../../shared/journal";

type Outreach = {
  id: string; content_id?: string; market: string; language?: string; outlet: string; outlet_url?: string; angle?: string; editorial_contact?: string; contact_source?: string;
  materials_url?: string; email_subject?: string; email_body?: string; gmail_draft_id?: string; link_id?: string;
  approval_status: string; approved_by?: string; approved_at?: string; send_status: string; sent_at?: string; gmail_message_id?: string;
  reply_status: string; replied_at?: string; follow_up_at?: string; follow_up_notes?: string; published_url?: string; published_at?: string;
  metrics?: { sessions?: number; inquiries?: number; orders?: number }; next_action?: string;
};
type Response = { ready: boolean; writable: boolean; message?: string; outreach: Outreach[] };

const approvalLabel: Record<string, string> = { pending: "발송 승인 대기", approved: "발송 승인", rejected: "보류" };
const sendLabel: Record<string, string> = { not_sent: "미발송", sent: "발송함", bounced: "반송" };
const replyLabel: Record<string, string> = { none: "회신 없음", replied: "회신", interested: "관심", declined: "거절", no_reply: "무응답 종료" };

async function call(path: string, body: unknown) {
  const response = await fetch(path, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${window.localStorage.getItem("hondit_admin_token") || ""}` }, body: JSON.stringify(body) });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || "요청에 실패했습니다.");
  return data;
}

export function AdminPressPage() {
  const [data, setData] = useState<Response | null>(null);
  const [error, setError] = useState("");
  const [open, setOpen] = useState<string>("");
  const load = () => adminFetch<Response>("/api/admin/press").then(setData).catch((err) => setError(err.message));
  useEffect(() => { load(); }, []);
  const act = (id: string, body: Record<string, unknown>) => call(`/api/admin/press/${id}/action`, body).then(load).catch((err) => setError(err.message));

  if (error && !data) return <AdminNotice message={error} />;
  return (
    <>
      <div className="admin-heading">
        <p className="eyebrow">콘텐츠 · PR</p>
        <h1>해외 언론 제안</h1>
        <p className="admin-muted">기존 Gmail 초안(hondit.office@gmail.com)과 CONTENT_PIPELINE 제안 행을 그대로 관리합니다. 이 화면은 메일을 보내지 않습니다. 발송은 승인 후 Gmail에서 직접 하고, 보낸 뒤 "발송함"으로 기록하세요. 같은 시장의 같은 매체는 한 번만 등록됩니다.</p>
      </div>
      {data && !data.ready && <AdminNotice message={`${data.message} 아래 목록은 저장소에 준비된 5건(읽기 전용)입니다.`} />}
      {data?.ready && !data.writable && <AdminNotice message="이 배포(Preview)는 읽기 전용입니다." />}
      {error && <AdminNotice message={error} />}
      <section className="admin-panel">
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead><tr><th>ID</th><th>시장</th><th>매체 · 편집부 연락처</th><th>link_id</th><th>승인</th><th>발송</th><th>회신·후속</th><th>게재 URL</th><th>성과</th></tr></thead>
            <tbody>
              {(data?.outreach || []).map((row) => (
                <tr key={row.id}>
                  <td>{row.content_id}</td>
                  <td>{row.market}</td>
                  <td><button type="button" className="button button--ghost" onClick={() => setOpen(open === row.id ? "" : row.id)}>{row.outlet}</button><div className="admin-muted">{row.editorial_contact}</div></td>
                  <td>{row.link_id}</td>
                  <td>{approvalLabel[row.approval_status]}{row.approved_by && <div className="admin-muted">{row.approved_by}</div>}</td>
                  <td>{sendLabel[row.send_status]}{row.sent_at && <div className="admin-muted">{formatKst(row.sent_at)}</div>}</td>
                  <td>{replyLabel[row.reply_status]}{row.follow_up_at && <div className="admin-muted">후속 {formatKst(row.follow_up_at)}</div>}</td>
                  <td>{row.published_url ? <a href={row.published_url} target="_blank" rel="noreferrer">게재</a> : "-"}</td>
                  <td>{row.metrics ? `세션 ${row.metrics.sessions || 0} · 문의 ${row.metrics.inquiries || 0} · 주문 ${row.metrics.orders || 0}` : "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      {(data?.outreach || []).filter((row) => row.id === open).map((row) => (
        <section className="admin-panel admin-press-card" key={row.id}>
          <h2>{row.outlet} · {row.market}</h2>
          <p className="admin-muted">연락처 출처: {row.contact_source || "-"} · 다음 실행: {row.next_action || "-"}</p>
          <strong>{row.email_subject}</strong>
          <pre>{row.email_body}</pre>
          <p>{row.gmail_draft_id && <a href="https://mail.google.com/mail/#drafts" target="_blank" rel="noreferrer">Gmail 초안함 열기 (draft {row.gmail_draft_id})</a>} · <a href={row.materials_url} target="_blank" rel="noreferrer">제안 기사 자료</a></p>
          {data?.writable && (
            <div className="admin-journal-actions">
              {row.approval_status !== "approved" && row.send_status !== "sent" && <button className="button" type="button" onClick={() => act(row.id, { action: "approve" })}>발송 승인</button>}
              {row.approval_status === "approved" && row.send_status !== "sent" && <button className="button button--ghost" type="button" onClick={() => act(row.id, { action: "reject" })}>승인 취소</button>}
              {row.approval_status === "approved" && row.send_status === "not_sent" && <button className="button button--ghost" type="button" onClick={() => { const id = window.prompt("Gmail에서 실제로 보낸 뒤, 보낸 메일의 메시지 ID(선택)를 입력하세요"); if (id !== null) act(row.id, { action: "mark_sent", gmailMessageId: id }); }}>발송함으로 기록</button>}
              {row.send_status === "sent" && <select defaultValue="" onChange={(e) => e.target.value && act(row.id, { action: "record_reply", replyStatus: e.target.value })}><option value="">회신 기록…</option>{Object.entries(replyLabel).filter(([k]) => k !== "none").map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select>}
              {row.send_status === "sent" && <button className="button button--ghost" type="button" onClick={() => { const url = window.prompt("실제 게재 URL (https://)"); if (url) act(row.id, { action: "record_published", url }); }}>게재 URL 기록</button>}
            </div>
          )}
        </section>
      ))}
    </>
  );
}
