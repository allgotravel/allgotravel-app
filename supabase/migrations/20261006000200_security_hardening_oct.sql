-- Security hardening, October 2026 (branch seguridad-oct)
-- 1) Emergency QR token: 192-bit random text token, rotated, revocable, not user-settable
-- 2) get_emergency_card: minimal data, server-only (service_role), rejects short tokens
-- 3) Rate-limit helper for /e/<token> (server-only)
-- 4) handle_new_user: fixed search_path, not callable through the API
-- 5) Table privileges: least privilege for anon / authenticated (RLS stays as the main guard)
-- 6) Policies rewritten "to authenticated" with (select auth.uid()); vip form can't attach rows to other users
-- 7) Vault bucket: size + type limits; explicit WITH CHECK on update
-- 8) Length limits on the two public forms (leads, vip_clients)

-- ── 1) Emergency token ─────────────────────────────────────────────────────────
create or replace function public.new_emergency_token()
returns text
language sql
volatile
set search_path = ''
as $$
  -- 24 random bytes = 192 bits, base64url (32 chars, no padding)
  select translate(encode(extensions.gen_random_bytes(24), 'base64'), '+/=', '-_');
$$;
revoke all on function public.new_emergency_token() from public, anon, authenticated;

alter table public.profiles alter column emergency_token drop default;
alter table public.profiles alter column emergency_token type text using emergency_token::text;
-- Rotate every existing token (old ones were UUIDs = 122 bits). Old printed QR codes stop working.
update public.profiles set emergency_token = public.new_emergency_token();
alter table public.profiles alter column emergency_token set default public.new_emergency_token();
alter table public.profiles add constraint profiles_emergency_token_len check (length(emergency_token) >= 32);

-- Users (API roles) can never choose their own token. Only rotate_emergency_token() changes it.
create or replace function public.protect_emergency_token()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if current_user in ('authenticated', 'anon') then
    if tg_op = 'INSERT' then
      new.emergency_token := public.new_emergency_token();
    elsif new.emergency_token is distinct from old.emergency_token then
      new.emergency_token := old.emergency_token;
    end if;
  end if;
  return new;
end;
$$;
drop trigger if exists protect_emergency_token on public.profiles;
create trigger protect_emergency_token
  before insert or update on public.profiles
  for each row execute function public.protect_emergency_token();

-- "Generate a new QR" = revoke the old one.
create or replace function public.rotate_emergency_token()
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  uid uuid := auth.uid();
  tok text;
begin
  if uid is null then
    raise exception 'not authenticated' using errcode = '28000';
  end if;
  tok := public.new_emergency_token();
  update public.profiles set emergency_token = tok where id = uid;
  return tok;
end;
$$;
revoke all on function public.rotate_emergency_token() from public, anon;
grant execute on function public.rotate_emergency_token() to authenticated;

-- ── 2) Emergency card: minimal data, server-only ───────────────────────────────
drop function if exists public.get_emergency_card(uuid);
create or replace function public.get_emergency_card(token text)
returns table (
  full_name text, blood_type text, allergies text, allergy_severity text,
  chronic_conditions text, invisible_needs text, medical_devices text, medications jsonb,
  primary_language text,
  emergency_contact_name text, emergency_contact_phone text,
  emergency_contact2_name text, emergency_contact2_phone text,
  emergency_contact3_name text, emergency_contact3_phone text,
  doctor_name text, doctor_phone text, service_dog jsonb
)
language sql
stable
security definer
set search_path = ''
as $$
  select p.full_name, p.blood_type, p.allergies, p.allergy_severity,
         p.chronic_conditions, p.invisible_needs, p.medical_devices,
         coalesce((select jsonb_agg(jsonb_strip_nulls(jsonb_build_object(
                     'name', m->>'name', 'dose', m->>'dose', 'times', m->'times')))
                   from jsonb_array_elements(case when jsonb_typeof(p.medications) = 'array'
                                                  then p.medications else '[]'::jsonb end) m), '[]'::jsonb),
         p.primary_language,
         p.emergency_contact_name, p.emergency_contact_phone,
         p.emergency_contact2_name, p.emergency_contact2_phone,
         p.emergency_contact3_name, p.emergency_contact3_phone,
         p.doctor_name, p.doctor_phone,
         case when p.service_dog is null then null else jsonb_strip_nulls(jsonb_build_object(
           'has', p.service_dog->'has', 'name', p.service_dog->>'name', 'breed', p.service_dog->>'breed',
           'size', p.service_dog->>'size', 'tasks', p.service_dog->>'tasks',
           'trained_dot', p.service_dog->'trained_dot', 'vaccines_current', p.service_dog->'vaccines_current',
           'rabies_date', p.service_dog->>'rabies_date',
           'vet_name', p.service_dog->>'vet_name', 'vet_phone', p.service_dog->>'vet_phone')) end
  from public.profiles p
  where length(token) >= 32
    and p.emergency_token = token
    and p.emergency_sharing_enabled = true
  limit 1;
$$;
revoke all on function public.get_emergency_card(text) from public, anon, authenticated;
grant execute on function public.get_emergency_card(text) to service_role;
-- TRANSITIONAL: the version of /e/<token> that is live today (main) still calls this with the
-- public key. Keep anon EXECUTE until seguridad-oct is deployed, then run:
--   revoke execute on function public.get_emergency_card(text) from anon;
-- (see 20261006000300_revoke_anon_emergency_card.sql). With 192-bit tokens guessing is not feasible.
grant execute on function public.get_emergency_card(text) to anon;

