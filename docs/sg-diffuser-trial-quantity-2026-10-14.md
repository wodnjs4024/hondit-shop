# SG 디퓨저 체험가격·수량 선택 로컬 구현 — 2026-10-14

## 구현 결과

- SG 350g 체험 10개는 개당 SGD 23 / 상품금액 SGD 230, 500g은 개당 SGD 50 / 상품금액 SGD 500으로 반영했다. 이전 제안 250/530을 SG 체험 가격 원본에서 교체했다. 원본 엑셀·과거 모델 자료는 수정하지 않았다.
- 공개 구매 옵션은 10개 고정 체험 주문과 20개 이상 일반 주문 두 가지다. 일반 주문은 1개씩 증가·감소하고 직접 입력 및 붙여넣기를 지원한다. 15개 옵션은 만들지 않았으며 기존 원본 계산자료는 보존했다.
- 빈 값, 11~19개, 소수, 음수, 문자 입력을 조용히 보정하지 않는다. 입력값을 유지하고 금액·주문/결제 요청 행동을 제한한다. 재고 상한도 유지한다.
- 상품 상세, 해외 주문 진입, 직접 주문 URL, Partners 계산기, 연락 초안에 같은 선택값과 수량별 가격 판정을 사용한다. 유효한 선택은 국가·언어 변경 시 유지한다.

## 승인 가격과 직접 결제의 구분

|선택|350g 상품금액|500g 상품금액|현재 로컬 결제 판정|
|---|---:|---:|---|
|SG 10개 체험|SGD 230|SGD 500|가격 승인. 배송·결제 확인 전 결제 요청|
|SG 20개 일반|SGD 420|SGD 920|기존 직접 주문 범위 유지. 로컬 Preview 모드에서는 SDK·결제 비활성|
|SG 20개 초과|SGD 21 × 수량|SGD 46 × 수량|가격 계산 가능. 추가 운임·포장·배송 범위 확인 전 결제 요청|
|비SG 10개|복원된 국가별 체험 제안가격|복원된 국가별 체험 제안가격|proposed. 직접 결제·재판매 수익 계산 비활성|
|비SG 일반|기존 레거시 참고가격 보존|기존 레거시 참고가격 보존|기존 로컬 조건 게이트의 승인 미확인 상태 유지. 자동 승인 없음|

SG 350g 21개=441, 35개=735 / 500g 23개=1,058, 50개=2,300을 정수 소액 단위로 검증했다. 추가 할인은 없다. 가격만 승인된 수량에서는 상품금액을 재판매 검토에 사용할 수 있지만, 배송비가 확정되었다고 표시하지 않는다. 미입력 비용 제외 안내를 유지한다.

## 공통 원본과 서버 검증

- `shared/page-sales.js`: 기존 SG 20개 및 클렌징 승인 가격 원본 보존.
- `shared/diffuser-quantity.js`: SG 10개 승인 단가, 다른 7개 시장 원본 10개 proposed 단가, 수량 유효성. 내부 원가·EMS·잔여율은 포함하지 않는다.
- `shared/checkout-terms.js`: 상품·시장·체험/일반 범위로 조건을 선택한다. 가격 승인, 배송 승인, 결제 승인, 청구통화, 재고를 분리한다. 동일 범위 중복은 오류로 처리한다. 10개 proposed가 20개 조건을 덮어쓰지 않는다.
- `shared/resale-economics.js`: 배송 승인과 상품가격 승인을 구분하여 승인된 상품 매입금액으로 계산한다. 계산값은 실제 청구금액이 아니다.
- `api/_utils.js`: 디퓨저 수량 규칙과 SG 기준 상품금액을 공통 함수로 검증한다. 클렌징 기존 단위·혼합 범위는 확대하지 않았다.
- `api/paypal/create-order.js`: 고객이 보낸 가격·총액·승인 상태를 사용하지 않는다. 미확정 수량·상품·시장 조건은 주문 INSERT 및 외부 PayPal 호출 전에 거절한다.
- MY/BN/MO의 기존 운영 청구 규칙을 바꾸지 않았다. BN/MO 10개 제안가격 표시에는 원본 BND/MOP를 사용하되 확정 청구통화·금액으로 간주하지 않는다.

## 기존 작업 보존

브랜치: `codex/buyer-flow-consistency`.
기준 HEAD: `3fc2534915653e61c66c79325ccae6014ae36b53`.
새 커밋·push 없음. 이번 작업은 기존 미커밋 변경 위에 로컬 보완한 상태다.

작업 시작 전 기존 변경·미추적 소스/문서 46개를 `.qa-tools/before-sg-trial-20261014/`에 사본 및 SHA256으로 보관했다. 아래 변경은 해당 작업 전 사본과 비교해 구분했다. 루트의 B 구현, 기존 주문·결제·환불·견적, 원본 XLSX/복원 자료, Shopee·제주 수령 가격 및 PayPal 운영 환경변수는 수정하지 않았다. 운영 DB·마이그레이션·Production·main은 변경하지 않았다.

