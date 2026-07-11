-- Emergency Medical Card — public QR access
-- Run in Supabase Dashboard → SQL Editor
--
-- Lets a doctor/first-responder scan the medical-card QR and see ONLY the
-- emergency info, WITHOUT logging in. Security:
--   * access is by an unguessable random token (not the user id)
--   * only emergency-relevant columns are ever returned
--   * the user can turn sharing off
--   * read-only

-- 1) Unguessable per-profile token
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS emergency_token uuid DEFAULT gen_random_uuid();
UPDATE profiles SET emergency_token = gen_random_uuid() WHERE emergency_token IS NULL;
ALTER TABLE profiles ALTER COLUMN emergency_token SET NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS profiles_emergency_token_idx ON profiles(emergency_token);

-- 2) Let the user enable/disable emergency sharing (default ON)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS emergency_sharing_enabled boolean DEFAULT true;

-- 3) Public read of ONLY the emergency fields, keyed by the secret token.
--    SECURITY DEFINER runs with the function owner's rights (bypasses RLS) but
--    the function body only ever returns the five emergency columns.
CREATE OR REPLACE FUNCTION public.get_emergency_card(token uuid)
RETURNS TABLE (
  full_name text,
  chronic_conditions text,
  invisible_needs text,
  medications jsonb
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT full_name, chronic_conditions, invisible_needs, medications
  FROM profiles
  WHERE emergency_token = token
    AND emergency_sharing_enabled = true
  LIMIT 1;
$$;

-- 4) Allow anonymous (not-logged-in) and logged-in callers to run it
GRANT EXECUTE ON FUNCTION public.get_emergency_card(uuid) TO anon, authenticated;
