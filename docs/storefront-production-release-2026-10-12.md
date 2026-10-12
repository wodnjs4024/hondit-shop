# 화면 개편 운영 배포 기록

## 승인 범위
검증된 sales-flow-revision Preview의 구매/상담 동선, 홈/파트너 소개, 번역 보완, 디퓨저 영상 섹션 재구성. 운영 DB·마이그레이션 적용, 실제 결제·환불, 고객 연락 제외.

## 배포 전 확인
- 원격 main 및 기존 Production 코드: 841bbe74caaa72037d1f97681c950f92a537c118
- 복구 배포: dpl_81bDoHfvtoTCuNRXQmEVv1KDQdNj (hondit-shop-ivxtp3ywd-hondit.vercel.app)
- 대상: hondit/hondit-shop, GitHub main 자동 배포 사용. CLI Production 배포 중복 실행 안 함.
- Production에 VITE_VERCEL_ENV, VITE_PARTNER_DEMO, PARTNER_DEMO, VERCEL_ENV 사용자 override 없음.
- 운영 DB 스키마 변경 없음. B 구현은 원래 checkout에 보존.
- 별도 worktree의 기존 미커밋 화면·번역 개선은 검증한 Preview와 함께 반영. 원래 checkout 변경은 건드리지 않음.
- 검증 Preview: https://hondit-shop-phfpiccg1-hondit.vercel.app (dpl_5ZGXLAmSHf7Vi85dkvwogzwaAEAF)
- 타입/빌드 통과, 번역 4개 및 기존 규칙 33개 테스트 통과. 기존 큰 번들 경고 유지.
- Preview 결제 비활성/빈 client ID/쓰기 403 확인. Production은 Git 배포의 Production 환경으로 별도 빌드.

## 복구
운영 이상 시 기존 Ready Production 배포를 Vercel rollback으로 복원. 새 거래 데이터 삭제/DB rollback은 하지 않음. Git 코드 복구는 릴리스 커밋과 기존 sales-flow 커밋의 revert를 검토해 별도 기록하며 reset/force push 금지.

## 미검증
실제 PayPal 결제·환불, 이메일 수신, 인증 관리자 전체, 원어민 번역 감수는 미검증. B DB 통합·백업·마이그레이션은 후속 작업.
