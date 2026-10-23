# HONDIT Journal · 언론 PR 시스템 (2026-10-23)

## 구성

| 영역 | 위치 |
|---|---|
| 공개 페이지 (서버 렌더링 HTML) | `/journal`, `/journal/{en,ja,zh-hk,zh-tw}`, `/journal/{lang}/{slug}` → `api/products.js` → `api/_journal-route.js`, `api/_journal-html.js` |
| 공개 JSON | `/api/journal?lang=&slug=` |
| 관리자 | `/admin/journal`, `/admin/journal/:id`, `/admin/press` → `api/admin.js` → `api/_journal.js` |
| 공통 규칙 (검수·URL·UTM·시트 행) | `shared/journal.js` |
| 기존 4개국 초안·Gmail 초안 5건 | `shared/journal-seed.js` → `supabase/seeds/010_journal_seed.sql` (`node scripts/journal-seed-sql.mjs`로 재생성) |
| DB | `supabase/migrations/010_journal_pr.sql` (신규 테이블 4개만), 롤백 `supabase/rollback/010_journal_pr_down.sql` |
| 테스트 | `tests/journal-system.test.mjs` |

새 Vercel 함수 파일은 없습니다 (Hobby 12개 한도 유지). 기존 `products.js`·`admin.js` 안에서 분기합니다.

## 작업 흐름과 안전장치

1. 주제 → 2. 근거(`JOURNAL_FACTS`: StoneJeju 상세페이지·관리 안내·브랜드 소개) → 3. 초안(사람 또는 AI) → 4. 현지화(AI는 번역이 아니라 시장별 각색, 사실 추가 금지) → 5. 검수 → 6. 관리자 승인 → 7. 예약 발행 → 8. 발행·오류 기록.

- AI는 `status=draft`만 만듭니다. 승인은 관리자 로그인 계정만 가능하며 `approved_by`에 이메일이 남습니다.
- DB 트리거 `journal_articles_guard`가 승인·검수 3항목 없는 `published` 전환을 거부합니다 (코드 버그가 있어도 공개 불가).
- 자동 검사: 효능·공기정화·향 지속 수치·보증/인증·최상급·단품/배송 약속 표현, alt 누락, 출처 누락, 다른 기사와 60% 이상 중복, 미지원 상품.
- 승인·예약 뒤 본문을 고치면 승인이 해제되고 검수로 돌아갑니다.
- 공개 기사 수정은 검수 오류가 없을 때만 저장되고 "수정일"이 갱신됩니다.

## 예약 발행 (Asia/Seoul)

- 관리자 입력은 KST, DB 저장은 UTC.
- 발행기 `runPublisher`: `status=scheduled AND publish_at<=now`만, `status=eq.scheduled` 조건부 UPDATE → 동시에 여러 번 돌아도 한 번만 발행.
- 실행 시점: ① `/journal` 페이지·사이트맵 요청 시 (예약 시각 직후 첫 방문에 공개) ② 관리자 "예약 발행 지금 확인" ③ Vercel Cron 매일 00:00 UTC(09:00 KST) 안전망.
- 실패: 사유를 `last_error`·로그에 남기고 3회 실패 시 `failed`. 관리자 "재시도".
- 공개 URL은 `public_url`에 자동 기록.
- 일반 Preview 배포는 운영 DB를 읽기만 하므로 발행기·쓰기가 꺼져 있습니다.

## SEO / AEO

- 기사별 title·description·canonical·hreflang(번역 묶음 `group_key` + x-default)·Open Graph·`Article` + `BreadcrumbList` JSON-LD(about=Product, citation=출처)
- 본문 전체가 HTML에 포함 (JS 없이 읽힘), 이미지 alt 필수, 관련 상품 내부 링크
- 사이트맵: 공개 기사만, 번역 alternates 포함. 기사 0건이면 목록은 `noindex`
- GA4: `page_type=journal_list/journal_article`, `journal_view`, `journal_cta_click`(action_name=journal_product_click / journal_contact_click). 주문 확정은 기존대로 Supabase 주문 원장 기준.
- 색인 확인: 운영 공개 후 Search Console URL 검사 → "실제 URL 테스트".

## 운영 반영 순서 (승인 필요)

1. **백업**: Supabase 대시보드 → Database → Backups 최신 시점 확인 (010은 신규 테이블만 만들므로 기존 데이터 변경 없음).
2. SQL Editor에서 `supabase/migrations/010_journal_pr.sql` 실행.
3. `/admin/journal` → "기존 4개국 초안 등록" (또는 `supabase/seeds/010_journal_seed.sql` 실행). 기사 4건은 검수 대기(비공개), 언론 제안 5건은 승인 대기·미발송으로 들어갑니다.
4. (선택) Vercel 환경변수: `CRON_SECRET`, `JOURNAL_AI_ENABLED=1`(AI 비용 승인 후), `CONTENT_PIPELINE_WEBHOOK_URL`·`CONTENT_PIPELINE_WEBHOOK_SECRET`.
5. main 머지 → 운영 배포.
6. 롤백: 코드 revert 후 `supabase/rollback/010_journal_pr_down.sql` (Journal/PR 테이블만 삭제). 남길 데이터가 있으면 먼저 `/admin/journal` → "시트 행 만들기"로 내보내기.

