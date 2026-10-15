# 사이트 전체 리디자인 Production 배포 — 2026-10-15

- 운영 URL: https://hondit-shop.vercel.app/
- 배포: GitHub main 자동배포, fast-forward push `8e8dcd3 → 1090e0c` (사용자 요청 "지금거 일단 배포해")
- 반영 확인: 운영 HTML이 로컬 빌드와 같은 CSS 번들(index-CSCm1XH8.css) 로드
- 복구 지점: 직전 운영 커밋 `8e8dcd3` (SG 배송비 포함 가격 반영 커밋)

## 포함
1·2단계(사이트 전체 디자인·접근성), Impeccable layout·colorize, OUR JEJU 소재 밴드, 500g 박스 사진 분류 수정.
가격·주문·결제 로직, API, 환경변수, DB 변경 없음. main에 있던 SG 결제·배송비 커밋(15ee08a·dba3312·8e8dcd3)은 그대로 포함.

## 배포 전 확인
빌드, 기존 테스트 98/98, 운영 대비 가격·수량·주문 시나리오 차이 0건.

## 배포 후 운영 확인
- 홈 영상·시장·언어·구매 동선 53/53
- 19개 고객 경로 × 360·390·768·1440 이상 없음 (없는 주소 `/nope`는 기존처럼 Vercel 404라 공통 헤더 없음)
- OUR JEJU 소재 밴드: PC·모바일에서 숲 패널 선택 시 숲 영상만 재생, 영상은 선택 시에만 내려받음
- `/api/products`·`/api/pickup`·`/api/paypal/config` 200, PayPal checkoutEnabled=true·mode=live 유지(값 출력 안 함)
- 실제 결제·주문 생성·문의 발송·DB 변경 없음

## 미검증
iOS·Android 실기기·Safari, 실제 결제 완료.

## 복구
Vercel에서 직전 배포(커밋 8e8dcd3)를 운영으로 되돌리거나 Git에서 `8e8dcd3..1090e0c`를 revert.
