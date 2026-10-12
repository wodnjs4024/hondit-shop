# HONDIT 판매 구조 개편 — 로컬 구현·Preview 결과

## 작업 기준·보존
- 브랜치: codex/sales-flow-revision
- 작업 공간: C:/Users/user/.codex/worktrees/hondit-page-preview/hondit-shop
- 시작 시 원격 main: 841bbe74caaa72037d1f97681c950f92a537c118
- 시작 시 Production: dpl_81bDoHfvtoTCuNRXQmEVv1KDQdNj (Ready)
- 기존 A worktree의 깨끗한 소스에서 새 브랜치를 만들었다. 원래 OneDrive 작업 폴더의 미커밋 변경·B 구현은 수정하지 않았다. 이번 작업으로 main push·Production 배포·운영 DB 변경·마이그레이션·실제 결제/환불·고객 연락을 하지 않았다.
- 기준 브랜치에서 존재하던 사전 점검 문서는 함께 보존했다. B 테이블·함수·견적 API를 가져오지 않았다.

## 구현
1. 헤더를 상품 / 대량주문·맞춤 상담 / 파트너 프로그램 / HONDIT 소개로 정리했다. 소개는 기존 /jeju를 재사용하고 모든 기존 URL·짧은 캠페인 라우트를 유지했다. 배송·환불·약관·개인정보·기존 연락처는 푸터에 유지했다.
2. SG 단일 승인 MOQ만 직접 구매하며 수량 변경에 따라 상담 모드로 전환한다. 상담에서는 배송 필드를 숨기고 fieldset을 disabled 처리한다. 수취인·주소·전화·우편번호를 요구하지 않는다. 상품·수량·국가·이유 및 선택 사업장/목적/일정/추가 정보로 이메일 초안·복사를 제공한다. 초안/복사를 접수 완료로 표현하지 않는다.
3. 직접 구매 입력 state와 상담 입력 state를 유지해 모드 전환 시 초기화하지 않는다. 상담에서는 PayPal SDK·버튼을 로드하지 않고 전환 시 기존 스크립트·버튼을 정리한다. Preview는 결제 설정이 별도로 비활성이다.
4. 상세의 상품 query를 알려진 상품 ID로 조회하여 공개 이름·수량·시장·언어·허용된 상담 이유에 연결한다. 임의 상품 설명/자유입력 URL은 사용하지 않는다. 제목·본문은 encodeURIComponent로 인코딩하고 이메일과 복사는 같은 본문 원본을 사용한다. 선택 상담 정보는 React state에만 두며 URL·분석 이벤트·공개 로그에 전송하지 않는다. 이메일 초안은 버튼 클릭 시 생성하므로 자유입력 본문을 링크 분석에 노출하지 않는다. 직접 구매 이메일 보조 경로에서도 개인 연락처·주소를 본문 링크에 넣지 않는다.
5. /partners 도입·시험 운영 제안 페이지를 추가했다. 실제 사례·실적·수익 보장·샘플·혼합 MOQ·위탁·반품 확정 조건을 생성하지 않았다. 지원 범위/횟수/비용/일정은 상담 후 확정한다.
6. /partners/:slug QR 안내 템플릿은 shared/partners.js의 승인 목록을 사용한다. 목록은 현재 비어 있다. 로컬 또는 명시적으로 허용한 Preview의 /partners/demo만 데모이며 승인 파트너가 아님을 표시한다. 상품 정보·기존 공개 사용법·구매 문의 위치를 표시한다. 재고·소비자 가격을 생성하지 않고 모바일 B2B 결제 고정 CTA도 숨긴다. 실제 QR 이미지 인쇄/배포는 하지 않았다.
7. 알 수 없는 QR slug는 기존 products 서버 함수의 HTML 분기를 통해 HTTP 404와 NotFound 화면을 반환한다. 서버 함수 수를 늘리지 않는다. dist/index.html을 해당 함수에 명시적으로 포함하며 DB 접근을 하지 않는다.

## 배송주소 전체 흐름
기존 사이트 입력 → BulkProductPage buildPayload → create-order 서버 → 공통 normalizeShipping → 기존 orders 주소 필드 저장 → 같은 객체로 purchase_units.shipping 생성 → payment_source.paypal.experience_context.shipping_preference=SET_PROVIDED_ADDRESS → PayPal 승인 → Capture 전 주문 상세 GET으로 사이트 저장 주소와 비교 → Capture 결과에서도 비교 → 기존 완료/관리자 화면은 orders에 저장된 주소 표시.

