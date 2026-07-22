# v23 Frontend Replacement - Operational Contract Inventory

This document fixes the operational contracts that must survive the v23 storefront replacement. The customer-facing React screens may be replaced, but these server/API/admin/analytics contracts must stay connected.

## Branch Scope

| Item | Value |
|---|---|
| Working branch | `codex/v23-frontend-replacement` |
| Source design | `C:/Users/user/Downloads/hondit-sites-design-source-v23.zip` |
| Rule | Replace customer storefront with v23 UI. Preserve and reconnect operations. |
| Production/main | Do not merge or deploy to production before approval. |

## API Contract Table

| Feature | Endpoint or file | Method | Input | Output | v23 connection note |
|---|---|---|---|---|---|
| Product and stock list | `/api/products` | `GET` | Optional query `slug` | `{ products }` | Products, detail pages, bulk checkout must read catalog data through an adapter. |
| PayPal create order | `/api/paypal/create-order` | `POST` | `orderType`, `customerName`, `customerEmail`, `customerPhone`, Singapore address fields, `cart: [{ slug, packCount }]`, optional `companyName`, `customerNote`, `attribution` | `{ paypalOrderId, orderNumber }` | v23 Bulk Checkout must call this server endpoint only. PayPal secret remains server-side. |
| PayPal capture order | `/api/paypal/capture-order` | `POST` | `paypalOrderId`, `orderNumber` | `{ orderNumber }` | Called after sandbox approval. Updates order as paid and inserts payment event/history. |
| Payment failure/cancel | `/api/paypal/update-attempt` | `POST` | `orderNumber`, optional `paypalOrderId`, `status: payment_failed/payment_cancelled`, optional `reason` | `{ orderNumber, status }` | v23 cancel/failure states must record attempts here. |
| PayPal webhook | `/api/paypal/webhook` | `POST` | PayPal webhook payload and PayPal verification headers | `{ received: true }` | Preserve for server-side payment reconciliation. |
| Public order lookup | `/api/orders/public/:orderNumber` | `GET` | Route param `orderNumber` | `{ order }` with public order and item fields | Order complete/failure pages can show saved order status from here. |
| Admin login | `/api/admin/login` | `POST` | `email`, `password` | `{ accessToken }` | Admin remains Korean and independent from the v23 storefront. |
| Admin dashboard | `/api/admin/summary` | `GET` | Bearer admin token | Totals, recent orders, checkout attempts, products, countries, sources | Preserve for Korean operations dashboard. |
| Admin order list | `/api/admin/orders` | `GET` | Bearer token; optional `status`, `paymentStatus`, `orderStatus`, `orderType`, `from`, `to`, `search/q` | `{ orders }` | Preserve order/shipping/cancel/refund operations. |
| Admin order detail | `/api/admin/orders/:id` | `GET` | Bearer token; order id | `{ order, items, paymentEvents, history }` | Preserve order history and payment trace. |
| Admin order update | `/api/admin/orders/:id` | `PATCH` | Bearer token; order/customer/payment/shipping/cancel/refund/internal note fields | `{ order }` | Preserve shipping, cancellation, refund status workflows. |
| Admin PayPal refund | `/api/admin/orders/:id/refund` | `POST` | Bearer token; `reason` | `{ refund }` | Uses saved `paypal_capture_id`; must not be simplified. |
| Admin products | `/api/admin/products` | `GET` | Bearer token | `{ products }` | Korean admin product list/editing remains the source for products, prices, MOQ, stock, images. |
| Admin product upsert | `/api/admin/products` | `PATCH` | Bearer token; `{ products: [...] }` | `{ products }` | v23 public UI reads output through public product adapter. |
| Admin settings | `/api/admin/settings` | `GET/PATCH` | Bearer token; optional `{ settings }` | `{ settings }` | Preserve GA4, PayPal, email/operation settings visibility. |
| Public reviews | `/api/reviews?productSlug=...` | `GET` | `productSlug` | `{ reviews }` | v23 product detail reviews should read approved reviews. |
| Submit review | `/api/reviews` | `POST` | `orderNumber`, `customerEmail`, `productSlug`, `rating`, `body`, optional `displayName`, `title` | `201 { review, message }` | Preserve verified-purchase review submission. |
| Admin review list/update/delete | `/api/admin/reviews`, `/api/admin/reviews/:id` | `GET/PATCH/DELETE` | Bearer token; status/admin note fields | `{ reviews }` or `{ review }` | Preserve Korean review moderation. |
| Contact inquiry save | `/api/contact` | `POST` | `name`, `email`, optional `company`, optional `orderNumber`, `inquiryType`, `message`, honeypot `website` | `201 { ok, referenceNumber, inquiry }`; spam honeypot returns `{ ok, referenceNumber }` | v23 Contact UI saves directly to Supabase `inquiries` and shows the reference number. |
| Admin inquiry list/update | `/api/admin/inquiries` | `GET/PATCH` | Bearer token; optional `status`; patch uses `id`, `status`, optional `adminNote` | `GET { inquiries }`; `PATCH { inquiry }` | Korean admin inbox can filter, mark status and keep internal notes. |
| Admin inquiry reply | `/api/admin/inquiries/reply` | `GET/POST` | Bearer token; `GET ?inquiry=id`; `POST { inquiryId, subject, body }` | `GET { replies }`; `POST { sent, message, reply }` | Sends through Resend when configured; otherwise saves a draft reply and keeps mailto fallback available. |
| GA4 | `src/lib/analytics.ts` | Client helper | `VITE_GA_MEASUREMENT_ID`, route and event payloads | `gtag` events and page views | Keep page views and ecommerce/contact/product events in new storefront. |
| Vercel routing | `vercel.json` | Rewrites | `/api/admin/:path*`, `/api/(.*)`, SPA fallback | API and app routing | Preserve current Vite output and serverless routes. |

