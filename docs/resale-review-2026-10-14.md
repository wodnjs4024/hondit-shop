# 사업자 재판매 검토·국가별 가격 연결 인계 — 2026-10-14

## 작업 기준과 보존
- 브랜치 codex/sales-structure, HEAD 1a17bde. 이번 변경은 미커밋 상태로 보존.
- 시작 당시 제주 수령 작업의 미커밋 변경: shared/contact-copy.js, PickupRequestPanel.tsx, JejuPickupPage.tsx, sales-structure.css, purchase-followup.test.mjs 및 제주 인계서·캡처·테스트. 이를 되돌리지 않았으며 이번에는 제주 파일을 추가 수정하지 않음. 공통 CSS에는 재판매 스타일만 추가.
- 원래 main 작업 공간 및 B 구현 보존. 운영 DB/마이그레이션/배포환경/main push/실제 결제·환불·문의 발송 없음.

## 이번 변경 파일
- shared/resale-economics.js 및 .d.ts: 승인 조건 조회 및 통화 최소단위 계산.
- shared/resale-copy.js 및 .d.ts: 기존 6개 언어 문구.
- src/components/ResaleCalculator.tsx: 접힌 재판매 계산기, 기본 입력 3개, 고급 비용 2개, 7개 결과, 미승인 조합 차단.
- src/components/BusinessPlanner.tsx: 기존 단순 차액 계산기를 교체. 기존 배분·판매 카드·인쇄·연락 기능 재사용. 재판매 목적에서만 계산기를 표시. 결과를 기존 문의 복사·이메일 초안·인쇄 요약에 포함.
- src/pages/BulkOrdersPage.tsx, src/pages/PartnersPage.tsx: 구매 진입 가격표는 확인된 SG 승인 원본만 표시. 다른 시장은 가격 확인 문의로 연결.
- src/lib/market.tsx, src/styles/sales-structure.css: 번역 연결과 모바일 결과 카드.
- tests/resale-economics.test.mjs, tests/site-localization.test.mjs: 산식·승인·통화·번역 검증.

## 가격 출처와 승인 규칙
- 공통 승인 원본: shared/page-sales.js의 sgTerms. API PayPal create-order.js, 화면 getMarketUnitPrice와 같은 원본.
- SG 확인 SKU: foam-oil, foaming-cleanser, cleansing-water 각각 890센트/MOQ30; diffuser-350g 2100센트/MOQ20; diffuser-500g 4600센트/MOQ20.
- approvedResaleTerms는 SG 원본 존재 및 기존 purchaseRoute의 단일 상품 직접 주문 가능 조건을 모두 만족해야 반환. 추가 수량·재고 부족·비활성·알 수 없는 SKU는 계산 불가.
- 다른 시장은 현재 코드에 명시적 승인 메타데이터 없음. 운영값이 존재한다는 이유로 새 계산기의 승인 원본으로 사용하지 않음. 제안표를 실행 코드에 새 가격표로 복제하지 않음.
- 레거시 제품별 직접 주문 URL과 PayPal 서버의 기존 가격·주문 규칙은 변경하지 않음. 새 구매 진입 화면의 문의 전환과 기존 직접 URL의 유지가 구분됨. 기존 경로를 폐쇄하려면 별도 운영 결정 필요.
- 공급/운송/수입/결제 가능 상태가 가격 승인만으로 추가 승인되지는 않음.

