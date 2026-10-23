// HONDIT Journal + press outreach: database access, scheduled publisher and admin endpoints.
// Runs inside the existing functions (api/products.js for public pages, api/admin.js for admin) so no new
// Vercel function slot is used. Tables come from supabase/migrations/010_journal_pr.sql; until that migration
// is applied public pages show nothing, admins see the in-repo drafts read-only, and every write answers 503.
// Public requests never write: a scheduled article becomes visible at its publish_at by a read-time check (isPublic),
// and the status/log/sheet bookkeeping is done by the authenticated publisher (cron with CRON_SECRET, or an admin).
import {
  CHANNELS, ISSUED_LINK_IDS, JOURNAL_LANGUAGES, MAX_PUBLISH_ATTEMPTS, PRODUCT_SLUGS, TRANSITIONS, AUTHOR_TYPES, IMAGE_RIGHTS,
  approvalBlockers, articlePipelineRow, articleUrl, buildDistribution, isPublic, kstToUtc, languageByCode, languageBySegment,
  linkIdOk, nextLinkId, pressLink, prPipelineRow, publicView, publishBlockers, reviewArticle, slugOk, toTsv, withFinalUrl, PIPELINE_COLUMNS,
} from '../shared/journal.js';
import { SheetsHookError, fetchSheetLinkIds, reserveSheetLink, sheetsHookConfigured, syncPipelineRow } from './_sheets-hook.js';
import { JOURNAL_FACTS, seedArticles, seedPress } from '../shared/journal-seed.js';
import { isStagingPreview, json, readBody, supabase, verifyAdmin } from './_utils.js';

export class JournalNotReady extends Error {
  constructor() { super('Journal 테이블이 아직 없습니다. supabase/migrations/010_journal_pr.sql 적용 후 사용할 수 있습니다.'); this.status = 503; }
}
class HttpError extends Error { constructor(status, message, extra = {}) { super(message); this.status = status; this.extra = extra; } }

const missingTable = (error) => /journal_|pr_outreach|schema cache|does not exist|relation/i.test(String(error?.message || ''));
async function db(path, options) {
  try { return await supabase(path, options); } catch (error) { if (missingTable(error)) throw new JournalNotReady(); throw error; }
}

/* Writes (publisher, admin edits) only where the database is meant to change: production, the staging preview,
   or a local/test run that opts in. An ordinary Preview reads production data and must never write to it. */
export function journalWritesAllowed() {
  if (process.env.VERCEL_ENV === 'production') return true;
  if (process.env.VERCEL_ENV === 'preview') return isStagingPreview();
  return process.env.JOURNAL_ALLOW_WRITES === '1';
}

const LIST_FIELDS = ['id', 'group_key', 'content_id', 'language', 'market', 'slug', 'title', 'dek', 'hero_image_url', 'hero_image_alt', 'author_type', 'author_name', 'status', 'published_at', 'updated_at', 'related_products'];
const PRIVATE_FIELDS = ['review', 'ai_meta', 'publish_attempts', 'last_error', 'approved_by', 'approved_at', 'created_by', 'publish_at'];
const enc = encodeURIComponent;
const pick = (row, keys) => Object.fromEntries(keys.map((k) => [k, row[k]]));
const strip = (row) => Object.fromEntries(Object.entries(row).filter(([k]) => !PRIVATE_FIELDS.includes(k)));
const byDateDesc = (a, b) => String(b.published_at || '').localeCompare(String(a.published_at || ''));

/* ---------- public reads (no writes, no drafts; Preview deployments behave exactly like production) ---------- */
async function visibleRows(filter, now) {
  // Published rows plus scheduled rows; isPublic keeps only those already public at this instant.
  const rows = await db(`/journal_articles?select=*&status=in.(published,scheduled)${filter}&limit=500`);
  return rows.filter((row) => isPublic(row, now)).map(publicView);
}

export async function listPublicArticles(language, { now = new Date() } = {}) {
  const lang = language ? languageByCode(language) : null;
  try {
    const rows = await visibleRows(lang ? `&language=eq.${enc(lang.code)}` : '', now);
    return { articles: rows.sort(byDateDesc).slice(0, 100).map((row) => pick(row, LIST_FIELDS)), preview: false };
  } catch (error) {
    if (!(error instanceof JournalNotReady)) throw error;
    return { articles: [], preview: false };
  }
}

/* admin=true is only passed after verifyAdmin succeeded; it shows any status, marked as a preview and never cached. */
export async function getPublicArticle(language, slug, { admin = false, now = new Date() } = {}) {
  const lang = languageByCode(language);
  if (!lang || !slugOk(slug)) return null;
  let article = null, translations = [];
  try {
    const rows = await db(`/journal_articles?select=*&language=eq.${enc(lang.code)}&slug=eq.${enc(slug)}&limit=1`);
    article = rows[0] || null;
    if (article && !isPublic(article, now) && !admin) article = null;
    if (article?.group_key) translations = (await visibleRows(`&group_key=eq.${enc(article.group_key)}`, now)).filter((t) => t.id !== article.id);
  } catch (error) {
    if (!(error instanceof JournalNotReady)) throw error;
    // Before migration 010 only a signed-in admin can look at the in-repo drafts.
    const draft = admin ? seedArticles.find((a) => a.language === lang.code && a.slug === slug) : null;
    if (draft) {
      article = { ...draft, updated_at: draft.updated_at || null };
      translations = seedArticles.filter((a) => a.group_key === draft.group_key && a.id !== draft.id);
    }
  }
  if (!article) return null;
  const preview = !isPublic(article, now);
  const shown = preview ? article : publicView(article);
  return { article: strip(shown), translations: translations.map(({ id, language: l, slug: s2, title }) => ({ id, language: l, slug: s2, title })), preview };
}

/* ---------- publisher ---------- */
const log = (article_id, action, message, actor = 'publisher', ok = true) =>
  db('/journal_publish_log', { method: 'POST', headers: { Prefer: 'return=minimal' }, body: JSON.stringify({ article_id, action, message: String(message || '').slice(0, 2000), actor, ok }) }).catch(() => null);

