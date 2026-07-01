-- ─── Tabla de conversaciones del chatbot ────────────────────
create table if not exists conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  messages jsonb not null default '[]'::jsonb,
  -- Formato: [{ "role": "user"|"assistant", "content": "...", "ts": "ISO8601" }]
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Índice para obtener conversaciones por usuario, más reciente primero
create index if not exists conversations_user_id_idx on conversations (user_id, updated_at desc);

-- ─── RLS ────────────────────────────────────────────────────
alter table conversations enable row level security;

create policy "Users manage own conversations" on conversations
  for all using (auth.uid() = user_id);

create policy "Service role full access" on conversations
  for all using (auth.role() = 'service_role');
