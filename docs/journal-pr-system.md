# HONDIT Journal · 언론 PR 시스템 (2026-10-23)

## 구성

| 영역 | 위치 |
|---|---|
| 공개 페이지 (서버 렌더링 HTML) | `/journal`, `/journal/{en,ja,zh-hk,zh-tw}`, `/journal/{lang}/{slug}` → `api/products.js` → `api/_journal-route.js`, `api/_journal-html.js` |
| 공개 JSON | `/api/journal?lang=&slug=` |
| 관리자 | `/admin/journal`, `/admin/journal/:id`, `/admin/press` → `api/admin.js` → `api/_journal.js` |
| 공통 규칙 (검수·공개 판단·URL·UTM·시트 행) | `shared/journal.js` |
| 시트 연동 | `api/_sheets-hook.js` (Apps Script 웹앱 1개, 아래) |
| 기존 4개국 초안·언론 후보 15곳 | `shared/journal-seed.js` → `supabase/seeds/010_journal_seed.sql` (`node scripts/journal-seed-sql.mjs`로 재생성) |
| DB | `supabase/migrations/010_journal_pr.sql` (신규 테이블 5개만: 기사·발행 로그·외부 배포·언론 제안·link_registry), 롤백 `supabase/rollback/010_journal_pr_down.sql` |
| 테스트 | `tests/journal-system.test.mjs` |

새 Vercel 함수 파일은 없습니다 (Hobby 12개 한도 유지). 기존 `products.js`·`admin.js` 안에서 분기합니다.

## 작업 흐름과 안전장치

1. 주제 → 2. 근거(`JOURNAL_FACTS`: StoneJeju 상세페이지·관리 안내·브랜드 소개) → 3. 초안(사람 또는 AI) → 4. 현지화(AI는 번역이 아니라 시장별 각색, 사실 추가 금지) → 5. 검수 → 6. 관리자 승인 → 7. 예약 발행 → 8. 발행·오류 기록.

- AI는 `status=draft`만 만듭니다. 승인은 관리자 로그인 계정만 가능하며 `approved_by`에 이메일이 남습니다.
- DB 트리거 `journal_articles_guard`가 승인과 검수 3항목 없이 `published`로 바꾸는 것을 거부합니다. 코드에 버그가 있어도 공개되지 않습니다.
- 자동 검사 항목: 효능·공기정화·향 지속 수치·보증/인증·최상급·단품/배송 약속 표현, alt 누락, 출처 누락, 다른 기사와 60% 이상 중복, 미지원 상품.
- 승인·예약 뒤 본문을 고치면 승인이 해제되고 검수로 돌아갑니다.
- 공개 기사 수정은 검수 오류가 없을 때만 저장되고 "수정일"이 갱신됩니다.

## 예약 발행 (Asia/Seoul)

- 관리자 입력은 KST, DB 저장은 UTC.
- **공개 시점**: 예약 기사는 `publish_at`이 지나면 그 뒤 첫 요청부터 공개됩니다. 공개 페이지가 읽을 때마다 승인·검수·사용권·예약 시각을 확인하므로(`isPublic`) 크론이 없어도 시각이 정확합니다. 기사·목록 페이지는 CDN에 최대 60초, 사이트맵은 최대 약 1시간 캐시됩니다.
- **공개 요청은 DB에 쓰지 않습니다.** 상태를 `published`로 바꾸고 로그와 CONTENT_PIPELINE을 남기는 일은 인증된 발행기만 합니다. 발행기는 아래 세 경우에 돕니다.
  1. Vercel Cron: `CRON_SECRET`(16자 이상)이 있어야 하고, 없거나 틀리면 503 또는 401을 돌려주며 아무것도 쓰지 않습니다.
  2. 관리자가 `/admin/journal` 목록을 열 때.
  3. 관리자가 "예약 발행 지금 확인"을 누를 때.
