# v23 Asset and Cleanup Audit

This audit separates the v23 storefront assets from legacy storefront files. It is a working checklist, not a production deletion log.

## Image Application Table

| Image | Applied page | Applied component | Actual reference code |
|---|---|---|---|
| `/images/hondit-tidal-ritual-hero.webp` | Home | `HomePage` hero | `src/pages/HomePage.tsx` |
| `/images/hondit-jeju-dawn-hero-v2.webp` | Home | `HomePage` Jeju editorial panel | `src/pages/HomePage.tsx` |
| `/images/hondit-diffuser-detail.webp` | Home | `HomePage` diffuser guide | `src/pages/HomePage.tsx` |
| `/images/jeju-wind-coast-v2.webp` | Common, Shipping | `V23PageHero`, `ShippingPage` | `src/components/v23/SiteChrome.tsx`, `src/pages/ShippingPage.tsx` |
| `/images/jeju-water-basalt-v2.webp` | Products | `V23PageHero` | `src/pages/ProductsPage.tsx` |
| `/images/hondit-collection-hero.webp` | Bulk Orders | `V23PageHero` | `src/pages/BulkOrdersPage.tsx` |
| `/images/jeju-field-university.webp` | Contact, Our Jeju, map detail | `ContactPage`, `JejuPage`, `V23GeoJourney` | `src/pages/ContactPage.tsx`, `src/pages/JejuPage.tsx`, `src/data/v23JejuData.ts` |
| `/images/jeju-sea-motion.mp4` | Our Jeju | `JejuPage` hero media | `src/pages/JejuPage.tsx` |
| `/images/jeju-field-sea.webp` | Our Jeju | reference card | `src/pages/JejuPage.tsx` |
| `/images/jeju-field-hallasan.webp` | Home map, Our Jeju map | `V23GeoJourney` detail card | `src/data/v23JejuData.ts` |
| `/images/jeju-field-woljeongri.webp` | Home map, Our Jeju map | `V23GeoJourney` detail card | `src/data/v23JejuData.ts` |
| `/images/jeju-field-bijarim.webp` | Our Jeju, map detail | `JejuPage`, `V23GeoJourney` | `src/pages/JejuPage.tsx`, `src/data/v23JejuData.ts` |
| `/images/jeju-field-seongsan.webp` | Our Jeju, map detail | `JejuPage`, `V23GeoJourney` | `src/pages/JejuPage.tsx`, `src/data/v23JejuData.ts` |
| `/images/jeju-field-jusangjeolli.webp` | Our Jeju, map detail | `JejuPage`, `V23GeoJourney` | `src/pages/JejuPage.tsx`, `src/data/v23JejuData.ts` |
| `/images/korea/kbeauty.jpg` | Home map | Korea reference card | `src/components/v23/GeoJourney.tsx` |
| `/images/korea/korean-food.webp` | Home map | Korea reference card | `src/components/v23/GeoJourney.tsx` |
| `/images/korea/seoul-night.webp` | Home map | Korea reference card | `src/components/v23/GeoJourney.tsx` |
| `/images/korea/hanbok.webp` | Home map | Korea reference card | `src/components/v23/GeoJourney.tsx` |
| `/images/diffuser-350g.webp` | Products, product detail, bulk route | `V23CatalogGrid`, `ProductDetailPage`, `BulkOrdersPage` | `src/data/v23SiteData.ts` |
| `/images/diffuser-500g.webp` | Products, product detail, bulk route | `V23CatalogGrid`, `ProductDetailPage`, `BulkOrdersPage` | `src/data/v23SiteData.ts` |
| `/images/foam-oil.webp` | Products, product detail, bulk route | `V23CatalogGrid`, `ProductDetailPage`, `BulkOrdersPage` | `src/data/v23SiteData.ts` |
| `/images/foaming-cleanser.webp` | Products, product detail, bulk route | `V23CatalogGrid`, `ProductDetailPage`, `BulkOrdersPage` | `src/data/v23SiteData.ts` |
| `/images/cleansing-water.webp` | Products, product detail, bulk route | `V23CatalogGrid`, `ProductDetailPage`, `BulkOrdersPage` | `src/data/v23SiteData.ts` |

## Map Data

