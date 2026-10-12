# 페이지 개선 A — 미리보기 결과

작성일: 2026-10-12 (Asia/Seoul)

## 배포와 작업 분리

- 최종 Preview: https://hondit-shop-j26i385zu-hondit.vercel.app
- Preview ID: dpl_EviwAYwahJ4PrjdeeZxB5oeD6UMB (READY)
- Production 기준: 30946ecb34f1e0cd79e0737b4410a372fc284914
- 별도 worktree: C:/Users/user/.codex/worktrees/hondit-page-preview/hondit-shop
- 기존 작업 폴더의 미커밋 변경·판매조건 DB/견적/결제 복구 구현을 복사하거나 되돌리지 않았다. Production 커밋 전체에서 출발해 의존성을 확인했다.
- main push/Production 배포/마이그레이션/운영 DB 쓰기/실제 결제/고객 연락 없음.
- 배포 후 Production inspect: dpl_HkA3JXtCHWMPm3UpCFUZ6yeXrb2D로 기존 배포 유지 확인.
- 기존 프로젝트의 Vercel CLI Preview 경로만 사용했다. Git 자동 Production 경로는 유지했다. Preview는 기존 Vercel 인증 보호가 적용된다.

## 변경 내용과 운영 반영 시 영향

1. shared/page-sales.js가 확인된 5개 SKU의 SG 가격을 정수 최소 단위 890/2100/4600으로 정의한다. 프런트 market 가격 조회와 서버 market 가격 조회가 함께 참조한다. 신규 sales_conditions 테이블을 사용하지 않는다. 직접결제 서버는 고객 가격·총액을 사용하지 않고 기존 products에서 상품·판매 가능·재고·수량을 검증한다. SG 총액은 정수 센트 합산이다.
2. 상품 상세와 대량주문의 ProductSalesSummary에서 단가/MOQ/최소 상품금액/증가단위/배송/세금/문의 동선을 분리했다. 상세 breadcrumb, 카드 간격, 모바일 버튼·입력 크기·줄바꿈을 정돈했다. 기존 사진/브랜드 자료/사용법을 재사용하며 새 사진·후기·인증·판매자 정보를 만들지 않았다.
3. cleanProductUsage가 API DTO와 화면 양쪽에서 usage 및 사용법의 배송/MOQ/팩 안내를 필터링한다. DB usage 자체는 바꾸지 않았다. 주문 화면에서 usage 안에 국가 배송 안내를 다시 덧붙이던 경로도 제거했다.
4. SG 단일 SKU MOQ 묶음만 직접결제 대상으로 유지한다. 추가 수량/다품목/혼합 MOQ는 서버에서 결제 전 거부하고 화면은 기존 문의·이메일로 연결한다. HK/MO 기존 혼합 경로는 유지한다. 가격 승인을 운송·규제 승인으로 확장하지 않았다. 일본 및 다른 시장 가격표와 Shopee 소매가격 필드는 변경하지 않았다.
5. 관리자 주문 상세 및 증빙에서 pack_count를 packs로 표시하던 열/문구를 제거하고 실제 total_units를 표시한다. 거래 원본은 수정하지 않았다. 관리자 가격 편집 통합은 B 범위로 남긴다.
6. 문의 페이지의 저장 보장 문구를 중립적으로 수정했다. 기존 폼과 이메일 동선을 유지한다. 확인한 Supabase에 inquiries/inquiry_replies가 없는 문제는 A에서 새 구조로 해결하지 않았다.
7. 모든 기존 API handler의 Preview 비GET/HEAD/OPTIONS 요청을 서버 진입점에서 거부한다. Preview의 PayPal config는 checkoutEnabled=false/clientId 빈 값이다. 화면도 설정 확인 전 결제를 활성화하지 않는다. 이 보호는 VERCEL_ENV=preview일 때만 적용되며 Production 판매경로를 일괄 중단하지 않는다.

## 검증 결과

- 기존 11개 + 추가 7개 = 18개 로컬 테스트 통과.
- TypeScript 및 Vite 빌드 통과. 최종 Vercel npm run build 성공. 대형 번들 경고는 남아 있다.
- 추가 모의 테스트에서 실제 handler와 모의 Supabase/PayPal 응답을 사용해 클라이언트 가격 조작이 무시되고 SG 267.00/420.00/920.00으로 서버 청구 금액이 생성되는지 확인했다. 외부 금융 호출은 하지 않았다.
- 신규 DB 시스템 참조 검색: 실행 api/src/shared에 sales_conditions, quotes API, reserve_checkout, settle_capture, payment_reconciliation 의존성 없음. 기존 001~004 SQL은 실행하지 않았다. 마이그레이션을 추가하지 않았다.
- 브라우저 390×844 모바일: SG 상세 8.90/267.00, 350g 21.00/420.00, 500g 46.00/920.00 확인. 문서 폭이 뷰포트를 넘지 않음.
- 최종 일본 주문 화면: 2400/48000, SG 배송 문구 없음, 가로 넘침 없음.
- 최종 SG 주문 화면: 중복 조건 목록 제거, 30→40 증가 시 356 상품금액과 수량·배송 문의 CTA 표시. PayPal SDK 미로드 확인.
- 문의 화면: 폼/이메일 링크 표시와 저장 보장 문구 제거 확인. 실제 제출하지 않음.
- CLI 인증 GET /api/paypal/config: checkoutEnabled=false/clientId 빈 값/정상 JSON 확인. 브라우저의 해당 API 직접 탐색은 클라이언트가 차단해 CLI GET으로 대체했다.
- diff --check 공백 점검 수행.

## 미검증 및 후속 B

실제 문의 저장, 실제 결제, 관리자 인증 후 상세 화면, 외부 Sandbox/Live PayPal, 운송·납기·제품 주의사항 승인, 서버 Supabase URL의 write-only 값 대조는 미검증이다. 실제 문의 저장은 현재 확인한 DB의 테이블 누락으로 정상 동작을 보장할 수 없다. 이메일 링크는 발송하지 않고 동선만 확인했다. 기존 주의사항/반품·납기 기준은 운영 담당자의 제공·승인 자료가 필요하다. 이를 확정된 사실로 새로 작성하지 않았다.

백업·격리 복원·선행 스키마 보완·006/007·견적·결제 복구 적용은 원래 작업 폴더의 B 후속 계획으로 유지한다. 이번 Preview를 DB 통합 버전으로 착각해 배포하지 않는다. 운영 반영 시에는 이 worktree의 A 변경 전체를 검토하고, Preview 쓰기 차단이 Production에는 적용되지 않는 점과 기존 문의 저장 문제를 별도 확인한다.

## 파일

공통 모듈 shared/page-sales.js 및 .d.ts, ProductSalesSummary.tsx, tests/page-preview.test.mjs를 추가했다. 기존 변경 파일은 다음과 같다.

```text
.gitignore
api/_markets.js
api/_utils.js
api/admin-handler.js
api/admin.js
api/contact.js
api/orders/public/[orderNumber].js
api/paypal/capture-order.js
api/paypal/config.js
api/paypal/create-order.js
api/paypal/health.js
api/paypal/update-attempt.js
api/paypal/webhook.js
api/products.js
api/reviews/index.js
package.json
src/lib/market.tsx
src/lib/storefrontApi.ts
src/pages/AdminOrderDetailPage.tsx
src/pages/BulkOrdersPage.tsx
src/pages/BulkProductPage.tsx
src/pages/ContactPage.tsx
src/pages/ProductDetailPage.tsx
src/styles/v23.css
```