- `published_at`에는 실제 공개 시각인 예약 시각이 기록됩니다.
- **Vercel Hobby 한도** (2026-10-23 공식 문서 확인): 크론은 하루 1회만 돌 수 있고, 실행 시각은 지정한 시각부터 59분 안에서 달라집니다. 그래서 상태 기록은 최대 하루 늦을 수 있고, 관리자 화면에도 이 한계를 적어 두었습니다. 공개 시점 자체는 영향을 받지 않습니다.
- 실패: 사유는 `last_error`와 로그에 남고, 3번 실패하면 `failed`가 됩니다. 관리자 화면의 "재시도"로 다시 시도합니다.
- 일반 Preview 배포는 운영 DB를 읽기만 하고 발행기와 모든 쓰기가 꺼져 있습니다. 공개 페이지에도 초안을 보여 주지 않습니다.

## 공개 범위 (접근 제어)

- 공개 페이지(`/journal…`), `/api/journal`, 사이트맵에는 공개된 기사와 예약 시각이 지난 승인 기사만 나옵니다. Preview 배포도 같습니다. noindex에 기대지 않고 아예 응답하지 않습니다(404).
- 공개 전 미리보기는 두 가지뿐입니다.
  - 관리자 편집 화면의 미리보기 탭
  - `/journal/{lang}/{slug}?preview=1`: 관리자 로그인 토큰으로 `/api/journal?preview=1`을 호출하며, 응답은 `private, no-store`입니다. 토큰이 없으면 404입니다.
- 검수 메모, 승인자, 오류 같은 내부 필드는 공개 응답에서 빠집니다.

## SEO / AEO

- 기사별로 title, description, canonical, hreflang(번역 묶음 `group_key` + x-default), Open Graph, `Article`과 `BreadcrumbList` JSON-LD(about=Product, citation=출처)를 넣습니다.
- 본문 전체가 HTML에 들어 있어 JS 없이도 읽힙니다. 이미지 alt는 필수이고, 관련 상품 내부 링크가 붙습니다.
- 사이트맵에는 공개 기사만 들어가고 번역 alternates도 포함합니다. 기사가 0건이면 목록 페이지는 `noindex`입니다.
- GA4: `page_type=journal_list/journal_article`, `journal_view`, `journal_cta_click`(action_name=journal_product_click / journal_contact_click). 주문 확정은 기존대로 Supabase 주문 원장 기준입니다.
- 색인 확인: 운영 공개 후 Search Console URL 검사의 "실제 URL 테스트"를 씁니다.

## 운영 반영 순서 (승인 필요)

1. **백업**: Supabase 대시보드 → Database → Backups에서 최신 시점을 확인합니다. 010은 신규 테이블만 만들므로 기존 데이터는 바뀌지 않습니다.
2. SQL Editor에서 `supabase/migrations/010_journal_pr.sql`을 실행합니다.
3. `/admin/journal`에서 "기존 4개국 초안 등록"을 누릅니다 (또는 `supabase/seeds/010_journal_seed.sql` 실행). 기사 4건은 검수 대기(비공개)로, 언론 후보 15곳은 승인 대기·미발송으로 들어갑니다.
4. Vercel 환경변수:
   - `CRON_SECRET` (16자 이상, **필수**: 없으면 크론 발행 기록이 돌지 않음)
   - 선택: `CONTENT_PIPELINE_WEBHOOK_URL`·`CONTENT_PIPELINE_WEBHOOK_SECRET` (아래 Apps Script)
   - 선택: `JOURNAL_AI_ENABLED=1` (AI 비용 승인 후)
5. 시트 연동이 없으면 `/admin/journal`에서 03_LINKS A열을 붙여 넣어 동기화합니다.
6. main 머지 → 운영 배포.
7. 롤백: 코드를 revert한 뒤 `supabase/rollback/010_journal_pr_down.sql`을 실행합니다 (Journal/PR/link_registry 테이블만 삭제). 남길 데이터가 있으면 먼저 `/admin/journal`의 "시트 행 만들기"로 내보내세요.

## AI 비용

- 기존 `OPENAI_API_KEY`(gpt-4.1-mini, `OPENAI_MODEL`)를 재사용합니다.
- 기사 초안 1건은 입력 2k + 출력 2.5k 토큰 정도라 1센트 안팎입니다 (gpt-4.1-mini 기준).
- `JOURNAL_AI_ENABLED=1`이 없으면 호출 자체를 하지 않습니다. 키는 서버 환경변수에만 있습니다.

