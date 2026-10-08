// Lógica pura del webhook de Hotmart (sin APIs de Deno), para poder probarla fuera de Supabase.

export type ProductKey = 'perro' | 'turismo' | 'pack' | 'kit' | 'kit_silla' | 'mexico' | 'unknown'

// IDs numéricos de producto en Hotmart -> producto de AllGo Travel App
export const PRODUCTS: Record<string, { key: ProductKey; label: string; group: string }> = {
  '8150917': { key: 'perro', label: 'Guía Perro de Servicio', group: 'Compradores · Perro' },
  '8020788': { key: 'turismo', label: 'Turismo Sin Fronteras', group: 'Compradores · Turismo' },
  '8605596': { key: 'pack', label: 'Pack Viajero Completo', group: 'Compradores · Pack' },
  '8335262': { key: 'kit', label: 'Kit del Viajero', group: 'Compradores · Kit' },
  '8374052': { key: 'kit_silla', label: 'Kit Silla', group: 'Compradores · Kit' },
  '8681979': { key: 'mexico', label: 'Patitas Viajeras Sin Fronteras', group: 'Compradores · México' },
}

export const ACTIVE_EVENTS = ['PURCHASE_APPROVED', 'PURCHASE_COMPLETE']
export const END_EVENTS = ['PURCHASE_REFUNDED', 'PURCHASE_CHARGEBACK', 'PURCHASE_CANCELED', 'PURCHASE_CANCELLED']

/** Comparación en tiempo constante (el hottok no se puede adivinar midiendo tiempos). */
export function tokenMatches(given: string | null | undefined, expected: string | null | undefined): boolean {
  if (!given || !expected) return false
  const a = new TextEncoder().encode(given)
  const b = new TextEncoder().encode(expected)
  let diff = a.length ^ b.length
  const n = Math.max(a.length, b.length)
  for (let i = 0; i < n; i++) diff |= (a[i] ?? 0) ^ (b[i] ?? 0)
  return diff === 0
}

export interface Normalized {
  event: string
  event_id: string | null
  transaction_id: string | null
  product_id: string | null
  product_key: ProductKey
  buyer_email: string | null
  buyer_first_name: string | null
  price: number | null
  currency: string | null
  sck: string | null
  src: string | null
  marketing_ok: boolean
}

// deno-lint-ignore no-explicit-any
type Any = any

const clean = (v: unknown, max = 120): string | null => {
  if (v === undefined || v === null) return null
  const s = String(v).trim()
  return s ? s.slice(0, max) : null
}

/** Extrae solo los campos que usamos de un evento Hotmart (webhook v2). Lo demás se descarta. */
export function normalize(body: Any): Normalized {
  const d: Any = body?.data ?? {}
  const pid = clean(d?.product?.id, 20)
  const email = clean(d?.buyer?.email ?? d?.subscriber?.email, 254)
  const name = clean(d?.buyer?.first_name ?? d?.buyer?.name, 120)
  const origin: Any = d?.purchase?.origin ?? {}
  const priceRaw = d?.purchase?.price?.value ?? d?.purchase?.full_price?.value
  const price = priceRaw === undefined || priceRaw === null || isNaN(Number(priceRaw)) ? null : Number(priceRaw)
  return {
    event: String(body?.event ?? '').toUpperCase().slice(0, 60),
    event_id: clean(body?.id, 80),
    transaction_id: clean(d?.purchase?.transaction, 80),
    product_id: pid,
    product_key: (pid && PRODUCTS[pid]?.key) || 'unknown',
    buyer_email: email ? email.toLowerCase() : null,
    buyer_first_name: name ? name.split(/\s+/)[0] : null, // solo el nombre de pila
    price,
    currency: clean(d?.purchase?.price?.currency_value, 8),
    sck: clean(origin?.sck, 60),
    src: clean(origin?.src, 60),
    marketing_ok: false, // Hotmart no envía consentimiento de marketing: queda en false
  }
}

/** Qué hacer en MailerLite según el cambio de estado que devolvió la base. */
export function mailerliteAction(newStatus: string, changed: boolean): 'add' | 'remove' | 'none' {
  if (!changed) return 'none'
  if (newStatus === 'active') return 'add'
  if (['refunded', 'chargeback', 'canceled'].includes(newStatus)) return 'remove'
  return 'none'
}

/** Datos para el log: nunca correo, nombre ni payload completo. */
export function safeLog(n: Normalized, extra: Record<string, unknown> = {}) {
  const tx = n.transaction_id ? n.transaction_id.slice(0, 4) + '…' + n.transaction_id.slice(-3) : '-'
  return JSON.stringify({ event: n.event, tx, product: n.product_key, ...extra })
}

// ─── MailerLite (API nueva: connect.mailerlite.com) ─────────────────────────
export type Fetch = (url: string, init?: Any) => Promise<{ ok: boolean; status: number; json: () => Promise<Any> }>
const ML = 'https://connect.mailerlite.com/api'

function headers(key: string) {
  return { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json', Accept: 'application/json' }
}

/** Busca el grupo por nombre exacto; si no existe, lo crea. */
export async function ensureGroup(fetchFn: Fetch, key: string, name: string): Promise<string> {
  const q = await fetchFn(`${ML}/groups?limit=100&filter[name]=${encodeURIComponent(name)}`, { headers: headers(key) })
  if (!q.ok) throw new Error(`ML groups ${q.status}`)
  const found = ((await q.json())?.data ?? []).find((g: Any) => g?.name === name)
  if (found) return String(found.id)
  const c = await fetchFn(`${ML}/groups`, { method: 'POST', headers: headers(key), body: JSON.stringify({ name }) })
  if (!c.ok) throw new Error(`ML create group ${c.status}`)
  return String((await c.json())?.data?.id)
}

/** Agrega (o actualiza) al comprador y lo pone en el grupo. No cambia otros grupos. */
export async function addToGroup(fetchFn: Fetch, key: string, email: string, firstName: string | null, groupId: string) {
  const body: Any = { email, groups: [groupId] }
  if (firstName) body.fields = { name: firstName }
  const r = await fetchFn(`${ML}/subscribers`, { method: 'POST', headers: headers(key), body: JSON.stringify(body) })
  if (!r.ok) throw new Error(`ML upsert ${r.status}`)
}

/** Saca al comprador del grupo (reembolso / contracargo / cancelación). */
export async function removeFromGroup(fetchFn: Fetch, key: string, email: string, groupId: string) {
  const s = await fetchFn(`${ML}/subscribers/${encodeURIComponent(email)}`, { headers: headers(key) })
  if (s.status === 404) return // no estaba en MailerLite
  if (!s.ok) throw new Error(`ML get subscriber ${s.status}`)
  const id = (await s.json())?.data?.id
  if (!id) return
  const r = await fetchFn(`${ML}/subscribers/${id}/groups/${groupId}`, { method: 'DELETE', headers: headers(key) })
  if (!r.ok && r.status !== 404) throw new Error(`ML remove ${r.status}`)
}