-- ── 3) Rate-limit helper (server-only) ─────────────────────────────────────────
create schema if not exists private;
revoke all on schema private from public, anon, authenticated;
create table if not exists private.rate_limit_hits (
  id bigint generated always as identity primary key,
  bucket text not null,
  created_at timestamptz not null default now()
);
create index if not exists rate_limit_hits_bucket_time on private.rate_limit_hits (bucket, created_at);
alter table private.rate_limit_hits enable row level security;

-- Returns true if allowed. p_bucket should already be hashed (no raw IPs stored).
create or replace function public.hit_rate_limit(p_bucket text, p_limit int, p_window_seconds int)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  n int;
begin
  delete from private.rate_limit_hits where created_at < now() - interval '1 day';
  select count(*) into n from private.rate_limit_hits
   where bucket = p_bucket and created_at > now() - make_interval(secs => p_window_seconds);
  if n >= p_limit then
    return false;
  end if;
  insert into private.rate_limit_hits (bucket) values (p_bucket);
  return true;
end;
$$;
revoke all on function public.hit_rate_limit(text, int, int) from public, anon, authenticated;
grant execute on function public.hit_rate_limit(text, int, int) to service_role;

-- ── 4) handle_new_user ─────────────────────────────────────────────────────────
alter function public.handle_new_user() set search_path = public;
revoke all on function public.handle_new_user() from public, anon, authenticated;
revoke all on function public.protect_membership_fields() from public, anon, authenticated;
revoke all on function public.protect_emergency_token() from public, anon, authenticated;

-- ── 5) Least-privilege grants (RLS is still the main guard) ────────────────────
revoke all on all tables in schema public from anon;
revoke all on all tables in schema public from authenticated;

grant select on public.airlines, public.service_animal_policies, public.wheelchair_policies,
                public.cruise_lines, public.cruise_accessibility_policies to anon, authenticated;
grant insert on public.leads, public.vip_clients to anon, authenticated;

grant select, insert, update, delete on public.profiles  to authenticated;
grant select, insert, update, delete on public.documents to authenticated;
grant select, insert, update, delete on public.med_log   to authenticated;
grant select, insert                 on public.conversations to authenticated;
grant select                         on public.memberships   to authenticated;
-- members, pending_entitlements, api_usage: server (service_role) only.

-- ── 6) Policies: explicit roles, (select auth.uid()), no client-side cross-user writes ──
drop policy if exists "Service role full access" on public.profiles;
drop policy if exists "Users manage own profile" on public.profiles;
create policy profiles_own on public.profiles for all to authenticated
  using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

drop policy if exists own_docs_select on public.documents;
drop policy if exists own_docs_insert on public.documents;
drop policy if exists own_docs_update on public.documents;
drop policy if exists own_docs_delete on public.documents;
create policy documents_own on public.documents for all to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

drop policy if exists own_medlog_all on public.med_log;
create policy med_log_own on public.med_log for all to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

drop policy if exists "Users can view own conversations" on public.conversations;
drop policy if exists "Users can insert own conversations" on public.conversations;
create policy conversations_own_select on public.conversations for select to authenticated
  using ((select auth.uid()) = user_id);
create policy conversations_own_insert on public.conversations for insert to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "usuario ve su propia membresia" on public.memberships;
create policy memberships_own_select on public.memberships for select to authenticated
  using ((select auth.uid()) = user_id);

-- service_role bypasses RLS; these "service role" policies only added noise
drop policy if exists "service role manages pending" on public.pending_entitlements;
drop policy if exists "cruise_lines service role" on public.cruise_lines;
drop policy if exists "cruise_policies service role" on public.cruise_accessibility_policies;

drop policy if exists vip_insert_public on public.vip_clients;
create policy vip_insert_public on public.vip_clients for insert to anon, authenticated
  with check ((user_id is null or user_id = (select auth.uid())) and coalesce(status, 'nuevo') = 'nuevo');

-- ── 7) Vault bucket ────────────────────────────────────────────────────────────
update storage.buckets
   set public = false,
       file_size_limit = 15728640, -- 15 MB
       allowed_mime_types = array['application/pdf','image/jpeg','image/png','image/webp','image/heic','image/heif']
 where id = 'vault';

drop policy if exists vault_own_update on storage.objects;
create policy vault_own_update on storage.objects for update to authenticated
  using (bucket_id = 'vault' and (storage.foldername(name))[1] = (select auth.uid())::text)
  with check (bucket_id = 'vault' and (storage.foldername(name))[1] = (select auth.uid())::text);

-- ── 8) Length limits on public forms (existing rows already fit) ───────────────
alter table public.leads add constraint leads_len check (
  length(email) <= 320 and length(coalesce(source, '')) <= 100 and length(coalesce(meta::text, '')) <= 4000);
alter table public.vip_clients add constraint vip_len check (
  length(email) <= 320 and length(coalesce(name, '')) <= 200 and length(coalesce(whatsapp, '')) <= 50
  and length(coalesce(destination, '')) <= 300 and length(coalesce(travel_dates, '')) <= 200
  and length(coalesce(airline, '')) <= 200 and length(coalesce(dog_info, '')) <= 2000
  and length(coalesce(service_type, '')) <= 200 and length(coalesce(notes, '')) <= 5000);
