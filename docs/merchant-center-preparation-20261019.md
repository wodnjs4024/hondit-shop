# HONDIT Google Merchant Center 준비 결과 — 2026-10-19

## 결과

별도 브랜치 `codex/merchant-center-prep`에서 로컬 구현 완료. 기준은 최신 원격 main `c759e411babda09e77059b6f0a2f91533ceab938`이다. 처음 확인한 `80abf95`에서 작업을 고정하지 않고 최신 말레이시아 결제·클렌징 수량 변경까지 먼저 반영했다. Production 소스 SHA와 main의 최종 일치는 별도 배포 화면에서 확인하지 않았다.

운영 배포, push, Merchant Center 등록, 운영 DB·환경변수·시트 변경, 결제·환불·문의 발송은 하지 않았다. 기존 다른 작업 공간을 수정하지 않았다. 기존 작업 폴더는 과거 worktree 메타데이터가 없어 새 clone을 사용했다.

## 실제 공개 데이터 조사

운영 공개 GET `/api/products`를 읽었으며 고객·주문 데이터는 조회하지 않았다. 확인 시점의 공개 상품은 5개, 가격 버전 `prices`와 시장 오버라이드 `markets`는 모두 빈 객체였다.

| 상품 | 공개 전산 재고(개) | SG 최소 직접 구매 수량 | 승인 계산 총액 | 추가 청구 배송비 |
|---|---:|---:|---:|---:|
| 디퓨저 350g | 240 | 10 | 230.00 SGD | 0.00 SGD |
| 디퓨저 500g | 200 | 10 | 500.00 SGD | 0.00 SGD |
| Foam Oil | 600 | 30 | 267.00 SGD | 0.00 SGD |
| Foaming Cleanser | 600 | 30 | 267.00 SGD | 0.00 SGD |
| Cleansing Water | 600 | 30 | 267.00 SGD | 0.00 SGD |

재고는 API가 제공한 전산 수량이며 실물 재고·공급 가능량을 확인한 것이 아니다. 기존 `inventoryPacks × packQuantity` 환산일 수도 있다. raw `unitPriceSgd`/`packPriceSgd`를 최종 가격으로 사용하지 않고 사이트 주문과 동일한 `termsFor`로 계산한다. 예를 들어 API의 과거 클렌징 단가와 현재 승인 단가가 다를 수 있다. 새 가격을 만들지 않았다.

SG 디퓨저: 10개 고정 체험 주문, 또는 20~9999개 정수 일반 주문. 350g 일반 단가 S$21, 500g S$46. 15/19개 등은 직접 구매 불가. SG 클렌징: 상품별 30개부터 10개씩 증가, 승인 단가 S$8.90. 기존 수량별 가격/배송/결제 조건은 수정하지 않았다.

코드에 있는 기타 시장의 일반 주문 기준(실거래 검증과 구분):

| 국가 | 결제 통화 | 350g 20개 | 500g 20개 | 클렌징 |
|---|---|---:|---:|---|
| JP | JPY | 48,000 | 104,000 | 제외 |
| HK | HKD | 2,560 | 5,600 | 각30개 1,650 HKD |
| TW | TWD | 9,600 | 21,000 | 제외 |
| MO | HKD | 2,560 | 5,600 | 각30개 1,650 HKD |
| TH | THB | 11,000 | 24,000 | 제외 |
| MY | SGD | 420 | 920 | 제외 |
| BN | SGD | 420 | 920 | 제외 |

이 표는 현재 승인 코드와 공개 상품 상태의 계산 결과다. 해외 10개 체험 가격은 SG 외에는 제안 상태이며 직접 구매 상품으로 피드에 넣지 않았다. 다른 국가의 실제 주문·통관·PayPal 수납을 이번에 검증한 것은 아니다. SG 외 피드는 기본 비활성(404)이다.

## 구현

