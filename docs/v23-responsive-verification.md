# v23 responsive verification

Date: 2026-07-22
Branch: `codex/v23-frontend-replacement`

## Build

| Check | Result |
|---|---|
| Production build | Passed with `npm run build` |
| Main branch merge | Not merged |
| Production deployment | Not changed |
| Vercel Preview | Blocked locally by invalid Vercel token; branch was pushed for Git-based preview |

## Captures

Viewport screenshots were taken at browser zoom 100%.

| Page | 1440px | 768px | 390px |
|---|---|---|---|
| Home | `docs/v23-screenshots/home-1440.png` | `docs/v23-screenshots/home-768.png` | `docs/v23-screenshots/home-390.png` |
| Explore Jeju | `docs/v23-screenshots/jeju-1440.png` | `docs/v23-screenshots/jeju-768.png` | `docs/v23-screenshots/jeju-390.png` |
| Products | `docs/v23-screenshots/products-1440.png` | `docs/v23-screenshots/products-768.png` | `docs/v23-screenshots/products-390.png` |

## Scope Verified

| Area | Result |
|---|---|
| v23 storefront routes | Home, Explore Jeju, Products, Bulk Orders, Shipping, Contact implemented as v23 pages |
| Legacy customer CSS | `src/main.tsx` does not import `src/styles/storefront.css` |
| New map basis | Asia and Korea maps use `@svg-maps/world` and `@svg-maps/south-korea`; Jeju is derived from real South Korea map geometry |
| Old map image assets | Old `map-asia`, `map-korea`, and `map-jeju` files are not used by v23 public routes |
| Product cards | The five v23 product cards use fixed product media, aligned metadata, price, and action rows |
| Operational files | PayPal, order, refund, review, contact, admin, GA4, env and Vercel configuration remain preserved |

## Remaining External Check

The local Vercel CLI could not create a preview because the configured token was invalid. After Vercel auth is refreshed, run a Preview deployment from this branch and compare it against the saved captures.
