-- 008 Admin P0 (additive only; no column, row or policy is dropped).
-- Applies the two migrations production never received (003 product media, 004 order UTM detail),
-- then adds what the operator needs to manage products without code changes.
-- Empty new values keep today's behaviour: no market row = current code rules, null stock_units = stock not tracked.
-- Prices, MOQ and delivery terms are NOT here; they stay in shared/checkout-terms.js until phase 2.

begin;

-- 003 / 004 that production is missing (idempotent)
alter table public.products
  add column if not exists gallery_images text[] default '{}',
  add column if not exists detail_images text[] default '{}',
  add column if not exists detail_highlights text[] default '{}',
  add column if not exists detail_how_to_use text[] default '{}';
alter table public.orders
  add column if not exists utm_content text,
  add column if not exists utm_term text;

-- products: identity, lifecycle, unit stock
alter table public.products
  add column if not exists sku text,
  add column if not exists status text not null default 'published',
  add column if not exists stock_units integer,
  add column if not exists published_at timestamptz;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'products_status_check') then
    alter table public.products add constraint products_status_check check (status in ('draft', 'published', 'soldout', 'hidden'));
  end if;
  if not exists (select 1 from pg_constraint where conname = 'products_sku_key') then
    alter table public.products add constraint products_sku_key unique (sku);
  end if;
  if not exists (select 1 from pg_constraint where conname = 'products_stock_units_check') then
    alter table public.products add constraint products_stock_units_check check (stock_units is null or stock_units >= 0);
  end if;
  -- allow new categories (lower-case words); existing 'cleansing' / 'diffuser' rows stay valid
  if exists (select 1 from pg_constraint where conname = 'products_category_check'
             and pg_get_constraintdef(oid) like '%cleansing%diffuser%') then
    alter table public.products drop constraint products_category_check;
    alter table public.products add constraint products_category_check check (category ~ '^[a-z][a-z0-9-]{1,39}$');
  end if;
end $$;
update public.products set sku = upper(slug) where sku is null;
update public.products set stock_units = inventory_packs * pack_quantity where stock_units is null and coalesce(inventory_packs, 0) > 0;
update public.products set status = case when active then 'published' else 'hidden' end, published_at = coalesce(published_at, updated_at, now())
  where published_at is null;

-- per-language content (ko, en, ja, zh = Traditional Chinese for HK/MO/TW, ms, th)
create table if not exists public.product_contents (
  product_id text not null references public.products(id) on delete cascade,
  language text not null check (language in ('ko', 'en', 'ja', 'zh', 'ms', 'th')),
  name text,
  short_description text,
  description text,
  highlights text[] default '{}',
  how_to text[] default '{}',
  updated_at timestamptz default now(),
  primary key (product_id, language)
);

-- photos: existing /images paths or Supabase Storage objects
create table if not exists public.product_media (
  id uuid primary key default gen_random_uuid(),
  product_id text not null references public.products(id) on delete cascade,
  url text not null,
  storage_path text,
  role text not null default 'gallery' check (role in ('main', 'gallery', 'detail')),
  sort_order integer not null default 100,
  alt jsonb not null default '{}'::jsonb,
  created_at timestamptz default now()
);
create index if not exists product_media_product_idx on public.product_media(product_id, role, sort_order);

-- per-market override; absent row = today's code rules. 'direct' is honoured only where approved terms exist in code.
create table if not exists public.product_markets (
  product_id text not null references public.products(id) on delete cascade,
  market text not null check (market in ('SG', 'HK', 'MO', 'TW', 'JP', 'TH', 'MY', 'BN')),
  mode text not null check (mode in ('hidden', 'quote', 'direct')),
  updated_at timestamptz default now(),
  primary key (product_id, market)
);

-- drafts and published snapshots (preview, publish, revert)
create table if not exists public.product_revisions (
  id uuid primary key default gen_random_uuid(),
  product_id text not null,
  state text not null check (state in ('draft', 'published', 'superseded')),
  snapshot jsonb not null,
  note text,
  created_by uuid,
  created_at timestamptz default now(),
  published_at timestamptz
);
create index if not exists product_revisions_product_idx on public.product_revisions(product_id, created_at desc);
create unique index if not exists product_revisions_one_draft on public.product_revisions(product_id) where state = 'draft';

-- stock ledger; one automatic deduction per order line at most
create table if not exists public.inventory_movements (
  id uuid primary key default gen_random_uuid(),
  product_id text not null references public.products(id) on delete cascade,
  delta integer not null,
  reason text not null check (reason in ('stock_in', 'adjust', 'order', 'order_reversal')),
  order_id uuid references public.orders(id) on delete set null,
  note text,
  created_by uuid,
  created_at timestamptz default now()
);
create unique index if not exists inventory_movements_order_once on public.inventory_movements(order_id, product_id) where reason = 'order';