### 작업 전부터 변경되어 있었으며 이번에 보완한 파일

- `api/paypal/create-order.js`
- `shared/resale-economics.js`
- `src/components/BusinessPlanner.tsx`
- `src/components/ProductSalesSummary.tsx`
- `src/components/QuantityReview.tsx`
- `src/components/ResaleCalculator.tsx`
- `src/lib/market.tsx`
- `src/pages/BulkOrdersPage.tsx`
- `src/pages/BulkProductPage.tsx`
- `src/pages/ProductDetailPage.tsx`
- `src/styles/sales-structure.css`
- `shared/checkout-terms.d.ts`
- `shared/checkout-terms.js`
- `shared/customer-conditions.d.ts`
- `shared/customer-conditions.js`
- `src/components/PaymentRequestPanel.tsx`

### 이번에 새로 변경하거나 추가한 파일

- `api/_utils.js`
- `tests/resale-economics.test.mjs`
- `tests/sales-flow.test.mjs`
- `shared/diffuser-quantity.js`
- `shared/diffuser-quantity.d.ts`
- `shared/diffuser-copy.js`
- `shared/diffuser-copy.d.ts`
- `src/components/DiffuserQuantitySelector.tsx`
- `tests/diffuser-quantity.test.mjs`

## 검증 결과

- `node --test tests/*.test.mjs`: 전체 87개 통과. 기존 결제·캡처·문의·배송주소·클렌징·제주 수령 회귀 테스트 포함.
- `npm run build`: 통과. 기존 대형 번들 경고는 남아 있다. 로컬 검증용 빌드는 프로세스 범위의 `VITE_VERCEL_ENV=preview`로 수행했으며 환경변수 파일은 변경하지 않았다.
- 실제 Edge 기반 브라우저 자동화: PC 1440×1000, 모바일 390×844, 39건 통과. 빈칸 지우기, 붙여넣기, ±1, 총액 갱신, SG/JP 전환, 6개 언어 전환, 직접 URL, 이메일 초안, Partners 매입금액·차액, 모바일 가로 넘침을 확인했다.
- 브라우저 테스트의 제품·결제설정 응답은 로컬 모의 데이터다. 운영 DB 연결이나 실계정 결제 검증이 아니다. 모든 외부 요청을 차단하고 쓰기 요청 0건·PayPal SDK 호출 0건·페이지 실행 오류 0건을 확인했다. 분석 스크립트 도메인은 의도적으로 차단했다.
- 서버 모의 테스트: SG 10개·20개 초과·15개·비SG 미승인 조건은 주문 쓰기/PayPal 호출 없이 차단. SG 기존 20개 및 클렌징 30개는 조작된 고객 금액 대신 승인 금액과 배송주소로 모의 주문을 생성함을 확인했다. 실제 외부 호출은 수행하지 않았다.

검증 파일: `docs/qa/sg-trial-20261014/browser-results.json`, `sg-trial-all-tests.log`, `sg-trial-build.log`, `preexisting-change-boundary.json`.
화면: `trial-1440.png`, `trial-390.png`, `general-1440.png`, `general-390.png`, `resale-1440.png`, `resale-390.png`.

## 미검증·운영 적용 전 필요한 사항

1. SG 10개 체험의 실제 포장·운송·배송비 포함 범위·결제 활성 조건 확인. 가격 승인을 재요청하는 항목이 아니다.
2. 20개 초과 수량·다품목의 추가 운임과 확정 청구금액 확인. 확인 전에는 선택값을 유지한 결제 요청만 제공한다.
3. 비SG 조건은 현재 로컬 게이트에서 승인 미확인으로 남아 있다. 기존 운영 경로에 대한 영향과 시장·상품별 승인을 별도 확인한 뒤 배포해야 한다. 이번 작업으로 일괄 승인하거나 운영 경로를 변경하지 않았다.
4. 실계정 PayPal 결제·배송·이메일 수신·고객 연락은 검증하지 않았다.
5. 사용자 운영 배포 승인 전까지 로컬에서 유지한다. Preview/Production 배포, 운영 DB 변경, 마이그레이션, 실제 결제·환불은 수행하지 않았다.

## 로컬 확인

- `http://127.0.0.1:4190/bulk-orders?market=SG&lang=ko&product=diffuser-350g&quantity=10`
- `http://127.0.0.1:4190/bulk-orders/diffuser-500g?market=SG&lang=ko&quantity=23`
- `http://127.0.0.1:4190/partners?market=SG&lang=ko&product=diffuser-350g&quantity=35`

로컬 검증 서버가 실행 중일 때 접근 가능하다. 결제는 비활성 상태다.
