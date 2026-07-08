alter table public.orders
  add column if not exists shipping_note text,
  add column if not exists cancellation_reason text,
  add column if not exists refund_reason text,
  add column if not exists refunded_at timestamptz,
  add column if not exists utm_source text,
  add column if not exists utm_medium text,
  add column if not exists utm_campaign text,
  add column if not exists landing_page text,
  add column if not exists referrer text;

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references public.orders(id) on delete set null,
  product_id text references public.products(id),
  product_slug text not null,
  product_name_snapshot text not null,
  order_number text not null,
  customer_email text not null,
  display_name text not null,
  rating integer not null check (rating between 1 and 5),
  title text,
  body text not null,
  status text not null default 'pending' check (status in ('pending', 'approved', 'hidden', 'deleted')),
  admin_note text,
  submitted_at timestamptz default now(),
  approved_at timestamptz,
  updated_at timestamptz default now()
);

alter table public.reviews enable row level security;

create index if not exists reviews_product_slug_idx on public.reviews(product_slug);
create index if not exists reviews_status_idx on public.reviews(status);
create index if not exists reviews_submitted_at_idx on public.reviews(submitted_at desc);
