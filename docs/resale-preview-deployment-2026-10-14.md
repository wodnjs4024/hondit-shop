# 재판매 계산기 Preview 배포 — 2026-10-14

- URL: https://hondit-shop-764kwag73-hondit.vercel.app/partners?market=SG&lang=ko
- 배포 ID: dpl_hUwhvPRURB1rjG5aMR5Gnx7gduZM
- 대상: 기존 hondit/hondit-shop 프로젝트의 Preview, Ready 확인.
- 소스: codex/sales-structure 작업 공간의 현재 미커밋 변경 포함 스냅샷. HEAD 1a17bde만의 배포가 아님.
- Production 배포/main push/운영 DB/마이그레이션/실제 결제/고객 연락 없음.
- 기존 Vercel 인증 보호 유지. 서버 기본 VERCEL_ENV=preview, 빌드 VITE_VERCEL_ENV=preview 및 기존 파트너 데모 설정 사용.
- 결제 설정 checkoutEnabled=false, clientId 빈 값 확인.
- 제주 예약 및 결제 비활성 확인. 제주500g 제안가격 비노출, 선택 비활성 확인.
- 결제 생성/Capture/Webhook/시도 갱신/문의/상품/리뷰/관리자 설정/제주 쓰기 요청 9개 모두403 확인. 검증 요청은 빈 본문 사용.
- 배포된 브라우저 계산기 SG350g 판매가35: 매입420, 전량차액280, 개당14, 차액률40%, 회수12 확인.
- 로컬 빌드 성공 및72개 테스트 통과 상태를 배포. 실제 결제·환불·메일수신 검증은 수행하지 않음.
- 검증 JSON과 화면: docs/qa/resale-preview/.
