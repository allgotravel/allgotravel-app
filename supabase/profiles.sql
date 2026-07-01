-- ─── Tipos de discapacidad ──────────────────────────────────
create type disability_type as enum (
  'motriz',
  'visual',
  'auditiva',
  'autismo',
  'cognitiva',
  'cronica_invisible',
  'mixta'
);

-- ─── Tabla de perfiles ──────────────────────────────────────
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  avatar_url text,

  -- Discapacidad (puede ser más de una)
  disability_types disability_type[] default '{}',

  -- Para enfermedades crónicas/invisibles: detalles libres
  chronic_conditions text,        -- ej: "fibromialgia, POTS"

  -- Necesidades invisibles: lo que no se ve pero importa
  invisible_needs text,           -- ej: "necesito parar cada 30 min", "no tolero ruidos fuertes"

  -- Recordatorios de medicamentos
  medications jsonb default '[]'::jsonb,
  -- Formato esperado en medications:
  -- [{ "name": "Metformina", "dose": "500mg", "times": ["08:00", "20:00"] }]

  -- Zona horaria para los recordatorios
  timezone text default 'America/Mexico_City',

  -- Grupo / familia
  is_group_profile boolean default false,
  group_members jsonb default '[]'::jsonb,
  -- Formato: [{ "name": "Ana", "age": 8, "disability_types": ["autismo"] }]

  -- Preferencias de viaje
  preferred_language text default 'es' check (preferred_language in ('es', 'en')),

  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ─── RLS ────────────────────────────────────────────────────
alter table profiles enable row level security;

create policy "Users manage own profile" on profiles
  for all using (auth.uid() = id);

create policy "Service role full access" on profiles
  for all using (auth.role() = 'service_role');

-- ─── Auto-crear perfil vacío al registrarse ─────────────────
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', '')
  );
  return new;
end;
$$;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
