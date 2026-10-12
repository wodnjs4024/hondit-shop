# 홈·파트너 페이지 내용 보강

## 작업 기준과 범위
- 브랜치: codex/sales-flow-revision. 기준 커밋: 4f88e38df738048afcbb18d6bf5ed8a75570fdff.
- 작업 시작 시 이 worktree는 깨끗했음. 원본 checkout의 미커밋 변경과 B 구현은 건드리지 않음.
- 운영 DB·마이그레이션·서버 결제 로직·Production·main push 변경 없음.

## 변경 파일
- src/pages/HomePage.tsx: 기존 이미지 중심 첫 화면, 목적별 동선, 상품 비교. h1은 하나로 유지.
- src/pages/PartnersPage.tsx: 상품 이미지, 매장/공간/선물 검토 사항, 4단계 상담 절차, FAQ, 상담 위치 바로가기.
- src/components/SalesDiscovery.tsx: 구매 목적 카드와 시장별 상품 비교표. 기존 가격 포맷/조회 함수와 SG 공통 MOQ 사용.
- src/data/discoveryCopy.ts: 현재 선택 가능한 6개 언어의 신규 문구. 기존 중국어 별칭도 처리.
- src/styles/v23.css: 반응형 배치, 표 내부 스크롤, 키보드 포커스, 파트너 화면 구성.

## 검증
- TypeScript 및 Vite production build 통과. 기존 큰 chunk 경고 유지.
- 기존 결제/가격/Preview 안전성/상담 테스트 33개 통과.
- 로컬 빌드 화면: SG 단가 8.90/21/46, 최소 상품금액 267/420/920 확인.
- JP 350g 2,400 및 48,000 유지 확인. JP 화면 상품 범위 기존 필터 재사용.
- 390×844 파트너 6개 언어 가로 넘침 없음. FAQ 펼침 확인. 상품 이미지 로드 확인.
- 홈 SG 데스크톱, JP 모바일 가로 넘침 없음. 비교표는 모바일에서 표 영역만 가로 스크롤.
- 로컬 개발 서버는 기존 의존성 @babel/types 누락으로 실행 실패하여, 정상 빌드된 dist를 Vite preview로 검증함.

## Preview
- https://hondit-shop-smh43o92f-hondit.vercel.app
- ID: dpl_FnuT2JUydurwRbdPJvnv2K4B5erV
- 기존 Vercel 인증 보호 유지. VITE_VERCEL_ENV=preview, VITE_PARTNER_DEMO=1, PARTNER_DEMO=1로 배포.
- Production 배포 아님. 실제 결제·문의 발송·운영 쓰기 미수행.

## 미검증 및 주의
- 실제 결제, 이메일 수신, 관리자 인증 전체는 검증하지 않음.
- 추가 번역의 원어민 감수 미수행.
- 홈·파트너 보강에 한정하며 상품 상세 전체 재구성은 이번에 변경하지 않음.
- 새 가격·실적·후기·보장 조건은 생성하지 않음. 모든 상품 사진은 저장소 기존 자산 사용.

## 원격 Preview 확인
- Ready 상태 확인. 실제 Preview 홈의 신규 섹션과 SG 가격 표시 확인.
- GET /api/paypal/config: checkoutEnabled=false, clientId 비어 있음 확인.
- 빈 POST /api/paypal/create-order: 403 차단 확인.
