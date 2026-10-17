-- STAGING ONLY. Synthetic orders and enquiries for the hondit-staging project. No real customer data.
-- Covers every state the dashboard must count correctly: live paid, test paid, refunded, failed, cancelled, pending,
-- three currencies, shipped / waiting to ship, answered / unanswered enquiries.
begin;
insert into public.site_settings (id, checkout_enabled, paypal_mode) values (1, true, 'sandbox') on conflict (id) do nothing;

with rows(n, cur, total, pay, ord, env, test, paid_days, refunded) as (values
  (1, 'SGD', 420.00, 'completed', 'shipped',          'live',    false, 9,  null::numeric),
  (2, 'SGD', 230.00, 'completed', 'preparing',        'live',    false, 2,  null),
  (3, 'HKD', 2560.00,'completed', 'paid',             'live',    false, 1,  null),
  (4, 'SGD', 420.00, 'completed', 'paid',             'sandbox', true,  1,  null),
  (5, 'SGD', 1.00,   'completed', 'delivered',        'live',    true,  20, null),
  (6, 'SGD', 267.00, 'refunded',  'refunded',         'live',    false, 15, 267.00),
  (7, 'JPY', 48000,  'payment_failed',    'pending_payment', 'live', false, null, null),
  (8, 'SGD', 420.00, 'payment_cancelled', 'pending_payment', 'live', false, null, null),
  (9, 'SGD', 920.00, 'pending_payment',   'pending_payment', 'live', false, null, null)
)
insert into public.orders (order_number, order_type, customer_name, customer_email, customer_phone, country_code, address_line_1, city, postal_code,
  currency, total_packs, total_units, total_sgd, payment_status, order_status, paypal_order_id, paypal_capture_id, paid_at, refunded_at, refunded_amount,
  environment, is_test, utm_source, utm_medium, utm_campaign, created_at)
select 'STG-' || lpad(n::text, 4, '0'), 'Direct bulk order', 'Synthetic Buyer ' || n, 'buyer' || n || '@example.test', '+65 0000 00' || lpad(n::text, 2, '0'),
  case cur when 'HKD' then 'HK' when 'JPY' then 'JP' else 'SG' end, '1 Example Road', 'Example City', '000000',
  cur, 1, 20, total, pay, ord, 'STG-PP-ORDER-' || n, case when pay in ('completed', 'refunded') then 'STG-CAPTURE-' || n end,
  case when paid_days is not null then now() - make_interval(days => paid_days) end,
  case when refunded is not null then now() - interval '3 days' end, refunded,
  env, test, case when n % 2 = 0 then 'instagram' else 'qr' end, 'social', 'staging-sample', now() - make_interval(days => coalesce(paid_days, 0) + 1)
from rows
on conflict (order_number) do nothing;

insert into public.order_items (order_id, product_id, product_slug, product_name_snapshot, volume_snapshot, unit_price_sgd_snapshot, pack_quantity_snapshot, pack_price_sgd_snapshot, pack_count, total_units, line_total_sgd)
select o.id, 'diffuser-350g', 'diffuser-350g', 'Volcanic Stone Diffuser', '350g', o.total_sgd / 20, 20, o.total_sgd, 20, 20, o.total_sgd
from public.orders o where o.order_number like 'STG-%' and not exists (select 1 from public.order_items i where i.order_id = o.id);

insert into public.payment_events (order_id, provider_event_id, event_type, paypal_order_id, paypal_capture_id, amount_sgd, currency, verified)
select id, 'STG-EVT-' || order_number, 'PAYMENT.CAPTURE.COMPLETED', paypal_order_id, paypal_capture_id, total_sgd, currency, true
from public.orders where order_number like 'STG-%' and paypal_capture_id is not null
on conflict (provider_event_id) do nothing;

insert into public.inquiries (reference_number, name, email, inquiry_type, channel, market, language, message, status, created_at, replied_at) values
  ('STG-INQ-1', 'Synthetic Shop', 'shop@example.test', 'wholesale', 'whatsapp', 'SG', 'en', 'Synthetic enquiry: 40 units of the 350g diffuser for a hotel lobby.', 'new', now() - interval '1 day', null),
  ('STG-INQ-2', 'Synthetic Traveller', null, 'pickup', 'telegram', 'SG', 'ko', 'Synthetic enquiry: airport pickup of two 500g diffusers.', 'read', now() - interval '2 days', null),
  ('STG-INQ-3', 'Synthetic Buyer', 'buyer@example.test', 'order', 'email', 'HK', 'zh-HK', 'Synthetic enquiry: tracking number for order STG-0003.', 'replied', now() - interval '5 days', now() - interval '4 days')
on conflict (reference_number) do nothing;
commit;
