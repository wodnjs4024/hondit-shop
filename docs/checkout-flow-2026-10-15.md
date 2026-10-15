# 결제 동선 최적화 — 2026-10-15

## 기준과 작업 보존
- 기준 Production: 8bdfbb3c32126cafe233c76a17104de086d8c87d / dpl_5kWuKLw4gGqDuAG2bpgW9ty2LBLp.
- 앞선 미디어 배포0483492 이후 Claude 리디자인이 운영에 반영된 것을 확인하여 최신 운영 기준에서 작업했다.
- 브랜치 codex/checkout-flow, 별도 worktree C:/Users/user/OneDrive/문서/hondit-shop/_codex_work/checkout-flow.
- 루트의 미커밋 B 구현, sales-structure, Claude home-redesign 작업과 Preview를 보존했다. 기존 폴더에서 파일을 되돌리거나 덮어쓰지 않았다.
- Impeccable clarify와 craft-floor를 적용. context를 로드하고 현재 DESIGN.md/컴포넌트의 화면 체계를 유지했다. 이번 작업은 결제 동선 보완이며 리디자인 재작성이나 신규 상담 시스템이 아니다.

## 변경
1. PC/모바일 메뉴의 주문 진입을 '주문·결제'로 명시. 모바일 상품 상세에서 상품·수량·국가·언어·기존 URL 선택값을 주문 페이지로 전달.
2. 상품·수량 선택 화면에 'PayPal 바로 결제 가능' / '결제 전 조건 확인 필요'를 공통 거래조건 판정에 따라 표시. 직접결제는 배송정보→PayPal, 미확정 조건은 현재 선택으로 PayPal 링크 요청에 연결.
3. 구매 진입 화면에서 선택→배송→PayPal 순서와 현재 직접결제 범위를 안내. 추가 수량·다품목·미확정 국가에는 배송주소 입력을 강요하지 않음.
4. 배송정보 확인 후 PayPal 영역으로 이동하는 버튼 및 직접 이동 링크 추가. Enter 제출 시 기본 페이지 전송을 막고 같은 검증을 수행하여 주소가 URL로 전송되지 않음.
5. PayPal SDK onClick에서 필수 입력·주소·최종 확인을 검증해 잘못된 입력은 actions.reject로 차단. 기존 createOrder의 재검증 및 서버 검증 유지.
6. 수량·시장·상품 변경 시 금액 확인 체크 초기화. 배송정보는 유지하고 SDK 중복 로딩 방지 구조 유지.
7. 취소하면 현재 배송정보와 주문 화면을 유지해 다시 진행 가능. 생성 실패는 입력을 보존해 인라인 안내. 캡처 상태 불명확 시 기존 확인 대기 화면으로 이동해 중복 결제를 권하지 않음.
8. 결제 진행 상태 안내와 카드 제공 여부가 구매자·PayPal 환경에 따라 달라짐을 표시. 반복 도움말은 접고 빈 선택 항목의 요약을 줄임.

## 가격·결제 가능 범위
- 현재 승인된 SG 기본 단일상품 묶음: 클렌징 각 SKU30개SGD267,350g20개SGD420,500g20개SGD920 직접결제 유지.
- SG10개 체험가격230/500 유지. 배송 범위 확인 전 PayPal 링크 요청 유지.
- 20개 초과·다품목·비SG 조건은 기존 판정대로 결제 요청. 신규 가격·운송·규제·통화 승인을 만들어내지 않았으며 결제 범위를 확대하지 않음.
- JP기존2400/48000,다른 시장·Shopee·제주 수령·과거 거래 변경 없음.
- 서버는 기존처럼 상품·수량·금액·통화·배송주소를 검증. 프런트는 고객 제공 총액을 추가로 보내지 않음.

## 변경 파일
- src/components/CheckoutAvailability.tsx
- src/data/checkoutFlowCopy.ts
- src/styles/checkout-flow.css
- src/components/QuantityReview.tsx
- src/components/home/HomeChrome.tsx
- src/pages/BulkOrdersPage.tsx
- src/pages/BulkProductPage.tsx
- src/main.tsx
- 본 보고서
서버 API·DB 스키마·판매조건 원본·마이그레이션·환경변수 수정 없음.

## 검증
- 타입 검사·빌드 통과. 기존 대용량 번들 경고 유지.
- 기존 회귀 테스트92/92 통과.
- PC1440·모바일390 브라우저116건 통과, 페이지 실행 오류0.
- 로컬 모의 SDK 및 모의 API로 주문 생성→승인→캡처→완료 확인.
- 필수 입력 누락 시 생성0건, 취소 시 입력 유지, 생성 실패 시 캡처0건, 캡처 불확실 시 확인 대기 화면 검증.
- 20→21→20 선택값·가격·확인 체크·SDK1회로딩 유지 검증.
- 8시장×6언어코드(ko/en/ja/zh-HK/ms/th)×2뷰포트에서 상태·PayPal CTA·가로 넘침 확인.
- MO 주문에는 주소·SDK 없음, 선택 조건 요청 유지. 모바일 상세→주문 URL에 상품·수량·시장·언어 보존.
- Preview용 별도 로컬 빌드: API 모의 응답이 live/enabled를 광고해도 SDK0·결제 진행 비활성·쓰기0 확인.
- 실제 PayPal SDK는 공개 운영 설정만 사용한 로컬 읽기 전용 검수 서버에서 PC/모바일 iframe 표시2건 확인. PayPal 버튼 클릭·주문 생성·캡처 없음. SDK의 비GET 요청 차단.
- 로컬 검수 서버의 POST /api/paypal/create-order가403인 것 확인.
- PayPal 입력검증 참고: https://developer.paypal.com/v5/checkout/validate-input/

## 증빙
폴더 docs/qa/checkout-flow-20261015/
- results.json:116건(주문/캡처/완료는 전부 로컬 모의)
- preview-guard.json,real-sdk-readonly.json
- checkout/payment/request 각각1440·390PNG
- real-sdk-1440.png,real-sdk-390.png: 실제 PayPal 버튼 표시만 검증
테스트 스크립트 .qa-tools/checkout-browser.cjs / preview-guard.cjs / real-sdk-readonly.cjs.
화면에 사용한 구매자 정보는 qa@example.invalid 등의 합성 테스트 데이터이다. 실제 고객 데이터는 조회하지 않았다.

## 확인 주소·배포 상태
- 안전한 로컬 읽기 전용 검수: http://127.0.0.1:4196/bulk-orders?market=SG&lang=ko
  공개 상품/결제 설정 GET만 연결, 모든 쓰기·다른 API403. 실제 결제 불가. 상단에 로컬 검수 표시.
- 정적 테스트 서버4194,Preview 차단 검수4195는 개발 검수용.
- Vercel Preview/Production 배포·main push 없음. 운영 DB·고객연락·실제 결제·환불 없음.

## 미검증·운영 적용 전
- 실제 PayPal 승인·금전 캡처·운영 주문DB저장·알림수신은 미실행. 테스트 완료를 실제 결제 완료로 보고하지 않음.
- 실제 iOS Safari와 기기별 카드/게스트결제 제공 여부 미검증.
- 동시 결제 시도·웹훅 재처리·DB 실패 복구 등 B 결제 복구 시스템은 이번 작업에서 도입하지 않음.
- 운영 적용 전 최신main과 Claude 작업을 다시 대조하고 충돌을 보존하며 기존 Git 자동배포 경로 사용. DB마이그레이션 불필요.
- 복구는 배포 직전 정상 코드로만 수행하며 새 거래 기록은 삭제하지 않음.
