# Vercel Deployment

Production URL:

```text
https://hondit-shop.vercel.app
```

Build settings:

- Framework preset: Vite
- Build command: `npm run build`
- Output directory: `dist`

Required environment variables:

```text
VITE_GA_MEASUREMENT_ID
VITE_PAYPAL_CLIENT_ID
PAYPAL_ENV
PAYPAL_CLIENT_ID
PAYPAL_CLIENT_SECRET
PAYPAL_WEBHOOK_ID
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
SITE_URL
```

After changing environment variables, click Redeploy in Vercel. Environment variables are not applied to the already-running deployment until redeploy.

Instagram bio URL:

```text
https://hondit-shop.vercel.app/?utm_source=instagram&utm_medium=bio&utm_campaign=instagram_bio_launch
```
