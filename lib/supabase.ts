import { createClient } from '@supabase/supabase-js'

// Public client (anon key). Safe for the browser. Row Level Security protects the data.
// The service-role client lives in lib/supabase-admin.ts and is server-only.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
