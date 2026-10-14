# HONDIT 홈 3개 영상 재배치 — 2026-10-15

## 적용 및 보존
- 브랜치 codex/stonejeju-media, 작업 기준 8562127 (앞선 미디어 적용 커밋).
- 기존 미커밋 B 구현과 다른 worktree, 기존 보고서 보존.
- 홈 흐름: 첫인상 제품 영상 → 숲 분위기 → 실물·소재 영상 → 규격 비교 → 기존 상품군·구매/지원 안내.
- HOME 첫 화면: 기존 대표 이미지 위치에 home_product.mp4 6초. 500g 연출 표시. PC 소개 옆, 모바일 짧은 소개 아래. 상품 보기와 해외 묶음 주문 CTA 유지.
- 자연 이야기: 기존 브랜드 영역을 앞쪽으로 이동, our_jeju_forest.mp4 7초 연결. 촬영 장소 미확인 안내. 기존 해안 이미지 보존.
- 실물 설명: 기존 하단 영역에 detail_product.mp4 8초 연결. 500g 표시와 영상 아래350g/500g 상세 버튼. 비교표는 바로 다음에 한 번만 표시.
- 기존 500g 상세 사진2컷과350g 기존 사진 유지. 예비 사진01/06은 추가하지 않음.
- 포스터02/04 WebP가0바이트이므로 첨부 JPG 사용. 상세 포스터05는WebP.
- 홈 고정 링크에 현재 시장·언어·URL 선택값 전달. 가격·수량 규칙·PayPal 서버·주문·제주 수령·DB 변경 없음.

## 변경 파일
- src/pages/HomePage.tsx: 섹션 재배치, 영상3개 연결, 선택값 유지 링크.
- src/components/StoneJejuMedia.tsx: 공통 StoneJejuFilm, 기존500g 이미지 갤러리 유지.
- src/data/homeMediaCopy.ts: 한국어·영어·일본어·번체중국어·말레이어·태국어 캡션/재생버튼/안내. zh-HK/zh-TW/zh 공통 번체.
- src/styles/v23.css: 기존 색·폰트·카드 체계의 반응형 배치,16:9 전체 프레임,44px 재생버튼.
- public/media/stonejeju/our_jeju_forest.mp4, detail_product.mp4: 첨부 영상 추가. 앞선 home_product.mp4 및 포스터 재사용.

## 재생·성능
- 화면에25% 이상 들어왔을 때에만 무음·인라인 자동재생 시도. 첫 화면 제품 영상도 실제 노출 상태에 따라 시작.
- 화면 밖/탭 비활성 시pause. 사용자가pause하면 재진입·탭복귀로 자동재생하지 않음.
- 끝난 영상은 자동 반복하거나 재진입 시 재생하지 않음. 재생버튼으로만 처음부터 다시 시작.
- prefers-reduced-motion에서 영상src를 지정하지 않고 포스터만 유지. 사용자가 재생버튼을 눌러야 파일 로딩 및 재생.
- 각 영상src는 최초 재생 조건 충족 때 지정, preload=none. 첫 화면에서 세 파일을 동시에 로드하지 않음.
- 자동재생이 브라우저 정책에 의해 거절되면 직접 재생버튼 유지. 파일 실패 시포스터+현지화 안내. 외부 영상 서비스 없음.

## 검증 결과
- 타입검사/빌드 통과. 기존 대용량 번들 경고 잔존.
- 기존회귀 테스트92/92 통과.
- PC1440×1000, 모바일390×844/900 Edge/Chromium 브라우저52건 통과(주요16 +언어/시장/실패36).
- 세 영상 실제 디코딩·재생·정지·화면 밖 정지, 사용자 정지 보존, 종료 후 비반복 확인.
- 탭 비활성은 document.hidden/visibilitychange 이벤트 모의로 검증. 실제 운영체제 탭 전환 및 iOS Safari 실기기는 미검증.
- 일반 모션과 동작 줄이기, 포스터 직접재생 검증. 세 파일 로딩 실패 각각 재현하여 구매 링크 유지 확인.
- 첫 화면CTA가두뷰포트에서보임.16:9 프레임·가로넘침없음. 350g/500g 상세버튼, 비교표 중복없음 확인.
- 7개 언어코드와8시장 확인. 클렌징SG/HK/MO 포함5개, 기타시장디퓨저2개노출 유지. 상품보기 이동 후시장URL 유지.
- 500g상세→수량35→SG상품금액1610→결제요청 이동시상품/수량유지 확인.
- 로컬API는기존상품fixture와결제비활성응답사용.외부요청차단,쓰기요청0,페이지실행오류0.실제결제·주문생성·문의발송없음.

## 캡처 및 증빙
경로: docs/qa/home-three-films-20261015/
- first-screen-1440.png / first-screen-390.png
- forest-1440.png / forest-390.png
- detail-1440.png / detail-390.png
- results.json (주요16건)
- language-market-errors.json (추가36건)
로컬스크립트: .qa-tools/home-films-browser.cjs, home-films-languages.cjs.

## 배포 상태
- 로컬 소스 적용·빌드·검증 완료: http://127.0.0.1:4193/?market=SG&lang=ko
- Vercel Preview 배포하지 않음.
- main push·Production 배포하지 않음. 운영 사이트는 이전 배포 그대로.
- DB·환경변수·마이그레이션·거래 데이터 변경 없음.
