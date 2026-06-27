# hondit-shop

Jeju-inspired Korean care and scent landing page for hondit Singapore. The site is built for an Instagram bio link and guides visitors to Shopee Singapore product pages and the official Shopee store.

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
- GA4 event helpers: `src/lib/analytics.ts`
- Page sections: `src/sections`
- Shared UI components: `src/components`
- Global styles and design tokens: `src/styles/global.css`
- Site images: `public/images`
- Original supplied images: `input-assets`

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
4. Add `VITE_GA_MEASUREMENT_ID` in Vercel environment variables when the real GA4 ID is ready.

## GitHub connection later

Create a repository named `hondit-shop`, commit this project, then push it to GitHub. GitHub and Vercel are intentionally not connected yet.

## Canonical URL

The current canonical URL is set in `index.html`:

```text
https://hondit-shop.vercel.app
```

If the final deployment URL changes, update the canonical URL and Open Graph URLs in `index.html`.
