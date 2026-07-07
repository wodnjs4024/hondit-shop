create extension if not exists pgcrypto;

create table if not exists public.products (
  id text primary key,
  slug text not null unique,
  name text not null,
  category text not null check (category in ('cleansing', 'diffuser')),
  volume_label text not null,
  short_description text not null,
  description text not null,
  image_url text not null,
  unit_price_sgd numeric(10,2) not null,
  pack_quantity integer not null,
  pack_price_sgd numeric(10,2) not null,
  unit_weight_kg numeric(10,3) default 0,
  inventory_packs integer default 0,
  active boolean default true,
  purchase_enabled boolean default true,
  sort_order integer default 100,
  features text[] default '{}',
  usage text[] default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  order_type text not null,
  customer_name text not null,
  customer_email text not null,
  customer_phone text not null,
  company_name text,
  country_code text not null default 'SG',
  address_line_1 text not null,
  address_line_2 text,
  city text not null,
  postal_code text not null,
  customer_note text,
  internal_note text,
  currency text not null default 'SGD',
  total_packs integer not null,
  total_units integer not null,
  total_sgd numeric(10,2) not null,
  shipping_included boolean default true,
  payment_provider text default 'paypal',
  payment_status text not null default 'pending',
  order_status text not null default 'pending_payment',
  paypal_order_id text,
  paypal_capture_id text,
  paypal_payer_id text,
  tracking_carrier text,
  tracking_number text,
  paid_at timestamptz,
  shipped_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id text references public.products(id),
  product_slug text not null,
  product_name_snapshot text not null,
  volume_snapshot text not null,
  unit_price_sgd_snapshot numeric(10,2) not null,
  pack_quantity_snapshot integer not null,
  pack_price_sgd_snapshot numeric(10,2) not null,
  pack_count integer not null,
  total_units integer not null,
  line_total_sgd numeric(10,2) not null,
  created_at timestamptz default now()
);

create table if not exists public.payment_events (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references public.orders(id) on delete set null,
  provider text not null default 'paypal',
  provider_event_id text unique,
  event_type text not null,
  paypal_order_id text,
  paypal_capture_id text,
  amount_sgd numeric(10,2),
  currency text,
  verified boolean default false,
  raw_payload jsonb,
  created_at timestamptz default now()
);

create table if not exists public.order_status_history (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  previous_status text,
  new_status text not null,
  changed_by uuid,
  note text,
  created_at timestamptz default now()
);

create table if not exists public.admin_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  role text not null default 'admin',
  created_at timestamptz default now()
);

create table if not exists public.site_settings (
  id integer primary key default 1,
  legal_business_name text,
  business_registration_number text,
  business_address text,
  customer_service_email text,
  paypal_mode text default 'sandbox',
  checkout_enabled boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.payment_events enable row level security;
alter table public.order_status_history enable row level security;
alter table public.admin_profiles enable row level security;
alter table public.site_settings enable row level security;

drop policy if exists "public active products" on public.products;
create policy "public active products"
on public.products for select
using (active = true and purchase_enabled = true);

drop policy if exists "admins read admin profiles" on public.admin_profiles;
create policy "admins read admin profiles"
on public.admin_profiles for select
to authenticated
using (auth.uid() = user_id);

create index if not exists orders_order_number_idx on public.orders(order_number);
create index if not exists orders_created_at_idx on public.orders(created_at desc);
create index if not exists order_items_order_id_idx on public.order_items(order_id);
create index if not exists payment_events_order_id_idx on public.payment_events(order_id);
