-- Compras de Hotmart -> Supabase (para la secuencia poscompra en MailerLite) — 9-oct-2026.
-- Lo escribe solo app/api/webhooks/hotmart/route.ts con la clave de servicio (lib/hotmartPurchases.ts). Sin acceso para anon ni authenticated.
-- Datos personales mínimos: correo (para el correo de servicio) y nombre de pila. Nada de teléfono, documento ni dirección.

create table if not exists public.hotmart_purchases (
  id               bigint generated always as identity primary key,
  transaction_id   text not null unique,              -- idempotencia: una fila por transacción de Hotmart
  status           text not null default 'pending'
                   check (status in ('pending', 'active', 'refunded', 'chargeback', 'canceled')),
  last_event       text not null,                     -- último evento recibido (PURCHASE_APPROVED, …)
  last_event_id    text,                              -- id del evento de Hotmart (detecta reenvíos)
  product_id       text,
  product_key      text,                              -- perro | turismo | pack | kit | kit_silla | mexico | unknown
  buyer_email      text,
  buyer_first_name text,
  price            numeric(10, 2),
  currency         text,
  sck              text,                              -- atribución (?src -> sck en las landings)
  src              text,
  service_ok       boolean not null default false,    -- correos de servicio sobre su compra
  marketing_ok     boolean not null default false,    -- marketing: solo con consentimiento explícito
  ml_group         text,                              -- grupo de MailerLite donde quedó (o del que salió)
  ml_synced_at     timestamptz,
  ml_error         text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index if not exists hotmart_purchases_email on public.hotmart_purchases (buyer_email);
create index if not exists hotmart_purchases_product_status on public.hotmart_purchases (product_key, status);

alter table public.hotmart_purchases enable row level security;
-- Sin políticas: anon y authenticated no ven ni escriben nada. Además se retiran los permisos de tabla.
revoke all on public.hotmart_purchases from anon, authenticated;

-- Registro atómico de un evento. Reglas:
--  * PURCHASE_APPROVED / PURCHASE_COMPLETE -> active (salvo que ya esté reembolsada/cancelada: eso gana)
--  * PURCHASE_REFUNDED -> refunded · PURCHASE_CHARGEBACK -> chargeback · PURCHASE_CANCELED -> canceled
--  * cualquier otro evento -> solo crea una fila mínima 'pending' si no existía (no cambia estados)
--  * mismo last_event_id que ya se procesó -> no hace nada (reenvío de Hotmart)
-- Devuelve el estado anterior y el nuevo para que la ruta sepa si debe sincronizar MailerLite.
create or replace function public.hotmart_record_event(p jsonb)
returns table (transaction_id text, previous_status text, new_status text, changed boolean, duplicate boolean)
language plpgsql
security definer
set search_path = public
as $$
#variable_conflict use_column
declare
  v_tx    text := nullif(trim(p->>'transaction_id'), '');
  v_event text := upper(coalesce(p->>'event', ''));
  v_eid   text := nullif(p->>'event_id', '');
  v_new   text;
  v_prev  text;
  v_last  text;
begin
  if v_tx is null then
    raise exception 'transaction_id requerido';
  end if;

  v_new := case
    when v_event in ('PURCHASE_APPROVED', 'PURCHASE_COMPLETE') then 'active'
    when v_event = 'PURCHASE_REFUNDED' then 'refunded'
    when v_event = 'PURCHASE_CHARGEBACK' then 'chargeback'
    when v_event in ('PURCHASE_CANCELED', 'PURCHASE_CANCELLED') then 'canceled'
    else null
  end;

  select h.status, h.last_event_id into v_prev, v_last
  from public.hotmart_purchases h where h.transaction_id = v_tx for update;

  -- Reenvío del mismo evento
  if v_prev is not null and v_eid is not null and v_last = v_eid then
    return query select v_tx, v_prev, v_prev, false, true;
    return;
  end if;

  if v_prev is null then
    insert into public.hotmart_purchases as h (
      transaction_id, status, last_event, last_event_id, product_id, product_key, buyer_email, buyer_first_name,
      price, currency, sck, src, service_ok, marketing_ok)
    values (
      v_tx, coalesce(v_new, 'pending'), v_event, v_eid, p->>'product_id', p->>'product_key',
      lower(nullif(trim(p->>'buyer_email'), '')), nullif(trim(p->>'buyer_first_name'), ''),
      nullif(p->>'price', '')::numeric, nullif(p->>'currency', ''), nullif(p->>'sck', ''), nullif(p->>'src', ''),
      coalesce(v_new, 'pending') = 'active', coalesce((p->>'marketing_ok')::boolean, false));
    return query select v_tx, null::text, coalesce(v_new, 'pending'), v_new is not null, false;
    return;
  end if;

  -- Eventos que no cambian estado: solo se anotan
  if v_new is null
     -- una aprobación que llega después de un reembolso/cancelación no revive la compra
     or (v_new = 'active' and v_prev in ('refunded', 'chargeback', 'canceled')) then
    update public.hotmart_purchases h
       set last_event = v_event, last_event_id = coalesce(v_eid, h.last_event_id), updated_at = now()
     where h.transaction_id = v_tx;
    return query select v_tx, v_prev, v_prev, false, false;
    return;
  end if;

  update public.hotmart_purchases h set
    status = v_new,
    last_event = v_event,
    last_event_id = coalesce(v_eid, h.last_event_id),
    product_id = coalesce(h.product_id, p->>'product_id'),
    product_key = coalesce(h.product_key, p->>'product_key'),
    buyer_email = coalesce(h.buyer_email, lower(nullif(trim(p->>'buyer_email'), ''))),
    buyer_first_name = coalesce(h.buyer_first_name, nullif(trim(p->>'buyer_first_name'), '')),
    price = coalesce(h.price, nullif(p->>'price', '')::numeric),
    currency = coalesce(h.currency, nullif(p->>'currency', '')),
    sck = coalesce(h.sck, nullif(p->>'sck', '')),
    src = coalesce(h.src, nullif(p->>'src', '')),
    service_ok = (v_new = 'active'),
    updated_at = now()
  where h.transaction_id = v_tx;
  return query select v_tx, v_prev, v_new, v_prev is distinct from v_new, false;
end;
$$;

-- Anota el resultado de la sincronización con MailerLite (lo llama la ruta del webhook).
create or replace function public.hotmart_mark_ml_sync(p_tx text, p_group text, p_error text)
returns void language sql security definer set search_path = public as $$
  update public.hotmart_purchases
     set ml_group = p_group, ml_synced_at = case when p_error is null then now() else ml_synced_at end,
         ml_error = p_error, updated_at = now()
   where transaction_id = p_tx;
$$;

revoke all on function public.hotmart_record_event(jsonb) from public, anon, authenticated;
revoke all on function public.hotmart_mark_ml_sync(text, text, text) from public, anon, authenticated;
grant execute on function public.hotmart_record_event(jsonb) to service_role;
grant execute on function public.hotmart_mark_ml_sync(text, text, text) to service_role;

-- Prueba de RLS: suma hotmart_purchases (usuario A y anon no deben leer ni escribir)
do $$
declare d text;
begin
  select pg_get_functiondef('security_tests.run_rls_test()'::regprocedure) into d;
  if position('A_read_hotmart' in d) = 0 then
    d := replace(d,
      $r$r := r || 'A_read_vip=' || n || (case when n = 0 then ' OK' else ' FAIL' end) || '; ';$r$,
      $r$r := r || 'A_read_vip=' || n || (case when n = 0 then ' OK' else ' FAIL' end) || '; ';
  begin select count(*) into n from public.hotmart_purchases; exception when insufficient_privilege then n := 0; end; r := r || 'A_read_hotmart=' || n || (case when n = 0 then ' OK' else ' FAIL' end) || '; ';
  begin
    insert into public.hotmart_purchases (transaction_id, last_event) values ('RLS-TEST-A', 'X');
    r := r || 'A_insert_hotmart=allowed FAIL; ';
  exception when others then r := r || 'A_insert_hotmart=blocked OK; '; end;
  begin
    perform public.hotmart_record_event('{"transaction_id":"RLS-TEST-A2","event":"PURCHASE_APPROVED"}'::jsonb);
    r := r || 'A_call_hotmart_record=allowed FAIL; ';
  exception when others then r := r || 'A_call_hotmart_record=blocked OK; '; end;$r$);
    d := replace(d,
      $r$r := r || 'anon_read_vip=' || n || (case when n = 0 then ' OK' else ' FAIL' end) || '; ';$r$,
      $r$r := r || 'anon_read_vip=' || n || (case when n = 0 then ' OK' else ' FAIL' end) || '; ';
  begin select count(*) into n from public.hotmart_purchases; exception when insufficient_privilege then n := 0; end; r := r || 'anon_read_hotmart=' || n || (case when n = 0 then ' OK' else ' FAIL' end) || '; ';
  begin
    insert into public.hotmart_purchases (transaction_id, last_event) values ('RLS-TEST-ANON', 'X');
    r := r || 'anon_insert_hotmart=allowed FAIL; ';
  exception when others then r := r || 'anon_insert_hotmart=blocked OK; '; end;
  begin
    perform public.hotmart_record_event('{"transaction_id":"RLS-TEST-ANON2","event":"PURCHASE_APPROVED"}'::jsonb);
    r := r || 'anon_call_hotmart_record=allowed FAIL; ';
  exception when others then r := r || 'anon_call_hotmart_record=blocked OK; '; end;$r$);
    execute d;
  end if;
end $$;