## 외부 채널 (Metricool)

- 공개된 기사만 Pinterest·Instagram·Facebook 패키지를 만들 수 있습니다. 기사·채널당 1개만 만들어 중복 게시를 막습니다.
- Final URL 형식: `https://hondit-shop.vercel.app/journal/{lang}/{slug}?market=..&lang=..&utm_source=..&utm_medium=social&utm_campaign={market}_journal_{yyyymm}&utm_content={link_id}&link_id={link_id}` (신규 /q/ 리디렉션 없음).
- 실제 예약은 Metricool에서 하고, 예약 ID와 게시 URL을 관리자에 기록합니다. Metricool API 직접 연동은 Advanced 플랜 API 토큰이 필요해서 켜지 않았습니다.

## link_id 중복 방지

- `link_registry` 테이블에 지금까지 발급된 모든 ID가 들어갑니다. 03_LINKS 이력과 이 시스템이 Journal 배포·언론 제안에 쓴 ID를 함께 담고, 기본키 제약으로 같은 ID를 두 번 쓸 수 없습니다. 마이그레이션이 2026-10-23 시트 기준 l0001–l0043을 넣습니다.
- 새 ID를 지정하는 방법은 둘입니다.
  - **시트 연동 있음**: Apps Script가 잠금 상태에서 03_LINKS A열을 확인합니다. 이미 있으면 거부하고, 없으면 행을 추가한 뒤 `01_RULES!B3`(NEXT_LINK_ID)를 올립니다. 그다음 시트가 계산한 I열 final_url이 보낸 값과 같은지 확인하고, 다르면 추가한 행을 지웁니다. 캠페인이 02_CAMPAIGNS에 없을 때도 거부합니다.
  - **시트 연동 없음**: `/admin/journal`의 "03_LINKS link_id 중복 방지"에 03_LINKS A열 전체를 붙여 넣어 동기화합니다. 동기화가 24시간을 넘으면 새 ID 지정을 거부합니다. 지정 뒤 화면에 나오는 03_LINKS 행을 시트에 바로 추가하세요.
- 03_LINKS의 H(market)·I(final_url)·R(진단 경고)은 수식 열이라 쓰지 않습니다. `{market}_journal_{yyyymm}`, `{market}_pr_{yyyymm}` 캠페인은 02_CAMPAIGNS에 먼저 등록해야 I열이 계산됩니다. 2026-10-23 기준으로는 `*_pr_202610`만 있고 `*_journal_202610`은 없습니다.
- 지정했다가 바꾼 ID는 레지스트리에 남아 다시 쓰이지 않습니다.

## CONTENT_PIPELINE 시트 · 03_LINKS 연동 (Apps Script 1개)

- 관리자 "시트 행 만들기"는 CONTENT_PIPELINE 13개 열과 같은 순서의 TSV를 만듭니다. 연동이 없을 때는 이걸 붙여 넣으면 됩니다.
- 자동 연동 순서:
  1. 아래 스크립트를 Apps Script 웹앱으로 배포합니다 (실행 계정: 나, 접근: 모든 사용자).
  2. 스크립트 속성 `SECRET`에 임의의 긴 값을 넣습니다.
  3. Vercel에 `CONTENT_PIPELINE_WEBHOOK_URL`과 `CONTENT_PIPELINE_WEBHOOK_SECRET`(같은 값)을 넣습니다.
- 서버는 HTTP 200만으로 성공 처리하지 않습니다. 스크립트가 `ok:true`와 함께 같은 콘텐츠 ID, 저장 결과(updated/appended), 저장 후 다시 읽은 I–M 값을 돌려주고, 그 값이 보낸 값과 같을 때만 `pipeline_synced`로 기록합니다. 인증 실패, 행 불일치, 값 불일치, JSON이 아닌 응답, HTTP 오류는 모두 `pipeline_failed`(ok=false)로 남고, 기사 화면의 "CONTENT_PIPELINE 다시 보내기"로 재시도합니다.

