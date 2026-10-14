# HONDIT QA 인계서 후속 수정 결과 — 2026-10-14

## 범위와 현재 상태

첨부 QA 보고서·인계서·ZIP의 콘솔 증거를 기준으로 기존 구조를 보완했다. 디자인 개편, 신규 페이지·CRM·DB·예약·결제 시스템은 추가하지 않았다. 이번 작업은 로컬 수정·검증이며 Production에 반영하지 않았다.

- 브랜치: `codex/qa-handoff-fixes`
- 기준 HEAD 및 확인한 원격 main: `17ce42b23eb8e809b3c3e13ebe3715b053ec66a7`
- 새 커밋·main push·Preview/Production 배포 없음.
- 이전부터 있던 미추적 보고서·가격복원 자료·검증 자료를 보존. 원래 작업 공간의 B 구현 미변경.
- API 서버·승인 가격 원본·판매 허용 시장·과거 주문/결제/견적·제주 수령 가격·PayPal 운영 설정·DB·마이그레이션 미변경.

## P0 원인 확인과 수정

첨부 콘솔의 `Can not register multiple components with the same tag` 및 `window.paypal.Buttons is not a function`과 기존 코드를 대조했다. 이전 주문 화면은 수량이 문의 상태로 바뀔 때 SDK 스크립트와 window.paypal을 제거하고, 20개로 돌아오면 SDK를 다시 부트스트랩했다. 스크립트 요소 제거가 SDK 내부 등록 해제를 보장한다고 가정한 상태에서, Buttons 생성의 동기 예외도 React effect 밖으로 전파될 수 있었다.

SDK 로드는 설정별 Promise로 재사용하고, 수량·언어 전환에서는 버튼 인스턴스만 닫는다. 새 렌더마다 별도 DOM 호스트를 사용하여 오래된 정리가 새 버튼을 지우지 않게 했다. Buttons 존재 검증, 생성·렌더·close 실패, 로딩 실패·시간 초과를 결제 영역의 오류 안내로 처리한다.

