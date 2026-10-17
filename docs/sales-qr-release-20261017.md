# 판매·QR 선행 릴리스 구현 결과

## 확정 소스와 보존

- 배포 가능한 **앱 소스 커밋**: `b42d6bf200b95f84323f0a0f491a90cd4c12b6f6`.
- 브랜치: `codex/sales-qr-release`. Production `45ebbe84a09441ae641586884223d27e5cf9696e`에서 별도 worktree로 시작했다.
- 원래 미커밋 후속 작업 전체 보존 커밋: `31f7918c24f0471e76226593079ca8d8f0c03ad1`, 원래 브랜치 `codex/sales-tracking-phase1-pc`에 남겨뒀다. Claude 디자인·B·로컬 main 작업은 수정하지 않았다.
- 현재 Production 복구 지점: `dpl_5mAi8Se9Ew4t8hKZq2qC1YgZLyH4`, 소스 `45ebbe84a09441ae641586884223d27e5cf9696e`. Preview 이후에도 동일함을 Vercel 읽기 API로 재확인했다.
- 전체 변경 파일 **63개**의 정확한 목록과 핵심 파일 해시는 [release-manifest.json](qa/sales-qr-release-20261017/release-manifest.json)에 있다. 이 문서·캡처·증거는 별도 문서 커밋이며 위 앱 소스를 변경하지 않는다.

## 구현한 경계

| 기능 | 구현·근거 |
|---|---|
| 판매 선택값 전달 | `shared/sales-tools.*`, `src/lib/market.tsx`, 상품·해외 주문·Partners·Contact·RequestActions. 상품·수량·시장·언어·목적·이행방식을 허용된 공개값으로 전달. 내부 이동에 UTM을 재부착하지 않음 |
| 제주 수령 오류 | `PickupRequestPanel.tsx`가 선택한 500g/2개로 가격·복사문·이메일 초안을 동일 계산. 80,000원 확인. 가격 원본 `shared/pickup.js`는 Production과 동일 |
| QR 6개 | `config/qr-links.json`, `scripts/sync-qr-redirects.mjs`, `vercel.json`, `api/qr-not-found.js`. 기존 rewrite와 병합한 정적 307, 미등록 404. 모두 DRAFT |
| 유입 저장 | `shared/attribution.*`, `src/lib/attribution.ts`. 최초 90일·최근 외부 30일, 저장소 사용 불가 시 메모리로 구매 계속. 공개 캠페인 값만 저장 |
| 브라우저 분석 | `index.html`의 무조건 GA 로드 제거. `analyticsConsent.ts`, `AnalyticsConsent.tsx`, `analytics.ts`, 공통 policy로 미선택/거부/철회/180일 만료 시 이벤트 차단. 허용 때만 Production 태그 초기화 |
| 조회·연락 행동 | 경로 기반 page_view로 수량·쿼리·해시 변경 중복 억제. 실제 상품 로드 뒤 view_item. contact_click와 성공한 request_copy 구분. 연락 클릭/복사를 문의 접수로 간주하지 않음 |
| 새 주문 조회 | `api/_order-access.js`, 생성 서버, `bulkApi.ts`, `orderAccess.ts`, 공개 조회 API. 서명·주문 결속·30일 만료 검증 후 조회. sessionStorage/메모리 보관, URL·localStorage·이벤트에는 토큰 미포함. 명시적 허용 필드로 개인정보·내부 메모 비공개 |
| 과거 주문·안내 | 토큰 없는 과거/배포 전 진행/다른 브라우저 주문은 주문번호 문의 안내. 접근 제한을 미결제·대기·실패로 추정하지 않음. 복구 기능 추가 안 함 |
| 실패 재시도 | 기록된 상품·수량·국가·언어·목적만 복원. 혼합 주문·조건 변경·자료 부족은 단일 상품 재결제로 연결하지 않음 |
| 브라우저 purchase | 조회 성공한 completed 주문 + 동의 허용일 때만 전송, 세션/메모리 중복 방지 유지. 조회 불가·대기·실패·거부·철회는 추정 purchase 없음 |

