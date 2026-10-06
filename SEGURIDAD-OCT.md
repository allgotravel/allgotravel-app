# Security hardening — October 2026 (branch `seguridad-oct`)

## Already applied in Supabase (live database)
- `security_tests_rls` — private test `security_tests.run_rls_test()`. Run it in the SQL editor:
  `select security_tests.run_rls_test();` It creates two fake users inside a transaction,
  tries every cross-user read/write, and rolls everything back. The result comes back as the
  error text ("RLS_RESULT: ... OK ..."). Any "FAIL" = a leak.
- `security_hardening_oct` — see `supabase/migrations/20261006000200_security_hardening_oct.sql`.

## Apply AFTER this branch is deployed
- `supabase/migrations/20261006000300_revoke_anon_emergency_card.sql`
  (removes public-key access to `get_emergency_card`; the new `/e/<token>` page uses the server key).

## Optional Vercel env var
- `RATE_LIMIT_SALT` (any long random text). Used to hash visitor IPs for the `/e/` rate limit.

## Rotating keys (only if Yadi decides to)
### Anthropic
1. console.anthropic.com → API Keys → Create key (name: `allgo-vercel-2026-10`).
2. Vercel → allgotravel-app → Settings → Environment Variables → `ANTHROPIC_API_KEY` → Edit → paste → Save.
3. Vercel → Deployments → latest Production → ⋯ → Redeploy.
4. Test Alli once. Then back in Anthropic console → disable/delete the old key.
5. Update `.env.local` on the Mac.

### Supabase service key (`SUPABASE_SERVICE_ROLE_KEY`)
The legacy `service_role` JWT can't be rotated alone (rotating the JWT secret also changes
the anon key and logs everybody out). The clean way is the new key system:
1. Supabase → Project Settings → API Keys → "Publishable and secret keys" → create a **secret key** (`sb_secret_…`).
2. Vercel: set `SUPABASE_SERVICE_ROLE_KEY` = the new `sb_secret_…` value → Redeploy → test webhook + Alli + `/e/`.
3. Supabase → API Keys → Legacy → **Disable legacy service_role key** (anon can stay until step below).

### Hotmart hottok
Hotmart → Tools → Webhook → generate new hottok → Vercel `HOTMART_HOTTOK` → Redeploy.

## Plan: move to new Supabase keys before end of 2026 (do NOT do yet)
1. Create a publishable key (`sb_publishable_…`) and a secret key (`sb_secret_…`) in Supabase → API Keys.
2. Vercel: `NEXT_PUBLIC_SUPABASE_ANON_KEY` = publishable key, `SUPABASE_SERVICE_ROLE_KEY` = secret key
   (names can stay; supabase-js accepts the new keys in the same place).
3. Replace the anon JWT hard-coded in `public/*.html` (leads forms: adelanto-perro, checklist-viaje,
   gratis, kit, kit-turismo-gratis, kit-perro-gratis, perro, prueba-ali, quiz-viaje, verificador-perro)
   with the publishable key.
4. Redeploy, test: login, register, profile save, documents upload/download, Alli, planner,
   `/e/<token>`, Hotmart webhook (test event), the lead forms.
5. Supabase → API Keys → disable legacy anon + service_role keys. Watch logs 48 h.
6. Note: secret keys are refused from browsers (by design) — they must only live in Vercel.
