import { createClient, type SupabaseClient } from '@supabase/supabase-js'

// SERVER ONLY. Uses the service-role key, which bypasses Row Level Security.
// Never import this file from a 'use client' component.
let _admin: SupabaseClient | null = null

export function getSupabaseAdmin(): SupabaseClient {
  if (typeof window !== 'undefined') {
    throw new Error('getSupabaseAdmin() is server-only')
  }
  if (!_admin) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!url || !key) throw new Error('Supabase server credentials are not configured')
    _admin = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })
  }
  return _admin
}