## 서버 분석은 OFF 설정이 아니라 코드에서 분리

- 릴리스에 `api/_server-analytics.js`, `_analytics-target.js`, `api/analytics/*`, `src/lib/purchaseAnalyticsContext.ts` **없음**.
- `src/main.tsx`와 동의 UI의 bind/sync import·호출, 주문 화면의 GA 식별자 수집·analyticsContext 전송, 생성 서버의 saveAnalyticsContext/newDeliveryOwner import·호출을 제거했다.
- 공개 조회 API도 서버 소유권 모듈을 import하거나 소유권 필드를 반환하지 않는다. 이 릴리스는 브라우저 purchase만 사용한다.
- `008/009/010`과 그 preflight는 포함하지 않았다. 기존 supabase 파일은 Production과 차이 없음. 새 분석 API·RPC·테이블을 참조하는 실행 코드가 없음을 테스트가 재귀 검사한다.
- `SERVER_ANALYTICS_*`를 일부러 true로 둔 모의 통합 테스트에서도 주문·Capture·반복 Webhook·조회가 기존 테이블만 사용한다.
- `api/admin.js`, Capture·Webhook·update-attempt·PayPal config·기존 유틸·시장/상품/가격/배송 조건 핵심 **11개 파일이 Production과 동일**하다. 해시 대조 기록 참조. 직접결제 허용 시장이나 가격을 확대하지 않았다.

## 기존 DB의 UTM 제약

`api/paypal/create-order.js:createOrderRow`는 기존 `utm_content/utm_term` 열이 없으면 그 두 필드만 제외하고 다시 저장한다. 모의 스키마에서 첫 요청의 열 오류와 두 번째 정상 저장·결제를 검증했다. 기존 utm_source/medium/campaign, landing_page, referrer 의미는 변경하지 않았다.

**link_id 전용 주문 열과 구조화된 utm_content/term은 보장되지 않는다.** QR 진입 URL이 landing_page에 남는 경우와 개인 채널 요청문의 `Reference: l000x`는 활용할 수 있으나 모든 주문에 link_id가 완전히 고정된다고 보고하지 않는다. 신규 열·다른 기존 필드로의 우회 저장·DB 변경은 하지 않았다.

## 검증 결과

| 검증 | 결과·범위 |
|---|---|
| 전체 로컬 테스트 | **136/136 통과**, `node --test tests/*.test.mjs` |
| 빌드 | **성공**, `npm run build`. 기존 500kB 초과 chunk 경고 유지 |
| 모의 통합 | 기존 테이블만 허용하고 utm_content/term·008/009/010이 없는 fetch 어댑터로 실제 생성·Capture·Webhook·조회 핸들러 실행. 모든 외부 요청은 합성 응답 |
| SG 금액 | 350g: 10/230, 20/420, 21/441, 35/735, 100/2100 SGD. 500g: 10/500, 20/920, 23/1058 SGD. 클렌징 3개 SKU 각30/267 SGD. 클라이언트 가짜 금액1 무시 |
| 수량 거부 | 15·19·0·음수·소수·빈값·문자에서 주문 생성 차단 |
| 결제 보존 | 완료 Capture 재요청과 중복 완료 Webhook에도 completed 유지. 새 분석 접근 0. 실제 PayPal 호출은 없음 |
| 구매 이벤트 | 완료 조회 성공/동의 허용만 purchase1. 조회 불가/대기/실패/거부/철회0. 순수 모의 gtag, GA 외부 전송 없음 |
| 토큰 | 실제 로컬 브라우저에서 발급·session 보관·URL 미포함, 정상 조회·개인정보 제외, 변조/만료/다른 주문 거부 확인 |
| 안내·재시도 | 실제 로컬 모바일에서 조회 불가가 결제 상태 추정을 하지 않음. 실패 주문의 500g/35/SG/ja/resale 재시도 URL과 도착 화면 확인. 지원 언어별 안내는 모의 UI 테스트 |
| 제주 수령 | PC1440/모바일390에서 500g·2개 80,000원 및 실제 복사문 일치. 복사 성공 문구는 주문 접수와 구분 |
| 뒤로/앞으로 | 수량 편집은 history.replace. 뒤로가기는 이전 페이지로, 앞으로가기는 편집된 수량 유지. 기능 파라미터·언어 전환은 모의 UI 회귀 포함 |
| 실제 Preview QR | **6개×6언어=36건 모두 HTTP307**, Location의 UTM/link_id/언어/선택값 유지와 최종200. 미등록404. 홈·SG 홈·제주 수령·사업자 목적지 실제 브라우저 렌더 확인 |
| Preview 격리 | **함수0**, 정적263파일, 운영 DB 키 미포함, CSP connect-src self, 9개 쓰기 경로403. PayPal 설정 false/clientId 빈값, SDK·GA 태그 미로드. Preview checkout 콘솔 오류0 |

