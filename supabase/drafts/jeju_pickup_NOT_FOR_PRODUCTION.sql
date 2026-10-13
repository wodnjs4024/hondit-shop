-- 검토 초안: 운영 적용 금지. 기존 마이그레이션 순서에 포함하지 않음.
-- 영속 저장·관리 API·권한·개인정보 보존 정책을 별도 승인한 후 완성할 것.
-- 로컬 상태 전이 모델(shared/pickup.js)의 향후 저장 구조. 실제 예약 테이블 없음.
begin;
create table public.pickup_operation_drafts (
 id uuid primary key default gen_random_uuid(),
 operation_date date not null,
 time_slots jsonb not null default '[]',
 approved_locations jsonb not null default '[]',
 capacity integer check(capacity>0),
 operations_approved boolean not null default false,
 billing_currency text,
 billing_unit_minor bigint check(billing_unit_minor>0),
 payment_enabled boolean not null default false,
 check(not payment_enabled or (operations_approved and billing_currency is not null and billing_unit_minor is not null))
);
create table public.pickup_request_drafts (
 id uuid primary key default gen_random_uuid(),
 operation_id uuid references public.pickup_operation_drafts(id),
 sku text not null check(sku='diffuser-350g'),
 quantity integer not null check(quantity between 1 and 3),
 reference_currency text not null default 'KRW' check(reference_currency='KRW'),
 reference_unit_amount integer not null default 18000 check(reference_unit_amount=18000),
 customer_name text not null, contact_phone text not null, customer_email text not null,
 preferred_time timestamptz, departure_notes text,
 status text not null default 'requested' check(status in ('requested','approved','awaiting_payment','payment_confirmed','scheduled','delivered','change_requested','no_show','refund_pending','refunded','cancelled')),
 billing_snapshot jsonb, handover_snapshot jsonb, payment_evidence jsonb,
 delivered_at timestamptz, created_at timestamptz not null default now()
);
create table public.pickup_history_drafts (
 id uuid primary key default gen_random_uuid(),
 request_id uuid not null references public.pickup_request_drafts(id),
 previous_status text, new_status text not null, action text not null,
 actor_id uuid not null, evidence jsonb, created_at timestamptz not null default now()
);
alter table public.pickup_operation_drafts enable row level security;
alter table public.pickup_request_drafts enable row level security;
alter table public.pickup_history_drafts enable row level security;
-- 公開/anonymous 접근 정책 없음. 서버 권한과 승인 API는 후속 작업.
rollback; -- 검토용 초안이므로 그대로 실행해도 구조를 남기지 않음.
