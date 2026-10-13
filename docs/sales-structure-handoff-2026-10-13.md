# HONDIT 판매 구조 구현·리디자인 인계

작성: 2026-10-13. 로컬 구현 및 읽기 전용 Preview 범위. Production 배포·main push·운영 DB 접근/변경·마이그레이션 실행·실결제·환불·고객 연락은 수행하지 않음.

## 작업 기준과 기존 작업 보호

- 시작 시 확인한 원격 main: `61d0e1dd683966f2e346ece39a3c487d97cdbfb4`.
- 시작 시 확인한 Production: `dpl_6KKkyTC83oxFsDCHLXokFCnvWfbX`, READY, `https://hondit-shop.vercel.app`.
- 이전 기능 작업 `codex/final-sales-tools`의 깨끗한 `d2e97927bc931e7584fcd2ee9cef5767b0ac4e80`에서 별도 `codex/sales-structure` worktree 생성.
- 작업 경로: `C:/Users/user/OneDrive/문서/hondit-shop/_codex_work/sales-structure`.
- 원래 저장소의 미커밋 B 구현과 `codex/sales-flow-revision` 작업본, `codex/final-sales-tools`는 수정하지 않음. 이번 변경만 새 worktree에 존재함.
- 최신 별도 인계서는 이번 첨부에 없어 현재 지시문과 실제 코드를 기준으로 함. 일본 신규 판매조건 범위는 임의 변경하지 않음.
- 구현 도중 줄바꿈 처리 오류로 이번 전용 작업본 일부를 보정함. 자동 승인 검토의 기존 변경 훼손 우려에 대해 작업 시작 기준과 대상 확인 및 보정 전 사본 보존 후 허용받아 진행함. 다른 worktree 변경은 건드리지 않음.

## 페이지별 목적과 주요 행동

| 경로 | 목적과 행동 | 구조·상태 |
|---|---|---|
| `/` | 상품 이해 → 해외 묶음 주문 | 실제 상품 사진, 주 CTA, 준비 중 제주 수령 보조 CTA, 상품·비교표, MOQ 설명, 사업자·구매 후·판매자 지원, 기존 제주/디퓨저 콘텐츠 |
| `/products` · `/products/:slug` | 선택 시장 조건 확인 | 카드의 해외 주문 행동 우선, 상세 보조, SG Shopee 접힘 보조 경로. 가격·MOQ·배송·세금과 사용법 분리 |
| `/bulk-orders` | 국가·상품·목적·수량 선택 | 금액 검토, 직접 주문 후보 / 상담 필요 / 확인 필요. 추가 수량·다품목은 주소 없이 상담. HK/MO 기존 클렌징 혼합 진입 유지 |
| `/bulk-orders/:slug` | 승인된 조건의 직접 주문 | 넓은 폼, 수량·금액 → 연락/배송 → 최종 확인 → 결제. 선택 필드 접힘. 상담 시 입력값을 지우지 않고 폼 숨김·비활성화 |
| `/partners` | 도입 목적·제품·지원자료 이해 | 재판매·사업장·단체선물 안내 먼저. 도구는 펼침. 재판매에서만 수량 배분·차액·판매 카드. 사업장/선물에서는 요구사항·일정. 요약·복사·인쇄·상담 공통 |
| `/jeju/pickup` | 준비 중 제주 수령 문의 | 350g, 1~3개, KRW18,000 기준. 승인 날짜/장소/청구통화 없음. 이메일 초안 전용, 예약 저장·결제 없음 |
| `/contact` | 맥락이 유지되는 이메일 상담 | 상품·국가·수량·목적·이행방식 보존. 공식 이메일·복사·제공 QR. 앱 열기/복사는 접수가 아님 |
| `/guide/:productId` | 사용·관리·공유·재주문 상담 | 기존 사용 안내 유지, 공유 API 또는 링크 복사. 해외 개별배송 재주문 기능 없음 |
| `/jeju/stores` | 기존 확인 판매처 목록·지도 | 기존 주소·좌표·출처 유지, 공통 주의사항 상단 1회. HONDIT 수령 장소와 구분 |
| `/partners/:slug` | 기존 승인 파트너 경로 보존 | 승인 목록 확대 없음. 데모는 Preview 게이트 유지 |
| `/admin/pickup` | 내부 상태 전이 시뮬레이션 | 기존 관리자 진입 검사 유지. DEV 또는 명시적 Preview 데모에서 메모리만 사용. 실제 인증 관리자 전체 검증 미수행 |

