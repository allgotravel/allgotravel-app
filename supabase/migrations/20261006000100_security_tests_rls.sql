-- Re-runnable RLS test (private schema, not exposed by the API).
-- Run: select security_tests.run_rls_test();   -> returns an ERROR whose text is the result.
-- Everything it writes is rolled back by that final error.
create schema if not exists security_tests;
revoke all on schema security_tests from public, anon, authenticated;

create or replace function security_tests.run_rls_test()
returns void
language plpgsql
security invoker
as $fn$
declare
  a uuid := gen_random_uuid();
  b uuid := gen_random_uuid();
  r text := '';
  n int;
  t text;
begin
  insert into auth.users (id, instance_id, aud, role, email, raw_user_meta_data, created_at, updated_at)
  values (a, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'rls-test-a@example.invalid', '{}', now(), now()),
         (b, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'rls-test-b@example.invalid', '{}', now(), now());
  insert into public.profiles (id, email) values (a, 'rls-test-a@example.invalid') on conflict (id) do nothing;
  insert into public.profiles (id, email) values (b, 'rls-test-b@example.invalid') on conflict (id) do nothing;

  -- B's private data (written as admin)
  update public.profiles set allergies = 'B-secret', blood_type = 'O-', medications = '[{"name":"B-med"}]' where id = b;
  insert into public.documents (user_id, owner, doc_type, label) values (b, 'person', 'passport', 'B-passport');
  insert into public.med_log (user_id, med_name) values (b, 'B-med');
  insert into public.conversations (user_id, role, content) values (b, 'user', 'B-chat');
  insert into public.memberships (user_id, plan_type, status) values (b, 'monthly', 'active');
  insert into storage.objects (bucket_id, name, owner, owner_id) values ('vault', b::text || '/passport.pdf', b, b::text);

  -- ===== act as user A =====
  perform set_config('request.jwt.claims', json_build_object('sub', a, 'role', 'authenticated')::text, true);
  set local role authenticated;

  begin select count(*) into n from public.profiles; exception when insufficient_privilege then n := 0; end;                 r := r || 'A_sees_profiles=' || n || (case when n = 1 then ' OK' else ' FAIL' end) || '; ';
  begin select count(*) into n from public.profiles where id = b; exception when insufficient_privilege then n := 0; end;    r := r || 'A_read_B_profile=' || n || (case when n = 0 then ' OK' else ' FAIL' end) || '; ';
  begin update public.profiles set full_name = 'hacked' where id = b; get diagnostics n = row_count; exception when insufficient_privilege then n := 0; end;
                                                               r := r || 'A_update_B_profile=' || n || (case when n = 0 then ' OK' else ' FAIL' end) || '; ';
  begin delete from public.profiles where id = b; get diagnostics n = row_count; exception when insufficient_privilege then n := 0; end;
                                                               r := r || 'A_delete_B_profile=' || n || (case when n = 0 then ' OK' else ' FAIL' end) || '; ';
  begin
    begin update public.profiles set id = b where id = a; get diagnostics n = row_count; exception when insufficient_privilege then n := 0; end;
    r := r || 'A_move_own_profile_to_B=' || n || (case when n = 0 then ' OK' else ' FAIL' end) || '; ';
  exception when others then r := r || 'A_move_own_profile_to_B=blocked OK; '; end;

  begin select count(*) into n from public.documents where user_id = b; exception when insufficient_privilege then n := 0; end; r := r || 'A_read_B_docs=' || n || (case when n = 0 then ' OK' else ' FAIL' end) || '; ';
  begin update public.documents set label = 'x' where user_id = b; get diagnostics n = row_count; exception when insufficient_privilege then n := 0; end;
                                                               r := r || 'A_update_B_docs=' || n || (case when n = 0 then ' OK' else ' FAIL' end) || '; ';
  begin delete from public.documents where user_id = b; get diagnostics n = row_count; exception when insufficient_privilege then n := 0; end;
                                                               r := r || 'A_delete_B_docs=' || n || (case when n = 0 then ' OK' else ' FAIL' end) || '; ';
  begin
    insert into public.documents (user_id, owner, doc_type) values (b, 'person', 'visa');
    r := r || 'A_insert_doc_as_B=allowed FAIL; ';
  exception when others then r := r || 'A_insert_doc_as_B=blocked OK; '; end;
  begin
    insert into public.documents (user_id, owner, doc_type) values (a, 'person', 'visa');
    begin update public.documents set user_id = b where user_id = a; get diagnostics n = row_count; exception when insufficient_privilege then n := 0; end;
    r := r || 'A_hand_doc_to_B=' || n || (case when n = 0 then ' OK' else ' FAIL' end) || '; ';
  exception when others then r := r || 'A_hand_doc_to_B=blocked OK; '; end;

  begin select count(*) into n from public.med_log where user_id = b; exception when insufficient_privilege then n := 0; end; r := r || 'A_read_B_medlog=' || n || (case when n = 0 then ' OK' else ' FAIL' end) || '; ';
  begin
    insert into public.med_log (user_id, med_name) values (b, 'x');
    r := r || 'A_insert_medlog_as_B=allowed FAIL; ';
  exception when others then r := r || 'A_insert_medlog_as_B=blocked OK; '; end;

  begin select count(*) into n from public.conversations where user_id = b; exception when insufficient_privilege then n := 0; end; r := r || 'A_read_B_chat=' || n || (case when n = 0 then ' OK' else ' FAIL' end) || '; ';
  begin
    insert into public.conversations (user_id, role, content) values (b, 'user', 'x');
    r := r || 'A_insert_chat_as_B=allowed FAIL; ';
  exception when others then r := r || 'A_insert_chat_as_B=blocked OK; '; end;

  begin select count(*) into n from public.memberships where user_id = b; exception when insufficient_privilege then n := 0; end; r := r || 'A_read_B_membership=' || n || (case when n = 0 then ' OK' else ' FAIL' end) || '; ';
  begin
    insert into public.memberships (user_id, plan_type, status) values (a, 'annual', 'active');
    r := r || 'A_give_self_membership=allowed FAIL; ';
  exception when others then r := r || 'A_give_self_membership=blocked OK; '; end;
  update public.profiles set subscription_status = 'active', subscription_plan = 'annual' where id = a;
  select subscription_status into t from public.profiles where id = a;
                                                               r := r || 'A_self_upgrade_status=' || t || (case when t = 'free' then ' OK' else ' FAIL' end) || '; ';

  begin select count(*) into n from public.pending_entitlements; exception when insufficient_privilege then n := 0; end;     r := r || 'A_read_pending=' || n || (case when n = 0 then ' OK' else ' FAIL' end) || '; ';
  begin select count(*) into n from public.members; exception when insufficient_privilege then n := 0; end;                  r := r || 'A_read_members=' || n || (case when n = 0 then ' OK' else ' FAIL' end) || '; ';
  begin select count(*) into n from public.api_usage; exception when insufficient_privilege then n := 0; end;                r := r || 'A_read_api_usage=' || n || (case when n = 0 then ' OK' else ' FAIL' end) || '; ';
  begin
    insert into public.api_usage (user_id, endpoint) values (b, 'chat');
    r := r || 'A_insert_api_usage=allowed FAIL; ';
  exception when others then r := r || 'A_insert_api_usage=blocked OK; '; end;
  begin select count(*) into n from public.leads; exception when insufficient_privilege then n := 0; end;                    r := r || 'A_read_leads=' || n || (case when n = 0 then ' OK' else ' FAIL' end) || '; ';
  begin select count(*) into n from public.vip_clients; exception when insufficient_privilege then n := 0; end;              r := r || 'A_read_vip=' || n || (case when n = 0 then ' OK' else ' FAIL' end) || '; ';

  begin select count(*) into n from storage.objects where name like b::text || '/%'; exception when insufficient_privilege then n := 0; end;
                                                               r := r || 'A_list_B_vault=' || n || (case when n = 0 then ' OK' else ' FAIL' end) || '; ';
  begin
    insert into storage.objects (bucket_id, name, owner, owner_id) values ('vault', b::text || '/evil.pdf', a, a::text);
    r := r || 'A_upload_into_B_folder=allowed FAIL; ';
  exception when others then r := r || 'A_upload_into_B_folder=blocked OK; '; end;
  begin update storage.objects set name = a::text || '/stolen.pdf' where name like b::text || '/%'; get diagnostics n = row_count; exception when insufficient_privilege then n := 0; end;
                                                               r := r || 'A_move_B_file=' || n || (case when n = 0 then ' OK' else ' FAIL' end) || '; ';
  begin
    insert into storage.objects (bucket_id, name, owner, owner_id) values ('vault', a::text || '/mine.pdf', a, a::text);
    begin update storage.objects set name = b::text || '/planted.pdf' where name = a::text || '/mine.pdf'; get diagnostics n = row_count; exception when insufficient_privilege then n := 0; end;
    r := r || 'A_move_own_file_into_B=' || n || (case when n = 0 then ' OK' else ' FAIL' end) || '; ';
  exception when others then r := r || 'A_move_own_file_into_B=blocked OK; '; end;
  begin select count(*) into n from storage.buckets; exception when insufficient_privilege then n := 0; end;                 r := r || 'A_list_buckets=' || n || '; ';

  -- emergency token: user must not be able to set an arbitrary token
  begin
    begin update public.profiles set emergency_token = '00000000-0000-0000-0000-000000000001' where id = a; get diagnostics n = row_count; exception when insufficient_privilege then n := 0; end;
    begin select count(*) into n from public.profiles where id = a and emergency_token::text = '00000000-0000-0000-0000-000000000001'; exception when insufficient_privilege then n := 0; end;
    r := r || 'A_set_own_token_manually=' || (case when n = 0 then 'blocked OK' else 'allowed WARN' end) || '; ';
  exception when others then r := r || 'A_set_own_token_manually=blocked OK; '; end;

  -- sanity: A can still use her OWN data (the app must keep working)
  begin
    insert into public.documents (user_id, owner, doc_type, label) values (a, 'person', 'passport', 'A-own');
    insert into public.med_log (user_id, med_name) values (a, 'A-med');
    insert into storage.objects (bucket_id, name, owner, owner_id) values ('vault', a::text || '/own-check.pdf', a, a::text);
    select count(*) into n from public.documents where user_id = a and label = 'A-own';
    update public.profiles set full_name = 'A name' where id = a;
    r := r || 'A_own_doc_medlog_upload_profile=' || (case when n = 1 then 'works OK' else 'FAIL' end) || '; ';
  exception when others then r := r || 'A_own_data=error FAIL(' || sqlerrm || '); '; end;

  -- emergency token rotation (revocation) by the owner
  begin
    select emergency_token into t from public.profiles where id = a;
    perform public.rotate_emergency_token();
    select count(*) into n from public.profiles where id = a and emergency_token <> t and length(emergency_token) >= 32;
    r := r || 'A_rotate_own_token=' || (case when n = 1 then 'OK' else 'FAIL' end) || '; ';
  exception when others then r := r || 'A_rotate_own_token=error FAIL(' || sqlerrm || '); '; end;
  begin
    select count(*) into n from public.get_emergency_card((select emergency_token from public.profiles where id = a));
    r := r || 'A_call_get_emergency_card=allowed WARN; ';
  exception when others then r := r || 'A_call_get_emergency_card=blocked OK; '; end;

  -- ===== act as anonymous visitor =====
  reset role;
  perform set_config('request.jwt.claims', json_build_object('role', 'anon')::text, true);
  set local role anon;
  begin select count(*) into n from public.profiles; exception when insufficient_privilege then n := 0; end;                 r := r || 'anon_read_profiles=' || n || (case when n = 0 then ' OK' else ' FAIL' end) || '; ';
  begin select count(*) into n from public.documents; exception when insufficient_privilege then n := 0; end;                r := r || 'anon_read_docs=' || n || (case when n = 0 then ' OK' else ' FAIL' end) || '; ';
  begin select count(*) into n from public.med_log; exception when insufficient_privilege then n := 0; end;                  r := r || 'anon_read_medlog=' || n || (case when n = 0 then ' OK' else ' FAIL' end) || '; ';
  begin select count(*) into n from public.conversations; exception when insufficient_privilege then n := 0; end;            r := r || 'anon_read_chat=' || n || (case when n = 0 then ' OK' else ' FAIL' end) || '; ';
  begin select count(*) into n from public.leads; exception when insufficient_privilege then n := 0; end;                    r := r || 'anon_read_leads=' || n || (case when n = 0 then ' OK' else ' FAIL' end) || '; ';
  begin select count(*) into n from public.vip_clients; exception when insufficient_privilege then n := 0; end;              r := r || 'anon_read_vip=' || n || (case when n = 0 then ' OK' else ' FAIL' end) || '; ';
  begin select count(*) into n from storage.objects; exception when insufficient_privilege then n := 0; end;                 r := r || 'anon_list_vault=' || n || (case when n = 0 then ' OK' else ' FAIL' end) || '; ';
  begin select count(*) into n from public.airlines; exception when insufficient_privilege then n := 0; end;                 r := r || 'anon_read_airlines=' || n || (case when n > 0 then ' OK(public)' else ' FAIL' end) || '; ';
  begin select count(*) into n from public.cruise_lines; exception when insufficient_privilege then n := 0; end;             r := r || 'anon_read_cruise=' || n || (case when n > 0 then ' OK(public)' else ' FAIL' end) || '; ';
  begin update public.airlines set notes = 'x'; get diagnostics n = row_count; exception when insufficient_privilege then n := 0; end;
                                                               r := r || 'anon_update_airlines=' || n || (case when n = 0 then ' OK' else ' FAIL' end) || '; ';
  begin
    insert into public.profiles (id, email) values (gen_random_uuid(), 'x@example.invalid');
    r := r || 'anon_insert_profile=allowed FAIL; ';
  exception when others then r := r || 'anon_insert_profile=blocked OK; '; end;
  begin
    insert into public.leads (email, source) values ('rls-test@example.invalid', 'rls-test');
    r := r || 'anon_insert_lead=allowed OK(intended); ';
  exception when others then r := r || 'anon_insert_lead=blocked FAIL(form broken); '; end;
  begin
    insert into public.vip_clients (email) values ('rls-test@example.invalid');
    r := r || 'anon_insert_vip=allowed OK(intended form); ';
  exception when others then r := r || 'anon_insert_vip=blocked FAIL(form broken); '; end;
  begin
    insert into public.vip_clients (email, user_id) values ('rls-test@example.invalid', b);
    r := r || 'anon_insert_vip_as_B=allowed WARN; ';
  exception when others then r := r || 'anon_insert_vip_as_B=blocked OK; '; end;
  begin
    select count(*) into n from public.get_emergency_card('short-token');
    r := r || 'anon_call_get_emergency_card=allowed(transitional) short_token_rows=' || n || (case when n = 0 then ' OK' else ' FAIL' end) || '; ';
  exception when others then r := r || 'anon_call_get_emergency_card=blocked; '; end;

  reset role;
  raise exception 'RLS_RESULT: %', r;
end
$fn$;

revoke all on function security_tests.run_rls_test() from public, anon, authenticated;