PayPal 공식 구현에서도 버튼 인스턴스의 close, 생성 예외, 비동기 render 실패를 구분한다. 참고: [PayPal react-paypal-js 공식 소스](https://github.com/paypal/paypal-js/blob/main/packages/react-paypal-js/src/components/PayPalButtons.tsx).

이전 배포 검수에서는 SDK 실행을 차단했기 때문에 SDK 재진입 오류를 확인하지 못했다. 이번에는 중복 부트스트랩을 오류로 만드는 로컬 SDK 모형, 상태 왕복, 생성·렌더·정리 실패를 회귀 검증에 추가했다. 운영 PayPal SDK나 실거래를 실행해 검증했다는 의미는 아니다.

## QA별 처리 결과

|항목|상태|결과|
|---|---|---|
|QA-01|로컬 수정·검증|설정별 SDK 단일 로드, namespace 분리, 버튼 인스턴스 close, 생성·렌더·정리 예외를 결제 영역에서 처리. 실제 운영 SDK 검증은 미수행.|
|QA-02|로컬 수정·검증|혼합 상단 단일상품 조건표 제거. 상단·하단·메일초안에 선택 합계30/HKD1650 일치.|
|QA-03|로컬 수정·검증|허용 SKU·10개 단위 구성만 mix URL에 직렬화. 새로고침·HK/MO·언어 전환 보존.|
|QA-04|로컬 수정·검증|국가명 동적 소개를 정적 번역 템플릿과 결합. 8시장×EN/KO/JA/ZH 목록 검증.|
|QA-05|로컬 수정·검증|번체 출력 정규화 및 보고서의 주요 용어·문장 교정. 전 상품 라벨·이미지 내 문구의 원어민 전수 검수는 아님.|
|QA-06|로컬 수정·검증|기존 정책 제목·본문 전체 JA/ZH 번역. 7일·5~10영업일 등 원문 기간과 예외 보존.|
|QA-07|로컬 수정·검증|실제 허용·노출 상품 수와 CARE 유무로 상품 수·소개 연동. CN 추가 없음.|
|QA-08|로컬 수정·검증|고정가·포함배송·직접결제 단정 대신 상품·수량별 조건 확인 안내. 비SG 배너도 최종조건 확인 안내.|
|QA-09|로컬 수정·검증|재판매 링크에 목적 resale와 기존 계산기 앵커 전달. 기존 도구·계산기 자동 펼침.|
|QA-10|로컬 수정·검증|Partners 요청 블록 하나로 통합. 미승인 참고금액과 계산 미지원 구분.|
|QA-11|로컬 수정·검증|legacy·내부설정 대신 참고가격·최종금액 확인 안내. 승인 데이터 값은 미변경.|
|QA-12|로컬 수정·검증|바이어 관점의 결제링크 요청 문구. 수동 결제 fallback도 동일 다국어 문의 템플릿 사용.|
|QA-13|운영자 확인 대기|제주 수령·수동 PayPal 링크의 취소·하자·환불 적용 범위 미확정. 기존 정책을 임의 확장하지 않음.|
|QA-14|로컬 수정·검증|일반주문 최소20개와 추가1개 분리. 클렌징10개 추가단위 유지. 디퓨저 비유효 수량 오류 한 번.|
|QA-15|로컬 수정·검증|제주 표·선택·복사 문구의 1 unit / 2 units 처리.|
|QA-16|로컬 수정·검증|BN/MO 참고표시통화와 최종청구통화 확인을 구분. 국가 선택의 고정통화 라벨 및 배너 확정청구 인상 제거.|
|QA-17|공급사·운영자 확인 대기|pH·성분·무향·비교 주장·사용량·주의사항 승인 증빙은 제공자료만으로 검증 불가. 신규 주장을 만들지 않음.|
|QA-18|로컬 수정·검증|OUR JEJU 지도 구현 설명을 고객용 여행 소개로 교체.|

## 번역·정책 보존

기존 정책의 69개 정적 문구와 동적 국가·통화·연락처 문장을 JA/ZH로 번역했다. 본문을 요약으로 대체하지 않았다. 환불 신고 7일, 환불 반영 5~10영업일, 발송 후 배송 3~5영업일 등 기존 원문 기간을 보존했다. 배송 가이드의 기존 준비·배송·전체 기간을 새로 변경하지 않았다.

번체 정규화는 선택된 번체 출력에만 적용하고 JA/KO/EN 원문을 변경하지 않는다. 보고서에 나온 핵심 용어·소개 문장을 별도로 교정했다. 홍콩식 공통 번체 표현이 기본이며, 모든 지역 표현에 대한 외부 원어민 검수나 법적 적합성 판단을 완료한 것은 아니다. 말레이어·태국어 정책 본문의 기존 영어 안내는 이번 4개 언어 범위 밖으로 유지했다.

## 판매조건 보존

- SG 350g 체험10개230 / 일반21×수량, 500g 체험10개500 / 일반46×수량 보존.
- 공개 수량10개/20개 이상, 일반1개 증감, 11~19개 차단 보존. 15개 독립 상품 추가 없음.
- SG10개·추가수량·다품목의 배송 확인 전 결제 요청 유지. SG 혼합 MOQ 활성화 없음.
- HK/MO 혼합 구성·가격은 기존 조건을 표시하지만 승인·결제 활성 상태를 변경하지 않았다. 미지원 시장에 혼합 결제 경로를 추가하지 않았다.
- 일본 기존2400/48000과 다른 국가 기존/제안 가격, CN 제외, 제주350g18000 및500g 미승인 비노출 보존.
- 내부 원가·EMS·수익률을 공개 코드·API에 추가하지 않았다. 새 환율·청구 금액을 만들지 않았다.

## 검증 결과

- `npm run build`: 통과. 기존 대형 번들 경고 유지.
- `node --test tests/*.test.mjs`: 92개 통과. 기존 결제·미승인 조건 차단·주소·주문 계산·클렌징·제주 수령 회귀 포함.
- PC1440/모바일390 브라우저: 102개 시나리오 통과.
- SDK API 누락·네트워크 실패·시간 초과 및 모바일 터치 에뮬레이션: 4개 통과.
- 혼합 수량 44px 터치 대상·1650→2200→1650 및 가로 넘침: PC/모바일2개 통과.
- 브라우저 합계108개 시나리오. 페이지 실행 오류0, 쓰기 요청0.
- 20→21→20,20→10→20,15/19→20,시장·언어 변경, 버튼 생성·렌더·정리 실패에서도 화면 유지.
- 혼합10+10+10=30/HKD1650의 상단·하단·메일초안 일치 및 새로고침·언어·HK/MO 전환 보존.
- 재판매 링크 자동 펼침·목적 선택·상품500g/35개 인계, 비SG 요청 블록1개 및 미승인 계산 미노출.
- 8개시장×4개언어 상품목록 및 JA/ZH 4개 정책 본문 검증.
- 터치 메뉴 열기·닫기, inputMode numeric, ±1, 고정 메뉴가 주요 행동을 가리지 않음, 가로 넘침 없음 확인.

모든 브라우저 상품·설정·SDK 응답은 로컬 모의 응답이다. 외부 SDK 실행·PayPal 주문 생성·Capture·환불·DB 저장·메일/메신저 발송·QR 스캔·수신은 수행하지 않았다. 모바일은 Edge의 viewport 및 touch/isMobile 에뮬레이션이며 실기기 키패드·Safari·메신저 앱은 미검증이다.

## 확인이 필요한 운영 자료

1. 제주 현장 수령 및 메시지 협의 후 PayPal 링크 거래의 취소 시점·하자 대응·환불 범위와 적용 정책. 기존 사이트 정책을 이 거래에 자동 확대하지 않았다.
2. 실제 계약 판매 주체와 반품·연락 정보의 확정 자료. 기존 공개 등록번호의 진위·법적 완전성을 검증했다고 보고하지 않는다.
3. 상품별 공급사 라벨·성분·pH·무향·비교 주장·사용량·주의사항의 승인 증빙. 확인 전 새 상품 주장을 추가하지 않는다.
4. 계정 소유자의 메신저 열기·친구추가·QR 스캔·수신 및 실제 결제 검증. 이는 공개 운영 QA에서 임의 실행할 항목이 아니다.

## 변경 파일

- `shared/contact-copy.js`
- `src/components/BusinessPlanner.tsx`
- `src/components/PaymentRequestPanel.tsx`
- `src/components/PickupRequestPanel.tsx`
- `src/components/ProductSalesSummary.tsx`
- `src/components/QuantityReview.tsx`
- `src/components/ResaleCalculator.tsx`
- `src/components/v23/SiteChrome.tsx`
- `src/lib/market.tsx`
- `src/pages/BulkOrdersPage.tsx`
- `src/pages/BulkProductPage.tsx`
- `src/pages/PartnersPage.tsx`
- `src/pages/PolicyPage.tsx`
- `src/pages/ProductsPage.tsx`
- `src/styles/sales-structure.css`
- `tests/page-preview.test.mjs`
- `tests/resale-economics.test.mjs`
- `tests/site-localization.test.mjs`
- `shared/mix-selection.d.ts`
- `shared/mix-selection.js`
- `shared/qa-copy.d.ts`
- `shared/qa-copy.js`
- `src/data/policyTranslations.ts`
- `src/lib/paypalSdk.ts`
- `src/lib/traditionalText.ts`
- `tests/qa-handoff.test.mjs`

## 검증 자료와 로컬 확인

- `docs/qa/qa-handoff-20261014/browser-results.json`: 102개 브라우저 결과.
- `edge-case-results.json`, `mix-touch-results.json`: 실패 처리·터치 검증.
- `qa-handoff-tests.log`, `qa-handoff-build.log`: 최종 테스트·빌드.
- `findings.json`, `changed-files.json`: QA 항목 및 변경 목록.
- `checkout-reentry-1440.png/390.png`, `mixed-1440.png/390.png`, `policy-1440.png/390.png`, `mobile-touch.png`: 대표 화면.

로컬: http://127.0.0.1:4190/products?market=JP&lang=ja

로컬 미리보기 서버에는 운영 API가 연결되어 있지 않으며 결제 설정 조회가 실패하면 결제 진입을 제한한다. SDK 성공/실패 검증은 별도 자동화에서 모의 응답으로 수행했다. Production의 P0 수정 반영은 별도 배포 승인이 필요하다.
