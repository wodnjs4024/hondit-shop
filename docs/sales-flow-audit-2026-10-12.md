# 판매 구조 개편 사전 점검 (2026-10-12)

## 기준과 보호
원격 main 실제 조회: 841bbe74caaa72037d1f97681c950f92a537c118.
Production 실제 조회: dpl_81bDoHfvtoTCuNRXQmEVv1KDQdNj, Ready, https://hondit-shop-ivxtp3ywd-hondit.vercel.app.
기존 A worktree가 깨끗한 상태임을 확인하고 codex/sales-flow-revision 브랜치를 생성했다. 원래 작업 폴더의 다수 미커밋 변경·B 구현은 읽기만 했으며 수정하지 않았다. 소스 수정·운영 DB 조회/수정·마이그레이션·외부 결제·고객 연락·main push·배포 없음.

## 1. 라우터·공통 화면·국가·언어
src/App.tsx:303 이후 MarketProvider 및 라우트. 상세 /products/:productId, 대량 /bulk-orders/:slug, 문의 /contact. 별도 파트너 도입 상담 라우트 없음.
src/components/v23/SiteChrome.tsx:17 V23Header, :119 V23Footer. 국가 변경 시 해당 국가 기본 언어로 재설정. Shopee 경로는 hasShopee에 따라 분기.
src/lib/market.tsx:244 MarketProvider. URL market/lang 및 localStorage를 사용. :2386 marketText는 기존 사전과 동적 번역 조회 후 한국어 fallback 또는 영어 원문 사용. 신규 고객용 문구는 기존 사전에 등록해야 다른 언어에서 영어로 남는 것을 방지할 수 있다.

## 2. 상품 상세·대량주문
src/pages/ProductDetailPage.tsx → src/lib/storefrontApi.ts → src/lib/bulkApi.ts → /api/products → api/_utils.js getProducts. 정적 상품 설명·사진과 API 가격·재고·활성 상태를 합친다. API 실패 시 정적 데이터 fallback 존재.
src/pages/BulkOrdersPage.tsx도 같은 storefront 조회 사용.
src/pages/BulkProductPage.tsx는 bulk API 조회 후 주문 입력·PayPal SDK·이메일 초안을 관리한다.
src/components/ProductSalesSummary.tsx와 shared/page-sales.js가 SG 승인 단가/MOQ 및 usage 판매문구 필터를 제공. api/_markets.js와 src/lib/market.tsx가 동일 SG 조건을 참조한다. B sales_conditions/quotes 의존성 없음.
SG 단일 MOQ 외 수량·혼합은 이메일 문의. HK/MO 기존 혼합 경로는 별도 보존.

## 3. 입력 폼·서버 검증
src/pages/BulkProductPage.tsx:250 validate, :281 부근 buildPayload. 이름·이메일·전화·주소1·도시·우편번호 및 최종 확인 체크를 요구한다. 회사명·주소2·메모는 선택이다. 이메일 문의 상태에서도 배송 입력 영역이 남아 있어 상담에 필요하지 않은 입력으로 오해할 여지가 있다.
src/lib/bulkApi.ts CheckoutPayload와 api/paypal/create-order.js:6 validateCheckout에도 같은 필수 필드가 있다. 프런트 필드만 삭제하면 서버가 거부한다.
api/_markets.js resolveMarket가 국가 일치를 검증하고, api/_utils.js:132 calculateCart가 상품·수량·MOQ·재고를 계산한다. 서버가 가격을 다시 계산한다. 입력 필수값 검증은 문자열 비어있음 확인 중심이며 이메일/주소의 실제 유효성 검증과는 다르다.

## 4. PayPal·배송주소
api/paypal/create-order.js는 검증 → 기존 orders 저장 → order_items 저장 → PayPal 주문 생성 → paypal_order_id 연결 순서다. purchase_units에는 reference_id/custom_id/description/amount만 포함한다. shipping 주소 및 application_context 배송 선호 설정은 전달하지 않는다.
즉 고객은 사이트에 배송주소를 입력하지만 HONDIT 입력 주소가 PayPal 주문에 지정되지 않는다. PayPal 자체 화면의 주소 수집 동작은 외부 호출 없이 확인할 수 없으며, 사이트 주소와 동일하다고 간주할 수 없다.
api/paypal/capture-order.js는 결제 금액·통화·상태 및 주문 ID를 검증하지만 PayPal 배송주소를 운영 주문 주소와 비교하거나 동기화하지 않는다.
따라서 입력 축소는 (a) 사이트 주소를 유지하고 PayPal로 전달 또는 (b) PayPal 주소를 수집·검증해 주문에 반영하는 방식 중 일관된 경로가 필요하다. 필수 입력만 제거해서는 안 된다. (b)는 시장·배송지 일치, 취소/누락, 승인 후 금액 변경 방지 및 기존 DB 필수 제약 확인이 필요하다.
B 결제 복구 구현은 현재 브랜치에 포함되지 않는다. 실제 결제 성공·복구 동작을 검증한 것으로 보고하지 않는다.

## 5. 이메일 문의
src/pages/ContactPage.tsx:52 이메일 안내·mailto·복사. 온라인 저장 폼과 POST 호출 없음. 기존 주소는 src/data/v23SiteData.ts EMAIL 상수 사용.
src/pages/BulkProductPage.tsx:193 manualPaymentHref는 선택 상품·수량·국가와 상품금액을 이메일 초안에 포함. 추가 수량 문의 CTA는 mailto 연결이며 접수 완료로 표시하지 않는다.
ProductSalesSummary의 /contact?product=... 링크는 상품 query를 전달하지만 ContactPage가 이를 읽지 않아 일반 이메일 초안에서 상품명이 비어 있다. 상품 상세 → 상담 경로에서 맥락 유실이 확인된다.
api/contact.js의 기존 저장 API 자체는 남아 있으나 화면에서 호출하지 않는다. inquiries 구조의 현재 운영 존재 여부를 이번 점검에서 재검증하지 않았으므로 다시 활성화할 근거 없음.

## 최소 구현 방향
기존 라우트·국가/언어 체계·상품 조회·승인 가격 계산을 재사용한다. 직접 구매와 파트너/추가 수량 상담 동선을 구분하고 상담 화면에서는 불필요한 배송 개인정보 입력을 노출하지 않는 방향이 적절하다. 상품 맥락이 유지되는 이메일 초안을 공통화한다. 결제 입력 축소는 배송주소의 최종 원본과 PayPal 전달 방식을 먼저 확정한 뒤 프런트·타입·서버·모의 테스트를 함께 변경한다. B DB 기능과 결제 복구 시스템은 포함하지 않는다.
이번 메시지에는 사전 확인 대상까지 제시되어 있어 임의의 파트너 기준·화면 요구·배송지 원본 정책을 만들지 않았다.

## 검증
기준 코드의 로컬 테스트 20개 통과. 외부 API 호출은 mock. Preview 쓰기 차단 및 빈 clientId 분기 테스트 포함. 이번 점검에서는 새 Preview 배포/실제 결제/실제 이메일 앱 발송/운영 DB 쓰기를 수행하지 않았다. 신규 구현과 신규 UI 검증은 아직 수행 전이다.