| Map | Source | Implementation | Notes |
|---|---|---|---|
| Asia/world map | `@svg-maps/world` | `src/components/v23/GeoJourney.tsx` | South Korea is the only highlighted/selectable country. |
| South Korea map | `@svg-maps/south-korea` | `src/components/v23/GeoJourney.tsx` | Jeju is selected from the real province path, not a fake drawn island. |
| Jeju map | `@svg-maps/south-korea` Jeju path crop | `src/components/v23/GeoJourney.tsx` | Markers are projected from latitude/longitude in `src/data/v23JejuData.ts`. |

## Verification Notes

| Check | Result |
|---|---|
| Build | `npm.cmd run build` passes. Vite reports the existing large bundle warning only. |
| Customer CSS isolation | No public v23 route imports `src/styles/storefront.css`. |
| Legacy map isolation | No public v23 route references `map-asia`, `map-korea` or `map-jeju` image assets. |
| Static image references | All v23 storefront image and video paths resolve from `public/images`; no observed image 404 in browser checks. |
| Product card alignment | All five product cards share the same measured height, price top and button row top at 1440px. |
| Responsive overflow | `/`, `/jeju`, `/products`, `/bulk-orders`, `/shipping`, `/contact` checked at 1440px, 768px and 390px with no horizontal overflow after the contact honeypot fix. |
| Map stage layout | Asia, South Korea and Jeju stages checked at 1440px; map/card sections do not overlap or overflow. |

## Customer Storefront Deletion Candidates

These are old customer-facing files that are no longer the new storefront baseline. They should be removed only after final visual and route verification.

| Candidate | Type | Why it is a deletion candidate | Keep operational files separate |
|---|---|---|---|
| `src/styles/storefront.css` | Legacy customer CSS | Not imported by `src/main.tsx`; old visual layer conflicts with v23 baseline. | Do not remove `src/styles/admin.css`. |
| `src/components/SiteHeader.tsx` | Legacy customer header | Replaced by `src/components/v23/SiteChrome.tsx`. | Admin layout is separate. |
| `src/sections/*` | Legacy customer sections | Previous Home DOM sections are no longer used by `src/App.tsx`. | No API/admin logic here. |
| `src/components/JejuJourney.tsx` | Legacy map component | Uses old image-based maps and old marker logic. | Replaced by `V23GeoJourney`. |
| `src/components/OurJejuFieldGuide.tsx` | Legacy Jeju map component | Uses old editorial SVG map and overlaps with v23 map. | Replaced by `V23GeoJourney` and `JejuPage`. |
| `src/components/ProductCard.tsx` | Legacy product card | Used by legacy sections only; v23 uses `V23ProductCard`. | `ProductReviews` is operational and should stay. |
| `src/components/CampusVisual.tsx` | Legacy visual helper | Legacy customer visual helper, not used by v23 pages. | Do not delete images still used by v23. |
| `src/data/siteData.ts` | Legacy customer content | Supports old sections/header/footer. | Confirm no remaining operational imports before deletion. |
| `src/data/jejuJourneyData.ts` | Legacy customer map data | Old map/content data, separate from `v23JejuData.ts`. | Do not delete `v23JejuData.ts`. |
| `src/data/ourJejuData.ts` | Legacy customer Jeju data | Superseded by `v23JejuData.ts`. | Do not delete until imports are zero. |
| `public/images/map-asia-pastel.svg` | Legacy map asset | Old image map should not drive v23 map. | New maps are package path data. |
| `public/images/map-korea-pastel.svg` | Legacy map asset | Old image map should not drive v23 map. | New maps are package path data. |
| `public/images/map-jeju-field.svg` | Legacy map asset | Old image map should not drive v23 map. | New maps are package path data. |
| `public/images/map-jeju-editorial.svg` | Legacy map asset | Old image map should not drive v23 map. | New maps are package path data. |

## Preserve

| File or area | Reason |
|---|---|
| `api/paypal/*` | PayPal create, capture, update-attempt and webhook must remain intact. |
| `api/admin.js` | Orders, refunds, products, reviews, settings, inquiries and replies are operational. |
| `api/products.js`, `api/_utils.js`, `api/_bulk-data.js` | Public/admin product and checkout calculations. |
| `src/lib/bulkApi.ts` | PayPal, admin, public order and fallback product adapter. |
| `src/components/ProductReviews.tsx` | Product detail review submission and display. |
| `src/pages/Admin*` | Korean admin operations. |
| `src/data/bulkProducts.ts` | Operational fallback product catalog and admin formats. |
| `vercel.json` | API rewrites and SPA fallback. |
