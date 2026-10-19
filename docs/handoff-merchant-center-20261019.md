# HONDIT Merchant Center 등록 인수인계 (2026-10-19)

이 문서는 Codex가 Google Merchant Center 등록을 이어서 마무리하기 위한 정리본이다.
코드·배포는 끝났고, 남은 일은 Merchant Center 화면 설정뿐이다.

## 1. 현재 운영 상태 (이미 배포됨, main = 19d2ef5)

- Codex 패치 `FULL_from_c759e41.patch`(커밋 380859c 내용)를 수정 없이 적용해 운영 배포했다. 테스트 196/196 통과.
  - 참고 보고서: `merchant-multicountry-20261019.md` (Codex 작성, 사용자 Downloads 폴더)
- 그 전에 배포된 판매 조건 (모두 사용자 승인됨):
  - SG·HK·MO·TW·JP·TH·BN·MY 디퓨저 20개 이상 PayPal 바로 결제, 배송비 포함
  - MY는 SGD로 결제(S$21 / S$46), 화면 상단에 SGD 안내 표시. MY 10개 체험은 견적 유지
  - 클렌저(SG S$8.90, HK·MO HK$55): 30개 이상 10개 단위 바로 결제, 배송비 포함
  - SG 10개 체험 주문은 바로 결제(S$23 / S$50)
- 운영에서 확인한 피드 첫 상품 (2026-10-19):

| 국가 | 피드 첫 상품 | 가격 |
|---|---|---|
| SG | foam-oil-q30 | 267.00 SGD |
| JP | diffuser-350g-q20 | 48000 JPY |
| HK | foam-oil-q30 | 1650.00 HKD |
| TW | diffuser-350g-q20 | 9600 TWD |
| TH | diffuser-350g-q20 | 11000.00 THB |
| MY | diffuser-350g-q20 | 420.00 SGD |

- 피드 링크의 랜딩(`/merchant/JP/en/diffuser-350g?quantity=20`)이 처음 HTML과 JSON-LD에 같은 가격을 보여준다 (JPY 48000 확인).
- MO·BN은 구글 지원국이 아니라서 피드에서 404. 사이트 결제는 정상.
- Search Console: 이미 소유권 확인됨, sitemap.xml 제출 상태 "성공".

## 2. Merchant Center에서 남은 일

계정: hondit (ID 5876625664). 사용자 본인이 로그인해 있다.

### 2-1. 피드 6개 등록 ("파일에서 제품 추가" → "파일 링크 입력")

| 피드 라벨 | 파일 링크 | 언어 |
|---|---|---|
| SG | https://hondit-shop.vercel.app/feeds/google/SG/en | 영어 |
| JP | https://hondit-shop.vercel.app/feeds/google/JP/en | 영어 |
| HK | https://hondit-shop.vercel.app/feeds/google/HK/en | 영어 |
| TW | https://hondit-shop.vercel.app/feeds/google/TW/en | 영어 |
| TH | https://hondit-shop.vercel.app/feeds/google/TH/en | 영어 |
| MY | https://hondit-shop.vercel.app/feeds/google/MY/en | 영어 |

- 가져오기 일정: 매일
- 피드 라벨은 대문자 국가 코드만 (소문자·띄어쓰기 불가)
- 진행 상황: SG 피드 링크 입력 후 "배송" 설정 화면까지 진행됨

### 2-2. 배송 설정 (사이트 배송 안내와 같게)

사이트 문구: 준비 영업일 1~3일, 발송 후 3~5일, 합계 4~8일 (`src/pages/ShippingPage.tsx`).

- 주문 마감: 오후 2:00, 시간대 (GMT+09:00) 서울 ← 기본값이 로스앤젤레스라 반드시 변경
- 주문 상품 준비 시간: 최소 1, 최대 3, 처리 요일 월~금
- 운송 시간: 모든 배송지, 발송 요일 월~금, 최소 3, 최대 5
- 배송비: 0 (가격에 포함). 피드에도 `g:shipping` 가격 0으로 들어 있다.
- 관세·수입세는 수령인 부담 (사이트 문구와 동일)

### 2-3. 반품 정책

사이트 정책 페이지 기준으로 입력한다. 내용을 지어내지 않는다.
- 정책 페이지: https://hondit-shop.vercel.app/policy/refund
- 사이트 문구: 파손·오배송·누락은 수령 후 7일 이내 신고, 환불 승인 후 결제사 반영 영업일 5~10일 (`src/data/policyKo.ts`)
- 반품 주소·반품 배송비 부담 주체 등 사이트에 없는 항목은 사용자에게 물어서 입력한다.

### 2-4. 등록 후 확인

- 각 피드의 "진단"에서 오류(가격 불일치, 이미지, 식별자 등)를 확인해 사용자에게 보고한다.
- GTIN/MPN은 없다. 지어내지 않는다 (피드는 식별자를 넣지 않음).

## 3. 지켜야 할 것

- 실제 결제·환불·송금 금지. 가격·최소수량·배송 조건을 임의로 바꾸지 않는다.
- 비밀번호·API 키·계좌번호 등 민감 정보는 화면·보고서에 쓰지 않는다.
- 코드 변경이 필요하면 최신 origin/main(19d2ef5) 기준 별도 브랜치에서 작업하고, 운영 배포는 사용자 승인 후에만 한다.
- 피드 주소(`/feeds/google/:market/:lang`)와 랜딩 주소(`/merchant/...`)는 바꾸지 않는다. Merchant Center에 등록된 주소다.
