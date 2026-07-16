# hondit Singapore — Codex image handoff

이 폴더는 `hondit-shop.vercel.app` 운영 사이트에 바로 적용할 수 있도록 정리한 이미지 묶음이다.

## 폴더 구성

- `01_product_originals/`: 제품 카드·상품 상세·Bulk Order에 사용할 제품 이미지 15장
- `02_brand_lifestyle/`: 홈 히어로와 브랜드 편집 영역에 사용할 보조 이미지 9장
- `03_jeju_real_photos/`: 제주대학교와 제주 장소의 실제 사진 14장
- `03_jeju_real_photos/source_jpg/`: 라이선스 기록 보존용 원본 JPG
- `04_reference/`: 기존 디자인 보드와 전체 미리보기 시트

## 반드시 지킬 적용 원칙

1. 웹사이트에는 최적화된 `.webp` 파일을 사용한다. `source_jpg`는 출처 확인용이며 페이지에 직접 로드하지 않는다.
2. 메인 히어로 1순위는 `02_brand_lifestyle/01_home_hero_full_line_coast.webp`, 2순위는 `02_home_hero_full_line_stone.webp`이다.
3. 제주대학교 소개 카드에는 `03_jeju_real_photos/01_jeju_national_university.webp`를 사용한다. 이미지 위에 로고를 합성하지 말고 CSS로 작은 주황색 `H · HONDIT HOME` 배지를 겹쳐 올린다.
4. 아시아·대한민국·제주 지도는 이 폴더의 사진으로 대체하지 않는다. 실제 지리 데이터 기반 SVG/TopoJSON을 유지하고, 영문 국가명·작은 주황색 위치점·점선 리더·외부 라벨을 사용한다.
5. 상품 카드와 PayPal Bulk Order의 제품 사진은 `01_product_originals/`를 사용한다. 배송 박스가 보이는 `15_full_product_line_real.webp`는 About/Shipping 증빙 영역에만 사용한다.
6. `02_brand_lifestyle/`는 분위기용 보조 자산이다. 제품명·용량·구성 판단은 반드시 `01_product_originals/`와 실제 상품 데이터가 기준이다.
7. `04_diffuser_pair_editorial_text.webp`에는 글자가 이미지에 포함되어 있으므로 기본 화면에서는 사용하지 않는다. 다른 이미지가 부족할 때만 보조 배너로 사용한다.
8. 제주 페이지는 `03_jeju_real_photos/`만 사용한다. 제주대학교 사진과 관광지 사진을 제품 사진처럼 보이게 합성하지 않는다.
9. 모든 Commons 사진의 저작자·라이선스는 `PHOTO_CREDITS.csv` 기준으로 사이트의 Photo Credits 또는 푸터에서 표시한다.
10. 이미지 아래에 학교 공식 보증을 암시하는 문구를 쓰지 않는다. `Student-led project based at Jeju National University`와 `Independent student commerce project`를 함께 표기한다.

## 페이지별 권장 배정

| 페이지/영역 | 권장 파일 |
|---|---|
| Home hero | `02_brand_lifestyle/01_home_hero_full_line_coast.webp` |
| Home secondary visual | `02_brand_lifestyle/02_home_hero_full_line_stone.webp` |
| Cleansing category | `02_brand_lifestyle/03_cleansing_trio_ice.webp` |
| Diffuser category | `02_brand_lifestyle/05_diffuser_350_editorial.webp` |
| About hondit / JNU | `03_jeju_real_photos/01_jeju_national_university.webp` |
| Our Jeju hero | `03_jeju_real_photos/02_seongsan_ilchulbong.webp` |
| Jeju forest story | `03_jeju_real_photos/04_saryeoni_forest_user_01.webp` |
| Jeju stone story | `03_jeju_real_photos/11_jusangjeolli_cliff.webp` 또는 `14_jeju_stone_wall.webp` |
| Products — 350g diffuser | `01_product_originals/02_diffuser_350_studio.webp` |
| Products — 500g diffuser | `01_product_originals/06_diffuser_500_studio.webp` |
| Products — foaming cleanser | `01_product_originals/10_foaming_cleanser_pack.webp` |
| Products — foam oil cleanser | `01_product_originals/12_foam_oil_cleanser.webp` |
| Products — cleansing water | `01_product_originals/13_cleansing_water_pack.webp` |
| Bulk Order | 선택 상품별 위 제품 카드 이미지 |
| Shipping / real operation | `01_product_originals/15_full_product_line_real.webp` |
| Social sharing preview | Home hero를 1200×630 비율로 CSS/빌드 단계에서 크롭 |

## 성능 적용

- 첫 화면 히어로만 eager/preload 처리한다.
- 나머지는 `loading="lazy"`, `decoding="async"`를 사용한다.
- 원본 비율에 맞는 `width`와 `height`를 지정해 레이아웃 이동을 막는다.
- 카드에서는 `object-fit: cover`, 상품 단독 컷에서는 `object-fit: contain`을 사용한다.
- 데스크톱·모바일 모두에서 제품 라벨이 잘리지 않는지 확인한다.

## 출처 주의

- Wikimedia Commons 이미지는 `PHOTO_CREDITS.csv`의 조건에 따라 사용한다.
- `04_saryeoni_forest_user_01.webp`, `05_saryeoni_forest_user_02.webp`는 사용자가 직접 제공한 사진이다.
- `02_brand_lifestyle/`는 생성형 보조 이미지다. 실제 제품 구성과 다른 세부 표현이 있으면 사용하지 않는다.
