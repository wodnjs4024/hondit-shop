# Order Evidence Guide

Use the admin order detail page as the main order evidence screen.

For each paid order, check:

- hondit order number
- order created date and paid date
- customer email and phone
- Singapore shipping address
- product names, pack counts, unit counts, and SGD total
- PayPal order ID
- PayPal capture ID
- payment status `completed`
- order status
- tracking carrier and tracking number when shipped

Recommended workflow:

1. Open `/admin/orders`.
2. Open the order number.
3. Confirm payment status is `completed`.
4. Copy the PayPal Capture ID if payment proof is needed.
5. Export the order CSV before fulfillment.
6. Update order status to `preparing`, `packed`, `shipped`, then `delivered`.

Refunds are handled manually in PayPal. After a refund, update the hondit order status to `refunded` and add an internal note.
