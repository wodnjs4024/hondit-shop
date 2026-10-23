// HONDIT Journal: shared rules for the article list, article pages, admin review and scheduled publishing.
// Nothing here talks to a database or network; api/_journal.js and the React pages both use it.

export const SITE = 'https://hondit-shop.vercel.app';
export const TIMEZONE = 'Asia/Seoul';

/* Languages served by the Journal. The URL segment is lower-case; the stored code matches the site's lang codes. */
export const JOURNAL_LANGUAGES = [
  { code: 'en', segment: 'en', market: 'SG', label: 'English', hreflang: 'en', ogLocale: 'en_SG', siteLang: 'en' },
  { code: 'ja', segment: 'ja', market: 'JP', label: '日本語', hreflang: 'ja', ogLocale: 'ja_JP', siteLang: 'ja' },
  { code: 'zh-HK', segment: 'zh-hk', market: 'HK', label: '繁體中文（香港）', hreflang: 'zh-HK', ogLocale: 'zh_HK', siteLang: 'zh-HK' },
  // The site's Taiwan links keep lang=en (zh-TW is not a selectable storefront language), the article itself is zh-TW.
  { code: 'zh-TW', segment: 'zh-tw', market: 'TW', label: '繁體中文（台灣）', hreflang: 'zh-TW', ogLocale: 'zh_TW', siteLang: 'en' },
];
export const languageByCode = (code) => JOURNAL_LANGUAGES.find((l) => l.code === code) || null;
export const languageBySegment = (segment) => JOURNAL_LANGUAGES.find((l) => l.segment === String(segment || '').toLowerCase()) || null;

export const STATUSES = ['draft', 'in_review', 'approved', 'scheduled', 'published', 'failed', 'archived'];
export const AUTHOR_TYPES = ['hondit_editorial', 'ai_assisted', 'partner_supplied'];
export const IMAGE_RIGHTS = ['confirmed', 'pending', 'restricted'];
export const PRODUCT_SLUGS = ['diffuser-350g', 'diffuser-500g', 'foam-oil', 'foaming-cleanser', 'cleansing-water'];
export const MAX_PUBLISH_ATTEMPTS = 3;

/* Allowed admin transitions. Publishing itself is only done by the publisher (scheduled -> published). */
export const TRANSITIONS = {
  submit: { from: ['draft', 'failed'], to: 'in_review' },
  request_changes: { from: ['in_review', 'approved', 'failed'], to: 'draft' },
  approve: { from: ['in_review'], to: 'approved' },
  schedule: { from: ['approved'], to: 'scheduled' },
  cancel_schedule: { from: ['scheduled'], to: 'approved' },
  retry: { from: ['failed'], to: 'scheduled' },
  archive: { from: ['published', 'approved', 'draft', 'in_review', 'failed'], to: 'archived' },
  restore: { from: ['archived'], to: 'draft' },
};

export const slugOk = (slug) => /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(String(slug || '')) && String(slug).length <= 90;
export const articlePath = (article) => `/journal/${languageByCode(article.language)?.segment || 'en'}/${article.slug}`;
export const articleUrl = (article) => SITE + articlePath(article);

/* datetime-local value entered in Korea ("2026-10-28T09:00") -> UTC ISO string. */
export function kstToUtc(value) {
  const m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(String(value || ''));
  if (!m) return null;
  const date = new Date(`${m[1]}-${m[2]}-${m[3]}T${m[4]}:${m[5]}:00+09:00`);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}
export function utcToKstInput(iso) {
  if (!iso) return '';
  const d = new Date(new Date(iso).getTime() + 9 * 3600 * 1000);
  return d.toISOString().slice(0, 16);
}
export function formatKst(iso) {
  if (!iso) return '';
  return `${utcToKstInput(iso).replace('T', ' ')} KST`;
}
export function formatDate(iso, language = 'en') {
  if (!iso) return '';
  try {
    return new Intl.DateTimeFormat(language === 'zh-HK' ? 'zh-Hant-HK' : language === 'zh-TW' ? 'zh-Hant-TW' : language, { year: 'numeric', month: 'long', day: 'numeric', timeZone: TIMEZONE }).format(new Date(iso));
  } catch { return iso.slice(0, 10); }
}