```js
// HONDIT 시트 연동 (Apps Script 웹앱). 스크립트 속성 SECRET = Vercel CONTENT_PIPELINE_WEBHOOK_SECRET
const AEO_ID = '1C60RQ5jTFJ0GwBJEBXLYI4_r-wUBZcA9m6PWez1Re0Q'; // 03_HONDIT_검색_AEO_성과측정 › CONTENT_PIPELINE
const UTM_ID = '1AlvK2ZNxPxtBnkxJ094DAdo3IfwwOrTQ6ujcnXp0oAA'; // HONDIT UTM › 03_LINKS, 01_RULES!B3, 02_CAMPAIGNS
const FORMULA_COLS = [8, 9, 18]; // 03_LINKS H market, I final_url, R 진단 경고: 수식이므로 쓰지 않음
const out = (o) => ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);

function doPost(e) {
  let body;
  try { body = JSON.parse(e.postData.contents); } catch (err) { return out({ ok: false, error: 'bad_json' }); }
  const secret = PropertiesService.getScriptProperties().getProperty('SECRET');
  if (!secret || body.secret !== secret) return out({ ok: false, error: 'forbidden' });
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(20000)) return out({ ok: false, error: 'busy' });
  try {
    if (body.action === 'pipeline_row') return out(pipelineRow(body.row));
    if (body.action === 'links_list') { const ids = linkIds(); return out({ ok: true, link_ids: ids, next_link_id: nextId(ids) }); }
    if (body.action === 'reserve_link') return out(reserveLink(String(body.link_id), body.row));
    return out({ ok: false, error: 'unknown_action' });
  } catch (err) {
    return out({ ok: false, error: String(err) });
  } finally { lock.releaseLock(); }
}

function lastIdRow(sheet) { // 마지막으로 A열에 값이 있는 행 (수식이 미리 채워진 빈 행은 제외)
  const a = sheet.getRange(1, 1, sheet.getMaxRows(), 1).getDisplayValues();
  for (let i = a.length - 1; i >= 0; i--) if (String(a[i][0]).trim()) return i + 1;
  return 1;
}

function pipelineRow(row) {
  if (!Array.isArray(row) || row.length !== 13 || !row[0]) return { ok: false, error: 'bad_row' };
  const sheet = SpreadsheetApp.openById(AEO_ID).getSheetByName('CONTENT_PIPELINE');
  const last = lastIdRow(sheet);
  const ids = last > 1 ? sheet.getRange(2, 1, last - 1, 1).getDisplayValues().map((r) => r[0]) : [];
  const i = ids.indexOf(String(row[0]));
  let result = 'updated', n;
  if (i >= 0) { n = i + 2; sheet.getRange(n, 9, 1, 5).setNumberFormat('@').setValues([row.slice(8, 13).map(String)]); } // I–M만 갱신
  else { n = last + 1; result = 'appended'; sheet.getRange(n, 1, 1, 13).setNumberFormat('@').setValues([row.map(String)]); }
  SpreadsheetApp.flush();
  return { ok: true, id: sheet.getRange(n, 1).getDisplayValue(), result, row_number: n, written: sheet.getRange(n, 9, 1, 5).getDisplayValues()[0] };
}

function linkIds() {
  const sheet = SpreadsheetApp.openById(UTM_ID).getSheetByName('03_LINKS');
  const last = lastIdRow(sheet);
  return last > 1 ? sheet.getRange(2, 1, last - 1, 1).getDisplayValues().map((r) => String(r[0]).trim()).filter((v) => /^l\d{4}$/.test(v)) : [];
}
function nextId(ids) { return 'l' + String(ids.reduce((m, id) => Math.max(m, Number(id.slice(1))), 0) + 1).padStart(4, '0'); }

function reserveLink(id, row) {
  if (!/^l\d{4}$/.test(id) || !Array.isArray(row) || row.length !== 20 || row[0] !== id) return { ok: false, error: 'bad_row' };
  const ids = linkIds();
  if (ids.indexOf(id) >= 0) return { ok: false, error: 'taken' };
  const ss = SpreadsheetApp.openById(UTM_ID);
  const campaigns = ss.getSheetByName('02_CAMPAIGNS').getRange('A:A').getDisplayValues().map((r) => r[0]);
  if (campaigns.indexOf(row[1]) < 0) return { ok: false, error: 'campaign_missing' };
  const sheet = ss.getSheetByName('03_LINKS');
  const n = lastIdRow(sheet) + 1;
  const rollback = () => { row.forEach((v, c) => { if (FORMULA_COLS.indexOf(c + 1) < 0) sheet.getRange(n, c + 1).clearContent(); }); sheet.getRange(n, 14).setValue(false); };
  try {
    row.forEach((v, c) => { if (FORMULA_COLS.indexOf(c + 1) < 0) sheet.getRange(n, c + 1).setValue(c === 13 ? v === true || v === 'TRUE' : v); });
    SpreadsheetApp.flush();
  } catch (err) { rollback(); return { ok: false, error: 'write_failed' }; } // 중간에 실패하면 반쯤 쓴 행을 남기지 않음
  if (sheet.getRange(n, 1).getDisplayValue() !== id || sheet.getRange(n, 9).getDisplayValue() !== row[8]) {
    rollback();
    return { ok: false, error: 'final_url_mismatch' };
  }
  const next = nextId(ids.concat([id]));
  ss.getSheetByName('01_RULES').getRange('B3').setValue(next);
  return { ok: true, link_id: id, row_number: n, next_link_id: next };
}
```

