import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import type { User } from '@supabase/supabase-js'

// Server-only helpers for API routes that spend Anthropic credit or read private data.
// The user is ALWAYS taken from the Supabase session cookie, never from the request body.

export async function getSessionUser(): Promise<User | null> {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { getAll: () => cookieStore.getAll() } }
    )
    const { data } = await supabase.auth.getUser()
    return data.user ?? null
  } catch {
    return null
  }
}

// ── Per-user rate limit ──────────────────────────────────────────────────────
// Uses the `api_usage` table (see supabase/migrations/*_api_usage.sql). If the table
// is not there yet, falls back to an in-memory counter (per server instance).
const memory = new Map<string, number[]>()

function memoryHit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now()
  const hits = (memory.get(key) ?? []).filter(t => now - t < windowMs)
  if (hits.length >= limit) {
    memory.set(key, hits)
    return false
  }
  hits.push(now)
  memory.set(key, hits)
  return true
}

/** Returns true if the request is allowed, false if the user went over the limit. */
export async function checkRateLimit(userId: string, endpoint: string, limit: number, windowMs: number): Promise<boolean> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (url && serviceKey) {
    try {
      const admin = createClient(url, serviceKey)
      const since = new Date(Date.now() - windowMs).toISOString()
      const { count, error } = await admin
        .from('api_usage')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('endpoint', endpoint)
        .gte('created_at', since)
      if (!error) {
        if ((count ?? 0) >= limit) return false
        await admin.from('api_usage').insert({ user_id: userId, endpoint })
        return true
      }
    } catch {
      // fall through to the in-memory limiter
    }
  }
  return memoryHit(`${endpoint}:${userId}`, limit, windowMs)
}
