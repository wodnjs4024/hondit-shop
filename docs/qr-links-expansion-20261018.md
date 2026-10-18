# QR 링크 10개 추가 — 로컬 구현 및 시트 등록 완료

작성일: 2026-10-18 (Asia/Seoul)

## 작업 기준과 보존

- 브랜치: `codex/qr-links-expansion`
- worktree: `_codex_work/qr-links-expansion`
- 기준 main/Production 소스: `5095827e1efbc9364a2384d2585b4820ae5a7204`
- 확인한 Production: `dpl_5pn3K4K3j9GbqcGu2Hcsd2joaoYC` (READY).
- 로컬 main의 미커밋 B 구현, Claude `claude/admin-p1-pricing` 및 기존 릴리스 worktree는 수정하지 않았다. 최신 main을 별도 worktree로 체크아웃한 뒤 작업했다.
- 가격·MOQ·배송·결제·디자인·서버 분석·DB·마이그레이션 파일은 변경하지 않았다.
- l0001~l0006의 설정과 리디렉션은 기준 스냅샷과 동일함을 테스트로 검증했다.

## 등록 결과

- 운영용 6탭 시트 ID: `1AlvK2ZNxPxtBnkxJ094DAdo3IfwwOrTQ6ujcnXp0oAA`.
- `03_LINKS!A1:A1000`의 기존 ID는 l0001~l0006이었다. l0007~l0016을 충돌 없이 등록했으며 다음 ID 계산 결과는 l0017이다.
- 변경 범위는 `03_LINKS!A8:S17`의 값/공식뿐이다. 기존 검증 규칙·서식·열 너비·체크박스를 유지했다. 02_CAMPAIGNS의 해당 캠페인이 모두 존재해 재등록하지 않았다.
- 신규 상태는 모두 `draft`; N열 운영 QA 체크는 false. P열 발급일·담당자는 임의로 채우지 않았다. 04_ACTIVITY/05_LEADS/06_WEEKLY 및 14탭 원본은 수정하지 않았다.
- I열 기존 계산식을 재사용하고 `link_id`를 추가했다. `utm_content=link_id`, 개인정보 없음. H/J/Q/R 공식은 보존했다. readback에서 URL·상태·진단 경고 없음과 기존 6개 값/공식/검증/서식 보존을 확인했다.
- placement는 표의 사용처를 식별하는 비개인 내부 토큰으로 명명했으며 E열에 저장했다. URL 소재 식별은 placement 대신 기존 규칙대로 link_id를 사용한다.