증거: `docs/qa/sales-qr-release-20261017/`의 테스트·빌드 로그, 모의·브라우저 결과, HTTP 결과, 아티팩트 파일 해시, PC·모바일 캡처. 최초 테스트는 dist가 없어 기존 partner demo 테스트1개가 실패했고 빌드 후 전체136개가 통과했다. Windows 디렉터리 제한 때문에 빌드/테스트/로컬 서버는 승인된 권한 확대로 실행했다.

## 격리 Preview

- URL: https://hondit-shop-pw4hpakb0-hondit.vercel.app/
- 제주 검토: https://hondit-shop-pw4hpakb0-hondit.vercel.app/q/l0002?lang=ko&product=diffuser-500g&quantity=2
- 배포 ID: `dpl_EfKE9VxqgPTU94e2eaKTAJh5E8YF`.
- 기존 `hondit-shop` 프로젝트의 Preview만 생성. Git push·Production 배포·설정 변경 없음. 기존 Vercel 보호 설정 유지; 휴대폰에서는 계정 로그인이 필요할 수 있다. 기존 자동화 자격증명은 HTTP 점검 메모리에서만 사용했고 보고서·URL에 넣지 않았다.
- **이 정적 Preview는 운영 승격하지 않는다.** 서버 함수가 없으므로 실제 결제·서버 조회 E2E 증거가 아니다. 결제·조회 핸들러는 로컬 모의 통합 검증 결과와 구분한다.

### 동일 Preview 준비 도구

일반 앱은 `npm ci`와 `npm run build`로 빌드한다. Preview 아티팩트 준비에만 기존 QA 도구 `@vercel/routing-utils@6.6.0`이 `.qa-tools/route-runtime/node_modules`에 필요하다. 새 체크아웃에서 준비하려면 다음과 같이 설치 위치를 제한한다. 이는 제품 런타임 의존성이 아니다.

```powershell
npm install --prefix .qa-tools/route-runtime --no-save --ignore-scripts @vercel/routing-utils@6.6.0
$env:VERCEL_ENV='preview'
$env:VITE_ANALYTICS_TEST_ENABLED='0'
npm run build
# 기존 HONDIT 프로젝트의 .vercel/project.json 경로만 지정. 새 프로젝트 생성 금지.
$env:HONDIT_VERCEL_PROJECT_FILE='<기존 프로젝트 project.json 절대경로>'
node scripts/prepare-isolated-preview.mjs
# 기존 계정·권한에서 Preview만 배포. --prod 사용 금지.
vercel deploy --prebuilt --yes --target preview --scope hondit --cwd .qa-tools/isolated-preview
```

## 운영 적용에 필요한 설정 (이번에는 미변경)