/* Records the article's CONTENT_PIPELINE row. Success is logged only when the sheet confirms what it stored. */
async function notifyPipeline(article, actor = 'publisher') {
  if (!sheetsHookConfigured()) return { skipped: true };
  try {
    const result = await syncPipelineRow(articlePipelineRow(article));
    await log(article.id, 'pipeline_synced', `CONTENT_PIPELINE ${result.result}${result.rowNumber ? ` row ${result.rowNumber}` : ''}`, actor);
    return { ok: true, ...result };
  } catch (error) {
    const message = error instanceof SheetsHookError ? error.message : String(error?.message || error);
    await log(article.id, 'pipeline_failed', message, actor, false);
    return { ok: false, error: message };
  }
}

/* Publishes every approved article whose time (Asia/Seoul entered, stored UTC) has come. Safe to run many times at once:
   the update is conditional on status=scheduled, so two runs cannot both publish (or double-log) the same row. */
export async function runPublisher({ now = new Date(), actor = 'publisher' } = {}) {
  if (!journalWritesAllowed()) return { skipped: 'writes disabled on this deployment', published: [], failed: [] };
  const iso = new Date(now).toISOString();
  const due = await db(`/journal_articles?select=*&status=eq.scheduled&publish_at=lte.${enc(iso)}&order=publish_at.asc&limit=20`);
  const result = { published: [], failed: [], skipped: [] };
  if (!due.length) return result;
  for (const article of due) {
    // The same checks the public pages apply at read time, so what readers saw is what gets recorded.
    const blockers = publishBlockers(article);
    if (blockers.length) {
      const attempts = Number(article.publish_attempts || 0) + 1;
      const status = attempts >= MAX_PUBLISH_ATTEMPTS ? 'failed' : 'scheduled';
      await db(`/journal_articles?id=eq.${enc(article.id)}&status=eq.scheduled`, { method: 'PATCH', body: JSON.stringify({ publish_attempts: attempts, last_error: blockers.join(' / ').slice(0, 1000), status }) });
      await log(article.id, status === 'failed' ? 'failed' : 'publish_blocked', blockers.join(' / '), actor, false);
      result.failed.push({ id: article.id, attempts, status, errors: blockers });
      if (status === 'failed') await notifyPipeline({ ...article, status, last_error: blockers.join(' / ') }, actor);
      continue;
    }
    try {
      const updated = await db(`/journal_articles?id=eq.${enc(article.id)}&status=eq.scheduled`, {
        method: 'PATCH',
        // published_at is the scheduled time: the article has been public since then.
        body: JSON.stringify({ status: 'published', published_at: article.publish_at || iso, public_url: articleUrl(article), last_error: null }),
      });
      if (!updated?.length) { result.skipped.push(article.id); continue; } // another run already published it
      await log(article.id, 'published', updated[0].public_url, actor);
      result.published.push({ id: article.id, url: updated[0].public_url });
      await notifyPipeline(updated[0], actor);
    } catch (error) {
      const attempts = Number(article.publish_attempts || 0) + 1;
      const status = attempts >= MAX_PUBLISH_ATTEMPTS ? 'failed' : 'scheduled';
      await db(`/journal_articles?id=eq.${enc(article.id)}&status=eq.scheduled`, { method: 'PATCH', body: JSON.stringify({ publish_attempts: attempts, last_error: String(error.message || error).slice(0, 1000), status }) }).catch(() => null);
      await log(article.id, 'failed', error.message, actor, false);
      result.failed.push({ id: article.id, attempts, status, errors: [error.message] });
    }
  }
  return result;
}


/* ---------- admin ---------- */
const EDITABLE = ['content_id', 'language', 'slug', 'title', 'dek', 'body_md', 'hero_image_url', 'hero_image_alt', 'hero_image_caption', 'hero_image_credit', 'image_rights', 'related_products', 'cta_type', 'seo_title', 'seo_description', 'sources', 'author_type', 'author_name', 'group_key', 'source_doc'];
const CONTENT_FIELDS = EDITABLE.filter((k) => !['content_id', 'group_key', 'source_doc'].includes(k));

