-- Add allergies to the medical profile + include it in the public emergency card
-- Run in Supabase Dashboard → SQL Editor

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS allergies text;

-- The emergency function's return shape changes (adds allergies), so drop + recreate
DROP FUNCTION IF EXISTS public.get_emergency_card(uuid);

CREATE FUNCTION public.get_emergency_card(token uuid)
RETURNS TABLE (
  full_name text,
  allergies text,
  chronic_conditions text,
  invisible_needs text,
  medications jsonb
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT full_name, allergies, chronic_conditions, invisible_needs, medications
  FROM profiles
  WHERE emergency_token = token
    AND emergency_sharing_enabled = true
  LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public.get_emergency_card(uuid) TO anon, authenticated;
