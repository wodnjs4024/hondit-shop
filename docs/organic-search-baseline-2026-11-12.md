# HONDIT 검색 유입 기준선 · 2026-11-12

| 데이터 | 조회 기간 | 확인값 |
| --- | --- | --- |
| [Search Console 웹 검색](https://search.google.com/u/1/search-console/performance/search-analytics?resource_id=https%3A%2F%2Fhondit-shop.vercel.app%2F&num_of_days=28) | 10/14–11/10 | 노출 103, 클릭 6, CTR 5.8%, 평균 게재순위 7.1 |
| [Search Console 생성형 AI 기능 베타](https://search.google.com/u/1/search-console/performance/search-analytics/ai?resource_id=https%3A%2F%2Fhondit-shop.vercel.app%2F&num_of_days=28) | 10/14–11/10 | 노출 25. 홈 7, 500g 상세 3, 대만 저널 개별 글 3·3 등 |
| [Search Console 페이지 색인](https://search.google.com/u/1/search-console/index?resource_id=https%3A%2F%2Fhondit-shop.vercel.app%2F) | 11/09 업데이트 | 색인 63, 제외 15. 크롤링 후 미색인 5, 발견 후 미색인 4 |
| [GA4 트래픽 확보](https://analytics.google.com/analytics/web/?authuser=1#/a398979101p542886133/reports/reportinghub) | 10/15–11/11 | 전체 114세션, 자연 검색 1세션. 전체에는 확인용 `codex / qa` 7세션 포함 |

웹 검색 보고서에 표시된 브랜드 검색어 `hondit`는 노출 16, 클릭 2였다. 표에 공개되지 않는 검색어가 있으므로 전체에서 브랜드 검색을 빼 비브랜드 수치로 간주하지 않는다. 생성형 AI 보고서의 노출은 Google이 표시한 횟수다. AI 답변에서의 고유 인용 횟수, GA4 방문, 판매를 각각 따로 측정한다.

| 비교 페이지 | 관찰 | HONDIT 적용 |
| --- | --- | --- |
| [BsaB Singapore 화산석 디퓨저](https://bsab.com.sg/products/volcano-stone-diffuser) | 용도, 구성품, 오일 용량, 규격이 상품명 가까이에 있다 | StoneJeju의 제주 송이석·용기·동봉 오일·크기를 제조사 출처와 연결 |
| [Scent by SIX 디퓨저 컬렉션](https://scentbysix.com/collections/reed-diffuser) | 검색 제목에서 리드 디퓨저와 싱가포르를 명시한다 | 제품 방식과 용도에 대한 비브랜드 질문을 FAQ에 추가. 가격은 개당 금액과 묶음 총액 구분 |
| [MUJI 홍콩 향 제품](https://onlineshop.muji.com.hk/categories/essential-oil-aroma-goods) | 번체 중국어 카테고리에서 擴香石을 직접 찾을 수 있다 | 제주공항 수령의 기존 번체 페이지를 검색 가능한 HTML로 제공. 검색용 번체 태그는 zh-Hant 사용 |
| [JDC 제주공항 예약 안내](https://jdcdutyfree.com/mall/customer/onlineguide.do) | 고객이 예약 절차와 수령 장소 확인 방법을 읽을 수 있다 | HONDIT 픽업은 메시지로 요청하고 시간·장소·결제 방법 확인 후 수령하는 절차를 공개. 별도 매장·면세·즉시 수령을 주장하지 않음 |

배포 후 먼저 픽업과 FAQ의 Google URL 검사에서 초기 HTML, 표준 URL, 색인 가능 여부를 확인한다. SG·JP의 기존 Merchant URL은 Rich Results Test에서 각각 묶음 총액·통화·재고를 화면과 대조한다. 이후 28일 같은 기간으로 Search Console의 비브랜드 검색어와 상품·픽업·FAQ 랜딩 페이지, GA4의 자연 검색 세션·상품 조회·문의·결제 시작을 비교한다. 태그된 QA 방문은 제외한다. 생성형 AI 기능은 같은 기간 보고서와 실제 답변에서 출처로 연결된 URL을 별도로 확인한다.