function cleanArticleInput(body, { partial = false } = {}) {
  const out = {};
  for (const key of EDITABLE) {
    if (body[key] === undefined) continue;
    let value = body[key];
    if (key === 'related_products') value = (Array.isArray(value) ? value : []).map(String).filter((s) => PRODUCT_SLUGS.includes(s)).slice(0, 5);
    else if (key === 'sources') value = (Array.isArray(value) ? value : []).filter((s) => s && /^https:\/\//.test(s.url || '')).map((s) => ({ label: String(s.label || s.url).slice(0, 200), url: String(s.url).slice(0, 500) })).slice(0, 12);
    else value = value === null ? null : String(value).slice(0, key === 'body_md' ? 40000 : 600);
    out[key] = value;
  }
  if (out.language !== undefined) {
    const lang = languageByCode(out.language);
    if (!lang) throw new HttpError(422, '언어는 en, ja, zh-HK, zh-TW 중 하나입니다.');
    out.market = lang.market;
  }
  if (out.slug !== undefined && !slugOk(out.slug)) throw new HttpError(422, 'URL 슬러그는 영문 소문자·숫자·하이픈만 사용할 수 있습니다.');
  if (out.author_type !== undefined && !AUTHOR_TYPES.includes(out.author_type)) throw new HttpError(422, '작성 주체 값이 올바르지 않습니다.');
  if (out.image_rights !== undefined && !IMAGE_RIGHTS.includes(out.image_rights)) throw new HttpError(422, '사진 사용권 값이 올바르지 않습니다.');
  if (out.cta_type !== undefined && !['product', 'contact', 'partners'].includes(out.cta_type)) throw new HttpError(422, 'CTA 값이 올바르지 않습니다.');
  if (!partial) {
    if (!out.language) throw new HttpError(422, '언어를 선택해 주세요.');
    if (!out.slug) throw new HttpError(422, 'URL 슬러그를 입력해 주세요.');
    if (!out.title) throw new HttpError(422, '제목을 입력해 주세요.');
  }
  return out;
}

async function loadArticle(id) {
  const rows = await db(`/journal_articles?select=*&id=eq.${enc(id)}&limit=1`);
  if (!rows.length) throw new HttpError(404, '기사를 찾을 수 없습니다.');
  return rows[0];
}
const allOthers = () => db('/journal_articles?select=id,language,slug,title,dek,body_md,status&limit=1000');
function requireWrites() {
  if (!journalWritesAllowed()) throw new HttpError(403, '이 배포(Preview)에서는 기사 데이터를 변경할 수 없습니다.');
}

async function adminList(actor) {
  try {
    // Opening the admin list records anything that became public since the last run (authenticated; no public writes).
    const publisher = journalWritesAllowed() ? await runPublisher({ actor: `${actor} (목록 열람)` }) : null;
    const articles = await db('/journal_articles?select=*&order=updated_at.desc&limit=500');
    return { ready: true, writable: journalWritesAllowed(), sheetsHook: sheetsHookConfigured(), publisher, articles: articles.map(withReview(articles)) };
  } catch (error) {
    if (!(error instanceof JournalNotReady)) throw error;
    return { ready: false, writable: false, message: error.message, articles: seedArticles.map(withReview(seedArticles)) };
  }
}
const withReview = (all) => (article) => ({ ...article, check: reviewArticle(article, { others: all }) });

async function transition(article, action, body, actor) {
  const rule = TRANSITIONS[action];
  if (!rule) throw new HttpError(400, '알 수 없는 작업입니다.');
  if (!rule.from.includes(article.status)) throw new HttpError(409, `현재 상태(${article.status})에서는 이 작업을 할 수 없습니다.`);
  const patch = { status: rule.to };
  const others = await allOthers();
  if (action === 'approve') {
    const blockers = approvalBlockers(article, others);
    if (blockers.length) throw new HttpError(422, '승인 전에 해결할 항목이 있습니다.', { blockers });
    Object.assign(patch, { approved_by: actor, approved_at: new Date().toISOString() });
  }
  if (action === 'schedule') {
    const when = body.publishNow ? new Date().toISOString() : kstToUtc(body.publishAt);
    if (!when) throw new HttpError(422, '발행 일시(Asia/Seoul)를 입력해 주세요.');
    if (!body.publishNow && new Date(when).getTime() < Date.now() - 60_000) throw new HttpError(422, '이미 지난 시각입니다. 바로 공개하려면 "지금 발행"을 사용하세요.');
    const blockers = publishBlockers(article, others);
    if (blockers.length) throw new HttpError(422, '예약 전에 해결할 항목이 있습니다.', { blockers });
    Object.assign(patch, { publish_at: when, publish_attempts: 0, last_error: null });
  }
  if (action === 'cancel_schedule') Object.assign(patch, { publish_at: null });
  if (action === 'retry') Object.assign(patch, { publish_attempts: 0, last_error: null, publish_at: new Date(Math.max(Date.now(), new Date(article.publish_at || 0).getTime())).toISOString() });
  if (action === 'request_changes' || action === 'restore') Object.assign(patch, { approved_by: null, approved_at: null, publish_at: null });
  if (action === 'archive') Object.assign(patch, { publish_at: null });
  const updated = await db(`/journal_articles?id=eq.${enc(article.id)}&status=eq.${enc(article.status)}`, { method: 'PATCH', body: JSON.stringify(patch) });
  if (!updated?.length) throw new HttpError(409, '다른 작업이 먼저 상태를 바꿨습니다. 새로고침 후 다시 시도하세요.');
  await log(article.id, action, action === 'schedule' ? `publish_at=${patch.publish_at}` : body.note || '', actor);
  let publisher = null;
  if (action === 'schedule' || action === 'retry') publisher = await runPublisher({ actor: `${actor} (즉시 확인)` });
  const fresh = await loadArticle(article.id);
  return { article: fresh, publisher };
}

export async function adminJournal(req, res, parts) {
  const admin = await verifyAdmin(req);
  const actor = admin?.profile?.email || admin?.user?.email || 'admin';
  try {
    const [, first, second, third] = parts;
    if (req.method === 'GET' && !first) return json(res, 200, await adminList(actor));
    if (req.method === 'GET' && first === 'facts') return json(res, 200, { facts: JOURNAL_FACTS, languages: JOURNAL_LANGUAGES, channels: CHANNELS, issuedLinkIds: ISSUED_LINK_IDS, sheetsHook: sheetsHookConfigured() });
    if (req.method === 'GET' && first === 'pipeline') return json(res, 200, await pipelineExport());
    if (req.method === 'GET' && first === 'links') return json(res, 200, await linkRegistryStatus());
    if (req.method === 'POST' && first === 'links' && second === 'sync') { requireWrites(); return json(res, 200, await syncLinkRegistry(await readBody(req), actor)); }
    if (req.method === 'POST' && first === 'run-publisher') { requireWrites(); return json(res, 200, await runPublisher({ actor })); }
    if (req.method === 'POST' && first === 'import-seed') { requireWrites(); return json(res, 200, await importSeed(actor)); }
    if (req.method === 'POST' && first === 'ai-draft') { requireWrites(); return json(res, 200, await aiDraft(await readBody(req), actor)); }
    if (first === 'distributions' && second && req.method === 'PATCH') { requireWrites(); return json(res, 200, await updateDistribution(second, await readBody(req), actor)); }
    if (req.method === 'POST' && !first) {
      requireWrites();
      const input = cleanArticleInput(await readBody(req));
      const lang = languageByCode(input.language);
      const row = { ...input, market: lang.market, status: 'draft', created_by: actor, author_type: input.author_type || 'hondit_editorial' };
      const created = await db('/journal_articles', { method: 'POST', body: JSON.stringify(row) }).catch((error) => {
        if (/duplicate|unique/i.test(error.message)) throw new HttpError(409, '같은 언어에 같은 URL(또는 콘텐츠 ID)이 이미 있습니다.');
        throw error;
      });
      await log(created[0].id, 'created', '', actor);
      return json(res, 201, { article: created[0] });
    }
    if (!first) return json(res, 405, { error: 'Method not allowed' });

    const id = first;
    if (req.method === 'GET' && !second) {
      const [article, logs, distributions, others] = await Promise.all([loadArticle(id), db(`/journal_publish_log?select=*&article_id=eq.${enc(id)}&order=created_at.desc&limit=100`), db(`/journal_distributions?select=*&article_id=eq.${enc(id)}&order=created_at.asc`), allOthers()]);
      return json(res, 200, { article, logs, distributions, check: reviewArticle(article, { others }), approvalBlockers: approvalBlockers(article, others), publishBlockers: publishBlockers(article, others) });
    }
    requireWrites();
    if (req.method === 'PATCH' && !second) {
      const article = await loadArticle(id);
      const input = cleanArticleInput(await readBody(req), { partial: true });
      const contentChanged = CONTENT_FIELDS.some((k) => input[k] !== undefined && JSON.stringify(input[k]) !== JSON.stringify(article[k]));
      const patch = { ...input };
      let note = '';
      if (contentChanged && ['approved', 'scheduled'].includes(article.status)) {
        // Approval covers the exact text that was reviewed. Any content edit sends it back to review.
        Object.assign(patch, { status: 'in_review', approved_by: null, approved_at: null, publish_at: null, review: { ...(article.review || {}), facts: false, claims: false, images: false } });
        note = '승인 후 내용이 바뀌어 승인·예약을 해제하고 검수로 되돌렸습니다.';
      }
      if (contentChanged && article.status === 'published') {
        const check = reviewArticle({ ...article, ...input }, { others: await allOthers(), publishing: true });
        if (!check.ok) throw new HttpError(422, '공개 중인 기사는 검수 오류가 없어야 수정할 수 있습니다.', { blockers: check.errors });
        note = '공개 기사 수정 (수정일 갱신)';
      }
      const updated = await db(`/journal_articles?id=eq.${enc(id)}&status=eq.${enc(article.status)}`, { method: 'PATCH', body: JSON.stringify(patch) });
      if (!updated?.length) throw new HttpError(409, '다른 작업이 먼저 상태를 바꿨습니다. 새로고침 후 다시 시도하세요.');
      await log(id, 'edited', note, actor);
      return json(res, 200, { article: updated[0], note });
    }
    if (req.method === 'POST' && second === 'review') {
      const article = await loadArticle(id);
      if (!['draft', 'in_review'].includes(article.status)) throw new HttpError(409, '검수 체크는 초안·검수 중 상태에서만 바꿀 수 있습니다.');
      const body = await readBody(req);
      const review = { facts: Boolean(body.facts), claims: Boolean(body.claims), images: Boolean(body.images), notes: String(body.notes || '').slice(0, 2000), reviewer: actor, reviewed_at: new Date().toISOString() };
      const patch = { review };
      if (body.imageRights && IMAGE_RIGHTS.includes(body.imageRights)) patch.image_rights = body.imageRights;
      const updated = await db(`/journal_articles?id=eq.${enc(id)}`, { method: 'PATCH', body: JSON.stringify(patch) });
      await log(id, 'review', `facts=${review.facts} claims=${review.claims} images=${review.images}`, actor);
      return json(res, 200, { article: updated[0] });
    }
    if (req.method === 'POST' && second === 'action') {
      const body = await readBody(req);
      return json(res, 200, await transition(await loadArticle(id), String(body.action || ''), body, actor));
    }
    if (req.method === 'POST' && second === 'pipeline-sync') {
      const article = await loadArticle(id);
      const result = await notifyPipeline(article, actor);
      if (result.skipped) throw new HttpError(409, '시트 연동이 설정되지 않았습니다. "시트 행 만들기"로 붙여 넣으세요.');
      return json(res, result.ok ? 200 : 502, result);
    }
    if (req.method === 'POST' && second === 'localize') return json(res, 200, await aiLocalize(await loadArticle(id), await readBody(req), actor));
    if (req.method === 'POST' && second === 'distributions') return json(res, 201, await createDistribution(await loadArticle(id), await readBody(req), actor));
    if (req.method === 'DELETE' && !second) {
      const article = await loadArticle(id);
      if (!['draft', 'in_review', 'archived', 'failed'].includes(article.status)) throw new HttpError(409, '승인·예약·공개 중인 기사는 삭제할 수 없습니다. 먼저 보관(비공개) 처리하세요.');
      await log(id, 'deleted', article.title, actor);
      await db(`/journal_articles?id=eq.${enc(id)}`, { method: 'DELETE' });
      return json(res, 200, { deleted: true });
    }
    void third;
    return json(res, 404, { error: 'Journal endpoint not found' });
  } catch (error) {
    if (error instanceof HttpError || error instanceof JournalNotReady) return json(res, error.status, { error: error.message, ...(error.extra || {}) });
    if (Number.isInteger(error?.status)) return json(res, error.status, { error: error.message }); // AiError
    throw error;
  }
}

/* ---------- step 5: register the existing four country drafts ---------- */
const PR_FILE_FIELDS = ['grade', 'recheck_result', 'verified_route', 'pre_send_check', 'evidence_url', 'related_url', 'hold_reason'];
async function importSeed(actor) {
  const articles = await db('/journal_articles?on_conflict=content_id', { method: 'POST', headers: { Prefer: 'resolution=ignore-duplicates,return=representation' }, body: JSON.stringify(seedArticles.map((a) => ({ ...a, created_by: actor }))) });
  for (const a of articles || []) await log(a.id, 'created', 'HONDIT_무료PR_기사초안_4개국_20261023에서 등록 (검수 대기, 비공개)', actor);
  // IDs already issued in 03_LINKS on 2026-10-23 (migration 010 inserts the same rows).
  await db('/link_registry?on_conflict=link_id', { method: 'POST', headers: { Prefer: 'resolution=ignore-duplicates,return=minimal' }, body: JSON.stringify(ISSUED_LINK_IDS.map((link_id) => ({ link_id, source: '03_LINKS', ref: 'issued by 2026-10-23' }))) });
  // Press: a candidate already registered (same content ID, or same outlet in the same market) is never added again;
  // only its empty verification fields from the latest file are filled in. Status, approval and text stay as they are.
  const existing = await db('/pr_outreach?select=id,content_id,market,outlet,grade,recheck_result,verified_route,pre_send_check,evidence_url,related_url,hold_reason');
  const sameRow = (a, b) => (a.content_id && a.content_id === b.content_id) || (a.market === b.market && a.outlet.toLowerCase() === b.outlet.toLowerCase());
  const fresh = seedPress.filter((p) => !existing.some((e) => sameRow(e, p)));
  const press = fresh.length ? await db('/pr_outreach?on_conflict=content_id', { method: 'POST', headers: { Prefer: 'resolution=ignore-duplicates,return=representation' }, body: JSON.stringify(fresh) }) : [];
  let filled = 0;
  for (const e of existing) {
    const p = seedPress.find((x) => sameRow(e, x));
    if (!p) continue;
    const patch = Object.fromEntries(PR_FILE_FIELDS.filter((k) => e[k] == null && p[k]).map((k) => [k, p[k]]));
    if (!Object.keys(patch).length) continue;
    await db(`/pr_outreach?id=eq.${enc(e.id)}`, { method: 'PATCH', body: JSON.stringify(patch) });
    filled++;
  }
  return { articles: (articles || []).length, press: (press || []).length, pressUpdated: filled };
}

/* ---------- step 3: AI drafts (never published by the AI) ---------- */
function aiEnabled() {
  return process.env.JOURNAL_AI_ENABLED === '1';
}
async function aiDraft(body, actor) {
  if (!aiEnabled()) throw new HttpError(503, 'AI 기사 초안 생성이 꺼져 있습니다. 비용 승인 후 JOURNAL_AI_ENABLED=1 로 켤 수 있습니다.');
  const { draftJournalArticle } = await import('./_ai.js');
  const lang = languageByCode(body.language);
  if (!lang) throw new HttpError(422, '언어를 선택해 주세요.');
  const topic = String(body.topic || '').trim().slice(0, 300);
  if (topic.length < 8) throw new HttpError(422, '기사 주제를 한 문장 이상 써 주세요.');
  const products = (Array.isArray(body.products) ? body.products : []).filter((s) => PRODUCT_SLUGS.includes(s));
  const facts = JOURNAL_FACTS.filter((f) => products.includes(f.id) || ['care', 'brand'].includes(f.id));
  const draft = await draftJournalArticle({ topic, angle: String(body.angle || '').slice(0, 300), language: lang.code, market: lang.market, facts });
  const others = await allOthers();
  const row = {
    language: lang.code, market: lang.market, slug: draft.slug, title: draft.title, dek: draft.dek, body_md: draft.body_md,
    seo_title: draft.seo_title, seo_description: draft.seo_description, related_products: products,
    hero_image_url: body.heroImageUrl || null, hero_image_alt: draft.hero_image_alt || null, image_rights: 'pending',
    sources: facts.map(({ label, url }) => ({ label, url })), author_type: 'ai_assisted', author_name: 'HONDIT editorial team (AI-assisted draft)',
    status: 'draft', created_by: actor, group_key: body.groupKey || null,
    ai_meta: { model: draft.model, generated_at: new Date().toISOString(), topic, angle: body.angle || '', claims_to_verify: draft.claims_to_verify, facts_used: facts.map((f) => f.id) },
  };
  let slug = row.slug, n = 2;
  while (others.some((o) => o.language === row.language && o.slug === slug)) slug = `${row.slug}-${n++}`;
  row.slug = slug;
  const created = await db('/journal_articles', { method: 'POST', body: JSON.stringify(row) });
  await log(created[0].id, 'ai_draft', `model=${draft.model}`, actor);
  return { article: created[0], check: reviewArticle(created[0], { others }) };
}
async function aiLocalize(source, body, actor) {
  requireWrites();
  if (!aiEnabled()) throw new HttpError(503, 'AI 현지화가 꺼져 있습니다. 비용 승인 후 JOURNAL_AI_ENABLED=1 로 켤 수 있습니다.');
  const target = languageByCode(body.language);
  if (!target || target.code === source.language) throw new HttpError(422, '다른 대상 언어를 선택해 주세요.');
  const { localizeJournalArticle } = await import('./_ai.js');
  const facts = JOURNAL_FACTS.filter((f) => (source.related_products || []).includes(f.id) || ['care', 'brand'].includes(f.id));
  const draft = await localizeJournalArticle({ article: source, language: target.code, market: target.market, facts });
  const groupKey = source.group_key || `story-${source.id}`;
  if (!source.group_key) await db(`/journal_articles?id=eq.${enc(source.id)}`, { method: 'PATCH', body: JSON.stringify({ group_key: groupKey }) });
  const row = { ...draft, language: target.code, market: target.market, related_products: source.related_products, hero_image_url: source.hero_image_url, hero_image_caption: null, hero_image_credit: source.hero_image_credit, image_rights: source.image_rights === 'confirmed' ? 'confirmed' : 'pending', sources: source.sources, author_type: 'ai_assisted', author_name: 'HONDIT editorial team (AI-assisted draft)', status: 'draft', created_by: actor, group_key: groupKey, cta_type: source.cta_type, ai_meta: { model: draft.model, localized_from: source.id, generated_at: new Date().toISOString(), claims_to_verify: draft.claims_to_verify } };
  delete row.model; delete row.claims_to_verify;
  const created = await db('/journal_articles', { method: 'POST', body: JSON.stringify(row) }).catch((error) => {
    if (/duplicate|unique/i.test(error.message)) throw new HttpError(409, '대상 언어에 같은 URL이 이미 있습니다.');
    throw error;
  });
  await log(created[0].id, 'ai_localize', `from ${source.language}/${source.slug}`, actor);
  return { article: created[0], check: reviewArticle(created[0], { others: await allOthers() }) };
}

/* ---------- link_id registry: one ID, one placement, across 03_LINKS, Journal packages and press proposals ----------
   link_registry holds every ID ever issued (03_LINKS history + IDs this system reserved); its primary key makes a second
   use impossible. With the sheet bridge configured, an ID is also issued in 03_LINKS itself under the script's lock.
   Without it, a new ID is only accepted while the registry was synced with the full 03_LINKS list in the last 24 hours. */
const SYNC_MAX_AGE_MS = 24 * 3600 * 1000;
async function registryRows() {
  return db('/link_registry?select=link_id,source,ref,last_seen_in_sheet&limit=10000');
}
async function linkRegistryStatus() {
  const rows = await registryRows();
  const lastSync = rows.map((r) => r.last_seen_in_sheet).filter(Boolean).sort().pop() || null;
  return {
    count: rows.length,
    next: nextLinkId(rows.map((r) => r.link_id)),
    lastSheetSync: lastSync,
    syncFresh: Boolean(lastSync && Date.now() - new Date(lastSync).getTime() < SYNC_MAX_AGE_MS),
    sheetsHook: sheetsHookConfigured(),
  };
}
/* Imports the full 03_LINKS link_id column: pulled through the sheet bridge, or pasted by an admin. */
async function syncLinkRegistry(body, actor) {
  let ids;
  if (body?.ids) ids = [...new Set(String(body.ids).match(/\bl\d{4}\b/g) || [])];
  else {
    try { ids = (await fetchSheetLinkIds()).linkIds.filter(linkIdOk); } catch (error) { throw new HttpError(error.code === 'not_configured' ? 422 : 502, error.code === 'not_configured' ? '시트 연동이 없으니 03_LINKS A열(link_id) 전체를 붙여 넣어 주세요.' : error.message); }
  }
  if (!ids.length) throw new HttpError(422, '03_LINKS link_id를 찾지 못했습니다.');
  const known = new Set((await registryRows()).map((r) => r.link_id));
  // A sync must cover everything already known to have come from the sheet, or it is a partial paste.
  const missing = ISSUED_LINK_IDS.filter((id) => !ids.includes(id));
  if (missing.length) throw new HttpError(422, `03_LINKS 전체 목록이 아닌 것 같습니다 (${missing.slice(0, 5).join(', ')} 없음). A열 전체를 붙여 넣어 주세요.`);
  const seenAt = new Date().toISOString();
  await db('/link_registry?on_conflict=link_id', { method: 'POST', headers: { Prefer: 'resolution=ignore-duplicates,return=minimal' }, body: JSON.stringify(ids.filter((id) => !known.has(id)).map((link_id) => ({ link_id, source: '03_LINKS', ref: `sync ${actor}`, last_seen_in_sheet: seenAt }))) });
  const seen = ids.filter((id) => known.has(id));
  for (let i = 0; i < seen.length; i += 200) {
    await db(`/link_registry?link_id=in.(${seen.slice(i, i + 200).join(',')})`, { method: 'PATCH', body: JSON.stringify({ last_seen_in_sheet: seenAt }) });
  }
  return { synced: ids.length, added: ids.filter((id) => !known.has(id)).length, ...(await linkRegistryStatus()) };
}
async function reserveLinkId(linkId, { source, ref, linksRow }, actor) {
  if (!linkIdOk(linkId)) throw new HttpError(422, 'link_id 형식은 l0044 처럼 l + 숫자 4자리입니다.');
  if (ISSUED_LINK_IDS.includes(linkId)) throw new HttpError(409, `${linkId}는 이미 03_LINKS에 발급된 ID입니다.`);
  const rows = await registryRows();
  if (rows.some((r) => r.link_id === linkId)) throw new HttpError(409, `${linkId}는 이미 발급·사용된 ID입니다. 다음 번호는 ${nextLinkId(rows.map((r) => r.link_id))}입니다.`);
  let sheet = null;
  if (sheetsHookConfigured()) {
    try { sheet = await reserveSheetLink(linkId, linksRow); } catch (error) {
      if (error.code === 'taken') throw new HttpError(409, `${linkId}는 03_LINKS에 이미 있습니다. 03_LINKS 동기화 후 다음 번호를 쓰세요.`);
      if (error.code === 'campaign_missing') throw new HttpError(409, `02_CAMPAIGNS에 ${linksRow?.[1] || '이 캠페인'}이 없습니다. 캠페인(목표·비용 주체)을 먼저 등록한 뒤 다시 지정하세요.`);
      throw new HttpError(502, `03_LINKS 발급을 확인하지 못해 link_id를 지정하지 않았습니다: ${error.message}`);
    }
  } else {
    const lastSync = rows.map((r) => r.last_seen_in_sheet).filter(Boolean).sort().pop();
    if (!lastSync || Date.now() - new Date(lastSync).getTime() >= SYNC_MAX_AGE_MS) throw new HttpError(409, '03_LINKS 목록을 먼저 동기화해 주세요 (24시간 이내). 시트에서 쓰인 ID와 겹치지 않게 하기 위함입니다.');
  }
  await db('/link_registry', { method: 'POST', headers: { Prefer: 'return=minimal' }, body: JSON.stringify({ link_id: linkId, source, ref, created_by: actor, last_seen_in_sheet: sheet ? new Date().toISOString() : null }) }).catch((error) => {
    if (/duplicate|unique/i.test(error.message)) throw new HttpError(409, `${linkId}는 방금 다른 곳에서 사용되었습니다.`);
    throw error;
  });
  return { linkId, sheet: Boolean(sheet), linksRow };
}

/* ---------- step 6: external channel packages (Metricool) ---------- */
async function createDistribution(article, body, actor) {
  const channel = String(body.channel || '');
  if (!CHANNELS[channel]) throw new HttpError(422, '채널은 pinterest, instagram, facebook 중 하나입니다.');
  const linkId = String(body.linkId || '').trim();
  if ((await db(`/journal_distributions?select=id&article_id=eq.${enc(article.id)}&channel=eq.${enc(channel)}`)).length) throw new HttpError(409, '이 기사·채널 조합의 배포 패키지가 이미 있습니다 (중복 발행 방지).');
  let pkg;
  try { pkg = buildDistribution(article, channel, linkId); } catch (error) { throw new HttpError(422, error.message); }
  const { links_row, dedupe_key, ...row } = pkg;
  const reserved = await reserveLinkId(linkId, { source: 'journal_distribution', ref: dedupe_key, linksRow: links_row }, actor);
  const created = await db('/journal_distributions', { method: 'POST', body: JSON.stringify({ ...row, article_id: article.id, status: 'draft' }) }).catch((error) => {
    if (/duplicate|unique/i.test(error.message)) throw new HttpError(409, '이 기사·채널 조합의 배포 패키지가 이미 있습니다 (중복 발행 방지).');
    throw error;
  });
  await log(article.id, 'distribution_created', `${channel} ${linkId} ${dedupe_key}`, actor);
  return { distribution: created[0], linksRow: links_row, linkInSheet: reserved.sheet };
}
const DIST_STATUSES = ['draft', 'approved', 'scheduled', 'published', 'failed', 'cancelled'];
async function updateDistribution(id, body, actor) {
  const rows = await db(`/journal_distributions?select=*&id=eq.${enc(id)}`);
  if (!rows.length) throw new HttpError(404, '배포 패키지를 찾을 수 없습니다.');
  const current = rows[0];
  const patch = { updated_at: new Date().toISOString() };
  if (body.status !== undefined) {
    if (!DIST_STATUSES.includes(body.status)) throw new HttpError(422, '상태 값이 올바르지 않습니다.');
    if (['scheduled', 'published'].includes(body.status) && !['approved', 'scheduled'].includes(current.status)) throw new HttpError(409, '승인된 패키지만 예약·게시 상태로 바꿀 수 있습니다.');
    patch.status = body.status;
  }
  for (const key of ['title', 'body', 'external_id', 'external_url', 'error']) if (body[key] !== undefined) patch[key] = String(body[key]).slice(0, key === 'body' ? 4000 : 600);
  if (body.scheduledAt !== undefined) patch.scheduled_at = body.scheduledAt ? kstToUtc(body.scheduledAt) : null;
  if ((patch.title !== undefined || patch.body !== undefined) && ['scheduled', 'published'].includes(current.status)) throw new HttpError(409, '예약·게시된 패키지의 문구는 Metricool에서 직접 수정하세요.');
  const updated = await db(`/journal_distributions?id=eq.${enc(id)}`, { method: 'PATCH', body: JSON.stringify(patch) });
  await log(current.article_id, 'distribution_updated', `${current.channel} -> ${patch.status || current.status}`, actor);
  return { distribution: updated[0] };
}

/* ---------- step 7: press outreach (status tracking only; nothing is sent from here) ---------- */
// File-derived fields (grade, recheck_result, verified_route, evidence_url, related_url) are kept as imported; hold_reason and
// pre_send_check stay editable so a hold can be lifted once its reason is resolved.
const PR_FIELDS = ['outlet', 'outlet_url', 'angle', 'editorial_contact', 'contact_source', 'materials_url', 'email_subject', 'email_body', 'gmail_draft_id', 'follow_up_notes', 'published_url', 'next_action', 'notes', 'language', 'hold_reason', 'pre_send_check'];
export async function adminPress(req, res, parts) {
  const admin = await verifyAdmin(req);
  const actor = admin?.profile?.email || 'admin';
  try {
    const [, id, second] = parts;
    if (req.method === 'GET' && !id) {
      try {
        const rows = await db('/pr_outreach?select=*&order=market.asc,outlet.asc');
        return json(res, 200, { ready: true, writable: journalWritesAllowed(), outreach: rows });
      } catch (error) {
        if (!(error instanceof JournalNotReady)) throw error;
        return json(res, 200, { ready: false, writable: false, message: error.message, outreach: seedPress });
      }
    }
    requireWrites();
    if (req.method === 'POST' && !id) {
      const body = await readBody(req);
      const row = { market: String(body.market || '').toUpperCase().slice(0, 2), outlet: String(body.outlet || '').trim().slice(0, 200), approval_status: 'pending', send_status: 'not_sent' };
      for (const k of PR_FIELDS) if (body[k] !== undefined) row[k] = String(body[k]).slice(0, k === 'email_body' ? 8000 : 600);
      if (!row.outlet || !/^(SG|JP|HK|TW|TH|MY|BN|MO)$/.test(row.market)) throw new HttpError(422, '매체명과 시장을 입력해 주세요.');
      let linksRow = null;
      if (body.link_id) {
        const link = pressLink(row, String(body.link_id));
        linksRow = (await reserveLinkId(String(body.link_id), { source: 'pr_outreach', ref: `${row.market}:${row.outlet}`, linksRow: link.linksRow }, actor)).linksRow;
        row.link_id = String(body.link_id);
        if (row.email_body) row.email_body = withFinalUrl(row.email_body, link.url);
      }
      // The same outlet in the same market is one record (UNIQUE outlet, market): no duplicate registration.
      const created = await db('/pr_outreach', { method: 'POST', body: JSON.stringify(row) }).catch((error) => {
        if (/duplicate|unique/i.test(error.message)) throw new HttpError(409, '같은 시장에 같은 매체(또는 link_id)가 이미 등록되어 있습니다.');
        throw error;
      });
      return json(res, 201, { outreach: created[0], linksRow });
    }
    const rows = await db(`/pr_outreach?select=*&id=eq.${enc(id)}`);
    if (!rows.length) throw new HttpError(404, '제안 기록을 찾을 수 없습니다.');
    const row = rows[0];
    const body = await readBody(req);
    const patch = { updated_at: new Date().toISOString() };
    let linksRow = null;
    if (req.method === 'PATCH' && !second) {
      for (const k of PR_FIELDS) if (body[k] !== undefined) patch[k] = String(body[k]).slice(0, k === 'email_body' ? 8000 : 600);
      if (body.metrics && typeof body.metrics === 'object') patch.metrics = { sessions: Number(body.metrics.sessions || 0), inquiries: Number(body.metrics.inquiries || 0), orders: Number(body.metrics.orders || 0), updated_at: new Date().toISOString() };
      if (body.link_id !== undefined && (body.link_id || null) !== row.link_id) {
        if (row.send_status === 'sent') throw new HttpError(409, '이미 발송된 제안의 link_id는 바꿀 수 없습니다.');
        if (!body.link_id) patch.link_id = null; // the old ID stays in the registry and is never handed out again
        else {
          const id = String(body.link_id).trim();
          const link = pressLink({ ...row, ...patch }, id);
          // Check the press table first so a taken ID is not burned in the registry.
          if ((await db(`/pr_outreach?select=id&link_id=eq.${enc(id)}`)).length) throw new HttpError(409, '다른 제안에서 이미 쓰는 link_id입니다.');
          linksRow = (await reserveLinkId(id, { source: 'pr_outreach', ref: `${row.market}:${row.outlet}`, linksRow: link.linksRow }, actor)).linksRow;
          patch.link_id = id;
          const text = patch.email_body ?? row.email_body;
          if (text) patch.email_body = withFinalUrl(text.replace(/https:\/\/hondit-shop\.vercel\.app\/\?[^\s]*link_id=l\d{4}[^\s]*/, 'https://hondit-shop.vercel.app/'), link.url);
        }
      }
      if (body.follow_up_at !== undefined) patch.follow_up_at = body.follow_up_at ? kstToUtc(body.follow_up_at) : null;
      // An edited email needs a fresh approval.
      if ((patch.email_body !== undefined && patch.email_body !== row.email_body) || (patch.email_subject !== undefined && patch.email_subject !== row.email_subject)) Object.assign(patch, { approval_status: 'pending', approved_by: null, approved_at: null });
      if (patch.link_id !== undefined) Object.assign(patch, { approval_status: 'pending', approved_by: null, approved_at: null });
    } else if (req.method === 'POST' && second === 'action') {
      const action = String(body.action || '');
      if (action === 'approve') {
        if (row.send_status === 'sent') throw new HttpError(409, '이미 발송된 제안입니다.');
        if (String(row.hold_reason || '').trim()) throw new HttpError(409, `보류 중인 후보입니다: ${row.hold_reason}`);
        // Only a written proposal whose link carries its own link_id (Final URL) can be approved.
        if (!String(row.email_body || '').trim()) throw new HttpError(409, '제안문이 없는 후보는 승인할 수 없습니다.');
        if (!row.link_id) throw new HttpError(409, '03_LINKS에서 link_id를 먼저 지정해 주세요.');
        if (!String(row.email_body).includes(`link_id=${row.link_id}`)) throw new HttpError(409, `본문 링크를 link_id=${row.link_id}가 들어간 Final URL로 바꾼 뒤 승인해 주세요.`);
        Object.assign(patch, { approval_status: 'approved', approved_by: actor, approved_at: new Date().toISOString() }); }
      else if (action === 'reject') Object.assign(patch, { approval_status: 'rejected', approved_by: null, approved_at: null });
      else if (action === 'mark_sent') {
        if (row.approval_status !== 'approved') throw new HttpError(409, '발송 승인된 제안만 "발송함"으로 기록할 수 있습니다.');
        if (row.send_status === 'sent') throw new HttpError(409, '이미 발송으로 기록되어 있습니다.');
        Object.assign(patch, { send_status: 'sent', sent_at: new Date().toISOString(), gmail_message_id: String(body.gmailMessageId || '').slice(0, 200) || null });
      } else if (action === 'mark_bounced') Object.assign(patch, { send_status: 'bounced' });
      else if (action === 'record_reply') {
        if (!['replied', 'interested', 'declined', 'no_reply'].includes(body.replyStatus)) throw new HttpError(422, '회신 상태를 선택해 주세요.');
        Object.assign(patch, { reply_status: body.replyStatus, replied_at: new Date().toISOString(), follow_up_notes: String(body.notes || row.follow_up_notes || '').slice(0, 2000) });
      } else if (action === 'record_published') {
        if (!/^https:\/\//.test(String(body.url || ''))) throw new HttpError(422, '게재 URL(https://)을 입력해 주세요.');
        Object.assign(patch, { published_url: String(body.url).slice(0, 500), published_at: new Date().toISOString() });
      } else throw new HttpError(400, '알 수 없는 작업입니다.');
    } else return json(res, 405, { error: 'Method not allowed' });
    const updated = await db(`/pr_outreach?id=eq.${enc(id)}`, { method: 'PATCH', body: JSON.stringify(patch) }).catch((error) => {
      if (/duplicate|unique/i.test(error.message)) throw new HttpError(409, '다른 제안에서 이미 쓰는 link_id입니다.');
      throw error;
    });
    return json(res, 200, { outreach: updated[0], linksRow });
  } catch (error) {
    if (error instanceof HttpError || error instanceof JournalNotReady) return json(res, error.status, { error: error.message, ...(error.extra || {}) });
    throw error;
  }
}

/* ---------- CONTENT_PIPELINE export ---------- */
async function pipelineExport() {
  let articles = seedArticles, press = seedPress, ready = false;
  try {
    articles = await db('/journal_articles?select=*&status=neq.archived&order=content_id.asc');
    press = await db('/pr_outreach?select=*&order=content_id.asc');
    ready = true;
  } catch (error) { if (!(error instanceof JournalNotReady)) throw error; }
  const rows = [...articles.map(articlePipelineRow), ...press.map(prPipelineRow)];
  return { ready, columns: PIPELINE_COLUMNS, rows, tsv: toTsv(rows), webhook: Boolean(process.env.CONTENT_PIPELINE_WEBHOOK_URL) };
}

export { languageBySegment };
