# 홈 레이아웃·반복 재생 보완 — 2026-10-15

## 작업 기준과 반영
- 기준: codex/stonejeju-media, 6c9ff72. 기존 미커밋 B 구현·별도 worktree·미추적 보고서 보존.
- 숲 영역의 전체 상품 이미지를 제거했다. 상품 컬렉션에 이미 각 상품 사진이 있어 중복 이미지는 옮겨 추가하지 않았다.
- 숲 영상·짧은 제목·설명·OUR JEJU 링크만 남겼다. 촬영지를 특정하지 않으며 내부 검수용 장소 미확인 문장은 지원 언어 모두에서 제거했다.
- 제품 설명 옆 검정 용기 단독 사진을 제거했다. 제목·소재 설명으로 정리하고 아래에 실제 350g/500g 사진·규격명·상세 버튼을 배치했다.
- 영상 아래의 중복 규격 선택 버튼은 제거하여 비교 카드로 통합했다. 기존 사용법3단계와 가격 비교표·상품군 유지.
- 두 영역의 PC 영상/설명 비율과 간격을 통일했다. 제목 keep-all·balance로 한국어 단어 중간 줄바꿈 방지. 모바일 영상→설명→버튼/규격 비교 순서.

## 영상 편집 및 재생
- home_product.mp4 / our_jeju_forest.mp4 / detail_product.mp4 모두 native loop 적용.
- muted·playsInline·preload=none 유지. 최초 화면 진입 시 src 설정, 화면 밖/비활성 탭 pause, 사용자 pause 상태는 재진입에도 유지.
- 동작 줄이기에서는 포스터와 직접 재생 버튼 유지. 파일 실패 시 포스터·현지화 안내와 구매 링크 유지.
- 원본은 첨부 해제 폴더에 보존. 공개 파일3개만 로컬 FFmpeg로 재인코딩.
- 홈: 원본0–3초의 같은 제품 장면을 정방향+역방향 연결(6초). 끝부분의 다른 제품 장면 전환 제외.
- 숲: 원본0–3.5초를 정방향+역방향 연결(7초).
- 실물: 원본4–8초의 제품 컷만 정방향+역방향 연결(8초). 앞부분 손/나뭇잎 장면 제외.
- 왕복 편집이므로 중간에서 카메라 이동 방향이 반전된다. 시작/끝은 같은 구도로 연결되며 검은 화면·긴 페이드 없음. 무음 H.264 1280×720, faststart 유지.
- FFmpeg blackdetect(d=0.05, pix_th=0.10)에서 세 파일 모두 검은 구간 검출0. 모든 디스플레이에서의 주관적 무봉제감을 보장하는 표현은 사용하지 않음.

## 검증
- 타입 검사·빌드 통과. 기존 번들 크기 경고 유지.
- 기존 테스트92/92 통과.
- 브라우저 PC1440, 모바일390: 주요20건 + 언어/시장/실패36건 통과. 최종 실물 컷 변경 후 해당 영상·구매 흐름8건 별도 재확인 통과.
- 세 영상 각각 두 번 이상의 자연 반복을 실제시간으로 확인했다. currentTime이 끝→시작으로 돌아가는 timeupdate 기록을 저장했으며 배속·강제 seek를 사용하지 않았다.
- 실제 재생 루프6건(3영상×2뷰포트), 수동 정지 후 재진입, 화면 밖 정지, 탭 이벤트 모의 정지/복귀 검증. 페이지 실행 오류0, 쓰기 요청0.
- 탭 비활성 테스트는 document.hidden/visibilitychange 모의. 실제 OS 탭 전환 및 iOS Safari 실기기 미검증.
- 기존 7개 언어코드·8시장 상품 노출과 상품 보기 링크의 시장 유지, 영상3개 로딩 실패·동작 줄이기 직접재생 검증.
- 규격 카드500g→수량35→SG상품금액1610→결제요청에서 상품·수량 유지 확인.
- API는 로컬 기존상품fixture와 결제비활성 응답 사용. 실제 주문·결제·문의·외부 메시지 발송 없음.

## 증빙
폴더: docs/qa/home-loop-20261015/
- first-screen/forest/detail 각각1440·390 PNG 및 comparison.png (PC·모바일 비교 이미지).
- loop-results.json: 실제 반복 횟수와 시간 기록. detail-loop-recheck.json: 최종 실물 컷 재검증.
- language-market-errors.json: 추가36건.
- product-two-loops.webm / forest-two-loops.webm / detail-two-loops.webm: 브라우저에서 실제 재생된 프레임을 captureStream/MediaRecorder로 기록한 검수용 녹화. 캔버스 하단에 반복 횟수 표시를 덧붙였으며 사이트 영상에는 표시하지 않았다. 전체 운영체제 화면 녹화가 아닌 재생 영상 영역의 녹화이다.
- 중간 프레임 분석·디버그 이미지는 참고용이고 최종 화면은 위 first-screen/forest/detail PNG이다.

## 변경 파일과 배포
- src/components/StoneJejuMedia.tsx
- src/data/homeMediaCopy.ts
- src/pages/HomePage.tsx
- src/styles/v23.css
- public/media/stonejeju/home_product.mp4
- public/media/stonejeju/our_jeju_forest.mp4
- public/media/stonejeju/detail_product.mp4
- 본 보고서

로컬 적용·검증 완료: http://127.0.0.1:4193/?market=SG&lang=ko
Vercel Preview/Production 배포·main push 없음. DB·환경변수·가격·수량·서버 계산·주문/결제 기록 변경 없음.
