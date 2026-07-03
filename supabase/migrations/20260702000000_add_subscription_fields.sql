-- Add subscription fields to profiles table
-- Run this in Supabase Dashboard → SQL Editor

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'free'
  CHECK (subscription_status IN ('free', 'active', 'cancelled', 'expired'));

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_plan TEXT;
  -- 'monthly' or 'annual'

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_provider TEXT;
  -- 'hotmart' or 'gumroad'

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_expires_at TIMESTAMPTZ;

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS hotmart_purchase_id TEXT;

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS gumroad_sale_id TEXT;

-- NOTE: Webhook routes use SUPABASE_SERVICE_ROLE_KEY to bypass RLS when updating
-- subscription status. Add this key to Vercel environment variables (never expose to client).