- 사이트 저장은 기존에도 존재했다. 기존 문제는 PayPal 생성 요청에 배송주소가 없고 기본 배송 선호를 사용했다는 점이다.
- 이름·주소1/2·도시·우편번호에 NFC/공백 정규화, 타입/길이/필수 검사를 적용하고 시장과 배송 국가를 일치시킨다. 금액은 기존 서버의 상품·수량·재고·승인 가격 계산을 사용한다.
- SG 우편번호 6자리, JP 7자리(선택 하이픈)를 검사한다. HK/MO는 우편번호 필드 없이 빈 문자열을 기존 NOT NULL 텍스트 컬럼에 저장하고 PayPal에는 해당 속성을 생략한다. 가짜 대체값을 쓰지 않는다. 다른 시장은 기존 필수 조건·길이 검사를 유지하며 우편번호의 실제 배달 가능성을 보장하지 않는다. 프런트와 서버가 같은 shared/shipping.js를 사용한다.
- 신규 주문은 기존 internal_note에 [shipping:v1] 표시를 붙인다. 이 표시가 있는 신규 주문만 새 승인주소 비교를 적용하여 과거 결제 대기 주문의 경로를 임의 차단하지 않는다. 관리자 내부 메모 변경으로 표시가 제거되지 않도록 운영 전 확인이 필요하다. 별도 DB 버전 필드를 추가하지 않았다.
- 주소/수취인/주문 연결 불일치는 Capture 이전에 거부하고 기존 address_check 상태로 남긴다. 반환 주소로 주문 주소를 덮어쓰지 않는다. Webhook의 신규 주문도 주문 상세 주소를 확인하며 확인 실패는 address_check로 분리한다. 기존 내부 메모의 표시를 보존한다.
- 완료 주문 재요청에는 Capture를 반복하지 않는다. 외부 결제와 DB를 하나의 트랜잭션으로 간주하지 않는다. 결제 성공 후 DB 장애의 완전한 자동 복구는 B 범위이며 이번에 해결했다고 보고하지 않는다. Capture 후 불일치/조회 실패는 운영자의 확인이 필요하다.
- 완료 화면 OrderCompletePage와 인증 관리자 AdminOrderDetailPage는 기존 저장 주소를 읽는다. 실제 고객 주문 조회는 하지 않았으며 코드 경로만 확인했다.
- PayPal 공식 배송 사양: https://developer.paypal.com/v5/checkout/add-shipping/ — SET_PROVIDED_ADDRESS가 제공 주소를 표시하고 리뷰 화면에서 구매자 변경을 막는다는 계약을 직접 확인했다. 실제 계정·카드/게스트 흐름의 동작을 검증한 것은 아니다. 판매자 보호를 보장하지 않는다.

## 입력 변경 전후
| 항목 | 이전 | 이번 |
|---|---|---|
| 이름 | Full name 필수 | 배송 수취인 명시, 필수 유지 |
| 이메일 | 필수 | 주문 안내 용도 명시, 필수 유지 |
| 전화 | Phone/WhatsApp 필수 | 배송 연락처, WhatsApp 요구 제거, 필수 유지 |
| 회사·주소2·메모 | 기본 노출 | 선택 입력을 키보드 가능한 details로 이동 |
| 국가 | 읽기전용 입력 | 시장 기반 고정 표시, 재입력 없음 |
| HK/MO 우편번호 | 일괄 필수 | 입력/대체값 없이 생략 |
| 상담 | 배송·결제 영역 함께 노출 | 배송/결제 숨김, 선택 상담 정보만 제공 |
| 오류 | 공통 안내 중심 | 필드별 안내·포커스 보완, 입력값 유지 |

전화 필수 여부는 공급/운송사 요구가 미확정이므로 현재 요구를 유지했다. 기존 최종 확인 체크와 정책 링크를 삭제하지 않았다. 실제 키보드 Enter로 선택 입력 펼침을 확인했다.

## 이메일 초안 예시 (가상 상담·발송 안 함)
HONDIT 상담
시장·국가: 싱가포르 (SG)
언어: ko
상담 이유: 추가 수량
J’essence Vegan Foam Oil: 40 개
사업장 유형 (선택):
도입 목적 (선택):
희망 일정 (선택):
추가 정보 (선택):
적용 조건을 확인해주세요. 확정 견적이 아닙니다.

운영 수신 주소는 기존 EMAIL 상수 hondit.official@gmail.com을 재사용한다. 이메일 수신 테스트는 하지 않았다.