## Environment Variables

| Variable | Scope | Used by | Purpose |
|---|---|---|---|
| `VITE_GA_MEASUREMENT_ID` | Client | `src/lib/analytics.ts` | GA4 measurement id. |
| `VITE_PAYPAL_CLIENT_ID` | Client | Bulk Checkout PayPal SDK | Public PayPal SDK client id only. |
| `PAYPAL_ENV` | Server | PayPal APIs | `sandbox` or live PayPal base URL. Keep sandbox for preview. |
| `PAYPAL_CLIENT_ID` | Server | PayPal APIs | Server PayPal credential. Do not expose to client. |
| `PAYPAL_CLIENT_SECRET` | Server | PayPal APIs | Server PayPal secret. Do not expose to client. |
| `PAYPAL_WEBHOOK_ID` | Server | PayPal webhook | Optional webhook signature verification id. |
| `VITE_SUPABASE_URL` | Client/Admin auth | Admin login | Public Supabase URL for auth. |
| `VITE_SUPABASE_ANON_KEY` | Client/Admin auth | Admin login | Public anon key for Supabase auth. |
| `SUPABASE_URL` | Server | API routes | Supabase REST base. |
| `SUPABASE_SERVICE_ROLE_KEY` | Server | API routes | Service role key. Do not expose to client. |
| `SITE_URL` | Server | Notifications/links | Public site URL for admin/order links. |
| `TELEGRAM_BOT_TOKEN` | Server optional | New order notification | Telegram bot token. |
| `TELEGRAM_CHAT_ID` | Server optional | New order notification | Telegram destination chat id. |
| `RESEND_API_KEY` | Server optional | Admin inquiry reply | Enables real customer email replies from the admin inbox. |
| `SUPPORT_FROM_EMAIL` | Server optional | Admin inquiry reply | Verified sender address for support replies. |
| `SUPPORT_REPLY_TO` | Server optional | Admin inquiry reply | Reply-to address; falls back to customer service email when absent. |

## Supabase Data Surfaces

| Table | Existing | Used for |
|---|---|---|
| `products` | Yes | Product, price, MOQ, stock, image, active/purchase flags. |
| `orders` | Yes | Bulk checkout records, payment/shipping/refund state, attribution. |
| `order_items` | Yes | Purchased product lines and quantities. |
| `payment_events` | Yes | PayPal create/capture/failure/refund/webhook trace. |
| `order_status_history` | Yes | Admin-visible order status timeline. |
| `admin_profiles` | Yes | Admin authorization after Supabase auth login. |
| `site_settings` | Yes | Operational settings/status. |
| `reviews` | Yes | Verified public product reviews and admin moderation. |
| `inquiries` | Needs Supabase table if not already present | v23 Contact save, admin inquiry inbox, status and internal notes. |
| `inquiry_replies` | Needs Supabase table if not already present | Admin reply history, sent/draft status, provider id and error audit trail. |

## Adapter Layer Plan

Create a storefront API adapter so v23 components do not know old component shapes:

| Adapter function | Connects to |
|---|---|
| `loadStorefrontProducts()` | `GET /api/products` |
| `loadStorefrontProduct(slug)` | `GET /api/products?slug=...` |
| `createBulkOrder(payload)` | `POST /api/paypal/create-order` |
| `captureBulkOrder(payload)` | `POST /api/paypal/capture-order` |
| `recordPaymentAttempt(payload)` | `POST /api/paypal/update-attempt` |
| `loadPublicOrder(orderNumber)` | `GET /api/orders/public/:orderNumber` |
| `loadProductReviews(productSlug)` | `GET /api/reviews?productSlug=...` |
| `submitProductReview(payload)` | `POST /api/reviews` |
| `submitContactInquiry(payload)` | `POST /api/contact` |

## Supabase Additions for v23 Contact

These are data tables, not storefront components. They are required only if the target Supabase project does not already include matching tables.

```sql
create table if not exists inquiries (
  id text primary key,
  reference_number text not null unique,
  name text not null,
  email text not null,
  company text,
  order_number text,
  inquiry_type text not null,
  message text not null,
  status text not null default 'new',
  admin_note text,
  created_at text not null,
  updated_at text not null,
  read_at text,
  replied_at text
);

create index if not exists inquiries_email_idx on inquiries (email);
create index if not exists inquiries_created_idx on inquiries (created_at);
create index if not exists inquiries_status_idx on inquiries (status);

create table if not exists inquiry_replies (
  id text primary key,
  inquiry_id text not null,
  sender_email text not null,
  recipient_email text not null,
  subject text not null,
  body text not null,
  status text not null default 'draft',
  provider_id text,
  error_message text,
  created_at text not null,
  sent_at text
);

create index if not exists inquiry_replies_inquiry_idx on inquiry_replies (inquiry_id, created_at);
```

## Preservation Rules

| Preserve | Do not preserve |
|---|---|
| `api/paypal/*` payment logic | Old customer page DOM just to keep styles working |
| `api/admin.js` operational workflows | Old storefront CSS overlays that change v23 structure |
| `api/products.js` and product DB contract | Old map drawings that conflict with v23 maps |
| `api/reviews/*` review verification | Old product image references where v23 provides new images |
| `src/lib/analytics.ts` GA4 helper | Any client exposure of PayPal/Supabase secrets |
| `vercel.json` API rewrites | Production deployment before approval |