## AI 비용

기존 `OPENAI_API_KEY`(gpt-4.1-mini, `OPENAI_MODEL`)를 재사용합니다. 기사 초안 1건 ≈ 입력 2k + 출력 2.5k 토큰 → 1센트 안팎(gpt-4.1-mini 기준). `JOURNAL_AI_ENABLED=1`이 없으면 호출 자체를 하지 않습니다. 키는 서버 환경변수에만 있습니다.

## 외부 채널 (Metricool)

- 공개된 기사만 패키지 생성 (Pinterest·Instagram·Facebook). 기사·채널당 1개(DB UNIQUE) + link_id 1회 사용으로 중복 게시 방지.
- link_id: 03_LINKS `NEXT_LINK_ID`(현재 l0044)부터 발급. l0001–l0043은 코드에서 재사용 차단. 패키지 생성 시 03_LINKS에 붙여 넣을 행이 함께 나옵니다.
- Final URL: `https://hondit-shop.vercel.app/journal/{lang}/{slug}?market=..&lang=..&utm_source=..&utm_medium=social&utm_campaign={market}_journal_{yyyymm}&utm_content={link_id}&link_id={link_id}` (신규 /q/ 리디렉션 없음).
- 실제 예약은 Metricool에서 하고, 예약 ID·게시 URL을 관리자에 기록합니다. Metricool API 직접 연동은 Advanced 플랜 API 토큰이 필요해 이번 범위에서 켜지 않았습니다.

## CONTENT_PIPELINE 시트

- 관리자 "시트 행 만들기"가 CONTENT_PIPELINE 13개 열과 같은 순서의 TSV를 만듭니다.
- 자동 기록: Apps Script 웹앱(아래)을 배포하고 URL을 `CONTENT_PIPELINE_WEBHOOK_URL`에 넣으면 발행·실패 때 콘텐츠 ID 행을 갱신합니다.

```js
// 03_HONDIT_검색_AEO_성과측정 › 확장 프로그램 › Apps Script
function doPost(e) {
  const body = JSON.parse(e.postData.contents);
  if (body.secret !== PropertiesService.getScriptProperties().getProperty('SECRET')) return ContentService.createTextOutput('forbidden');
  const sheet = SpreadsheetApp.getActive().getSheetByName('CONTENT_PIPELINE');
  const ids = sheet.getRange(2, 1, Math.max(sheet.getLastRow() - 1, 1), 1).getValues().map(r => r[0]);
  const row = body.row, i = ids.indexOf(row[0]);
  // 상태(I)·예정일(J)·검수(K)·실제 링크(L)·다음 실행(M)만 갱신하고 나머지 열은 사람이 관리
  if (i >= 0) sheet.getRange(i + 2, 9, 1, 5).setValues([row.slice(8, 13)]);
  else sheet.appendRow(row);
  return ContentService.createTextOutput('ok');
}
```

## 언론 제안

- 매체·편집부 연락처·제안 기사·메일 초안·승인·발송·회신·후속·게재 URL·성과(세션/문의/주문)를 기록합니다.
- 이 시스템은 메일을 보내지 않습니다. 승인 후 Gmail에서 직접 보내고 "발송함"으로 기록합니다. 승인 전에는 발송 기록이 막히고, 메일 문구를 고치면 승인이 해제됩니다.
- 등록 대상: 무료 PR 우선 15곳 (`HONDIT 무료 PR 15곳 최신 발송 준비.xlsx`, 2026-10-21 재검증). Gmail 초안 5건(l0039–l0043)은 Gmail 문안을 기준으로, 나머지 10곳은 시트의 `개별_제안문11` 문안 그대로 들어갑니다. 인스타그램 4곳은 계정 검증 보류라 제안문이 없고 승인할 수 없습니다.
- 승인 조건: 제안문이 있고, link_id가 지정돼 있고(03_LINKS `NEXT_LINK_ID`부터, l0001–l0043 재사용 불가), 본문 링크에 `link_id=`가 들어간 Final URL이 있어야 합니다. link_id나 본문을 바꾸면 승인이 해제됩니다.
- 같은 시장·같은 매체는 1건(UNIQUE). 기존 바이어 영업 메일 자동화(09·10·11·13·15시)와는 테이블·코드가 분리되어 있습니다.
