# 사업자 비주얼·통관 안내·제주 수령 개선 — 2026-10-15

## 범위와 상태
- 브랜치: `codex/checkout-flow`, 시작 커밋 `9cb1632`(최신 운영 기준).
- 기존 미추적 QA/배포 보고서는 보존. 로컬 main 미커밋 작업, B 구현, 별도 디자인 worktree 변경 없음.
- 이번 작업은 로컬 구현·검증이다. 운영/Preview 배포, main push, DB/마이그레이션, 실제 결제·환불·고객 연락 없음.

## 반영
1. Partners 메인 제품 단독 사진을 숙박·웰니스·카페 공간 콜라주로 교체. 업종 활용 중심 소개 문구를 기존 6개 언어에 연결. 실제 고객 사례를 만들지 않고 AI 공간 연출 예시로 명시. 기존 주문·추가 요청·상품 보기 버튼, 가격표·계산기·검토 도구 유지.
2. ProductSalesSummary의 강한 세금·수취인 부담 행 제거. 결제 합계 옆 반복 설명은 배송·통관 안내 링크로 변경. BusinessPlanner 화면/복사 문구는 국가별 정책에 따른 비용 가능성으로 중립화. Shipping 하단에는 중립 설명과 실제 선납되지 않는 조건을 함께 유지. 고객 비용 부담을 HONDIT 부담으로 바꾸지 않음. 서버 주문 스냅샷의 tax/recipient 조건 변경 없음.
3. 상단 주 메뉴 및 모바일 빠른 링크에 제주 수령 노출. 모바일 메뉴 중복 제거. 홈의 기존 구매 경로 항목에 제주 여행 일정에 맞춘 수령 설명 추가(홈 히어로·영상·섹션 순서 유지). 구매 가능한 350g 상품 카드에 별도 KRW 수령 링크 추가. 해외 주문 진입부에 제주 수령 안내 추가.
4. 제주 수령 전용 소개: 여행객·단기 체류자 대상 문구, 기존 제주 해안 사진, 350g 가격·지정 장소 전달·사전 일정 조율·문의 버튼. 기존 PickupRequestPanel을 그대로 연결하고 수량/요청 복사/메신저/QR 동작 유지. 별도 예약·DB·선결제 기능 추가 없음.

## 가격·거래 기능 보존
- 제주 350g 18,000원 × 1~3개 유지. 500g은 승인 대기 상태 유지하며 공개 빌드의 40,000원 제안가격 비노출·선택 비활성 유지.
- SG 디퓨저 10개 및 20개 이상 직접결제, 단가·배송비 포함 조건 유지. 다른 국가/클렌징/Shopee 가격과 일본 과거 거래 변경 없음.
- api/, shared/checkout-terms.js, 결제 생성·Capture·운임 계산 코드 변경 없음.
- 수령 링크에는 시장·언어를 유지하되 해외 묶음 수량·통화·배송주소 폼을 제주 수령에 전달하지 않음.

## 변경 파일
- `src/pages/PartnersPage.tsx`, `src/pages/JejuPickupPage.tsx`, `src/components/PickupIntroduction.tsx`
- `src/pages/ShippingPage.tsx`, `src/pages/BulkProductPage.tsx`, `src/components/ProductSalesSummary.tsx`, `src/components/BusinessPlanner.tsx`
- `src/components/home/HomeChrome.tsx`, `src/components/home/ProductTile.tsx`, `src/pages/HomePage.tsx`, `src/pages/BulkOrdersPage.tsx`
- `src/data/salesPresentationCopy.ts`, `src/styles/sales-presentation.css`, `src/main.tsx`
- `public/images/partners-spaces-concept.png`, `public/images/ATTRIBUTION.md`

## 검증
- 기존 전체 테스트 98개 통과. 기존 번들 크기 경고 유지, 로컬 빌드 통과.
- 브라우저 66개 검증: 1440/768/390px, 한국어·영어·일본어·번체중국어·말레이어·태국어. 가로 넘침 0, 페이지 JS 오류 0, 제목 2줄 이내.
- 제주 수령 3개 54,000원 및 구매 요청 문구·실제 클립보드 복사 확인. MO 선택 시에도 KRW 유지. 해외 주소·MOQ·PayPal 없음. 500g 승인 대기·가격 비노출 확인.
- 해외 350g SG35개 S$735 및 PayPal UI 모의 표시 유지. 모든 쓰기 요청 차단 상태로 검증.
- 상단 메뉴·모바일 빠른 링크·상품 카드·주문 진입부 노출 확인. 통관 정책의 실제 비용 의미 보존 확인.
- 스크린샷과 결과: `qa/sales-presentation-20261015/`.

## 디자인 검수와 범위
design-taste-frontend의 단일 섹션 보완 규칙을 적용하여 새 방향 추첨이나 DESIGN.md 교체 없이 기존 색상·폰트·레이아웃을 유지했다. Impeccable의 clarify/craft-floor, imagegen을 적용했다. 새 파일 source lint는 0 FAIL/0 WARN.

전체 페이지 자동 디자인 진단은 6 FAIL/5 WARN을 반환했다. 공통 QR/푸터를 eyebrow로 오인하는 항목, 기존 얇은 구분선, 승인된 브랜드 팔레트, 구매 안내에 4개 사진/8개 모션을 요구하는 항목 등이다. 이번 요청이 홈 유지·기존 체계 보존이므로 해당 취향 기준을 맞추기 위해 공통 디자인·연락처 기능을 재작성하지 않았다. 기존 한국어 웹폰트 fallback 경고도 별도 범위로 남겼다. 이를 자동 디자인 진단 전체 통과로 보고하지 않는다. 새 소개의 버튼 강조·모바일 메뉴 중복을 한 번 보완한 뒤 최종 화면을 확인했다.

## 미검증 및 인계
실제 결제·메시지 발송·실기기 Safari 검증은 미실행. 다국어 문구는 기존 지원 체계를 따라 작성했으며 원어민 감수는 미실시. AI 콜라주는 실제 납품 사례가 아니며 이 구분을 유지해야 한다. 제주 사진에 공식 인계 장소 주소/마커를 붙이지 않는다. 문의 버튼은 기존 메시지 요청으로 연결하며 복사/앱 열기를 주문 확정으로 표시하지 않는다.
