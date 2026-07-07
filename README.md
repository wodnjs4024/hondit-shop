# hondit-shop

Jeju-inspired Korean care and scent website for hondit Singapore. The site is built for an Instagram bio link, Shopee Singapore traffic tracking, and direct Singapore bulk orders through PayPal Sandbox.

## Local setup

Install dependencies:

```bash
npm install
```

Start a local preview server:

```bash
npm run dev
```

This project uses a build-and-preview local server so the page opens reliably on this Windows setup.

Build for production:

```bash
npm run build
```

## Project structure

- Product links and section navigation data: `src/data/siteData.ts`
- Bulk order product data and fallback prices: `src/data/bulkProducts.ts`
- Cart and checkout helpers: `src/lib/cart.ts`, `src/lib/bulkApi.ts`
- Vercel API functions: `api`
- GA4 event helpers: `src/lib/analytics.ts`
- Page sections: `src/sections`
- Shared UI components: `src/components`
- Global styles and design tokens: `src/styles/global.css`
- Site images: `public/images`
- Original supplied images: `input-assets`

## Bulk orders

The same hondit website now includes:

- `/bulk-orders` product catalog
- `/cart` local guest cart
- `/checkout` guest PayPal Sandbox checkout
- `/order-complete/:orderNumber` public order confirmation
- `/admin` protected order, product, and settings dashboard

There is no customer login. Admin access uses Supabase Auth email/password plus the `admin_profiles` table.

Bulk prices include Singapore EMS shipping:

- Foam Oil 150ml: SGD 255 per 30-unit pack
- Foaming Cleanser 200ml: SGD 255 per 30-unit pack
- Cleansing Water 300ml: SGD 255 per 30-unit pack
- Diffuser 350g: SGD 420 per 20-unit pack
- Diffuser 500g: SGD 920 per 20-unit pack

## GA4 measurement ID

Copy `.env.example` to `.env`, then replace the placeholder value:

```text
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

Leaving the value empty or as the placeholder is safe for local development.

For Instagram bio tracking, Shopee click events, and weekly reporting, see:

```text
docs/analytics-operations.md
```

## Vercel deployment

1. Connect the future GitHub repository to Vercel.
2. Set the Vercel project name to `hondit-shop`.
3. Use the default Vite settings:
   - Build command: `npm run build`
   - Output directory: `dist`
4. Add the environment variables from `.env.example`.
5. Redeploy after adding or changing environment variables.

Detailed setup guides:

- `VERCEL_DEPLOYMENT.md`
- `PAYPAL_SANDBOX_SETUP.md`
- `ADMIN_SETUP.md`
- `ORDER_EVIDENCE_GUIDE.md`

## GitHub connection later

Create a repository named `hondit-shop`, commit this project, then push it to GitHub. GitHub and Vercel are intentionally not connected yet.

## Canonical URL

The current canonical URL is set in `index.html`:

```text
https://hondit-shop.vercel.app
```

If the final deployment URL changes, update the canonical URL and Open Graph URLs in `index.html`.