## 언론 제안

- 기록하는 항목: 매체, 편집부 연락처, 제안 기사, 메일 초안, 승인, 발송, 회신, 후속, 게재 URL, 성과(세션/문의/주문).
- 이 시스템은 메일을 보내지 않습니다. 승인 후 Gmail에서 직접 보내고 "발송함"으로 기록합니다. 승인 전에는 발송 기록이 막히고, 메일 문구를 고치면 승인이 해제됩니다.
- 등록 대상은 무료 PR 우선 15곳입니다 (`HONDIT_무료PR_15곳_발송준비_5개묶음반영_20261021.xlsx`. 앞서 받은 `최신 발송 준비` 파일과 내용이 같습니다).
  - Gmail 초안이 있는 5곳(l0039–l0043)은 Gmail 문안을 기준으로 합니다.
  - 나머지 10곳은 파일의 `개별_제안문11` 문안을 그대로 넣었습니다.
- 파일에서 그대로 옮긴 필드: `grade`(재선정50 A/B/C), `recheck_result`(15곳_재검증 등급, 예: `A- / 제안 준비`, `B / 전문 교류`, `보류 / 계정 검증`), `verified_route`, `pre_send_check`, `evidence_url`, `related_url`, `hold_reason`.
- 인스타그램 4곳은 `hold_reason`이 있어 승인할 수 없습니다. "보류 해제"는 사유를 확인한 뒤에만 누르세요.
- 이미 등록된 매체는 콘텐츠 ID나 같은 시장·매체명으로 판단해 다시 추가하지 않습니다. 비어 있는 파일 필드만 채우고 상태·승인·문안은 그대로 둡니다. 해제한 보류도 다시 채우지 않습니다.
- 승인 조건: 보류가 아니고, 제안문이 있고, link_id가 지정돼 있고, 본문 링크가 그 link_id의 Final URL이어야 합니다. link_id를 지정하면 본문의 `https://hondit-shop.vercel.app/` 링크가 Final URL로 자동으로 바뀝니다. link_id나 본문을 바꾸면 승인이 해제됩니다.
- 파일의 `발송전_확인`은 아직 미완료입니다 (사진 사용 허락, 공방 사진 출처, 사양서, 단품 판매 경로, 국가별 배송·반품). 발송 승인 전에 확인하세요.
- 같은 시장·같은 매체는 1건만 등록됩니다(UNIQUE). 기존 바이어 영업 메일 자동화(09·10·11·13·15시)와는 테이블·코드가 분리되어 있습니다.