- `api/_merchant.js`: 공개 상품 + 승인 가격 버전 + 거래조건 + 공통 화면 원본으로 최소 구매 오퍼 하나를 생성한다. XML·초기 HTML·Product JSON-LD가 같은 오퍼를 사용한다.
- `api/_feeds.js`: 기존 XML RSS/Google namespace를 재사용. 20/30 고정 추정을 제거하고 승인 조건의 최소 수량에서 직접 결제 가능한 첫 조건을 선택한다. SG는 10/30개가 된다. 상품 ID는 SKU와 판매 단위로 고정(`diffuser-350g-q10`)한다. 국가가 바뀌어도 동일 판매 단위는 같은 ID를 사용한다.
- 재고는 명시적 `stockUnits`를 우선한다. 0/부족 수량/품절은 `out_of_stock`, 알 수 없는 재고는 제외한다. 재고 부족이라고 10개 오퍼를 20개로 바꾸지 않는다. 견적·비공개·미검토 상품은 제외한다.
- `config/merchant-center.json`: SG/en/SGD만 활성. 기존 제품의 실제 브랜드 StoneJeju/J'essence를 분리한다. GTIN·MPN은 미확인 상태로 두고 만들지 않는다. `identifier_exists=no`를 일괄 출력하지 않는다. 내부 SKU를 MPN으로 바꾸지 않는다. MOQ만 있다는 이유로 `multipack`을 주장하지 않는다.
- `shared/storefront-catalog.js/.d.ts`: 기존 React 상품 이름·설명·이미지·기존 표시 데이터 배열을 값 변경 없이 이동. `src/data/v23SiteData.ts`와 Merchant가 같은 배열을 참조한다. 관리자 언어별 콘텐츠/주 이미지가 있으면 우선한다. 이 작업에서 임의 번역·상품 설명·이미지를 생성하지 않았다.
- `api/products.js`, `vercel.json`: 기존 Vercel products 함수에 GET/HEAD XML과 서버 HTML 경로 추가. 새 함수 슬롯·DB 변경 없음. 미지원 시장·언어/상품/수량은 거부한다. 운영 DB 설정 없음·DB 조회 실패·결제 닫힘·읽기전용 Preview에서는 503으로 중단하고 기본 카탈로그를 실제 재고처럼 내보내지 않는다. Production에서는 기존 live PayPal 필수 설정 존재와 모드를 확인한다. PayPal 외부 요청은 하지 않는다.
- 전용 HTML은 일반 고객과 Google에 동일하게 제공한다(UA별 다른 내용 없음). 초기 응답에 상품명·이미지·수량·총액·재고·배송·JSON-LD가 모두 있다. 결제 버튼은 기존 `/bulk-orders/:slug`에 market/lang/product/quantity를 전달한다. 품절이면 버튼 없음.
- 기존 공개 상품 페이지와 결제 UI 디자인은 그대로다. 새 Merchant 전용 HTML만 간단한 상품 요약 화면이다. 기존 일반 `/products/:slug`의 SPA 초기 HTML은 변경하지 않았다.

## 주소

수정본을 배포한 뒤 사용할 피드:

- `https://hondit-shop.vercel.app/feeds/google/SG`
- 명시 언어 별칭: `https://hondit-shop.vercel.app/feeds/google/SG/en`

피드 도착 주소 예:

- `https://hondit-shop.vercel.app/merchant/SG/en/diffuser-350g?quantity=10`
- `https://hondit-shop.vercel.app/merchant/SG/en/foam-oil?quantity=30`

새 주소는 아직 배포하지 않았다. 현재 운영 `/feeds/google/SG`는 기존 구현의 응답이며 이 수정본이 아니다. 다른 국가를 설정만 켜서 검증 완료로 간주하지 않는다. en 외 HTML 번역은 아직 구현하지 않았으므로 코드도 비활성 언어를 허용하지 않는다. 실제 번역·배송·결제·정책 검증 후 시장/언어 확장 필요.

## 실제 운영 읽기 확인

`qa/merchant-center/production-readonly.json`:

- 기존 `/feeds/google/SG` HTTP200/application/xml.
- 기존 상품 상세 HTTP200. raw 초기 HTML에는 빈 React root가 있고 Product JSON-LD 없음.
- robots는 일반 경로 허용, admin/order-complete/payment-failed/partners 일부 차단. 새 `/merchant` 차단 규칙은 없음.
- 공개 PayPal config: checkoutEnabled=true, mode=live, 공개 clientId 존재 확인. 값은 저장하지 않았다.
- 실제 Google 크롤러 수집/색인, Rich Results Test, Merchant 진단 결과는 확인하지 않았다.

## 테스트

