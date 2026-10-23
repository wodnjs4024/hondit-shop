-- 010: HONDIT Journal (articles, scheduled publishing, channel packages) and press outreach tracking.
-- Additive and idempotent: four NEW tables only. No existing table, column, row, policy or function is changed,
-- so orders, payments, products, prices, inquiries and CRM data are untouched.
-- Rollback: supabase/rollback/010_journal_pr_down.sql (drops only these four tables and their functions).

create table if not exists public.journal_articles (
  id uuid primary key default gen_random_uuid(),
  group_key text,                                   -- translations of one story share a key (hreflang)
  content_id text unique,                           -- CONTENT_PIPELINE id, e.g. S-JRN-SG-01
  language text not null check (language in ('en','ja','zh-HK','zh-TW')),
  market text not null check (market in ('SG','JP','HK','TW')),
  slug text not null check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and length(slug) <= 90),
  title text not null check (length(title) between 1 and 200),
  dek text not null default '',
  body_md text not null default '',
  hero_image_url text,
  hero_image_alt text,
  hero_image_caption text,
  hero_image_credit text,
  image_rights text not null default 'pending' check (image_rights in ('confirmed','pending','restricted')),
  related_products text[] not null default '{}',
  cta_type text not null default 'product' check (cta_type in ('product','contact','partners')),
  seo_title text,
  seo_description text,
  sources jsonb not null default '[]'::jsonb,
  source_doc text,
  author_type text not null default 'hondit_editorial' check (author_type in ('hondit_editorial','ai_assisted','partner_supplied')),
  author_name text not null default 'HONDIT editorial team',
  ai_meta jsonb,
  review jsonb not null default '{}'::jsonb,        -- {facts, claims, images, notes, reviewer, reviewed_at}
  status text not null default 'draft' check (status in ('draft','in_review','approved','scheduled','published','failed','archived')),
  approved_by text,
  approved_at timestamptz,
  publish_at timestamptz,                           -- stored in UTC, entered and shown as Asia/Seoul
  published_at timestamptz,
  public_url text,
  publish_attempts integer not null default 0,
  last_error text,
  created_by text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (language, slug)
);
create index if not exists journal_articles_due on public.journal_articles (status, publish_at);
create index if not exists journal_articles_public on public.journal_articles (language, published_at desc) where status = 'published';

-- Approval guard in the database itself: a row can only become published with an approval and all three review checks.
create or replace function public.journal_articles_guard() returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  if new.status = 'published' then
    if tg_op = 'UPDATE' then
      if old.status = 'published' then return new; end if;
    end if;
    if new.approved_at is null or new.approved_by is null
       or coalesce((new.review->>'facts')::boolean, false) is not true
       or coalesce((new.review->>'claims')::boolean, false) is not true
       or coalesce((new.review->>'images')::boolean, false) is not true then
      raise exception 'Journal article cannot be published without approval and completed review';
    end if;
  end if;
  return new;
end $$;
drop trigger if exists journal_articles_guard on public.journal_articles;
create trigger journal_articles_guard before insert or update on public.journal_articles
  for each row execute function public.journal_articles_guard();

create table if not exists public.journal_publish_log (
  id bigint generated always as identity primary key,
  article_id uuid references public.journal_articles(id) on delete set null,
  action text not null,                             -- created, edited, submit, approve, schedule, published, failed, retry ...
  ok boolean not null default true,
  message text,
  actor text,
  created_at timestamptz not null default now()
);
create index if not exists journal_publish_log_article on public.journal_publish_log (article_id, created_at desc);

create table if not exists public.journal_distributions (
  id uuid primary key default gen_random_uuid(),
  article_id uuid not null references public.journal_articles(id) on delete cascade,
  channel text not null check (channel in ('pinterest','instagram','facebook','youtube')),
  title text,
  body text not null,
  image_url text,
  image_alt text,
  final_url text,
  link_id text check (link_id is null or link_id ~ '^l[0-9]{4}$'),
  utm_campaign text,
  status text not null default 'draft' check (status in ('draft','approved','scheduled','published','failed','cancelled')),
  scheduled_at timestamptz,
  external_id text,                                 -- Metricool post id
  external_url text,
  error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (article_id, channel)                      -- one package per article and channel: no double posting
);
create unique index if not exists journal_distributions_link on public.journal_distributions (link_id) where link_id is not null;

create table if not exists public.pr_outreach (
  id uuid primary key default gen_random_uuid(),
  content_id text unique,                           -- CONTENT_PIPELINE id, e.g. P-EMAIL-SG-01
  market text not null,
  language text,
  outlet text not null,
  outlet_url text,
  angle text,
  editorial_contact text,
  contact_source text,
  article_id uuid references public.journal_articles(id) on delete set null,
  materials_url text,
  email_subject text,
  email_body text,
  gmail_draft_id text,
  link_id text check (link_id is null or link_id ~ '^l[0-9]{4}$'),
  approval_status text not null default 'pending' check (approval_status in ('pending','approved','rejected')),
  approved_by text,
  approved_at timestamptz,
  send_status text not null default 'not_sent' check (send_status in ('not_sent','sent','bounced')),
  sent_at timestamptz,
  gmail_message_id text,
  reply_status text not null default 'none' check (reply_status in ('none','replied','interested','declined','no_reply')),
  replied_at timestamptz,
  follow_up_at timestamptz,
  follow_up_notes text,
  published_url text,
  published_at timestamptz,
  metrics jsonb not null default '{}'::jsonb,      -- {sessions, inquiries, orders} copied from GA4 / admin ledger
  next_action text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (outlet, market)
);
create unique index if not exists pr_outreach_link on public.pr_outreach (link_id) where link_id is not null;

-- Server-only tables: the site reads them with the service role; the anon key gets nothing.
alter table public.journal_articles enable row level security;
alter table public.journal_publish_log enable row level security;
alter table public.journal_distributions enable row level security;
alter table public.pr_outreach enable row level security;
revoke all on public.journal_articles, public.journal_publish_log, public.journal_distributions, public.pr_outreach from public, anon, authenticated;
grant select, insert, update, delete on public.journal_articles, public.journal_distributions, public.pr_outreach to service_role;
grant select, insert on public.journal_publish_log to service_role;

notify pgrst, 'reload schema';