1. 기존 Production Supabase·PayPal live/client·webhook·site_settings 설정을 유지한다. Preview의 빈 clientId·sandbox 설정·CSP·정적 API 응답을 운영으로 복사하지 않는다.
2. `SERVER_ANALYTICS_RECORDING=false`, `SERVER_ANALYTICS_NEW_ORDER_OWNER=legacy_browser`, `SERVER_ANALYTICS_SEND_ENABLED=false`, `SERVER_ANALYTICS_TEST_SEND_ENABLED=false` 유지. 이 브랜치에는 이를 실행하는 서버 모듈 자체가 없다.
3. 브라우저 운영 분석은 Production 빌드(`VERCEL_ENV=production`)와 공식 호스트에서만 동작. `VITE_ANALYTICS_TEST_ENABLED=0`/미설정, 테스트 ID 비활성. 기존 운영 측정 ID 유지. GA4 계정 설정·향상된 측정 상태/실제 수신은 이번에 변경·검증하지 않았다.
4. `ORDER_LOOKUP_SECRET`은 서버 전용 전용키 사용 권장. 이 릴리스는 키가 없으면 기존 `PAYPAL_CLIENT_SECRET`으로 서명하는 호환 경로가 있어 새 DB나 필수 신규 환경변수 없이 작동한다. 어느 키든 조회 기간 중 변경하면 기존 토큰이 거부되므로 설정·회전 시점을 운영자가 고정해야 한다. 이번에 키를 생성·출력·설정하지 않았다.
5. DB 마이그레이션·새 cron·API secret·GA 서버 소유권 설정은 필요 없다. 현재 운영 DB의 실제 URL 일치는 별도 확인 미완료지만 이 릴리스는 기존 연결 대상을 변경하지 않는다.

## 별도 승인 후 배포·복구

- 승인 대상은 위 **b42d6bf 앱 소스**다. 부분 파일 복사 대신 정확한 커밋 전체를 기존 Git→Vercel Production 경로로 반영한다. 그 전에 원격 main/Production이 바뀌었는지 다시 확인하고 달라졌으면 덮어쓰지 않고 병합·재검증한다. 미커밋 main·Claude·B를 reset하거나 강제 push하지 않는다.
- 현재까지 원격 main push·운영 배포·운영 DB·운영 GA4·시트 변경 없음. 실제 주문 조회·결제·환불·문의 전송 없음. S$320 재전송·서버 추적 확장은 하지 않았다.
- 적용 직후 QR·선택값·가격·PayPal config·토큰 없는 안내를 확인한다. 실거래 대신 안전한 읽기/합성 절차를 유지한다.
- 이상 시 기존 배포 `dpl_5mAi8Se9Ew4t8hKZq2qC1YgZLyH4`로 **코드만** 복구한다. 거래 데이터를 삭제·재계산·DB 롤백하지 않는다. Git 자동 배포가 다시 덮지 않도록 기존 릴리스 경로에서 되돌림 커밋을 마련한다.
- 이전 API는 무인증 조회의 개인정보 노출 문제가 있으므로 그 API까지 복귀하는 복구에는 알려진 보안 한계가 있다. 가능한 경우 서명 검증·명시적 응답 projection은 유지하는 후속 복구 커밋을 테스트한 뒤 사용한다. 새 주문 토큰의 접근성을 복구 후 확인한다. 운영 환경변수 변경은 코드 롤백으로 되돌아가지 않는다.

## 남은 제한

- 과거·다른 브라우저·세션 삭제·30일 만료 주문은 문의 안내만 제공. 해당 purchase는 추정 전송하지 않아 브라우저 구매 집계에서 빠질 수 있다. 완료 화면 미복귀도 이 릴리스에서는 측정 누락 가능.
- 문의·복사 이벤트는 실제 발송/접수/유효 리드가 아니다. QR 방문은 정확한 스캔 횟수가 아니다.
- 신규 주문의 link_id 구조화 저장은 미완전. 원본 DB 필드 의미 변경·추가 없음.
- 실제 Production 결제 완료·GA4 수신·고객 문의 수신은 검증하지 않았다. 격리 Preview는 기능/라우팅/표시 검증이며 운영 서버 통합 성공으로 보고하지 않는다.