- 전체 테스트 **189/189 통과**, 실패/skip 0. `qa/merchant-center/tests-full.txt`.
- TypeScript + Vite 빌드 성공. 기존 500kB 초과 번들 경고 있음. `qa/merchant-center/build.txt`.
- 전용 테스트 13개: 유효 XML 파싱, 최소 수량/총액, 콘텐츠 공통 원본, 가격 버전 전파, 재고0/부족/미확인, 품절 결제 차단, 견적/비공개 제외, 잘못된 쿼리, 주입 방지, 결제 닫힘/Preview/live 설정, HTTP GET/HEAD/POST, HTML JSON-LD와 피드 및 checkout URL 일치.
- 실제 로컬 HTTP 서버→API 핸들러→모의 DB로 모든 피드 상품의 초기 HTML/수량/금액 검증. 외부 결제·GA·Google 호출 없음.
- 기존 상품 배열 전체 값 일치, 가격/배송/PayPal 핵심9파일 내용 동일, 기존 redirects/functions/rewrites 보존 대조. `qa/merchant-center/preservation.json`.
- 공개 API 스냅샷으로 만든 XML/HTML/국가별 조건 조사 결과: `qa/merchant-center/sg-preview.xml`, 상품별 `.html`, `catalog-audit.json`. 샘플은 수집 시점의 미리보기이며 운영 고정 피드로 사용하지 않는다.
- 브라우저로 localhost 미리보기를 열었으나 cloud browser에서 연결 거부. 실제 PC/모바일 브라우저 시각 검증·실물 기기 검증은 미완료. HTTP/jsdom 검증과 구분한다.

## 등록 전에 남은 사항

1. 제품 포장/공급사에서 GTIN·MPN 유무 확인. 미확인을 ‘없음’으로 바꾸지 않는다. 이미지 원본·제품 정확성·사용권·AI 편집 표시 필요 여부도 확인한다.
2. 배송 목적지 범위·예상기간·반품 가능기간·반품비·판매자/연락처·수입 관련 고지와 Merchant 계정 설정 대조. 정책을 임의로 생성하거나 기존 거래조건을 변경하지 않았다.
3. 현재 배송포함 판매가를 유지하고 추가 배송 청구 0을 전달한다. 내부 EMS 원가를 임의로 분리/차감하지 않았다. 별도 배송요금이 생기면 승인 조건의 productTotalMinor/shippingMinor를 각각 전달한다.
4. 전산 재고가 실제 공급 가능한 재고인지 운영자 확인.
5. 테스트 승인 후 코드 배포·실제 Vercel 라우팅/이미지/JSON-LD 재검증·Rich Results/Google URL 검사·Merchant 등록 순서로 진행. 승인 없이 실행하지 않았다. 현재 이 보고서는 Google 승인/노출 성공 증거가 아니다.
6. 전용 정적 Merchant HTML에는 GA4 JS를 새로 추가하지 않았다. 기존 결제 화면의 분석 코드는 유지되지만 전용 랜딩부터의 동의 기반 유입 측정은 추가 연결 과제다. 서버 purchase 추적을 켜지 않았다.

## 적용 및 복구

이 브랜치/패치를 최신 로컬 main과 비교해 검토한다. 이미 후속 변경이 있으면 덮어쓰지 말고 충돌 병합 후 재검증한다. `git apply --check`가 통과한 경우만 patch 적용. 커밋 기반이면 cherry-pick 후 동일 검사. 새 DB 마이그레이션·환경변수 생성은 필요 없다. 기존 Production DB/PayPal 설정을 Preview 모의값으로 바꾸지 않는다.

코드 적용을 승인한 뒤에도 이 수정만 반영하고 금융/주문 데이터를 복구·삭제하지 않는다. Merchant 등록 전이라면 코드 revert로 복구 가능하나, 이전 피드의 알려진 불일치도 돌아오므로 피드 수집 중단/정정 계획을 함께 검토한다.

## 공식 근거

- 상품 데이터 규격: https://support.google.com/merchants/answer/7052112?hl=en
- 가격/최소 구매 수량: https://support.google.com/merchants/answer/6324371?hl=en
- 브랜드: https://support.google.com/merchants/answer/6324351?hl=en
- 식별자 없음의 의미: https://support.google.com/merchants/answer/6324478?hl=en
- Multipack: https://support.google.com/merchants/answer/6324488?hl=en
- Merchant Product/초기 HTML: https://developers.google.com/search/docs/appearance/structured-data/merchant-listing
- 랜딩 요구사항: https://support.google.com/merchants/answer/4752265?hl=en
