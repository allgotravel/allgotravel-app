-- Run this in the Supabase SQL Editor

create table if not exists members (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  name text,
  hotmart_purchase_id text,
  hotmart_product_id text,
  plan text default 'ebook',
  status text default 'pending' check (status in ('active', 'cancelled', 'pending')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Index for quick email lookups
create index if not exists members_email_idx on members (email);

-- Row Level Security: only service role can write; anon can read their own row
alter table members enable row level security;

create policy "Service role full access" on members
  for all using (auth.role() = 'service_role');

create policy "Users read own row" on members
  for select using (auth.jwt() ->> 'email' = email);