## 가격·배송·서버 계약

- SG SKU `foam-oil`, `foaming-cleanser`, `cleansing-water`: 890센트 × 30 = 26700센트 / SGD267.00.
- SG `diffuser-350g`: 2100센트 × 20 = SGD420.00. `diffuser-500g`: 4600센트 × 20 = SGD920.00.
- 기존 `shared/page-sales.js` SG 승인값 유지. 미승인 7개 시장 제안가격을 활성화하지 않음. 일본 기존 350g JPY2400·20개·JPY48000, Shopee 소매가격, 과거 거래 변경 없음.
- `shared/purchase-context.js`는 이행방식/목적과 직접 주문 적격성의 공통 판단. 목적은 가격·배송방식을 결정하지 않음. SG는 단일 SKU 정확한 MOQ만 직접 주문 후보. HK/MO 클렌징 혼합 기존 규칙 유지. 재고·활성·수량·중복도 확인.
- 상세/진입/사업자/주문 화면이 같은 판단을 사용. 서버 `create-order`는 기존 국가·상품·수량·재고·가격·주소 검증을 유지하고 공통 판단도 수행. 고객 금액·승인값 신뢰 안 함. 기존 숨은 운영 테스트 경로는 기존 범위 유지하며 실행하지 않음.
- 기존 주문의 `internal_note`에 신규 주문의 이행방식·목적 표식만 추가. 새 컬럼 필요 없음. `[shipping:v1]` 표식 보존. B 판매조건/견적 테이블 의존 없음.
- 추가 수량·다품목 금액은 검토용이며 확정 운임/청구금액이 아님. MOQ 운임의 추가 수량 적용, 운송·규제 승인 추정 없음.
- 표시·청구통화의 기존 시장 구조를 이번에 확대하지 않음. 제주 KRW는 기준가격이며 결제통화가 아님. 임의 환산 없음.

## 결제 안전성 보완과 한계

- 완료 화면은 서버 조회 `payment_status=completed`일 때만 성공 안내·구매 이벤트·영수증 출력 허용. 실패 URL도 실제 조회 상태를 확인하며 완료 건은 완료 경로로 이동.
- Capture 응답 유실/검증 문제/성공 후 DB 갱신 오류는 실패로 단정하지 않고 `PAYMENT_REVIEW_REQUIRED` 409. 기존 이벤트 저장은 최선 노력으로 수행하며 모든 DB가 실패하면 일반 서버 진단 로그만 남을 수 있음.
- 고객은 재결제 대신 주문 참조번호로 확인 안내. 클라이언트 Capture/SDK 오류로 실패 상태를 쓰지 않음.
- 완료 주문의 Capture 재요청은 조기 반환. 실패/취소 갱신은 DB 조건으로 `completed` 제외하며 PayPal 주문 ID 교체 금지.
- Webhook 연결 주문·금액·통화 검증 추가. 1센트 차이도 거절. 완료/환불 상태 보존. 알림 실패는 결제 완료 저장에 영향 없음.
- 외부 PayPal과 DB는 단일 트랜잭션이 아님. 자동 복구 작업 큐·Webhook 처리 원장·정확히 한 번 알림 등 B 복구 시스템은 이번에 구현/적용하지 않음. 기존 검증 Webhook 또는 담당자의 PayPal 대조가 필요하며 자동 복구를 보장하지 않음.
- Preview는 서버 쓰기 차단, 빈 clientId, 프런트 SDK 차단, GA 전송 비활성화. 실제 PayPal 계정/금전 흐름은 테스트하지 않음.

