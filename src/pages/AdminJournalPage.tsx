import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { adminFetch } from "../lib/bulkApi";
import { AdminNotice } from "./AdminDashboardPage";
import { JournalArticleView } from "./JournalPages";
import { CHANNELS, JOURNAL_LANGUAGES, PRODUCT_SLUGS, formatKst, languageByCode, reviewArticle, utcToKstInput, type JournalArticle, type ReviewResult } from "../../shared/journal";

type AdminArticle = JournalArticle & { check?: ReviewResult };
type LogRow = { id: number; action: string; ok: boolean; message?: string; actor?: string; created_at: string };
type Distribution = { id: string; channel: string; title?: string; body: string; image_url?: string; final_url?: string; link_id?: string; status: string; external_id?: string; external_url?: string; scheduled_at?: string };
type Detail = { article: AdminArticle; logs: LogRow[]; distributions: Distribution[]; check: ReviewResult; approvalBlockers: string[]; publishBlockers: string[] };
type ListResponse = { ready: boolean; writable: boolean; message?: string; sheetsHook?: boolean; articles: AdminArticle[] };
type LinkStatus = { count: number; next: string; lastSheetSync: string | null; syncFresh: boolean; sheetsHook: boolean };

/* What the scheduler can and cannot promise on the current (free) Vercel plan. Shown wherever a time is picked. */
export function PublishTimingNote() {
  return (
    <p className="admin-muted admin-journal-timing">
      예약 시각 안내: 예약한 기사는 예약 시각(Asia/Seoul)이 지나면 그 뒤 첫 요청부터 공개됩니다. 기사·목록 페이지는 최대 60초, 사이트맵은 최대 약 1시간 캐시됩니다.
      다만 상태를 "공개 중"으로 바꾸고 발행 기록과 CONTENT_PIPELINE 시트를 남기는 작업은 정확한 시각에 돌지 않습니다.
      이 작업은 Vercel Hobby 크론(하루 1회, 09:00–09:59 KST)이 처리하고, 관리자가 이 화면을 열거나 "예약 발행 지금 확인"을 누를 때도 처리됩니다.
      분 단위로 정확한 기록이 필요하면 Vercel Pro(유료) 같은 별도 스케줄러가 필요합니다.
    </p>
  );
}

export const statusLabel: Record<string, string> = { draft: "초안", in_review: "검수 중", approved: "승인 완료", scheduled: "예약됨", published: "공개 중", failed: "발행 실패", archived: "보관(비공개)" };
const authorLabel: Record<string, string> = { hondit_editorial: "HONDIT 편집", ai_assisted: "AI 초안 + 편집 검수", partner_supplied: "파트너 제공" };
const errorText = (err: unknown) => {
  const e = err as Error & { blockers?: string[] };
  return e?.message || "요청에 실패했습니다.";
};

async function call<T>(path: string, init: RequestInit = {}) {
  const response = await fetch(path, { ...init, headers: { "Content-Type": "application/json", Authorization: `Bearer ${window.localStorage.getItem("hondit_admin_token") || ""}` } });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw Object.assign(new Error(data.error || "요청에 실패했습니다."), { blockers: data.blockers || [] });
  return data as T;
}

export function AdminJournalPage() {
  const { articleId } = useParams();
  if (articleId) return <AdminJournalEditor id={articleId} />;
  return <AdminJournalList />;
}

