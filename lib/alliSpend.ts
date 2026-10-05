import { createClient } from '@supabase/supabase-js'

// Tope de gasto de IA por usuario y por mes calendario (Alli, /api/chat).
// Imports relativos/sin alias para poder usarlo también fuera de Next.

// Precios en USD por millón de tokens. Verificados el 5-oct-2026 en
// https://platform.claude.com/docs/en/about-claude/pricing — revisar si cambian.
export const AI_PRICES_USD_PER_MTOK: Record<string, { input: number; cacheWrite: number; cacheRead: number; output: number }> = {
  'claude-sonnet-4-6': { input: 3, cacheWrite: 3.75, cacheRead: 0.3, output: 15 },
  'claude-haiku-4-5': { input: 1, cacheWrite: 1.25, cacheRead: 0.1, output: 5 },
}

// Tope mensual por persona, en USD.
//  - free: cuenta sin acceso de pago.
//  - paid: con acceso de pago. Hoy el app solo lo reconoce por subscription_status = 'active';
//    las compras de guías y del Pack no se registran en la base (el webhook de Hotmart las ignora).
export const ALLI_MONTHLY_CAP_USD = { free: 0.5, paid: 3 } as const

// true: Alli funciona para cualquier cuenta con sesión, con el tope "free".
// false: solo con acceso de pago (como antes: 403 y panel de guías/Pack).
export const ALLI_FREE_ACCESS = true

export type SpendTier = keyof typeof ALLI_MONTHLY_CAP_USD

export interface UsageRow {
  model: string | null
  input_tokens: number | null
  output_tokens: number | null
  cache_read_tokens: number | null
}

/**
 * Costo estimado de una llamada. input_tokens incluye las escrituras de caché (no se
 * guardan aparte), así que se cobran a la tarifa de escritura de caché: estimación
 * conservadora (un poco por encima del costo real). Un modelo sin precio en la tabla
 * se cobra con la tarifa más cara de la tabla.
 */
export function estimateCostUSD(row: UsageRow): number {
  const p =
    (row.model && AI_PRICES_USD_PER_MTOK[row.model]) ||
    Object.values(AI_PRICES_USD_PER_MTOK).reduce((a, b) => (b.output > a.output ? b : a))
  return (
    ((row.input_tokens ?? 0) * p.cacheWrite +
      (row.cache_read_tokens ?? 0) * p.cacheRead +
      (row.output_tokens ?? 0) * p.output) /
    1_000_000
  )
}

/** Inicio del mes calendario actual y del siguiente (UTC). */
export function monthWindow(now = new Date()): { start: Date; next: Date } {
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1))
  const next = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1))
  return { start, next }
}

/**
 * Gasto estimado del usuario en el mes actual para un endpoint. Devuelve null si no se
 * puede calcular (sin clave de servicio o error de la base): en ese caso no se bloquea
 * y sigue aplicando el límite por hora.
 */
export async function monthlySpendUSD(userId: string, endpoint = 'chat'): Promise<number | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !serviceKey) return null
  try {
    const { start } = monthWindow()
    const { data, error } = await createClient(url, serviceKey)
      .from('api_usage')
      .select('model, input_tokens, output_tokens, cache_read_tokens')
      .eq('user_id', userId)
      .eq('endpoint', endpoint)
      .gte('created_at', start.toISOString())
    if (error) {
      console.warn('[alli spend]', error.message)
      return null
    }
    return ((data ?? []) as UsageRow[]).reduce((sum, r) => sum + estimateCostUSD(r), 0)
  } catch {
    return null
  }
}