-- orders: test/live separation and refunds (existing rows untouched; is_test defaults to false)
alter table public.orders
  add column if not exists environment text,
  add column if not exists is_test boolean not null default false,
  add column if not exists refunded_amount numeric(12,2);
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'orders_environment_check') then
    alter table public.orders add constraint orders_environment_check check (environment is null or environment in ('live', 'sandbox'));
  end if;
end $$;

-- inquiries: the structure the existing admin code expects, plus channel for messenger enquiries entered by hand
create table if not exists public.inquiries (
  id uuid primary key default gen_random_uuid(),
  reference_number text unique,
  name text not null,
  email text,
  company text,
  order_number text,
  inquiry_type text not null default 'general',
  channel text not null default 'web' check (channel in ('web', 'whatsapp', 'telegram', 'wechat', 'instagram', 'email', 'pickup', 'other')),
  market text,
  language text,
  message text not null,
  status text not null default 'new' check (status in ('new', 'read', 'replied', 'archived', 'spam')),
  admin_note text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  read_at timestamptz,
  replied_at timestamptz
);
create index if not exists inquiries_status_idx on public.inquiries(status, created_at desc);
create table if not exists public.inquiry_replies (
  id uuid primary key default gen_random_uuid(),
  inquiry_id uuid not null references public.inquiries(id) on delete cascade,
  sender_email text,
  recipient_email text,
  subject text,
  body text not null,
  status text not null default 'draft',
  provider_id text,
  error_message text,
  created_at timestamptz default now(),
  sent_at timestamptz
);

-- row level security: server uses the service role; the public may read published product data only
alter table public.product_contents enable row level security;
alter table public.product_media enable row level security;
alter table public.product_markets enable row level security;
alter table public.product_revisions enable row level security;
alter table public.inventory_movements enable row level security;
alter table public.inquiries enable row level security;
alter table public.inquiry_replies enable row level security;
drop policy if exists "public product contents" on public.product_contents;
create policy "public product contents" on public.product_contents for select
  using (exists (select 1 from public.products p where p.id = product_id and p.status in ('published', 'soldout')));
drop policy if exists "public product media" on public.product_media;
create policy "public product media" on public.product_media for select
  using (exists (select 1 from public.products p where p.id = product_id and p.status in ('published', 'soldout')));

-- Publish a product snapshot in one transaction (base fields, per-language text, photos, market overrides, revision history).
-- Snapshot keys: base{name,category,volumeLabel,sku,sortOrder,status,unitWeightKg,packQuantity},
-- contents{lang:{name,shortDescription,description,highlights[],howTo[]}}, media[{url,storagePath,role,sortOrder,alt{}}], markets{CODE:mode}.
-- pack_quantity is only written for products with no approved terms in code (the caller decides); prices are never written here.
create or replace function public.publish_product(p_product_id text, p_snapshot jsonb, p_by uuid default null, p_note text default null)
returns public.products language plpgsql as $$
declare
  b jsonb := coalesce(p_snapshot->'base', '{}'::jsonb);
  st text := coalesce(b->>'status', 'published');
  en jsonb := coalesce(p_snapshot->'contents'->'en', '{}'::jsonb);
  main_url text;
  row public.products;
