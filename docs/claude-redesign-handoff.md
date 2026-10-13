# Claude 리디자인 인계 — HONDIT

작성일: 2026-10-13. 기능 구현 브랜치 codex/final-sales-tools. 기준 운영 커밋 61d0e1d.

## 목적 및 경계
이번 변경은 기존 React/Vite/React Router 사이트의 기능 통합이다. 이후 CSS/배치/타이포 리디자인은 가능하되 아래 계산·조건·전환·출처·언어·URL 계약을 보존한다. 새로운 DB·CRM·견적 DB·AI·무역서류 시스템은 포함하지 않았다. 운영 적용·main push는 별도 승인 대상.

## 구조와 URL
- src/App.tsx: 기존 URL, 캠페인 /sg/ig /sg/fb /sg/c01 /hk/* /jp/* /tw/* 유지.
- 헤더: 상품 / 매장·사업자 도입 / HONDIT 소개. 홈은 로고. 배송/정책/연락처는 푸터.
- /products/:productId: 기존 상품 영웅 이미지·판매조건·Shopee·대량주문 버튼·SG 갤러리 재사용.
- /partners: 기존 파트너 페이지의 소개 → BusinessPlanner → 목적 안내/절차/FAQ. 신규 CRM 화면이 아님.
- /jeju/stores: 공급사 등록 판매처 지도와 목록. HONDIT 파트너 목록과 별개.
- /guide/:productId: 제품 설명·사용·관리·재주문 상담. 주문 완료 및 상품 상세에서 연결.
- /partners/:slug: 기존 승인 파트너 전용 안내. shared/partners.js의 approvedPartners만 공개. 현재 빈 목록이며 신규 파트너를 임의 추가하지 않음. Preview demo는 명시적 환경 분기뿐.
- /bulk-orders/:slug, /contact: 기존 구매 및 이메일 상담. 새 견적 화면 아님.
- vercel.json: /jeju/stores, /guide/* 새 경로를 SPA로 rewrite. 기존 partner HTTP404 처리 유지.

## 컴포넌트 계약
| 파일 | 역할 | 리디자인 때 유지할 것 |
|---|---|---|
| src/components/QuantityReview.tsx | 상품 상세 수량별 상품금액/구매·상담 링크 | 선택 수량과 시장·언어를 다음 경로에 보존 |
| src/components/ProductFactsDisplay.tsx | 공통 디퓨저 비교표와 관리 안내 | 350 유리/500 옹기, 공식 W×H×D, 표시 용량/포장중량 분리 |
| src/components/BusinessPlanner.tsx | 목적/국가/상품/수량, 요약, 배분, 차액, 매장 카드 | 한 흐름, 상태 React 메모리만, 서버 쓰기 금지 |
| src/components/ProductSalesSummary.tsx | 기존 단가/MOQ/최소/배송/세금 표시 | getMarketUnitPrice, sgTerms 재사용 |
| src/components/ConsultationPanel.tsx | 이메일 초안/내용 복사/주소 복사/선택 입력 | lines/presetPurpose/summaryDetails 모두 본문에 반영. 접수 완료로 표현하지 않기 |
| src/pages/JejuStoresPage.tsx | 정적 지도/목록 | 마커·카드 선택 연동/키보드 접근/지도 실패 시 목록 |
| src/pages/ProductGuidePage.tsx | 구매 후 제품 안내 | 현재 조건 재확인 상담, 자동 재주문 없음 |
| src/styles/sales-tools.css | 최소 기능/반응형/인쇄 | 카드만 인쇄, 가격·요약·다른 페이지 요소 제외 |

## 데이터와 계산 — 필수 보존
- 상품/시장별 기존 가격 흐름: GET /api/products → src/lib/storefrontApi.ts → src/lib/market.tsx. SG는 shared/page-sales.js sgTerms가 승인값 우선. 서버 api/_markets.js와 기존 검증 유지.
- SG 클렌징 3 SKU: 890 minor / MOQ30 / 26700 minor. 350g:2100/MOQ20/42000, 500g:4600/MOQ20/92000. 일본 기존350:2400/MOQ20/48000. 다른 시장/소매/과거 기록 불변.
- shared/sales-tools.js: 표시 통화의 정수 최소 단위 계산, 정수 수량 1~9999, 배분 합계, 단순 차액. JPY 소수0, SGD 소수2. ISO 통화 자릿수 기준 검토 계산이며 기존 PayPal 통화 포맷은 별도 서버 책임.
- reviewCheckout은 고객 안내용 후보 판별만 한다. 최종 stock/수량/통화/승인/PayPal 가능 여부는 기존 주문 화면 및 서버가 결정. 클라이언트 값을 신뢰하는 새 결제 경로 없음.
- SG는 단일 SKU 정확한 MOQ만 기존 직접 구매로 안내. 추가 수량·혼합은 상담. 기존 HK/MO 혼합 경로를 변경하지 않는다.
- 수량 배분은 진열·판매·예비의 합이 선택 수량과 항상 같고 음수·소수 배분 금지. 판매 수량 조정 시 예비 수량이 조정됨.
- 차액 = 고객 입력 판매단가 - 현재 HONDIT 대량 구매 단가. 합계는 판매 배분 수량만 곱함. 운송/세금/관세/수수료/할인/진열재고/손실 미포함, 순이익·수익 보장 아님. 음수 차액도 표시.
- 같은 통화끼리만 비교하며 환율을 새로 만들지 않는다. MY/BN/MO 등 결제 통화를 새로 활성화하지 않음.
- src/data/productFacts.ts: 공식 제품 정보 원본, 해외 가격/배송 박스 데이터 없음. API·DB의 오래된 상품 설명이 새 소재 안내를 덮지 않게 상세/대량주문/카드에서 우선 적용.
- src/data/jejuStockists.json: 검토 후 공개 8곳. 좌표5곳, 나머지 좌표null. 정확하지 않은 값 생성 금지. 전체16곳 검토 원본은 docs/sources/stockist-verification.json.

## 주문·상담·QR
- 비회원 결제, 상담 상태 배송 필드 hidden+disabled, 선택 입력 details 접힘, 전환 중 기존 form state 보존.
- 상품 상세 선택 수량은 quantity 쿼리로 이동. BulkProductPage에서 기존 normalizeBulkQuantity로 검증하고 서버 검증은 그대로.
- 미승인 수량을 숫자만 바꿔 신규 직접결제로 허용하지 않기. 상담에서는 정확한 희망 수량을 그대로 복사.
- 주문 저장 주소 = PayPal 전달 주소, Capture의 금액·통화·배송주소 검증/완료 상태 보호 유지. 이번 작업의 api/ 변경 없음.
- 매장 카드: 제품·언어·선택 매장명, 공개된 사용법/주의사항. 도매가/결제 링크/파트너 승인을 추론하거나 QR을 발급하지 않음.
- PartnerGuidePage는 도매가·직접결제·모바일 구매CTA·배송 판매배너 비노출. 승인 slug 서버404 정책 유지. 매장 구매 안내가 기본.
- guide URL에 주문 ID나 개인 정보를 넣지 않는다. 재주문은 현재 조건 확인 상담.
- 문의는 이메일 경로. 이메일 앱 실행/복사는 접수가 아니다. 복사 실패 시 선택 가능한 본문과 이메일 주소를 표시.
- 기존 UTM·캠페인 수집 유지. /contact,/partners URL의 허용 목록에 UTM을 보존하되 free text/contact details는 제외.

## 언어
- 현재 선택 언어: en, ko, zh-HK, ja, ms, th. zh/zh-TW 기존 별칭 유지.
- shared/sales-tools-copy.js → marketText. 기존 shared/storefront-copy.js / sales-copy.js와 함께 사용.
- 새 문구를 JSX 영어 하드코딩으로 추가하지 않는다. 카드 언어는 사이트 언어와 독립 선택 가능.
- 고유 매장명은 한국어 원문과 영문명 병기. 이미지 내 영어·법률 원문·과거 주문 스냅샷은 임의 변조하지 않음.

## 사용 가능한 이미지
- public/images/diffuser-350g.webp, diffuser-500g.webp (기존 실제 제품)
- public/images/product-details/diffuser-350g-sg/*.jpeg (기존 SG 갤러리)
- public/videos/stonejeju-use-loop.mp4, public/images/stonejeju-diffuser-product.png (기존 홈 섹션)
- public/images/foam-oil.webp, foaming-cleanser.webp, cleansing-water.webp
- public/images/hondit-pack/hondit_codex_image_pack/01_product_originals/ (기존 실제 원본 확인 후 사용)
- public/images/ATTRIBUTION.md 및 pack/PHOTO_CREDITS.csv 출처 확인.
- StoneJeju 별도 로고 파일 미확인: 임의 제작 금지. 현재 브랜드명 텍스트 사용.
- 매장 외부 사진 사용권 미확인: 공개 화면에 넣지 않음. AI 제품 사진으로 대체 금지.

## 검증/재현
```
npm ci --ignore-scripts
npm run build
npm run test:payments
npm run test:localization
npm run test:sales-tools
npm run preview -- --host 127.0.0.1 --port 4182
```
- 테스트 47개, TS/Vite 빌드 성공. 기존 큰 번들 경고 남음.
- 로컬 6언어×4신규 화면 모바일(390px) 가로 넘침 없음.
- SG23 상담 보존, 일본40개=96,000 기존 규칙 확인. 실제 결제 없음.
- 배분3/15/2 합계20, 단가21 대비 입력판매가30 → 판매15개 단순 차액135 확인. 실제 매출 가정/보장 아님.
- 지도5마커/8카드, 키보드 Enter 선택 연동 확인.
- 인쇄 window.print 호출과 전용 CSS 적용 경로 확인. IAB 인쇄 모달 자동화 제한으로 실제 PDF 페이지 수·출력은 미검증.
- docs/qa/ 캡처 참조. 실제 결제·환불·고객연락·운영DB·배포·main push는 금지.

## 미확인 사항
공개 제외8곳의 현재 운영/정확한 위치, 공개 목록 중3곳의 좌표, 개별 판매처 현재 SKU/재고, 공급 수량/출고 일정, 운송·규제 승인, 실제 이메일 수신·PayPal 완료·인증 관리자 전체, 원어민 번역 감수 및 실제 PDF 출력. 출처보고서에서 상세 원인 확인.
