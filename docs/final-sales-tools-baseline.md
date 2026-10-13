# 작업 기준 및 기존 변경 보존

확인일: 2026-10-13 (Asia/Seoul)
- 원격 main: 61d0e1dd683966f2e346ece39a3c487d97cdbfb4
- Production: dpl_6KKkyTC83oxFsDCHLXokFCnvWfbX / Ready
- 작업 브랜치: codex/final-sales-tools
- 작업 위치: hondit-shop/_codex_work/final-sales-tools
- 기존 sales-flow-revision worktree에는 운영 결과 보고서 수정이 남아 있었으며 건드리지 않음.
- 원래 checkout의 B 구현·005/006/007 및 미커밋 파일 보존. 새 worktree 생성 직후 깨끗한 상태에서 시작.
- 신규 기능은 기존 스키마·GET 상품 API를 재사용하며 api/ 및 supabase/ 파일 변경 없음.

## 원래 checkout의 변경 경로 (내용·비밀값 출력 없음)
```
 M .gitignore
 M README.md
 M api/_bulk-data.js
 M api/_markets.js
 M api/_utils.js
 M api/admin.js
 M api/contact.js
 M api/orders/public/[orderNumber].js
 M api/paypal/capture-order.js
 M api/paypal/create-order.js
 M api/paypal/update-attempt.js
 M api/paypal/webhook.js
 M api/products.js
 M package-lock.json
 M package.json
 M src/App.tsx
 M src/data/bulkProducts.ts
 M src/data/v23SiteData.ts
 M src/lib/bulkApi.ts
 M src/lib/market.tsx
 M src/lib/storefrontApi.ts
 M src/pages/AdminOrderDetailPage.tsx
 M src/pages/AdminProductsPage.tsx
 M src/pages/BulkOrdersPage.tsx
 M src/pages/BulkProductPage.tsx
 M src/pages/ProductDetailPage.tsx
 M supabase/seed_bulk_products.sql
 M tests/payment-system.test.mjs
 M vercel.json
?? .codex/
?? .codex_artifact/
?? _codex_work/
?? _screenshots/
?? api/_money.js
?? api/_pricing.js
?? api/_public.js
?? api/paypal/_capture.js
?? api/paypal/_webhook.js
?? api/quotes.js
?? docs/page-only-production-2026-10-12.md
?? docs/production-deployment-status-2026-10-11.md
?? docs/production-schema-backup-plan.md
?? docs/sales-integration-baseline.json
?? docs/sales-integration-change-manifest.json
?? docs/sales-integration-report.md
?? docs/sales-workflow-code-audit.md
?? docs/sg-quote-local-qa.png
?? docs/sg-sales-condition-change.md
?? hondit-sites-source-v14.zip
?? marketing/
?? outputs/
?? scripts/generate-sales-condition-migration.mjs
?? shared/
?? src/pages/QuotePage.tsx
?? supabase/migrations/005_sg_sales_conditions.sql
?? supabase/migrations/006_versioned_sales_conditions.sql
?? supabase/migrations/007_payment_recovery.sql
?? supabase/preflight/
?? tests/helpers/
?? tests/payment-recovery.test.mjs
?? tests/sales-conditions.test.mjs
```