begin
  if st not in ('draft', 'published', 'soldout', 'hidden') then raise exception 'invalid status %', st; end if;
  select m->>'url' into main_url from jsonb_array_elements(coalesce(p_snapshot->'media', '[]'::jsonb)) m
    where coalesce(m->>'role', 'gallery') = 'main' order by coalesce((m->>'sortOrder')::int, 100) limit 1;
  update public.products set
    name = coalesce(nullif(en->>'name', ''), nullif(b->>'name', ''), name),
    category = coalesce(nullif(b->>'category', ''), category),
    volume_label = coalesce(b->>'volumeLabel', volume_label),
    sku = coalesce(nullif(b->>'sku', ''), sku),
    sort_order = coalesce((b->>'sortOrder')::int, sort_order),
    unit_weight_kg = coalesce((b->>'unitWeightKg')::numeric, unit_weight_kg),
    pack_quantity = coalesce((b->>'packQuantity')::int, pack_quantity),
    short_description = coalesce(nullif(en->>'shortDescription', ''), short_description),
    description = coalesce(nullif(en->>'description', ''), description),
    image_url = coalesce(main_url, image_url),
    gallery_images = coalesce((select array_agg(m->>'url' order by coalesce((m->>'sortOrder')::int, 100))
                               from jsonb_array_elements(coalesce(p_snapshot->'media', '[]'::jsonb)) m where coalesce(m->>'role', 'gallery') = 'gallery'), '{}'),
    detail_images = coalesce((select array_agg(m->>'url' order by coalesce((m->>'sortOrder')::int, 100))
                              from jsonb_array_elements(coalesce(p_snapshot->'media', '[]'::jsonb)) m where m->>'role' = 'detail'), '{}'),
    status = st,
    active = st in ('published', 'soldout'),
    purchase_enabled = st = 'published',
    published_at = case when st in ('published', 'soldout') then now() else published_at end,
    updated_at = now()
  where id = p_product_id returning * into row;
  if row.id is null then raise exception 'product % not found', p_product_id; end if;

  delete from public.product_contents where product_id = p_product_id;
  insert into public.product_contents (product_id, language, name, short_description, description, highlights, how_to)
  select p_product_id, c.key, nullif(c.value->>'name', ''), nullif(c.value->>'shortDescription', ''), nullif(c.value->>'description', ''),
         coalesce((select array_agg(x) from jsonb_array_elements_text(coalesce(c.value->'highlights', '[]'::jsonb)) x where x <> ''), '{}'),
         coalesce((select array_agg(x) from jsonb_array_elements_text(coalesce(c.value->'howTo', '[]'::jsonb)) x where x <> ''), '{}')
  from jsonb_each(coalesce(p_snapshot->'contents', '{}'::jsonb)) c
  where c.key in ('ko', 'en', 'ja', 'zh', 'ms', 'th');

  delete from public.product_media where product_id = p_product_id;
  insert into public.product_media (product_id, url, storage_path, role, sort_order, alt)
  select p_product_id, m->>'url', nullif(m->>'storagePath', ''), coalesce(m->>'role', 'gallery'), coalesce((m->>'sortOrder')::int, 100), coalesce(m->'alt', '{}'::jsonb)
  from jsonb_array_elements(coalesce(p_snapshot->'media', '[]'::jsonb)) m where coalesce(m->>'url', '') <> '';

  delete from public.product_markets where product_id = p_product_id;
  insert into public.product_markets (product_id, market, mode)
  select p_product_id, k.key, k.value from jsonb_each_text(coalesce(p_snapshot->'markets', '{}'::jsonb)) k
  where k.key in ('SG', 'HK', 'MO', 'TW', 'JP', 'TH', 'MY', 'BN') and k.value in ('hidden', 'quote', 'direct');

  update public.product_revisions set state = 'superseded' where product_id = p_product_id and state = 'published';
  delete from public.product_revisions where product_id = p_product_id and state = 'draft';
  insert into public.product_revisions (product_id, state, snapshot, note, created_by, published_at)
  values (p_product_id, 'published', p_snapshot, p_note, p_by, now());
  return row;
end $$;

-- Stock: one statement changes the count and writes the ledger. Null stock_units means "not tracked" and stays null.
create or replace function public.adjust_stock(p_product_id text, p_delta integer, p_reason text, p_note text default null, p_by uuid default null)
returns integer language plpgsql as $$
declare next_units integer;
begin
  if p_reason not in ('stock_in', 'adjust') then raise exception 'invalid reason %', p_reason; end if;
  update public.products set stock_units = greatest(0, coalesce(stock_units, 0) + p_delta),
    inventory_packs = greatest(0, coalesce(stock_units, 0) + p_delta) / greatest(pack_quantity, 1), updated_at = now()
  where id = p_product_id returning stock_units into next_units;
  if next_units is null then raise exception 'product % not found', p_product_id; end if;
  insert into public.inventory_movements (product_id, delta, reason, note, created_by) values (p_product_id, p_delta, p_reason, p_note, p_by);
  return next_units;
end $$;

-- After a verified payment: deduct each line once (the unique index makes repeats a no-op). Untracked stock is left alone.
create or replace function public.record_order_stock(p_order_id uuid)
returns integer language plpgsql as $$
declare line record; done integer := 0;
begin
  for line in select product_id, sum(total_units)::int as units from public.order_items
              where order_id = p_order_id and product_id is not null group by product_id loop
    insert into public.inventory_movements (product_id, delta, reason, order_id, note)
    values (line.product_id, -line.units, 'order', p_order_id, 'paid order')
    on conflict do nothing;
    if found then
      update public.products set stock_units = greatest(0, stock_units - line.units),
        inventory_packs = greatest(0, stock_units - line.units) / greatest(pack_quantity, 1), updated_at = now()
      where id = line.product_id and stock_units is not null;
      done := done + 1;
    end if;
  end loop;
  return done;
end $$;

revoke all on function public.publish_product(text, jsonb, uuid, text) from public, anon, authenticated;
revoke all on function public.adjust_stock(text, integer, text, text, uuid) from public, anon, authenticated;
revoke all on function public.record_order_stock(uuid) from public, anon, authenticated;
grant execute on function public.publish_product(text, jsonb, uuid, text) to service_role;
grant execute on function public.adjust_stock(text, integer, text, text, uuid) to service_role;
grant execute on function public.record_order_stock(uuid) to service_role;

-- photo storage: public read, writes only through server-issued signed upload URLs
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('product-media', 'product-media', true, 5242880, array['image/webp', 'image/jpeg', 'image/png'])
on conflict (id) do nothing;

commit;
