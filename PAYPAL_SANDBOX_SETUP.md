# PayPal Sandbox Setup

Use Sandbox first. Do not switch to Live until test orders are working end to end.

1. Go to PayPal Developer Dashboard.
2. Create or open a Sandbox REST app.
3. Copy the Sandbox Client ID and Secret.
4. In Vercel, add:
   - `VITE_PAYPAL_CLIENT_ID`
   - `PAYPAL_CLIENT_ID`
   - `PAYPAL_CLIENT_SECRET`
   - `PAYPAL_ENV=sandbox`
5. Redeploy the Vercel project.
6. Open `/bulk-orders`, add a product to cart, and test checkout with a PayPal Sandbox buyer account.

Webhook:

1. In the PayPal Sandbox app, add webhook URL:
   `https://hondit-shop.vercel.app/api/paypal/webhook`
2. Subscribe to payment capture/order events.
3. Copy the webhook ID into Vercel as `PAYPAL_WEBHOOK_ID`.
4. Redeploy.

The checkout also captures the order directly after approval, so webhook delivery is additional evidence rather than the only source of truth.