## 제주 수령의 미운영 경계

- `shared/pickup.js`의 기준가격·수량 및 불변 이력 상태 전이를 로컬 테스트함.
- 요청 → 운영/장소/시간 승인 → 확정 청구조건 → 검증 결제 확인 → 일정 확정 → 전달. 변경·미수령·취소·환불 상태와 증빙 게이트 분리.
- `/api/pickup`은 기존 products 함수 진입점으로 전달되는 `_pickup.js`를 재사용. GET은 공개 비활성 조건만 제공, 모든 저장/승인/예약/결제 시도는 403. `create-order`에서도 `jeju_pickup` 차단.
- `/admin/pickup`은 가상 요청 한 건의 메모리 데모이며 새로고침으로 사라짐. 가상 청구값·검증 플래그는 시뮬레이션 입력이며 운영 승인·결제가 아님.
- `supabase/drafts/jeju_pickup_NOT_FOR_PRODUCTION.sql`은 검토용 초안으로 마이그레이션 디렉터리 밖에 두었고 마지막에 rollback. 실행하지 않았으며 실제 DB 복원·적용 테스트도 하지 않음.
- 향후 실제 운영 전 날짜·시간·정원·인계 장소·청구통화/금액·취소/미수령/환불 기준, 개인정보 보존 정책, 저장·관리 API 권한 및 백업·복원 검증이 필요함.

## 연락 QR와 공개 자료

- 고객용 이메일 및 서버 기본 회신/알림 이메일은 `hondit.office@gmail.com`으로 변경. 환경변수로 지정된 기존 서버 수신/회신 값은 변경하지 않았으므로 운영 전 별도 확인 필요.
- QR 4PNG는 제공 ZIP과 SHA256 일치 확인. `public/images/contact/`에 원본 그대로 사용하며 이미지 확대·크롭·재생성 안 함.
- WhatsApp/Telegram/WeChat QR는 로컬 해독 성공. 실제 앱 스캔·계정 소유/수신은 미검증. Instagram은 로컬 해독에 실패하여 기존 공개 계정 링크를 유지했고 해당 QR와 링크의 일치도 수동 확인 필요.
- 제공 README의 인코딩 손상으로 일부 텍스트를 읽을 수 없었음. 임의 연락 계정 생성 안 함.
- 실사용 자산: `public/images/diffuser-350g.webp`, `diffuser-500g.webp`, `stonejeju-diffuser-product.png`, 기존 `hondit-pack/hondit_codex_image_pack`, 기존 디퓨저 영상. 기존 자료의 촬영 출처/권리 확인 범위를 넘는 새 보증 없음.
- 제품 규격 근거는 기존 `src/data/productFacts.ts`, 판매처 공개 목록은 기존 `src/data/jejuStockists.json` 및 이전 출처 검토 문서 재사용. 이번에 공식 웹 출처를 새로 검증했다고 보고하지 않음.

## Claude가 변경 가능한 영역 / 유지해야 할 영역

- 변경 가능: 타이포·여백·색상·사진 배치·반응형 구성·접힘 표현·카드 시각 디자인. 기존 사진·영상·QR 원본 활용.
- 유지 필수: 해외 묶음 주 CTA, 제주 미운영 표시·서버 403, SG 가격/정확 MOQ, 기존 JP/HK/MO/Shopee 범위, 입력 맥락과 캠페인 URL, 주소 서버 정규화·PayPal 검증, 결제 결과의 서버 상태 확인, Preview 차단, 개인정보/내부 필드 비노출.
- 판매 카드 금액을 고객에게 확정 견적/순이익 보장으로 바꾸지 말 것. 지도 판매처를 수령 장소로 표현하지 말 것. 리뷰·사진·인증·납기를 만들지 말 것.

## 검증과 캡처