## 파트너·QR 사용법
- /partners에서 상담 내용을 선택적으로 작성하고 복사하거나 이메일 초안을 연다. 서버 문의 저장을 다시 활성화하지 않는다.
- 승인된 파트너가 생긴 뒤 shared/partners.js에 slug/name/productSlugs/purchaseLocation의 공개 승인 정보만 등록한다. 소비자 문의 위치는 확인된 안내만 사용한다. 새 DB·관리자 없음.
- 로컬은 /partners/demo, Preview는 VITE_VERCEL_ENV=preview, VITE_PARTNER_DEMO=1 및 서버 PARTNER_DEMO=1을 함께 사용한다. Production용 빌드에서는 데모 설정을 넣지 않는다. Preview 자체를 Production으로 promote하지 않고 별도 승인 후 Production 환경으로 새 빌드해야 한다.

## 테스트·Preview
최종 Preview: https://hondit-shop-ob8e1eqq5-hondit.vercel.app
배포 ID: dpl_89PtxQYw8Fe1hqeJNJqRrPDKqXWG (Preview Ready)
Vercel 인증 보호 유지. 공개 접근으로 완화하지 않았다.

- Node 자동 테스트 33개 통과. 실제 DB/PayPal/알림 호출은 모의 응답 사용.
- TypeScript 통과, Vite 빌드 및 Vercel Preview 빌드 성공. 기존 큰 청크 경고 남음.
- SG 클렌징 30=267.00, 350g 20=420.00, 500g 20=920.00 서버 모의 계산 및 화면 확인. JP 2,400/48,000 보존 확인.
- 390×844에서 상담 배송 숨김/disabled, SDK 없음, 가로 넘침 없음, 직접→상담→직접 수취인 값 보존, 상담 복사 내용, 선택 입력 키보드 펼침 확인.
- HK 우편번호 입력/가짜값 없음. QR 데모 명시·모바일 B2B CTA 없음. 알 수 없는 slug HTTP 404 확인.
- 현재 선택 UI의 6언어(en/ko/zh-HK/ja/ms/th) 파트너 제목·화면을 확인했다. 사전에는 zh/zh-TW 별칭도 포함했다. 기존 선택기는 zh/zh-TW를 독립 선택 항목으로 제공하지 않으므로 그 별칭 URL의 독립 선택 동작을 새 지원으로 보고하지 않는다.
- 신규 고객 문구를 shared/sales-copy.js에 등록하여 기존 marketText 조회에 연결했다. 상담 본문도 같은 언어 범위로 번역했다. 기존 전체 사이트 문구·제품 번역을 모두 다시 번역/감수한 것은 아니다.
- 실제 Preview config GET: checkoutEnabled=false, clientId 없음. 빈 create-order POST는 403으로 거부됨. 모의 테스트는 모든 기존 변경 가능한 Preview API의 외부 접근 전 403을 확인한다. Production 분기 설정은 기존 테스트로 별도 확인한다.

## 미검증·운영 전 결정
- 실제 PayPal 승인·카드/게스트 UI 및 주소 반환 형식, 실제 HK/MO 주소의 PayPal 계정별 수용, 실제 Capture/환불/판매자 보호 자격은 미검증.
- 공급사 승인 관리법, 파트너 지원 범위·비용·일정, 전화 필수 요구와 운송 조건 확인 필요.
- 실제 DB의 추가 사용자 제약/트리거, HK/MO 빈 postal_code 저장은 실제 쓰기로 검증하지 않았음. 기존 스키마 파일은 NOT NULL text로 빈 문자열 허용.
- 인증 관리자의 실제 주문 표시·운영 이메일 수신·모바일 실제 기기의 이메일 앱 실행·전체 번역 원어민 감수·장기 오류 관찰은 미검증.
- 주소 비교는 엄격하다. PayPal의 의미가 같은 주소 재배열/보정도 자동 승인하지 않고 수동 확인으로 남길 수 있다.
- B 결제 복구·백업·DB 통합·마이그레이션은 계속 별도 후속 과제.

## 변경 파일
- api/paypal/capture-order.js
- api/paypal/create-order.js
- api/paypal/webhook.js
- api/products.js
- package.json
- src/App.tsx
- src/components/ProductSalesSummary.tsx
- src/components/v23/SiteChrome.tsx
- src/lib/market.tsx
- src/pages/BulkProductPage.tsx
- src/pages/ContactPage.tsx
- src/styles/v23.css
- tests/page-preview.test.mjs
- vercel.json
- api/_partner-guide.js
- docs/sales-flow-audit-2026-10-12.md
- shared/consultation.d.ts
- shared/consultation.js
- shared/partners.d.ts
- shared/partners.js
- shared/sales-copy.d.ts
- shared/sales-copy.js
- shared/shipping.d.ts
- shared/shipping.js
- src/components/ConsultationPanel.tsx
- src/data/partners.ts
- src/pages/PartnerGuidePage.tsx
- src/pages/PartnersPage.tsx
- tests/sales-flow.test.mjs
