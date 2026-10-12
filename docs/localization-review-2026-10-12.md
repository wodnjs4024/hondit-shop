# 고객 화면 번역 누락 점검 및 보완

## 발견한 원인
1. HONDIT 소개·404·주문 완료·후기·일부 푸터 문구가 JSX에 영어로 직접 작성되어 언어 선택을 거치지 않았음.
2. 문의 폼 비활성화·이메일 복사·상품 판매조건 등 추가 문구의 번역 키가 누락되어 영어로 fallback.
3. 기존 말레이어·태국어 사전 및 동적 통화 문구의 번역 범위가 좁았음.
4. 문의 초안의 국가와 지도 국가명이 선택 언어 대신 countryName 영문을 직접 사용했음.
5. 신규 파트너 섹션 제목 PURPOSE/PROCESS/QUESTIONS를 영어로 고정했음.

## 보완 내용
- shared/storefront-copy.js 및 타입 선언: 기존 번역 조회에 보완 사전 연결. 419개 키, 1,321개 언어별 값. 기존 번역과 함께 사용하며 전체 번역 수를 뜻하지 않음.
- src/lib/market.tsx: 사전 우선 조회와 말레이어/태국어 동적 가격·통화·국가 문구.
- src/pages: HomePage, PartnersPage, ContactPage, JejuPage, NotFoundPage, OrderCompletePage, PaymentFailedPage, PolicyPage, BulkProductPage의 표시 연결.
- src/components: v23/SiteChrome, v23/GeoJourney, ProductReviews의 표시 연결.
- 문의 국가·국가 선택 목록의 표시 언어 연결. 원본 거래/상품 데이터 변경 없음.
- 정책 화면에는 해당 언어로 영어 원문 제공 안내를 추가하고 본문에 lang=en을 명시함. 정책 원문은 변경하지 않음.

## 검증
- TypeScript 및 production build 통과. 큰 chunk 경고 유지.
- 기존 결제·가격·Preview 안전성 모의 테스트 33개 통과.
- tests/site-localization.test.mjs 4개 통과: 공개 화면 정적 문구 조회, 상품 데이터, 8개 시장의 동적 문구, 영어 JSX 직접 출력 재발 방지.
- npm run test:localization 추가. 새 의존성 없음.
- 실제 로컬 빌드 화면 6개 언어 × 10개 경로 = 60조합. 제목 로드 후 수정 대상 영어 문구 잔여와 가로 넘침 검사.
- 경로: /, /products, /products/foam-oil, /bulk-orders, /bulk-orders/foam-oil, /partners, /jeju, /shipping, /contact, /missing-page.
- 모바일 390×844 비영어 5개 언어 × 파트너/문의/주문 3경로 = 15조합 가로 넘침 없음.
- 위 브라우저 검사는 대표 정적 문구 탐지이며 모든 API 오류·모든 문구의 원어민 감수를 보장하지 않음.

## 기존 작업 보호
- codex/sales-flow-revision에서 이어서 작업. 앞선 홈·파트너 보강 미커밋 변경을 보존함.
- 원본 checkout의 B 구현, 운영 DB, 마이그레이션, 서버 가격·결제 계산 변경 없음.
- Production 배포 및 main push 없음. 실제 결제·환불·고객 연락 없음.

## 남는 범위
- 정책 본문: 영어 원문 유지. 선택 언어 안내 표시. 번역된 정책으로 보고하지 않음.
- 상품 사진/상세 이미지 안에 삽입된 영문, 브랜드명, 통화 코드, 국제 주소, 원본 구매 후기·과거 주문 상품명은 원문 유지.
- 운영 DB에서 새로 입력하는 자유 문구 및 미등록 API/PayPal 오류는 자동 번역하지 않음. 원어민 감수, 실제 결제 화면, 실제 주문 개인정보 화면 미검증.
- 관리자 화면은 기존 한국어 운영 화면 유지. 고객 언어 선택 대상으로 변경하지 않음.
- 초기 docs/i18n-audit-before.json은 정적 후보 목록으로 브랜드·미사용 컴포넌트·별도 번역 함수·한국어 fallback이 포함되어 있어 실제 오류 건수로 사용하지 않음.

## Preview
- 최초 요청은 Not authorized. CLI 로그인·기존 프로젝트 접근 확인 후 재시도로 새 Preview 생성.
- https://hondit-shop-pzdctfb7u-hondit.vercel.app
- dpl_Ggipa8VoZxaj1DJMKw8A7CXwT99z
- 기존 인증 보호 및 Preview 환경 설정 유지.

## 원격 최종 확인
- Preview Ready, target preview 확인.
- 한국어 문의 제목·이메일 복사 버튼·상담 국가명 싱가포르 및 HONDIT 소개 번역 확인.
- PayPal config checkoutEnabled=false / clientId 빈 값, 빈 create-order POST 403 차단 확인.