/* ---------- body: a small, safe Markdown subset (no raw HTML) ---------- */
// ## heading, ### subheading, > quote, - list, ![alt](url "caption"), [label](/path) inside paragraphs.
export function parseBody(text) {
  const blocks = [];
  for (const raw of String(text || '').replace(/\r/g, '').split(/\n{2,}/)) {
    const chunk = raw.trim();
    if (!chunk) continue;
    const image = /^!\[([^\]]*)\]\(([^)\s]+)(?:\s+"([^"]*)")?\)$/.exec(chunk);
    if (image) { blocks.push({ type: 'image', alt: image[1].trim(), src: image[2], caption: image[3] || '' }); continue; }
    if (chunk.startsWith('### ')) { blocks.push({ type: 'h3', text: chunk.slice(4).trim() }); continue; }
    if (chunk.startsWith('## ')) { blocks.push({ type: 'h2', text: chunk.slice(3).trim() }); continue; }
    if (chunk.split('\n').every((l) => l.startsWith('> '))) { blocks.push({ type: 'quote', text: chunk.split('\n').map((l) => l.slice(2)).join(' ') }); continue; }
    if (chunk.split('\n').every((l) => /^- /.test(l))) { blocks.push({ type: 'list', items: chunk.split('\n').map((l) => l.slice(2).trim()) }); continue; }
    blocks.push({ type: 'p', text: chunk.replace(/\n/g, ' ') });
  }
  return blocks;
}

/* Inline links are limited to site paths and https URLs. Returns [{text}|{text,href}] segments. */
export function inlineSegments(text) {
  const out = [];
  const re = /\[([^\]]+)\]\(((?:\/|https:\/\/)[^)\s]*)\)/g;
  let last = 0, m;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push({ text: text.slice(last, m.index) });
    out.push({ text: m[1], href: m[2] });
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push({ text: text.slice(last) });
  return out;
}

export function plainText(article) {
  return [article.title, article.dek, ...parseBody(article.body_md).map((b) => b.text || (b.items || []).join(' ') || b.caption || '')].join(' ');
}

