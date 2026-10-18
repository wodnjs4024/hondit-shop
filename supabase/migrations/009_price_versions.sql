-- 009: admin price versions. Additive and idempotent; changes no existing table or row.
-- One row = one price for one product, market and kind (general = 20+/30+ order, trial = 10-unit diffuser trial),
-- valid from effective_from until a later row starts. Rows are never edited or deleted: history is the table.
-- Only a version that has not started yet may be cancelled. Orders keep their own amounts, so nothing is retroactive.

create table if not exists public.product_prices (
  id uuid primary key default gen_random_uuid(),
  product_id text not null references public.products(id) on delete cascade,
  market text not null check (market in ('SG','HK','MO','JP','TW','TH','MY','BN')),
  kind text not null check (kind in ('general','trial')),
  currency text not null check (currency in ('SGD','HKD','MOP','JPY','TWD','THB','MYR','BND')),
  amount numeric(12,2) not null check (amount > 0 and amount <= 1000000),
  version text not null unique,
  effective_from timestamptz not null default now(),
  cancelled_at timestamptz,
  note text,
  created_by uuid,
  created_at timestamptz not null default now()
);

create index if not exists product_prices_lookup on public.product_prices (product_id, market, kind, effective_from desc);

alter table public.product_prices enable row level security;
revoke all on public.product_prices from public, anon, authenticated;
grant select, insert, update on public.product_prices to service_role;

-- History guard: no back-dating, no edits, no deletes; only a future version can be cancelled.
create or replace function public.product_prices_guard() returns trigger language plpgsql as $$
begin
  if tg_op = 'INSERT' then
    if new.effective_from < now() - interval '5 minutes' then
      raise exception 'Price versions cannot start in the past';
    end if;
    new.cancelled_at := null;
    return new;
  end if;
  if tg_op = 'DELETE' then
    raise exception 'Price history cannot be deleted';
  end if;
  if (to_jsonb(new) - 'cancelled_at') <> (to_jsonb(old) - 'cancelled_at') then
    raise exception 'Price versions cannot be edited; add a new version instead';
  end if;
  if old.cancelled_at is not null or new.cancelled_at is null or old.effective_from <= now() then
    raise exception 'Only a version that has not started yet can be cancelled';
  end if;
  return new;
end $$;

drop trigger if exists product_prices_guard on public.product_prices;
create trigger product_prices_guard before insert or update or delete on public.product_prices
  for each row execute function public.product_prices_guard();

notify pgrst, 'reload schema';
