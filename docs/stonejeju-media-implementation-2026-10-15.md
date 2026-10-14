# StoneJeju 미디어 적용 결과 — 2026-10-15

## 기준·보존
- 기준 커밋: b7fdb1b91609dd213c9fc591b4e66314de6ec9ef. 원격 main과 일치함을 읽기 전용 확인.
- 브랜치: codex/stonejeju-media.
- 작업 경로: C:/Users/user/OneDrive/문서/hondit-shop/_codex_work/sales-structure
- 기존 B 구현과 루트 미커밋 변경, 다른 worktree, 기존 미추적 보고서 보존.
- AGENTS.md는 저장소 및 적용 상위 경로에서 발견되지 않음. 기존 React/Vite/TypeScript·React Router·useMarket 다국어 구조 재사용.

## 반영 위치·변경 파일
| 위치 | 파일 | 변경 |
|---|---|---|
| HOME 기존 하단 StoneJeju 소개 | src/pages/HomePage.tsx | 기존 세로 루프 영상 대신 제공된 6초 제품 영상. 강제 play/focus/visibility 재생 로직 제거. HERO·사용법·상품 버튼 유지 |
| 공통 미디어 | src/components/StoneJejuMedia.tsx | controls, playsInline, muted, preload=none, 포스터, 오류 시 정지 이미지·안내. 500g 연출 이미지 2컷 |
| OUR JEJU Forest 카드 | src/pages/JejuPage.tsx | 숲 사진 및 장소 비특정 alt. 로딩 실패 시 기존 사진. 비자림 지도 사진·출처 유지 |
| 500g 상세 | src/pages/ProductDetailPage.tsx | 기존 사양·구매 영역을 유지한 채 연출 사진 2컷 추가. 350g 갤러리 미변경 |
| 반응형 스타일 | src/styles/v23.css | 16:9 전체 프레임, contain, PC 2열·모바일 1열 갤러리, 기존 색·서체 재사용 |
| 다국어 | src/data/stonejejuMediaCopy.ts | 한국어·영어·일본어·번체중국어 및 기존 지원 말레이어·태국어. 새 영상 캡션·alt·실패 안내 |
| 정적 자산 | public/media/stonejeju/ | 아래 실제 사용 5개만 복사 |

사용 자산:
- home_product.mp4 (711,946 bytes), 6초·1280×720: 브라우저에서 실제 디코딩 확인.
- 02_product_moss.jpg (162,950 bytes): 포스터.
- 04_forest.jpg (184,653 bytes): Forest 카드.
- 03_product_light.webp (105,374 bytes), 05_product_stone.webp (110,598 bytes): 500g 상세.

ZIP의 02_product_moss.webp, 04_forest.webp는 0바이트여서 포함 JPG를 대체 사용. 새 이미지 생성·가공 없음.
미사용: leaves, closing, detail_product.mp4, our_jeju_forest.mp4, 원본 53초 영상, Preview HTML. public에 복사하지 않음.

## 상품 SKU 판단 근거
첨부 03/05 컷의 포장 측면 NET WT 500G 표시와 갈색 옹기 용기가 기존 public/images/diffuser-500g.webp의 NET WT 500G 포장·갈색 옹기와 일치함을 시각적으로 확인했다. 따라서 diffuser-500g에만 연출 사진으로 연결했다.
350g 기존 public/images/diffuser-350g.webp는 검은 유리 용기이며 포장 350G 표시가 달라 새 컷을 적용하지 않았다.
영상만으로 새 규격·제조·효능·촬영 장소를 주장하지 않았으며, 상세의 기존 사양과 구성품 사진을 교체하지 않았다.

## 검증
- npm run build: 타입 검사·빌드 통과. 기존 대용량 번들 경고는 남음.
- node --test tests/*.test.mjs: 92/92 통과. 최초 샌드박스 상위 디렉터리 접근 제한 실패 후 동일 테스트를 권한 제한 없이 실행하여 통과.
- 로컬 Edge/Chromium: PC1440·모바일390, 브라우저 시나리오 80건 + 최종 일반 모션·키보드·갤러리 검증 4건 통과.
- 실제 MP4 1280×720, 약6초 디코딩·play/pause 확인. 네이티브 controls 포커스 및 Space 재생·정지 확인.
- 일반 모션·prefers-reduced-motion 모두 새 영상 자동재생 없음. autoplay/loop 없음, muted/playsInline/controls/preload=none 확인.
- MP4 로딩 실패 강제 재현: 포스터+현지화 안내, 기존 구매 링크 유지.
- HOME/OUR JEJU/500g 상세 한국어·영어·일본어·번체(HK/TW)·말레이어·태국어 검증.
- 8시장 상품 노출(클렌징 SG/HK/MO, 나머지 디퓨저), 통화·가격 표시, 상세→주문/결제요청 선택 수량20 유지. 국가·언어 전환 시35 유지.
- SG350g20=420, SG500g35=1610, JP350g20=48000 등 유지. 기존92개 회귀 테스트에서 가격·수량·서버 검증도 통과.
- 가로 넘침 없음. 페이지 실행 오류0, 쓰기 요청0. API는 기존 상품 fixture 및 결제 비활성 설정을 사용했고 외부 요청 차단. 운영 DB 실조회 결과를 의미하지 않음.
- 결제·환불·주문 생성·문의 발송·고객 연락·운영 DB 수정 없음.

증빙: docs/qa/stonejeju-media-20261015/results.json, final-keyboard-checks.json 및 home/forest/detail500 각각1440·390 PNG 총6개.
로컬 실행 스크립트는 .qa-tools/media-browser.cjs와 media-keyboard-final.cjs. 형식적인 경로 테스트는 추가하지 않았다.

## 미검증·배포 상태
- 실제 iOS Safari/실기기, 운영 CDN 업로드 후 재생은 미검증.
- 실제 결제·문의 송수신·관리자 변경은 의도적으로 미실행.
- 소스 적용 및 로컬 검증 완료. main push, Vercel Preview/Production 배포, 환경변수·DB·마이그레이션 변경 없음.
- 로컬 확인: http://127.0.0.1:4193/?market=SG&lang=ko (로컬 서버 실행 중에만 유효).
- 기존 Production은 b7fdb1b 버전이며 이번 자산은 아직 공개 사이트에 반영되지 않음.
- 운영 적용 시 검증한 미디어 전용 커밋을 기존 main Git 자동배포 경로로 배포하고, CDN 미디어 응답·PC/모바일 재생을 재검증한다. 가격/서버/DB 변경은 포함하지 않는다.