/* ---------- automated review (step 5 of the workflow) ---------- */
// Claims the team has said must not appear without evidence: medical/wellness effects, air purification,
// scent duration, guarantees, superlatives, single-unit retail promises and fake endorsements.
const RISKY_CLAIMS = [
  { id: 'medical', re: /\b(cure|heal|therap\w*|anxiety relief|reduces? stress|improves? sleep|detox\w*|antibacterial|anti-bacterial)\b|治療|療効|効能|安眠|療效|功效|治癒|抗菌|紓壓|助眠/i, label: '의료·건강 효능 표현' },
  { id: 'air', re: /\b(purif\w+ (the )?air|air[- ]purif\w*|removes? odou?rs?|deodori[sz]\w*)\b|空気清浄|空気を浄化|消臭|淨化空氣|空氣淨化|除臭/i, label: '공기정화·탈취 효과' },
  { id: 'duration', re: /\b(lasts? (for )?\d+|\d+\s*(days?|weeks?|months?) of (scent|fragrance))|香りが\d+|\d+\s*(日|週間|か月|天|週|個月)(間)?(持続|持續|維持)/i, label: '향 지속기간 수치' },
  { id: 'guarantee', re: /\b(guarantee\w*|100%|clinically|certified|award[- ]winning)\b|保証|保證|認証|認證|臨床/i, label: '보증·인증·임상 표현' },
  { id: 'superlative', re: /\b(best|no\.?\s?1|number one|world'?s first|most popular)\b|最高|No\.1|世界初|最受歡迎|第一/i, label: '최상급·1위 표현' },
  { id: 'retail', re: /\b(buy (just )?one|single[- ]unit (purchase|order)|ships? tomorrow|next[- ]day delivery|free shipping)\b|1個から購入|翌日配送|送料無料|單件購買|免運|隔日到貨/i, label: '단품 구매·배송일 약속' },
];

export function textShingles(text, size = 5) {
  const clean = String(text || '').toLowerCase().replace(/\s+/g, ' ').trim();
  const words = /[぀-ヿ㐀-鿿]/.test(clean) ? Array.from(clean.replace(/\s/g, '')) : clean.split(' ');
  const set = new Set();
  for (let i = 0; i + size <= words.length; i++) set.add(words.slice(i, i + size).join(' '));
  return set;
}
export function similarity(a, b) {
  const x = textShingles(a), y = textShingles(b);
  if (!x.size || !y.size) return 0;
  let inter = 0;
  for (const s of x) if (y.has(s)) inter++;
  return inter / Math.min(x.size, y.size);
}

/* Returns { ok, errors, warnings, checks }. errors block approval and publishing; warnings are shown to the reviewer. */
export function reviewArticle(article, { others = [], publishing = false } = {}) {
  const errors = [], warnings = [];
  const lang = languageByCode(article.language);
  if (!lang) errors.push('지원하지 않는 언어입니다 (en, ja, zh-HK, zh-TW).');
  if (!slugOk(article.slug)) errors.push('URL 슬러그는 영문 소문자·숫자·하이픈만 사용할 수 있습니다.');
  if (!String(article.title || '').trim()) errors.push('제목이 없습니다.');
  if (String(article.title || '').length > 110) warnings.push('제목이 110자를 넘습니다. 검색 결과에서 잘릴 수 있습니다.');
  if (!String(article.dek || '').trim()) errors.push('요약(리드) 문장이 없습니다.');
  const blocks = parseBody(article.body_md);
  const words = plainText(article);
  const length = /[぀-ヿ㐀-鿿]/.test(words) ? words.replace(/\s/g, '').length : words.split(/\s+/).length;
  const minimum = /[぀-ヿ㐀-鿿]/.test(words) ? 500 : 250;
  if (length < minimum) errors.push(`본문이 너무 짧습니다 (${length} / 최소 ${minimum}). 독자에게 필요한 정보가 충분한지 확인하세요.`);
  if (!blocks.some((b) => b.type === 'h2')) warnings.push('소제목(## )이 없습니다. 긴 글은 소제목으로 나누면 읽기 쉽습니다.');
  if (!article.hero_image_url) errors.push('대표 이미지가 없습니다.');
  if (!String(article.hero_image_alt || '').trim()) errors.push('대표 이미지의 대체 텍스트(alt)가 없습니다.');
  for (const b of blocks.filter((x) => x.type === 'image')) if (!b.alt) errors.push(`본문 이미지 alt가 없습니다: ${b.src}`);
  if (article.image_rights !== 'confirmed') (publishing ? errors : warnings).push('사진 사용권이 "확인 완료"가 아닙니다.');
  const related = Array.isArray(article.related_products) ? article.related_products : [];
  if (!related.length) warnings.push('관련 상품이 연결되지 않았습니다.');
  for (const slug of related) if (!PRODUCT_SLUGS.includes(slug)) errors.push(`알 수 없는 관련 상품: ${slug}`);
  if (!Array.isArray(article.sources) || !article.sources.length) errors.push('근거 자료(출처)가 없습니다. 제품 사양 출처를 1개 이상 연결하세요.');
  const claims = [];
  for (const rule of RISKY_CLAIMS) {
    const hit = rule.re.exec(words);
    if (hit) claims.push({ id: rule.id, label: rule.label, match: hit[0] });
  }
  for (const c of claims) errors.push(`과장·미확인 표현 (${c.label}): "${c.match}"`);
  const duplicates = [];
  for (const other of others) {
    if (!other || other.id === article.id || other.status === 'archived') continue;
    if (other.language === article.language && other.slug === article.slug) errors.push(`같은 언어에 같은 URL이 이미 있습니다: ${articlePath(other)}`);
    const score = similarity(plainText(article), plainText(other));
    if (score >= 0.6) duplicates.push({ id: other.id, title: other.title, score: Math.round(score * 100) });
  }
  for (const d of duplicates) errors.push(`다른 기사와 ${d.score}% 겹칩니다: "${d.title}". 같은 내용을 복제하지 말고 독자·관점을 다르게 쓰세요.`);
  const review = article.review || {};
  const checks = { facts: Boolean(review.facts), claims: Boolean(review.claims), images: Boolean(review.images) };
  return { ok: errors.length === 0, errors, warnings, checks, claims, duplicates, length };
}

/* What must be true for an approve or a publish. */
export function approvalBlockers(article, others = []) {
  const result = reviewArticle(article, { others });
  const blockers = [...result.errors];
  if (!result.checks.facts) blockers.push('검수 체크: 사실관계 확인이 필요합니다.');
  if (!result.checks.claims) blockers.push('검수 체크: 과장 표현 확인이 필요합니다.');
  if (!result.checks.images) blockers.push('검수 체크: 사진 사용권 확인이 필요합니다.');
  return blockers;
}
export function publishBlockers(article, others = []) {
  const result = reviewArticle(article, { others, publishing: true });
  const blockers = [...result.errors];
  if (!article.approved_by || !article.approved_at) blockers.push('관리자 승인 기록이 없습니다.');
  if (!['facts', 'claims', 'images'].every((k) => result.checks[k])) blockers.push('검수 체크가 완료되지 않았습니다.');
  return blockers;
}

/* The only rule the public pages use. Drafts, scheduled-but-not-yet-published and archived rows are never shown. */
export const isPublic = (article) => article?.status === 'published' && Boolean(article.published_at);

/* ---------- UTM / Final URL (single Final URL rule from 01_RULES) ---------- */
// Link IDs already issued in 03_LINKS on 2026-10-23. New IDs continue from NEXT_LINK_ID; an issued ID is never reused.
export const ISSUED_LINK_IDS = Array.from({ length: 43 }, (_, i) => `l${String(i + 1).padStart(4, '0')}`);
export const linkIdOk = (id) => /^l\d{4}$/.test(String(id || ''));

export function campaignFor(market, date = new Date()) {
  const ym = new Date(new Date(date).getTime() + 9 * 3600 * 1000).toISOString().slice(0, 7).replace('-', '');
  return `${String(market || 'sg').toLowerCase()}_journal_${ym}`;
}
export function finalUrl({ path, market, siteLang, source, medium, campaign, linkId }) {
  const params = new URLSearchParams({ market, lang: siteLang, utm_source: source, utm_medium: medium, utm_campaign: campaign, utm_content: linkId, link_id: linkId });
  return `${SITE}${path}?${params}`;
}

/* ---------- external channels (Metricool: Pinterest, Instagram, Facebook, YouTube) ---------- */
export const CHANNELS = {
  pinterest: { label: 'Pinterest', source: 'pinterest', medium: 'social', titleMax: 100, bodyMax: 500, link: true },
  instagram: { label: 'Instagram', source: 'instagram', medium: 'social', titleMax: 0, bodyMax: 2200, link: false },
  facebook: { label: 'Facebook', source: 'facebook', medium: 'social', titleMax: 0, bodyMax: 2000, link: true },
};
const clip = (value, max) => { const s = String(value || '').replace(/\s+/g, ' ').trim(); return max && s.length > max ? s.slice(0, max - 1).trimEnd() + '…' : s; };

/* A platform package built only from the approved article: its title, lead, hero image and a Final URL. */
export function buildDistribution(article, channel, linkId, now = new Date()) {
  const spec = CHANNELS[channel];
  const lang = languageByCode(article.language);
  if (!spec || !lang) throw new Error('지원하지 않는 채널 또는 언어입니다.');
  if (!isPublic(article)) throw new Error('공개된 기사만 외부 채널 패키지를 만들 수 있습니다.');
  if (!linkIdOk(linkId)) throw new Error('link_id 형식은 l0044 처럼 l + 숫자 4자리입니다.');
  if (ISSUED_LINK_IDS.includes(linkId)) throw new Error(`${linkId}는 이미 03_LINKS에 발급된 ID입니다. NEXT_LINK_ID부터 새로 발급하세요.`);
  const campaign = campaignFor(lang.market, now);
  const url = finalUrl({ path: articlePath(article), market: lang.market, siteLang: lang.siteLang, source: spec.source, medium: spec.medium, campaign, linkId });
  const readMore = { en: 'Read the story', ja: '記事を読む', 'zh-HK': '閱讀全文', 'zh-TW': '閱讀全文' }[article.language];
  const linkInBio = { en: 'Full story: link in bio.', ja: '記事はプロフィールのリンクから。', 'zh-HK': '全文請按個人檔案連結。', 'zh-TW': '全文請點個人檔案連結。' }[article.language];
  const body = spec.link ? `${clip(article.dek, spec.bodyMax - 160)}\n\n${readMore}: ${url}` : `${clip(article.dek, spec.bodyMax - 120)}\n\n${linkInBio}`;
  return {
    channel,
    title: spec.titleMax ? clip(article.title, spec.titleMax) : '',
    body,
    image_url: article.hero_image_url?.startsWith('http') ? article.hero_image_url : SITE + article.hero_image_url,
    image_alt: article.hero_image_alt,
    final_url: url,
    link_id: linkId,
    utm_campaign: campaign,
    dedupe_key: `${article.id}:${channel}`,
    // The row to add to 03_LINKS before the post goes live (the sheet stays the single source of link IDs).
    links_row: [linkId, campaign, spec.medium, spec.source, `journal_${article.slug}_v1`, articlePath(article), '', lang.market.toLowerCase(), url, '', `${spec.label} 기사 공유`, article.language, '', 'FALSE', 'draft', '', '', '', 'Journal 기사 외부 배포용 Final URL. 신규 /q/ 없음.', 'PENDING'],
  };
}

/* ---------- CONTENT_PIPELINE (03_HONDIT_검색_AEO_성과측정) ---------- */
export const PIPELINE_COLUMNS = ['콘텐츠 ID', '방식', '시장', '채널', '콘텐츠/대상', '원고/준비자료', '게시처/연락처', 'UTM link_id', '현재 상태', '예정일(KST)', '검수 상태', '실제 발행/수신 링크', '다음 실행'];
const articleStatusKo = { draft: '초안', in_review: '검수 중', approved: '승인 완료', scheduled: '예약발행', published: '게시완료', failed: '발행 실패', archived: '보관' };
export function articlePipelineRow(article) {
  const lang = languageByCode(article.language);
  const r = article.review || {};
  const reviewed = r.facts && r.claims && r.images ? '검수 완료' : '사실·사진 검수 대기';
  const next = article.status === 'failed' ? `오류: ${article.last_error || ''}` : article.status === 'scheduled' ? '예약 시각 자동 발행' : article.status === 'approved' ? '발행 일시 지정' : article.status === 'published' ? '외부 채널 패키지·성과 확인' : '관리자 검수';
  return [article.content_id || '', '직접게재', lang?.market || '', 'HONDIT /journal', article.title, article.source_doc || '', `${SITE.replace('https://', '')}${articlePath(article)}`, '', articleStatusKo[article.status] || article.status, article.publish_at ? formatKst(article.publish_at).replace(' KST', '') : '', reviewed, article.public_url || '', next];
}
const prStatusKo = (row) => row.published_url ? '게재 확인' : row.reply_status && row.reply_status !== 'none' ? `회신: ${row.reply_status}` : row.send_status === 'sent' ? '발송완료' : row.approval_status === 'approved' ? '발송 승인' : '메일초안';
export function prPipelineRow(row) {
  return [row.content_id || '', '언론제안', row.market, row.outlet, row.angle || '', row.materials_url || '', row.editorial_contact || '', row.link_id || '', prStatusKo(row), row.follow_up_at ? formatKst(row.follow_up_at).replace(' KST', '') : '', row.approval_status === 'approved' ? '발송 승인' : '발송 전 확인', row.published_url || '', row.next_action || ''];
}
export function toTsv(rows) {
  return rows.map((r) => r.map((c) => String(c ?? '').replace(/[\t\n]/g, ' ')).join('\t')).join('\n');
}