- 로컬 TypeScript/Vite 빌드 통과. 기존 대형 번들 경고는 남아 있음.
- 기존 47개 + 신규 10개 = 57개 모의/회귀 테스트 통과. 금액 조작, SG MOQ, 일본 보존, 주소, Preview 차단, 제주 전이/위조 승인, Capture 응답 유실·DB 오류·알림 오류, Webhook 금액/통화/주문 연결, 다국어 포함.
- 고객용 새 고정 문구: 영어·한국어·번체중문·일본어·말레이어·태국어 번역 검사. 원어민 감수 미수행.
- 로컬 브라우저: 390px 모바일 및 1280px 데스크톱 결제 화면 가로 넘침 없음. 필수 입력 폭 각각 279px/488px. Preview SDK 미로드 확인. 제주 안내 6언어 모두 예약 false 및 가로 넘침 없음.
- 캡처 및 세부 결과: `docs/qa/sales-structure/`. 실제 결제·환불·이메일 수신·메신저 앱·인증 관리자 전체·인쇄 PDF 파일 결과·운송/규제는 미검증.
- Preview 배포 결과와 접근 제한은 아래 후속 검증에 기록. 운영 반영은 별도 승인 필요.

## 변경 파일 묶음

- 공통 판정: `shared/purchase-context.*`, `shared/consultation.*`, `shared/sales-tools.*`, `shared/structure-copy.*`.
- 제주: `shared/pickup.*`, `api/_pickup.js`, `src/pages/JejuPickupPage.tsx`, `AdminPickupPage.tsx`, 관리자 메뉴 및 DB 초안.
- 화면: Home/BulkOrders/BulkProduct/Partners/Contact/ProductDetail/ProductGuide/JejuStores/OrderComplete/PaymentFailed, SiteChrome/BusinessPlanner/QuantityReview/ProductSalesSummary/SalesDiscovery/ContactQrs.
- 서버: PayPal create/capture/update-attempt/webhook, 금액 검증 `_markets.js`, products 분기, 연락 이메일 기본값.
- 연결·자산·검증: App/vercel/main/market/bulkApi/analytics, sales-structure.css, QR PNG, localization 및 sales-structure 테스트, `.vercelignore`.

## 최종 Preview 검증 결과

- 최종 소스 커밋: `90e5b40` (핵심 구현 `12ee8f0`, 사업자 상태 문구 보정 `39a40b2`, 제주 환불 대기·전달 기록 보호 `90e5b40`).
- URL: https://hondit-shop-reo7u7626-hondit.vercel.app/?market=SG&lang=ko
- 배포 ID: `dpl_EvdST5bokRLLRzpktgGNYzTNSZdw`, target=preview, Ready 확인.
- 기존 Vercel 인증 보호 유지. 권한 없는 브라우저에서는 로그인이 필요할 수 있음. 보호 설정을 해제하지 않음.
- 배포 환경에서 `/api/paypal/config`: 200, checkoutEnabled=false, clientId 빈 값. `/api/pickup`: 200, 예약·결제=false.
- 빈 POST 안전 점검 9개 모두 403: pickup, PayPal create/capture/webhook/update-attempt, contact, products, reviews, admin/settings. 실제 거래를 만들지 않음.
- 이전 동일 화면 Preview에서 추가 수량 상담의 복사 내용에 상품·국가·수량·구매 목적·이행 방식 포함, 필수 주소 입력 0개 확인. 프런트 PayPal SDK 미로드 확인. 최종 Preview는 추가로 내부 제주 데모 상태 보호만 수정했으며 같은 차단 검증을 다시 통과함.
- 최종 커밋 기준 로컬 빌드 및 57개 테스트 재통과. 대형 번들 경고만 남음.
- 마지막 Production 확인: `dpl_6KKkyTC83oxFsDCHLXokFCnvWfbX` 유지. 원격 main `61d0e1dd683966f2e346ece39a3c487d97cdbfb4` 유지.
- 변경 파일 전체: `docs/qa/sales-structure/changed-files.txt`. 배포 API 결과: `preview-api-checks.json`. 테스트 로그: `regression-tests.txt`.
- 최종 인계 문서와 캡처 추가 커밋은 배포 제외 자료만 변경하며 별도 Preview 재배포가 필요하지 않음.
