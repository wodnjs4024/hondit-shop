# Merchant Center 다국가 확장 — 로컬 구현

2026-10-19. 브랜치 `codex/merchant-multicountry`. SG 준비 커밋 db4f17d에서 이어서 구현했다. 운영 배포·push·Merchant Center 등록·DB/환경변수 변경·실제 거래·Google 이벤트 전송은 하지 않았다.

## 대상과 가격

모든 피드/도착 페이지/구매 링크는 우선 **영어(en)** 로 통일했다. 일본어·번체·태국어 피드까지 완성한 상태가 아니다. 기존 사이트의 영어 구매 흐름을 재사용하며 판매조건과 번역 사전을 수정하지 않았다.

| 국가 | 통화 | 상품 수 | 디퓨저 350g 최소 총액 | 디퓨저 500g 최소 총액 | 클렌저 |
|---|---|---:|---|---|---|
| SG | SGD | 5 | 10개 / 230.00 | 10개 / 500.00 | 각 30개 / 267.00 |
| JP | JPY | 2 | 20개 / 48,000 | 20개 / 104,000 | 제외 |
| HK | HKD | 5 | 20개 / 2,560.00 | 20개 / 5,600.00 | 각 30개 / 1,650.00 |
| TW | TWD | 2 | 20개 / 9,600 | 20개 / 21,000 | 제외 |
| TH | THB | 2 | 20개 / 11,000.00 | 20개 / 24,000.00 | 제외 |
| MY | SGD | 2 | 20개 / 420.00 | 20개 / 920.00 | 제외 |

공개 상품 스냅샷과 현재 승인 거래조건에서 계산한 값이다. 가격 상수를 피드에 복제하지 않았다. 기존 termsFor/conditionsFor를 사용하며 관리 데이터 변경 시 같은 판정 결과를 따른다. 모두 기존 배송비 포함 조건이며 별도 청구 배송비 0이다. 관세/수입 비용까지 없다는 의미는 아니다. 재고는 사이트 기록이며 실물 실사는 하지 않았다. 재고 부족이면 out_of_stock, 가격이나 최소수량을 임의 변경하지 않는다.

## 배포 후 후보 HTTPS URL — 현재 새 코드 미배포

- https://hondit-shop.vercel.app/feeds/google/SG/en
- https://hondit-shop.vercel.app/feeds/google/JP/en
- https://hondit-shop.vercel.app/feeds/google/HK/en
- https://hondit-shop.vercel.app/feeds/google/TW/en
- https://hondit-shop.vercel.app/feeds/google/TH/en
- https://hondit-shop.vercel.app/feeds/google/MY/en

각 XML 상품 링크는 `/merchant/국가/en/상품?quantity=최소수량`으로 연결된다. 초기 HTML의 표시 가격/통화/재고와 Product/Offer JSON-LD가 동일 offer를 사용한다. 구매 버튼은 기존 `/bulk-orders/상품`으로 국가/en/상품/수량을 전달한다. 기존 언어별 QR와 일반 상품 화면은 변경하지 않았다. 미지원 시장·언어는 SG로 바꾸지 않고 거부한다.

## 국가·언어 정책 판단

Google 공식 목록의 지원국인 JP/HK/TW/TH/MY를 추가했다. 영어 데이터 소스를 다른 지원 국가에 사용하는 방식은 가능하나 피드·랜딩·구매 과정의 필수 정보가 같은 언어여야 한다. 이번에는 영어 방식만 준비했다. 국가 언어로 노출을 확대하려면 상품명/설명뿐 아니라 결제·정책 등 필수 문구의 일관성까지 별도 검증해야 한다.

MO/BN은 현재 공식 지원 판매국 목록에서 확인되지 않아 비활성 상태를 유지한다. 설정 실수로 enabled=true가 되어도 지원국 검사가 차단한다. 사이트의 MO/BN 판매 가능 조건 자체를 변경한 것은 아니다.

MY는 기존 실제 거래 통화 SGD를 유지한다. Google 비현지 통화 변환 방식의 적용과 해당 Merchant 계정의 국가/배송/세금 설정 및 심사 결과는 아직 검증하지 않았다. MYR 가격을 만들어 넣지 않는다.

공식 자료(2026-10-19 확인):
- https://support.google.com/merchants/answer/160637?hl=en
- https://support.google.com/merchants/answer/7055540?hl=en

## 변경 파일과 검증

- config/merchant-center.json: 국가별 영어 피드 활성화, MO/BN 보류 사유.
- api/_merchant.js: 검토된 Google 대상 국가 제한. 결제/가격 엔진 변경 없음.
- scripts/audit-merchant-catalog.mjs: 활성 국가별 XML/HTML/offer 감사 결과 출력.
- tests/feeds.test.mjs, tests/merchant-http.test.mjs: 기존 차단 기대값 갱신, 6개국 모든 피드 상품에 실제 로컬 HTTP GET/HEAD 검증 확대.
- tests/merchant-multicountry.test.mjs: 국가별 승인 최소수량·총액·통화·배송·초기 JSON-LD·재고·견적 제외·언어 거부 검증.
- docs/qa/merchant-multicountry/: 공개 스냅샷 기반 XML/HTML 18개 offer, 감사 결과, 테스트와 빌드 로그.

전체 196/196 통과, skip 0. 타입 검사와 Vite 빌드 성공. 기존 대형 번들 경고 유지. 외부 DB/PayPal/Google 호출 없는 합성 테스트이며 로컬 HTTP의 DB 응답도 모의다. 실제 브라우저 시각 검증·모바일 실기기·운영 배포 후 크롤링·Merchant 심사 완료를 의미하지 않는다. 공개 재고 스냅샷은 SG 준비 때 확보한 동일 파일을 사용했다. 새 운영 재고 실사나 결제는 수행하지 않았다.

## 남은 일

운영 적용 전 최신 main과 병합·기존 변경 보존을 다시 확인한다. SG 준비 패치까지 포함해야 하는지 적용 이력을 확인하고 전체 또는 증분 패치 중 하나만 사용한다. 승인 후 정상 앱 소스로 배포해야 하며 격리 정적 Preview를 운영 승격하지 않는다.

판매국별 실제 배송 가능 여부·기간·반품 주소/비용·관세 안내·사업자 정보·이미지 권리·상품 식별자(GTIN/MPN)를 운영자가 최종 확인해야 한다. 모르는 식별자는 생성하거나 identifier_exists=no로 단정하지 않았다. 승인 후 Merchant 계정 소유권/배송/반품/통화 설정, 공개 HTTPS 각 국가 피드와 랜딩의 실제 응답, Google 진단/심사를 검증한다. 현재 Merchant 등록 및 노출은 완료가 아니다.

SG 준비의 기존 제한도 유지: Merchant 정적 랜딩에 GA 태그를 추가하지 않았고, 일반 SPA 상품 페이지 초기 HTML의 SEO를 전면 개편하지 않았다. 검색 유입부터 결제까지 세션 추적/현지어 확장은 별도 후속 묶음이다.