| 링크 | 사용처 | 캠페인 | source / medium | placement | 목적지·국가·언어 |
|---|---|---|---|---|---|
| [l0007](https://hondit-shop.vercel.app/q/l0007) | SG Instagram 스토리 | sg_online_202610 | instagram / social | story_v1 | / · SG · en |
| [l0008](https://hondit-shop.vercel.app/q/l0008) | SG Instagram 영업 DM | sg_online_202610 | instagram / dm | sales_dm_v1 | / · SG · en |
| [l0009](https://hondit-shop.vercel.app/q/l0009) | SG 학생회 Telegram 게시 | sg_community_202610 | telegram / community | student_council_post_v1 | / · SG · en |
| [l0010](https://hondit-shop.vercel.app/q/l0010) | 일본 사업자 첫 이메일 | jp_b2b_202610 | outreach / email | first_email_v1 | /partners · JP · ja |
| [l0011](https://hondit-shop.vercel.app/q/l0011) | 일본 사업자 후속 이메일 | jp_b2b_202610 | outreach / email | followup_email_v1 | /partners · JP · ja |
| [l0012](https://hondit-shop.vercel.app/q/l0012) | 일본어 PDF 카탈로그 | jp_b2b_202610 | catalog / pdf | catalog_ja_v1 | /partners · JP · ja |
| [l0013](https://hondit-shop.vercel.app/q/l0013) | 대만 사업자 첫 이메일 | tw_b2b_202610 | outreach / email | first_email_v1 | /partners · TW · en |
| [l0014](https://hondit-shop.vercel.app/q/l0014) | 홍콩 공동구매 WhatsApp 상담 | hk_groupbuy_202610 | whatsapp / dm | groupbuy_dm_v1 | /partners · HK · zh-HK |
| [l0015](https://hondit-shop.vercel.app/q/l0015) | 제주 유상 수령 Instagram DM | jeju_pickup_202610 | instagram / dm | pickup_dm_v1 | /jeju/pickup · 제주 수령(해외 시장 고정 없음) · en |
| [l0016](https://hondit-shop.vercel.app/q/l0016) | 제주공항 유상 수령 안내 QR | jeju_pickup_202610 | airport / qr | airport_pickup_qr_v1 | /jeju/pickup · 제주 수령(해외 시장 고정 없음) · en |

## 대만 언어 제한

- `src/lib/market.tsx`의 타입·번역 사전에는 zh-TW가 있지만, 실제 `displayLanguages`와 `isDisplayLanguage()`의 선택 허용 목록에는 없다.
- l0013은 `market=TW&lang=en`으로 등록했다. 새 언어는 추가하지 않았다. 시트 메모에도 이 제한을 기록했다.
- 홍콩 l0014는 이미 지원하는 `zh-HK`를 사용한다.
- 제주 l0015/l0016은 KRW 현장 수령이며 특정 해외 market을 새로 고정하지 않는다. 기존 제주 링크와 같은 방식이다.

## 구현 파일

- `config/qr-links.json`: 신규 DRAFT 설정 10개.
- `scripts/sync-qr-redirects.mjs`: 6개 고정 제한 제거; 중복 ID·미지원 시장/언어·허용하지 않은 목적지·비정상 토큰 검증 유지/보완.
- `vercel.json`: 기존 방식의 정적 307 리디렉션 20개 추가(언어 오버라이드/기본값 각 1개). 기존 12개 및 모든 함수 설정·rewrites는 보존.
- `tests/qr-consent-config.test.mjs`: 고정 12개 단정을 전체 설정 수 기준으로 변경.
- `tests/qr-links-expansion.test.mjs`: 요구된 링크 조합·기존 링크 보존·언어/시장·선택값·잘못된 설정 회귀 검사.
- `tests/fixtures/qr-original-links.json`: 기존 6개 설정·실제 redirect 기준.
- 본 문서와 `docs/qa/qr-links-expansion-20261018/`: 공개 링크·테스트·화면 증거.

## 검증

- 빌드: `VITE_VERCEL_ENV=preview VITE_ANALYTICS_TEST_ENABLED=0 npm run build` 성공. 기존 대형 번들 경고만 있다.
- 전체 테스트: 빌드 후 `node --test tests/*.test.mjs` **159/159 통과**.
- 최초 테스트는 빌드와 동시 실행되어 dist/index.html을 읽는 기존 partner demo 테스트 1개가 503으로 실패했다. 해당 핸들러가 dist 파일을 필요로 함을 확인한 뒤 빌드 완료 후 순차 실행해 전체 통과했다. 코드/검증 기대값을 완화하지 않았다.
- Vercel 공식 routing-utils가 변환한 설정을 사용하는 격리 로컬 HTTP 서버에서 **128건** 307·Location·UTM·시장·언어·선택값 유지·최종 200 검증.
- 미등록 l0000/l0017/l9999/대소문자 변형/추가 경로는 404.
- 신규 10개 모두 실제 브라우저에서 목적지 제목·선택 언어 확인. SG 영어 홈 / JP 일본어 partners / TW 영어 partners / HK 번체 partners / 제주 영어 수령 페이지로 도착했다.
- 기본 방문과 여섯 지원 언어 override, 미지원 zh-TW의 설정 기본 언어 fallback을 확인했다.
- 로컬은 쓰기 403, PayPal clientId 공백·checkout 비활성, CSP 외부 연결 차단. 분석 동의를 허용해도 GA/PayPal SDK 태그 0개 확인.
- 시트 connector readback과 Google 렌더 화면으로 DRAFT 10행·언어·미체크 상태를 확인했다. 기존 고정 열 너비는 유지했다.
- 실제 모바일 기기/신규 링크의 Vercel HTTP 검증은 운영 배포 전 단계이므로 수행하지 않았다. 로컬 HTTP 검증과 운영 검증을 혼동하지 않는다.

## 배포 상태와 인계

- **운영 배포·main push·Preview 배포 없음**. 신규 공식 /q/l0007~l0016은 아직 배포되지 않은 DRAFT 주소다. 지금 외부에 발송·인쇄하지 않는다.
- 기존 l0001~l0006의 운영 상태는 유지한다. DRAFT 등록은 발송·게시·현장 배포 활동이 아니다.
- 승인 후 최신 main 변동을 재확인하고 이 커밋을 정상 Git 배포 경로로 반영한다. 가격/결제 설정 및 환경변수 변경은 필요 없다.
- 배포 후 307·Location·실제 언어·미등록 404를 다시 확인한 링크만 시트의 QA/LIVE로 전환한다.
- 복구가 필요하면 이 QR 전용 커밋만 revert하고 신규 시트 행은 삭제하지 말고 draft로 유지한다. 기존 거래·시트 활동·DB에는 손대지 않는다.
