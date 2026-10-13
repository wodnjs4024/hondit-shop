# HONDIT 기능·구조 구현 결과

작성일 2026-10-13 (Asia/Seoul)

## 작업 범위
최신 운영61d0e1d에서 별도 codex/final-sales-tools worktree로 구현. 원래 B/미커밋 변경 보존. 운영 DB·마이그레이션·main push·Production·실제 결제/환불·고객 연락 미수행.

## 기존 활용 / 보완 / 신규
- 활용: React/Vite/라우터, 상품 API/국가가격/SG 승인 규칙, 파트너 소개, 이메일 상담, 주문 폼·서버·PayPal 주소 검증, 캠페인, 승인 partner guide, 지도 SVG 의존성.
- 보완: 헤더3메뉴, 공식 용기·설명 우선 적용, 사용법/조건 분리 유지, 주문 수량 쿼리 보존, 이메일 목적·도입 요약/주소 복사, 파트너 가이드 판매CTA 숨김, UTM 허용 목록.
- 신규: 비교표, 상세 수량 검토, 사업자 도입 배분/차액/인쇄 카드, 정적 판매처 지도/목록, 구매 후 안내 URL. 신규 DB/CRM/견적/AI 없음.

## 테스트
- TypeScript/Vite build 통과(기존 큰 chunk 경고).
- 기존 결제/가격/상담/Preview 테스트33, 언어4, 신규10 =47 통과.
- 모바일6언어×4화면 가로 넘침 없음. 단순 차액135, 배분3+15+2=20, SG23상담 정확히 유지, JP40=96,000 확인.
- 16개 판매처 전체 추출. 공개8카드/5좌표 마커, 키보드 선택 연동 확인.
- 인쇄 버튼 호출 경로 확인. 실제 PDF 저장 결과 미검증(인앱 인쇄 모달 자동화 제한).
- 주요 캡처 docs/qa/. 원본 분석 HTML/이미지는 docs/sources에서 gitignore, 배포 자산으로 사용하지 않음.

## 미확인·제외
- 판매처8개는 주소/현재 운영 대조 미완료·충돌로 공개 제외. 공개3곳 좌표null. 장소 사진 전부 제외. 현재SKU/재고 전부 미확인.
- 실제 주문·결제·환불·이메일 수신·관리자 인증·원어민 감수 미검증.
- 공급 수량/출고/운송/규제 승인 새로 확정하지 않음.
- source 상세: product-source-review-2026-10-13.md; baseline: final-sales-tools-baseline.md.
- Claude 인계: claude-redesign-handoff.md.

## 운영 반영 전
Preview는 쓰기403·PayPal 비활성 상태에서만 확인. Production은 새 승인 후 기존 Git 배포 경로 사용, Preview환경 promote 금지. DB/마이그레이션은 이번 변경과 무관하며 B 후속으로 별도 진행. 실제 PDF 출력·원어민 감수·미확인 판매처 검토는 남아 있음.