function AdminJournalList() {
  const [data, setData] = useState<ListResponse | null>(null);
  const [error, setError] = useState("");
  const [language, setLanguage] = useState("");
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState("");
  const [pipeline, setPipeline] = useState<{ tsv: string; columns: string[]; webhook: boolean } | null>(null);
  const [links, setLinks] = useState<LinkStatus | null>(null);
  const [linkPaste, setLinkPaste] = useState("");
  const [ai, setAi] = useState({ topic: "", angle: "", language: "en", products: ["diffuser-350g"] as string[] });
  const navigate = useNavigate();
  const load = () => adminFetch<ListResponse>("/api/admin/journal").then((next) => {
    setData(next);
    if (next.ready) call<LinkStatus>("/api/admin/journal/links").then(setLinks).catch(() => setLinks(null));
  }).catch((err) => setError(err.message));
  useEffect(() => { load(); }, []);

  const rows = useMemo(() => (data?.articles || []).filter((a) => (!language || a.language === language) && (!status || a.status === status)), [data, language, status]);
  const run = async (label: string, fn: () => Promise<unknown>) => {
    setBusy(label); setError("");
    try { await fn(); await load(); } catch (err) { setError(errorText(err)); } finally { setBusy(""); }
  };

  if (error && !data) return <AdminNotice message={error} />;
  return (
    <>
      <div className="admin-heading">
        <p className="eyebrow">콘텐츠 · PR</p>
        <h1>Journal 기사 관리</h1>
        <p className="admin-muted">작성 → 검수(사실·과장 표현·사진 사용권) → 관리자 승인 → 예약(Asia/Seoul) → 자동 공개. 승인되지 않은 기사는 어떤 경로로도 공개되지 않으며, 공개 전 기사는 관리자 로그인 상태의 미리보기로만 볼 수 있습니다.</p>
        <PublishTimingNote />
      </div>
      {data && !data.ready && <AdminNotice message={`${data.message} 아래 목록은 저장소에 준비된 초안(읽기 전용)입니다.`} />}
      {data?.ready && !data.writable && <AdminNotice message="이 배포(Preview)는 읽기 전용입니다. 작성·승인·예약은 운영 관리자에서 할 수 있습니다." />}
      {error && <AdminNotice message={error} />}
      <form className="admin-filters" onSubmit={(e) => e.preventDefault()}>
        <select value={language} onChange={(e) => setLanguage(e.target.value)}>
          <option value="">모든 언어</option>
          {JOURNAL_LANGUAGES.map((l) => <option key={l.code} value={l.code}>{l.label}</option>)}
        </select>
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">모든 상태</option>
          {Object.entries(statusLabel).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <button className="button button--ghost" type="button" onClick={load}>새로고침</button>
        {data?.writable && <button className="button" type="button" onClick={() => navigate("/admin/journal/new")}>새 기사</button>}
        {data?.writable && <button className="button button--ghost" type="button" disabled={!!busy} onClick={() => run("seed", () => call("/api/admin/journal/import-seed", { method: "POST" }))}>기존 4개국 초안 등록</button>}
        {data?.writable && <button className="button button--ghost" type="button" disabled={!!busy} onClick={() => run("publisher", () => call("/api/admin/journal/run-publisher", { method: "POST" }))}>예약 발행 지금 확인</button>}
      </form>

      <section className="admin-panel">
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead><tr><th>상태</th><th>언어</th><th>제목</th><th>작성 주체</th><th>검수</th><th>예약/공개 (KST)</th><th>콘텐츠 ID</th></tr></thead>
            <tbody>
              {rows.map((a) => {
                const check = a.check || reviewArticle(a);
                return (
                  <tr key={a.id}>
                    <td><span className="admin-journal-status" data-status={a.status}>{statusLabel[a.status]}</span></td>
                    <td>{languageByCode(a.language)?.label}</td>
                    <td>{data?.ready ? <Link to={`/admin/journal/${a.id}`}>{a.title}</Link> : <a href={`/journal/${languageByCode(a.language)?.segment}/${a.slug}?preview=1`} target="_blank" rel="noreferrer">{a.title}</a>}{a.last_error && <div className="admin-journal-issues is-error">{a.last_error}</div>}</td>
                    <td>{authorLabel[a.author_type]}</td>
                    <td>{check.errors.length ? `오류 ${check.errors.length}` : "자동검사 통과"} · 체크 {[a.review?.facts, a.review?.claims, a.review?.images].filter(Boolean).length}/3</td>
                    <td>{a.status === "published" ? formatKst(a.published_at) : formatKst(a.publish_at)}</td>
                    <td>{a.content_id || "-"}</td>
                  </tr>
                );
              })}
              {!rows.length && <tr><td colSpan={7}>기사가 없습니다.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>

      <section className="admin-panel">
        <h2>AI 기사 초안 만들기</h2>
        <p className="admin-muted">AI는 저장소의 확인된 제품 사실(StoneJeju 상세페이지·관리 안내·브랜드 소개)만 근거로 <b>초안</b>을 만듭니다. 결과는 항상 "초안"으로 저장되고 검수·승인 전에는 공개되지 않습니다. 유료 API 사용은 JOURNAL_AI_ENABLED=1 설정 후에만 동작합니다.</p>
        <div className="admin-journal-grid" style={{ gridTemplateColumns: "1fr 1fr" }}>
          <label>주제<input value={ai.topic} onChange={(e) => setAi({ ...ai, topic: e.target.value })} placeholder="예: 작은 방에 맞는 화산석 디퓨저 고르기" /></label>
          <label>독자·관점<input value={ai.angle} onChange={(e) => setAi({ ...ai, angle: e.target.value })} placeholder="예: 싱가포르 원룸·사무실 책상, 선물용" /></label>
          <label>언어<select value={ai.language} onChange={(e) => setAi({ ...ai, language: e.target.value })}>{JOURNAL_LANGUAGES.map((l) => <option key={l.code} value={l.code}>{l.label}</option>)}</select></label>
          <label>관련 상품<select multiple value={ai.products} onChange={(e) => setAi({ ...ai, products: Array.from(e.target.selectedOptions).map((o) => o.value) })}>{PRODUCT_SLUGS.map((s) => <option key={s} value={s}>{s}</option>)}</select></label>
        </div>
        <button className="button" type="button" disabled={!data?.writable || !!busy} onClick={() => run("ai", async () => {
          const out = await call<{ article: JournalArticle }>("/api/admin/journal/ai-draft", { method: "POST", body: JSON.stringify(ai) });
          navigate(`/admin/journal/${out.article.id}`);
        })}>{busy === "ai" ? "초안 작성 중…" : "AI 초안 생성"}</button>
      </section>

      <section className="admin-panel">
        <h2>CONTENT_PIPELINE 시트 연동</h2>
        <p className="admin-muted">03_HONDIT_검색_AEO_성과측정 › CONTENT_PIPELINE 탭과 같은 13개 열입니다. {pipeline?.webhook ? "발행·실패 시 시트 웹훅으로 자동 전송됩니다." : "시트 자동 쓰기(웹훅)는 아직 설정되지 않았습니다. 아래 행을 복사해 붙여 넣거나, 운영 설정의 CONTENT_PIPELINE_WEBHOOK_URL을 등록하세요."}</p>
        <button className="button button--ghost" type="button" onClick={() => call<{ tsv: string; columns: string[]; webhook: boolean }>("/api/admin/journal/pipeline").then(setPipeline).catch((err) => setError(err.message))}>시트 행 만들기</button>
        {pipeline && <textarea className="admin-journal-tsv" readOnly value={`${pipeline.columns.join("\t")}\n${pipeline.tsv}`} />}
        <p className="admin-muted">자동 기록은 시트가 저장한 값을 다시 읽어 돌려준 경우에만 성공으로 남습니다. 인증 실패·행 불일치·저장 실패는 기사별 기록에 "pipeline_failed"로 남고, 기사 화면에서 다시 보낼 수 있습니다.</p>
      </section>

      {data?.ready && (
        <section className="admin-panel">
          <h2>03_LINKS link_id 중복 방지</h2>
          <p className="admin-muted">
            새 link_id는 03_LINKS 전체 발급 이력과 이 시스템이 쓴 ID를 모두 확인한 뒤에만 지정됩니다.
            {links?.sheetsHook ? " 시트 연동이 켜져 있어 새 ID는 03_LINKS에도 바로 발급됩니다." : " 시트 연동이 없으므로 새 ID를 쓰기 전 24시간 안에 03_LINKS A열 전체를 아래에 붙여 넣어 동기화해야 합니다. 지정 후 화면에 나오는 03_LINKS 행을 시트에 바로 추가하세요."}
          </p>
          {links && <p>등록된 ID {links.count}개 · 다음 번호 <b>{links.next}</b> · 마지막 시트 동기화 {links.lastSheetSync ? formatKst(links.lastSheetSync) : "없음"} {links.syncFresh ? "(유효)" : "(동기화 필요)"}</p>}
          {data.writable && (
            <>
              <textarea className="admin-journal-tsv" value={linkPaste} onChange={(e) => setLinkPaste(e.target.value)} placeholder={"03_LINKS A열(link_id) 전체를 복사해 붙여 넣으세요\nl0001\nl0002\n…"} />
              <div className="admin-journal-actions">
                <button className="button button--ghost" type="button" disabled={!!busy || !linkPaste.trim()} onClick={() => run("links", async () => { setLinks(await call<LinkStatus>("/api/admin/journal/links/sync", { method: "POST", body: JSON.stringify({ ids: linkPaste }) })); setLinkPaste(""); })}>붙여 넣은 목록으로 동기화</button>
                {links?.sheetsHook && <button className="button button--ghost" type="button" disabled={!!busy} onClick={() => run("links", async () => setLinks(await call<LinkStatus>("/api/admin/journal/links/sync", { method: "POST", body: "{}" })))}>03_LINKS에서 바로 가져오기</button>}
              </div>
            </>
          )}
        </section>
      )}
    </>
  );
}

const empty: Partial<JournalArticle> = { language: "en", slug: "", title: "", dek: "", body_md: "", related_products: [], sources: [], cta_type: "product", author_type: "hondit_editorial", image_rights: "pending" };

function AdminJournalEditor({ id }: { id: string }) {
  const isNew = id === "new";
  const navigate = useNavigate();
  const [detail, setDetail] = useState<Detail | null>(null);
  const [form, setForm] = useState<Partial<JournalArticle>>(empty);
  const [sourcesText, setSourcesText] = useState("");
  const [error, setError] = useState("");
  const [blockers, setBlockers] = useState<string[]>([]);
  const [notice, setNotice] = useState("");
  const [publishAt, setPublishAt] = useState("");
  const [review, setReview] = useState({ facts: false, claims: false, images: false, notes: "" });
  const [dist, setDist] = useState({ channel: "pinterest", linkId: "" });
  const [linksRow, setLinksRow] = useState("");
  const [tab, setTab] = useState<"edit" | "preview">("edit");

  const load = async () => {
    if (isNew) return;
    const next = await adminFetch<Detail>(`/api/admin/journal/${id}`);
    setDetail(next);
    setForm(next.article);
    setSourcesText((next.article.sources || []).map((s) => `${s.label} | ${s.url}`).join("\n"));
    setReview({ facts: !!next.article.review?.facts, claims: !!next.article.review?.claims, images: !!next.article.review?.images, notes: next.article.review?.notes || "" });
    setPublishAt(utcToKstInput(next.article.publish_at) || "");
  };
  useEffect(() => { load().catch((err) => setError(err.message)); }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  const parsedSources = sourcesText.split("\n").map((line) => line.split("|").map((x) => x.trim())).filter(([, url]) => url).map(([label, url]) => ({ label, url }));
  const draft = { ...form, sources: parsedSources } as JournalArticle;
  const liveCheck = reviewArticle(draft);
  const set = (key: keyof JournalArticle, value: unknown) => setForm((f) => ({ ...f, [key]: value }));
  const act = async (fn: () => Promise<unknown>, done = "") => {
    setError(""); setBlockers([]); setNotice("");
    try { await fn(); if (!isNew) await load(); if (done) setNotice(done); } catch (err) { setError(errorText(err)); setBlockers((err as { blockers?: string[] }).blockers || []); }
  };
  const save = () => act(async () => {
    const body = JSON.stringify({ ...form, sources: parsedSources });
    if (isNew) {
      const out = await call<{ article: JournalArticle }>("/api/admin/journal", { method: "POST", body });
      navigate(`/admin/journal/${out.article.id}`);
    } else {
      const out = await call<{ note?: string }>(`/api/admin/journal/${id}`, { method: "PATCH", body });
      if (out.note) setNotice(out.note);
    }
  }, "저장했습니다.");
  const action = (name: string, extra: Record<string, unknown> = {}, done = "") => act(() => call(`/api/admin/journal/${id}/action`, { method: "POST", body: JSON.stringify({ action: name, ...extra }) }), done);
  const status = detail?.article.status || "draft";
  const lang = languageByCode(form.language || "en");

  if (!isNew && !detail && error) return <AdminNotice message={error} />;
  return (
    <>
      <div className="admin-heading">
        <p className="eyebrow"><Link to="/admin/journal">← Journal 기사 관리</Link></p>
        <h1>{isNew ? "새 기사" : form.title}</h1>
        {!isNew && <p className="admin-muted"><span className="admin-journal-status" data-status={status}>{statusLabel[status]}</span> · {authorLabel[form.author_type || "hondit_editorial"]} · {detail?.article.public_url || `/journal/${lang?.segment}/${form.slug}`}</p>}
      </div>
      {error && <AdminNotice message={error} />}
      {blockers.length > 0 && <ul className="admin-journal-issues is-error">{blockers.map((b) => <li key={b}>{b}</li>)}</ul>}
      {notice && <p className="admin-muted">{notice}</p>}
      <div className="admin-filters">
        <button type="button" className={`button ${tab === "edit" ? "" : "button--ghost"}`} onClick={() => setTab("edit")}>편집</button>
        <button type="button" className={`button ${tab === "preview" ? "" : "button--ghost"}`} onClick={() => setTab("preview")}>공개 전 미리보기</button>
      </div>
      <div className="admin-journal-grid">
        <section className="admin-panel">
          {tab === "preview" ? (
            <div className="admin-journal-preview"><JournalArticleView article={{ ...draft, published_at: draft.published_at || new Date().toISOString() }} preview /></div>
          ) : (
            <>
              <label>언어<select value={form.language} onChange={(e) => set("language", e.target.value)}>{JOURNAL_LANGUAGES.map((l) => <option key={l.code} value={l.code}>{l.label} ({l.market})</option>)}</select></label>
              <label>URL 슬러그 (영문 소문자·하이픈) — /journal/{lang?.segment}/{form.slug}<input value={form.slug} onChange={(e) => set("slug", e.target.value.toLowerCase())} /></label>
              <label>제목<input value={form.title} onChange={(e) => set("title", e.target.value)} /></label>
              <label>요약(리드)<textarea value={form.dek} onChange={(e) => set("dek", e.target.value)} /></label>
              <label>본문 — ## 소제목, - 목록, &gt; 인용, ![대체텍스트](/images/… "캡션"), [링크](/products/…)<textarea className="is-body" value={form.body_md} onChange={(e) => set("body_md", e.target.value)} /></label>
              <label>대표 이미지 경로 (실제 제품 사진)<input value={form.hero_image_url || ""} onChange={(e) => set("hero_image_url", e.target.value)} /></label>
              <label>대표 이미지 대체 텍스트(alt)<input value={form.hero_image_alt || ""} onChange={(e) => set("hero_image_alt", e.target.value)} /></label>
              <label>이미지 설명(캡션)<input value={form.hero_image_caption || ""} onChange={(e) => set("hero_image_caption", e.target.value)} /></label>
              <label>사진 출처·저작권 표기<input value={form.hero_image_credit || ""} onChange={(e) => set("hero_image_credit", e.target.value)} /></label>
              <label>관련 상품 (Ctrl/⌘로 여러 개)<select multiple value={form.related_products || []} onChange={(e) => set("related_products", Array.from(e.target.selectedOptions).map((o) => o.value))}>{PRODUCT_SLUGS.map((s) => <option key={s}>{s}</option>)}</select></label>
              <label>하단 버튼<select value={form.cta_type} onChange={(e) => set("cta_type", e.target.value)}><option value="product">상품 + 문의</option><option value="contact">문의</option><option value="partners">기업·매장 구매</option></select></label>
              <label>작성 주체<select value={form.author_type} onChange={(e) => set("author_type", e.target.value)}>{Object.entries(authorLabel).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></label>
              <label>근거 자료 (한 줄에 "이름 | https://주소")<textarea value={sourcesText} onChange={(e) => setSourcesText(e.target.value)} /></label>
              <label>검색 제목 (SEO title)<input value={form.seo_title || ""} onChange={(e) => set("seo_title", e.target.value)} /></label>
              <label>검색 설명 (meta description)<textarea value={form.seo_description || ""} onChange={(e) => set("seo_description", e.target.value)} /></label>
              <label>CONTENT_PIPELINE 콘텐츠 ID<input value={form.content_id || ""} onChange={(e) => set("content_id", e.target.value)} placeholder="S-JRN-SG-02" /></label>
              <button className="button" type="button" onClick={save}>{isNew ? "초안 저장" : "저장"}</button>
              {["approved", "scheduled"].includes(status) && <p className="admin-muted">승인·예약 후 내용을 고치면 승인이 해제되고 다시 검수 단계로 돌아갑니다.</p>}
            </>
          )}
        </section>

        <aside className="admin-journal-side">
          <section className="admin-panel">
            <h3>자동 검사</h3>
            <p className="admin-muted">본문 길이 {liveCheck.length}</p>
            {liveCheck.errors.length ? <ul className="admin-journal-issues is-error">{liveCheck.errors.map((e) => <li key={e}>{e}</li>)}</ul> : <p>오류 없음</p>}
            {liveCheck.warnings.length > 0 && <ul className="admin-journal-issues is-warn">{liveCheck.warnings.map((e) => <li key={e}>{e}</li>)}</ul>}
            {detail?.check?.errors?.some((e) => e.includes("겹칩니다")) && <ul className="admin-journal-issues is-error">{detail.check.errors.filter((e) => e.includes("겹칩니다")).map((e) => <li key={e}>{e}</li>)}</ul>}
          </section>

          {!isNew && (
            <section className="admin-panel admin-journal-checks">
              <h3>사람 검수</h3>
              <label><input type="checkbox" checked={review.facts} onChange={(e) => setReview({ ...review, facts: e.target.checked })} /> 사실관계 (제품 사양·제조사·판매 조건)</label>
              <label><input type="checkbox" checked={review.claims} onChange={(e) => setReview({ ...review, claims: e.target.checked })} /> 과장·효능·보장 표현 없음</label>
              <label><input type="checkbox" checked={review.images} onChange={(e) => setReview({ ...review, images: e.target.checked })} /> 사진 사용권 확인</label>
              <label>사진 사용권 상태<select value={form.image_rights} onChange={(e) => set("image_rights", e.target.value)}><option value="pending">확인 대기</option><option value="confirmed">확인 완료</option><option value="restricted">사용 제한</option></select></label>
              <label>검수 메모<textarea value={review.notes} onChange={(e) => setReview({ ...review, notes: e.target.value })} /></label>
              <button className="button button--ghost" type="button" disabled={!["draft", "in_review"].includes(status)} onClick={() => act(() => call(`/api/admin/journal/${id}/review`, { method: "POST", body: JSON.stringify({ ...review, imageRights: form.image_rights }) }), "검수 체크를 저장했습니다.")}>검수 체크 저장</button>
              {detail?.article.review?.reviewer && <p className="admin-muted">{detail.article.review.reviewer} · {formatKst(detail.article.review.reviewed_at)}</p>}
            </section>
          )}

          {!isNew && (
            <section className="admin-panel">
              <h3>승인 · 예약 발행</h3>
              {detail?.approvalBlockers?.length && status === "in_review" ? <ul className="admin-journal-issues is-warn">{detail.approvalBlockers.map((b) => <li key={b}>{b}</li>)}</ul> : null}
              <div className="admin-journal-actions">
                {["draft", "failed"].includes(status) && <button className="button" type="button" onClick={() => action("submit", {}, "검수 요청했습니다.")}>검수 요청</button>}
                {status === "in_review" && <button className="button" type="button" onClick={() => action("approve", {}, "승인했습니다.")}>관리자 승인</button>}
                {["in_review", "approved", "failed"].includes(status) && <button className="button button--ghost" type="button" onClick={() => action("request_changes")}>수정 요청(초안으로)</button>}
              </div>
              {status === "approved" && (
                <>
                  <label>발행 일시 (Asia/Seoul)<input type="datetime-local" value={publishAt} onChange={(e) => setPublishAt(e.target.value)} /></label>
                  <PublishTimingNote />
                  <div className="admin-journal-actions">
                    <button className="button" type="button" onClick={() => action("schedule", { publishAt }, "예약했습니다.")}>예약</button>
                    <button className="button button--ghost" type="button" onClick={() => window.confirm("지금 공개합니다. 계속할까요?") && action("schedule", { publishNow: true }, "공개했습니다.")}>지금 발행</button>
                  </div>
                </>
              )}
              {status === "scheduled" && <><p>예약: {formatKst(detail?.article.publish_at)} (이 시각부터 공개, 상태 기록은 다음 크론·관리자 열람 때)</p><button className="button button--ghost" type="button" onClick={() => action("cancel_schedule", {}, "예약을 취소했습니다.")}>예약 취소</button></>}
              {status === "failed" && <><p className="admin-journal-issues is-error">{detail?.article.last_error}</p><button className="button" type="button" onClick={() => action("retry", {}, "재시도했습니다.")}>재시도</button></>}
              {status === "published" && <><p>공개: {formatKst(detail?.article.published_at)}<br /><a href={detail?.article.public_url || "#"} target="_blank" rel="noreferrer">{detail?.article.public_url}</a></p><button className="button button--ghost" type="button" onClick={() => window.confirm("공개를 중단하고 보관합니다.") && action("archive")}>비공개(보관)</button></>}
              {status === "archived" && <button className="button button--ghost" type="button" onClick={() => action("restore")}>초안으로 복원</button>}
              {["draft", "in_review", "archived", "failed"].includes(status) && <button className="button button--ghost" type="button" onClick={() => window.confirm("이 기사를 삭제합니다.") && act(async () => { await call(`/api/admin/journal/${id}`, { method: "DELETE" }); navigate("/admin/journal"); })}>삭제</button>}
            </section>
          )}

          {!isNew && status === "published" && (
            <section className="admin-panel">
              <h3>외부 채널 패키지 (Metricool)</h3>
              <p className="admin-muted">승인된 기사 제목·요약·대표 이미지로 플랫폼별 문구와 Final URL을 만듭니다. link_id는 03_LINKS 전체 이력과 대조해 한 번만 쓸 수 있고, 기사·채널당 1개만 만들 수 있어 중복 게시를 막습니다.</p>
              <label>채널<select value={dist.channel} onChange={(e) => setDist({ ...dist, channel: e.target.value })}>{Object.entries(CHANNELS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}</select></label>
              <label>새 link_id (Journal 목록의 "03_LINKS link_id 중복 방지"에서 다음 번호 확인)<input value={dist.linkId} onChange={(e) => setDist({ ...dist, linkId: e.target.value.trim() })} placeholder="l0044" /></label>
              <button className="button button--ghost" type="button" onClick={() => act(async () => { const out = await call<{ linksRow: string[] }>(`/api/admin/journal/${id}/distributions`, { method: "POST", body: JSON.stringify(dist) }); setLinksRow(out.linksRow.join("\t")); }, "패키지를 만들었습니다. 03_LINKS 행을 시트에 추가하세요.")}>패키지 만들기</button>
              {linksRow && <textarea className="admin-journal-tsv" readOnly value={linksRow} />}
              {(detail?.distributions || []).map((d) => (
                <article key={d.id} className="admin-press-card">
                  <strong>{CHANNELS[d.channel]?.label || d.channel} · {d.link_id} · {d.status}</strong>
                  {d.title && <span>{d.title}</span>}
                  <pre>{d.body}</pre>
                  <small>{d.final_url}</small>
                  <div className="admin-journal-actions">
                    {d.status === "draft" && <button className="button button--ghost" type="button" onClick={() => act(() => call(`/api/admin/journal/distributions/${d.id}`, { method: "PATCH", body: JSON.stringify({ status: "approved" }) }))}>문구 승인</button>}
                    {d.status === "approved" && <button className="button button--ghost" type="button" onClick={() => { const ext = window.prompt("Metricool 예약 ID (예약 후 입력)"); if (ext) act(() => call(`/api/admin/journal/distributions/${d.id}`, { method: "PATCH", body: JSON.stringify({ status: "scheduled", external_id: ext }) })); }}>Metricool 예약 기록</button>}
                    {d.status === "scheduled" && <button className="button button--ghost" type="button" onClick={() => { const url = window.prompt("게시된 URL"); if (url) act(() => call(`/api/admin/journal/distributions/${d.id}`, { method: "PATCH", body: JSON.stringify({ status: "published", external_url: url }) })); }}>게시 확인</button>}
                    {!["published", "cancelled"].includes(d.status) && <button className="button button--ghost" type="button" onClick={() => act(() => call(`/api/admin/journal/distributions/${d.id}`, { method: "PATCH", body: JSON.stringify({ status: "cancelled" }) }))}>취소</button>}
                  </div>
                </article>
              ))}
            </section>
          )}

          {!isNew && (
            <section className="admin-panel">
              <h3>발행·오류 기록</h3>
              {["published", "failed"].includes(status) && <button className="button button--ghost" type="button" onClick={() => act(() => call(`/api/admin/journal/${id}/pipeline-sync`, { method: "POST" }), "CONTENT_PIPELINE에 저장된 것을 확인했습니다.")}>CONTENT_PIPELINE 다시 보내기</button>}
              <ul className="admin-journal-log">
                {(detail?.logs || []).map((l) => <li key={l.id}><b style={{ color: l.ok ? undefined : "#a8321f" }}>{l.action}</b> · {formatKst(l.created_at)} · {l.actor}{l.message && <div>{l.message}</div>}</li>)}
              </ul>
            </section>
          )}
        </aside>
      </div>
    </>
  );
}