## 8개 시장 대조
아래는 로컬 기존 코드 기본값과 getMarketUnitPrice 결과이다. 운영 DB 값·승인 문서 확인 결과가 아니며 운영 적용을 주장하지 않는다.
|시장|기존 화면 통화|클렌징 3 SKU 각각|350g|500g|사용자 제안 클렌징/350g/500g|
|---|---|---|---|---|---|
|SG|SGD|foam-oil: 8.9, foaming-cleanser: 8.9, cleansing-water: 8.9|21|46|8.9 / 21 / 46|
|JP|JPY|foam-oil: 1033.85, foaming-cleanser: 1033.85, cleansing-water: 1033.85|2400|5200|1200 / 2700 / 5800|
|HK|HKD|foam-oil: 55, foaming-cleanser: 55, cleansing-water: 55|128|280|55 / 130 / 290|
|TW|TWD|foam-oil: 211.27, foaming-cleanser: 211.27, cleansing-water: 211.27|480|1050|240 / 560 / 1210|
|TH|THB|foam-oil: 234.19, foaming-cleanser: 234.19, cleansing-water: 234.19|550|1200|240 / 570 / 1250|
|MY|MYR|foam-oil: 28.92, foaming-cleanser: 28.92, cleansing-water: 28.92|68|148|31 / 72 / 156|
|BN|SGD|foam-oil: 8.99, foaming-cleanser: 8.99, cleansing-water: 8.99|21|46|11 / 24 / 53|
|MO|HKD|foam-oil: 55, foaming-cleanser: 55, cleansing-water: 55|128|280|65 / 145 / 310|

- 원본: src/data/v23SiteData.ts의 marketUnitPrices/bulkUnitPrice, src/lib/market.tsx의 markets/getMarketUnitPrice, api/_bulk-data.js 및 api/_markets.js. SG는 shared/page-sales.js가 기존 클렌징 8.99 기본값보다 우선한다.
- JP350g 기존 2400, MOQ20, 48000은 레거시 운영 조건이며 신규 제안2700과 분리. 실제 거래 사례 자체를 일반 승인가격의 근거로 확장하지 않음. 과거 기록 접근·수정 없음.
- JP/TW/TH/MY 클렌징은 명시 시장값이 없어 기존 SG 기본값8.99의 환산 경로를 사용한다. 이 값은 이번 계산기에 사용하지 않음. JP 소수 가격 또한 기존 경로 결과로 기록했으며 이번 작업에서 임의 반올림·승인하지 않음.
- BN/MO 기존 화면·결제 통화는 SGD/HKD이고 제안표는 BND/MOP이다. 단순 숫자 비교 또는 자동 환산으로 대체하지 않음.
- HK 클렌징55가 제안과 같더라도 승인 상태를 추정하지 않음. 다른 7개 시장 승인 자료·청구통화 확정이 필요.

## 산식과 표시
- 통화별 최소단위 parseMinor/currencyDigits 재사용. 할인 반영 판매가격을 최소단위로 반올림한 후 모든 결과에 일관되게 사용.
- 초기 지출 Q*(C+A)+F, 개당 차액 R-C-A-V, 전량 차액 Q*개당차액-F, 현금회수 ceil(I/(R-V)). 일회성 비용 중복 차감 없음.
- 100% 할인은 차액률/현금회수 계산 불가, 음수 차액 유지, 회수수량 초과 경고.
- 진열/예비 배분 도구와 별도로 경제성 계산은 요청 산식대로 구매 전량 판매를 가정한다고 명시.
- 바이어 예상 판매가격은 빈 값으로 시작. 통화 전환·국가별 세율 계산 없음.

## 검증 및 남은 항목
- 빌드 성공, 기존 번들 크기 경고 유지. 총70개 테스트 통과.
- SG350g: 420/개당차액14/40%/전량280/회수12, SG500g: 920/29/38.7%/580/13 확인.
- 추가 입고비·판매비·일회성 비용·할인·음수·0나눗셈·미승인·정밀도·JPY 소수 금지 검증.
- 브라우저: SG 결과와 문의 복사 내용 일치, JP 결과 차단, 모바일390px 가로 넘침 없음 확인.
- 출력/PDF 기능은 기존 구현과 요약 포함을 유지했으나 실제 프린터·PDF 파일 생성 검증은 하지 않음.
- 실제 PayPal, 고객 이메일 수신, 운영 DB 가격, 모든 언어의 실기기 시각 검수는 하지 않음.
- 로컬 URL: http://127.0.0.1:4184/partners?market=SG&lang=ko (도입 도구 → 재판매 → 재판매 경제성 검토).
- 캡처: docs/qa/resale-review. 이번 Preview 및 Production 배포 없음.
