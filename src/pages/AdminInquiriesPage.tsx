import { FormEvent, useEffect, useMemo, useState } from "react";
import { adminFetch } from "../lib/bulkApi";
import { AdminNotice } from "./AdminDashboardPage";

type Inquiry = {
  id: string;
  reference_number: string;
  name: string;
  email: string;
  company?: string | null;
  order_number?: string | null;
  inquiry_type: string;
  message: string;
  status: string;
  admin_note?: string | null;
  created_at: string;
  updated_at?: string | null;
  read_at?: string | null;
  replied_at?: string | null;
};

type InquiryReply = {
  id: string;
  inquiry_id: string;
  sender_email?: string | null;
  recipient_email: string;
  subject: string;
  body: string;
  status: string;
  error_message?: string | null;
  created_at: string;
  sent_at?: string | null;
};

const statusLabels: Record<string, string> = {
  new: "신규",
  read: "읽음",
  replied: "답변 완료",
  archived: "보관",
  spam: "스팸",
};

const statusOptions = ["new", "read", "replied", "archived", "spam"];

function formatDate(value?: string | null) {
  if (!value) return "-";
  return new Date(value).toLocaleString("ko-KR");
}

export function AdminInquiriesPage() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [replies, setReplies] = useState<InquiryReply[]>([]);
  const [status, setStatus] = useState("");
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [replySubject, setReplySubject] = useState("");
  const [replyBody, setReplyBody] = useState("");
  const [adminNote, setAdminNote] = useState("");

  const selected = useMemo(
    () => inquiries.find((item) => item.id === selectedId) || inquiries[0] || null,
    [inquiries, selectedId],
  );

  const load = () => {
    const query = status ? `?status=${encodeURIComponent(status)}` : "";
    adminFetch<{ inquiries: Inquiry[] }>(`/api/admin/inquiries${query}`)
      .then((data) => {
        setInquiries(data.inquiries || []);
        setError("");
      })
      .catch((err) => setError(err.message));
  };

  useEffect(load, [status]);

  useEffect(() => {
    if (!selected) return;
    setSelectedId(selected.id);
    setAdminNote(selected.admin_note || "");
    setReplySubject((current) => current || `[hondit] ${selected.reference_number}`);
    adminFetch<{ replies: InquiryReply[] }>(`/api/admin/inquiries/reply?inquiry=${encodeURIComponent(selected.id)}`)
      .then((data) => setReplies(data.replies || []))
      .catch((err) => setNotice(err.message));
  }, [selected?.id]);

  async function saveStatus(nextStatus = selected?.status || "read") {
    if (!selected) return;
    await adminFetch<{ inquiry: Inquiry }>("/api/admin/inquiries", {
      method: "PATCH",
      body: JSON.stringify({ id: selected.id, status: nextStatus, adminNote }),
    });
    setNotice("문의 상태와 내부 메모를 저장했습니다.");
    load();
  }

  async function sendReply(event: FormEvent) {
    event.preventDefault();
    if (!selected) return;
    const data = await adminFetch<{ sent: boolean; message: string; reply: InquiryReply }>("/api/admin/inquiries/reply", {
      method: "POST",
      body: JSON.stringify({ inquiryId: selected.id, subject: replySubject, body: replyBody }),
    });
    setNotice(data.message || (data.sent ? "답장을 발송했습니다." : "답장 초안을 저장했습니다."));
    setReplyBody("");
    load();
    const replyData = await adminFetch<{ replies: InquiryReply[] }>(`/api/admin/inquiries/reply?inquiry=${encodeURIComponent(selected.id)}`);
    setReplies(replyData.replies || []);
  }

  if (error) return <AdminNotice message={error} />;

  return (
    <>
      <div className="admin-heading">
        <p className="eyebrow">문의 · 답장</p>
        <h1>고객 문의함</h1>
        <p className="admin-muted">새 Contact 화면에서 들어온 문의를 확인하고, 답장 발송 또는 초안 저장 상태를 기록합니다.</p>
      </div>

      <form className="admin-filters">
        <select value={status} onChange={(event) => setStatus(event.target.value)}>
          <option value="">모든 문의 상태</option>
          {statusOptions.map((item) => (
            <option key={item} value={item}>{statusLabels[item]} ({item})</option>
          ))}
        </select>
        <button className="button button--ghost" type="button" onClick={load}>새로고침</button>
      </form>

      {notice && <p className="form-success">{notice}</p>}

      <section className="admin-inquiry-layout">
        <div className="admin-panel admin-inquiry-list">
          <h2>접수 목록</h2>
          {inquiries.length ? inquiries.map((inquiry) => (
            <button
              className={inquiry.id === selected?.id ? "is-active" : ""}
              key={inquiry.id}
              type="button"
              onClick={() => {
                setSelectedId(inquiry.id);
                setReplySubject(`[hondit] ${inquiry.reference_number}`);
                setNotice("");
              }}
            >
              <span>{statusLabels[inquiry.status] || inquiry.status}</span>
              <strong>{inquiry.reference_number}</strong>
              <small>{inquiry.name} · {inquiry.inquiry_type}</small>
              <em>{formatDate(inquiry.created_at)}</em>
            </button>
          )) : <p className="admin-muted">아직 접수된 문의가 없습니다.</p>}
        </div>

        <div className="admin-panel admin-inquiry-detail">
          {selected ? (
            <>
              <div className="admin-inquiry-detail__head">
                <div>
                  <p className="eyebrow">{statusLabels[selected.status] || selected.status}</p>
                  <h2>{selected.reference_number}</h2>
                  <p>{formatDate(selected.created_at)}</p>
                </div>
                <a className="button button--ghost" href={`mailto:${selected.email}`}>이메일 앱 열기</a>
              </div>

              <dl className="admin-inquiry-meta">
                <div><dt>고객</dt><dd>{selected.name}</dd></div>
                <div><dt>이메일</dt><dd>{selected.email}</dd></div>
                <div><dt>회사</dt><dd>{selected.company || "-"}</dd></div>
                <div><dt>주문번호</dt><dd>{selected.order_number || "-"}</dd></div>
                <div><dt>문의 유형</dt><dd>{selected.inquiry_type}</dd></div>
              </dl>

              <blockquote className="admin-inquiry-message">{selected.message}</blockquote>

              <div className="admin-inline-grid">
                <label>문의 상태
                  <select value={selected.status} onChange={(event) => void saveStatus(event.target.value)}>
                    {statusOptions.map((item) => <option key={item} value={item}>{statusLabels[item]} ({item})</option>)}
                  </select>
                </label>
                <label>내부 메모
                  <textarea value={adminNote} onChange={(event) => setAdminNote(event.target.value)} />
                </label>
              </div>
              <button className="button button--ghost" type="button" onClick={() => void saveStatus()}>상태와 메모 저장</button>

              <form className="admin-reply-form" onSubmit={sendReply}>
                <h3>관리자 답장</h3>
                <p className="admin-muted">Resend 환경변수가 연결되어 있으면 바로 발송되고, 아니면 초안으로 저장됩니다.</p>
                <label>제목<input required value={replySubject} onChange={(event) => setReplySubject(event.target.value)} /></label>
                <label>답장 내용<textarea required rows={7} value={replyBody} onChange={(event) => setReplyBody(event.target.value)} /></label>
                <div className="admin-row-actions">
                  <button className="button button--primary" type="submit">답장 발송 또는 초안 저장</button>
                  <a className="button button--ghost" href={`mailto:${selected.email}?subject=${encodeURIComponent(replySubject)}&body=${encodeURIComponent(replyBody)}`}>기본 이메일 앱으로 열기</a>
                </div>
              </form>

              <div className="admin-reply-history">
                <h3>답장 기록</h3>
                {replies.length ? replies.map((reply) => (
                  <article key={reply.id}>
                    <span>{reply.status} · {formatDate(reply.created_at)}</span>
                    <strong>{reply.subject}</strong>
                    <p>{reply.body}</p>
                    {reply.error_message && <small>{reply.error_message}</small>}
                  </article>
                )) : <p className="admin-muted">아직 저장된 답장이 없습니다.</p>}
              </div>
            </>
          ) : (
            <p className="admin-muted">왼쪽에서 문의를 선택하세요.</p>
          )}
        </div>
      </section>
    </>
  );
}
