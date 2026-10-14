# hondit 공식 연락 계정 정정 — 2026-10-14

이 문서는 이전 인계서의 ‘WhatsApp/WeChat 계정 ID 자료 누락’ 및 ‘Instagram QR 미해독’ 기록을 현재 기준으로 대체합니다. 기존 판매·예약 기능 계약과 공개 연결 제거 상태는 변경하지 않습니다.

- 브랜치: `codex/sales-structure`, 시작 `92101e1` (작업본 미커밋 변경 없음).
- 구현 커밋: `0bd1871`. 애플리케이션 수정 파일은 `src/components/ContactQrs.tsx` 하나입니다.
- WhatsApp/Telegram: 동일한 확정 전화번호를 표시·복사. WhatsApp 버튼은 사용자 제공 직접 연결 주소 사용. Telegram은 기존 QR에서 확인된 전화번호 링크 유지, 별도 사용자명 생성·표시 없음.
- WeChat: 확정 ID `hondit_jeju` 표시·복사. 제공 QR 및 QR 해독 주소 그대로 유지.
- Instagram: 기존 `@hondit.office`와 링크가 확정값과 일치하여 유지. Email `hondit.office@gmail.com`, 공식 사이트 URL도 기존 값이 확정값과 일치하여 유지.
- 기존 카드 배치, 우선 WhatsApp, 보조 채널·QR 접힘, 이메일 요청 흐름 유지. 새로운 기능·QR·채널 생성 없음.

## QR·연결 확인 범위

| 채널 | 확인 결과 | 미확인 |
|---|---|---|
| WhatsApp | 원본 QR 해독 성공. 사용자 제공 직접 링크의 공식 WhatsApp 웹 화면에서 확정 번호 확인 | 기존 QR는 WhatsApp 앱 설치가 필요하다고 안내하며 웹에서 소유 계정 번호를 드러내지 않음. 원본 QR와 확정 번호의 앱 내 대조 필요 |
| Telegram | QR가 확정 전화번호 링크를 담음. 웹에서 같은 번호와 `tg://resolve?phone=...` 대상 확인 | 실제 앱 로그인·연락처 공개 설정·대화 실행/수신 미검증 |
| WeChat | 원본 QR 해독 성공, 제공된 전용 주소와 코드 링크 일치. 확정 ID 반영 | 계정 ID는 QR 문자열 자체에 포함되지 않음. 웹 확인은 브라우저 보안 정책으로 차단되어 완료하지 못함. WeChat 앱에서 QR 프로필과 ID 대조 필요 |
| Instagram | 이번 해독 성공, QR URL 경로가 `hondit.office`로 확정 계정과 일치 | 실제 로그인·앱 내 계정 접근/메시지 수신 미검증 |
| Email | 화면·초안·복사에 동일한 확정 주소 사용 | 발송·수신 테스트 안 함 |

기존 QR 4개는 제공 ZIP의 각 원본과 SHA256 일치. 원본 이미지는 수정하지 않았습니다. 해독에 사용한 메모리 처리는 파일로 저장하거나 새 QR로 제작하지 않았습니다.

## 검증 및 보존

- 로컬 빌드 통과, 기존 62개 테스트 통과. 대형 번들 경고는 기존대로 남음.
- 5개 채널의 실제 복사 결과가 확정값과 일치함을 로컬 브라우저에서 확인. PC·390px 모바일 표시 확인, 모바일 가로 넘침 없음. 실제 모바일 기기 앱 실행을 검증한 것은 아님.
- `public/images/contact`, API·가격·예약 상태 코드·관리자 코드·SQL 초안의 변경 없음. 운영 DB·main·Production·결제·환불·고객 연락 변경/실행 없음.
- 상세 해독·해시: `docs/qa/contact-correction/qr-decode.json`.
- 복사 확인 및 캡처: 같은 폴더의 `copy-checks.json`, `accounts-desktop.jpg`, `accounts-mobile.jpg`.
- 이번에는 새로운 연락 자료나 QR을 요청하지 않습니다. 남은 QR 대조는 이미 제공된 원본을 공식 앱으로 확인하는 항목입니다.

## Preview

- URL: https://hondit-shop-24yz4erbu-hondit.vercel.app/contact?market=SG&lang=ko
- 배포 ID: `dpl_FJvVivcJH6DvBvPxKAEVjrWYwvGV`, 소스 `0bd1871`, Preview 전용. 운영 배포는 별도 승인 사항입니다.
- Vercel 기존 인증 보호·PayPal 비활성·쓰기 차단을 유지합니다. 배포 확인 결과는 아래에 추가 기록합니다.

### 배포 후 확인

Preview Ready 확인. PayPal 설정 200·checkoutEnabled=false·clientId 빈 값, 제주 예약/결제=false 확인. 기존 쓰기 요청 9개 모두 403 유지. `preview-api-checks.json` 참조.

원격 main은 `61d0e1dd683966f2e346ece39a3c487d97cdbfb4`로 유지. 애플리케이션 diff는 연락 채널 컴포넌트 하나이며 가격·결제 API·예약/관리자·라우트·DB 초안·QR 원본에는 diff가 없음. 후속 문서·캡처 커밋은 배포 제외 자료만 변경함.
