-- Per-user usage log for the rate limit of Alli (/api/chat) and the planner
-- (/api/planificador) — 4-oct-2026. NOT applied automatically.
-- Until this table exists, the API falls back to an in-memory limit (per server instance).

create table if not exists public.api_usage (
  id         bigint generated always as identity primary key,
  user_id    uuid not null references auth.users(id) on delete cascade,
  endpoint   text not null,
  created_at timestamptz not null default now()
);

create index if not exists api_usage_user_endpoint_time
  on public.api_usage (user_id, endpoint, created_at desc);

-- Only the server (service role) reads/writes this table. RLS on, no policies for users.
alter table public.api_usage enable row level security;
