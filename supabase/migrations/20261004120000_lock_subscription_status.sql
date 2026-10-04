-- Lock membership fields on profiles (AllGo Travel App) — 4-oct-2026
-- NOT applied automatically: review and run it in the Supabase SQL editor.
--
-- Problem: the policy "Users manage own profile" (for all using auth.uid() = id) lets any
-- signed-in user INSERT or UPDATE every column of their own row, including
-- subscription_status, so anyone could make themselves a member.
--
-- Fix: a BEFORE INSERT/UPDATE trigger. When the request comes from an end user
-- (JWT role 'authenticated' or 'anon'), membership columns are forced to safe values:
--   • INSERT: membership columns are reset to 'free' / NULL.
--   • UPDATE: membership columns keep their previous values (silently, so normal
--     profile saves that send the whole row keep working).
-- The service role (Hotmart webhook) and internal Postgres/Supabase roles are not affected.

create or replace function public.protect_membership_fields()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if coalesce(auth.role(), '') in ('authenticated', 'anon') then
    if tg_op = 'INSERT' then
      new.subscription_status     := 'free';
      new.subscription_plan       := null;
      new.subscription_provider   := null;
      new.subscription_expires_at := null;
      new.hotmart_purchase_id     := null;
    else
      new.subscription_status     := old.subscription_status;
      new.subscription_plan       := old.subscription_plan;
      new.subscription_provider   := old.subscription_provider;
      new.subscription_expires_at := old.subscription_expires_at;
      new.hotmart_purchase_id     := old.hotmart_purchase_id;
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists protect_membership_fields on public.profiles;
create trigger protect_membership_fields
  before insert or update on public.profiles
  for each row execute function public.protect_membership_fields();

-- Quick check after applying (run as a normal signed-in user, e.g. from the app):
--   update profiles set subscription_status = 'active' where id = auth.uid();
--   select subscription_status from profiles where id = auth.uid();  -- must NOT be 'active'
