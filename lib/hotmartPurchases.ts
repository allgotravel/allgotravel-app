// Compras de guías de Hotmart -> Supabase (hotmart_purchases) -> MailerLite (grupo "Compradores · <Producto>").
// Lo usa app/api/webhooks/hotmart/route.ts. No toca la membresía del Club.
// Sin imports con alias "@/" para poder probarlo fuera de Next (lib/hotmartPurchases.test.ts).

export type ProductKey = 'perro' | 'turismo' | 'pack' | 'kit' | 'kit_silla' | 'mexico'

// IDs de producto de Hotmart -> producto y grupo de MailerLite (los grupos ya existen)
export const GUIDE_PRODUCTS: Record<string, { key: ProductKey; group: string; groupId: string }> = {
  '8150917': { key: 'perro', group: 'Compradores · Perro', groupId: '200797004871239606' },
  '8020788': { key: 'turismo', group: 'Compradores · Turismo', groupId: '200797007864924011' },
  '8605596': { key: 'pack', group: 'Compradores · Pack', groupId: '200797008925033486' },
  '8335262': { key: 'kit', group: 'Compradores · Kit', groupId: '200797009951590302' },
  '8374052': { key: 'kit_silla', group: 'Compradores · Kit', groupId: '200797009951590302' },
  '8681979': { key: 'mexico', group: 'Compradores · México', groupId: '200797006221804568' },
}

export function guideProduct(productId: unknown) {
  return productId === undefined || productId === null ? undefined : GUIDE_PRODUCTS[String(productId)]
}

export interface GuidePurchase {
  event: string
  event_id: string | null
  transaction_id: string | null
  product_id: string | null
  product_key: ProductKey | 'unknown'
  buyer_email: string | null
  buyer_first_name: string | null
  price: number | null
  currency: string | null
  sck: string | null
  src: string | null
  marketing_ok: boolean
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Any = any

const clean = (v: unknown, max = 120): string | null => {
  if (v === undefined || v === null) return null
  const s = String(v).trim()
  return s ? s.slice(0, max) : null
}

/** Extrae solo los campos que usamos de un evento Hotmart (webhook v2). Lo demás se descarta. */
export function normalizeGuideEvent(body: Any): GuidePurchase {
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
    product_key: guideProduct(pid)?.key ?? 'unknown',
    buyer_email: email ? email.toLowerCase() : null,
    buyer_first_name: name ? name.split(/\s+/)[0] : null, // solo el nombre de pila
    price,
    currency: clean(d?.purchase?.price?.currency_value, 8),
    sck: clean(origin?.sck, 60),
    src: clean(origin?.src, 60),
    marketing_ok: false, // Hotmart no envía consentimiento de marketing
  }
}

/** Qué hacer en MailerLite según el cambio de estado que devolvió la base. */
export function mailerliteAction(newStatus: string, changed: boolean): 'add' | 'remove' | 'none' {
  if (!changed) return 'none'
  if (newStatus === 'active') return 'add'
  if (['refunded', 'chargeback', 'canceled'].includes(newStatus)) return 'remove'
  return 'none'
}

/** Para el log: nunca correo, nombre ni transacción completa. */
export function safeLog(p: GuidePurchase, extra: Record<string, unknown> = {}) {
  const tx = p.transaction_id ? p.transaction_id.slice(0, 4) + '…' + p.transaction_id.slice(-3) : '-'
  return JSON.stringify({ event: p.event, tx, product: p.product_key, ...extra })
}

// ─── MailerLite ──────────────────────────────────────────────────────────────
export type Fetch = (url: string, init?: Any) => Promise<{ ok: boolean; status: number; json: () => Promise<Any> }>
const ML = 'https://connect.mailerlite.com/api'
const mlHeaders = (key: string) => ({ Authorization: `Bearer ${key}`, 'Content-Type': 'application/json', Accept: 'application/json' })

/** Agrega (o actualiza) al comprador y lo pone en el grupo. No cambia sus otros grupos. */
export async function mlAddToGroup(fetchFn: Fetch, key: string, email: string, firstName: string | null, groupId: string) {
  const body: Any = { email, groups: [groupId] }
  if (firstName) body.fields = { name: firstName }
  const r = await fetchFn(`${ML}/subscribers`, { method: 'POST', headers: mlHeaders(key), body: JSON.stringify(body) })
  if (!r.ok) throw new Error(`ML upsert ${r.status}`)
}

/** Saca al comprador del grupo (la API pide el ID del suscriptor, no el correo). */
export async function mlRemoveFromGroup(fetchFn: Fetch, key: string, email: string, groupId: string) {
  const s = await fetchFn(`${ML}/subscribers/${encodeURIComponent(email)}`, { headers: mlHeaders(key) })
  if (s.status === 404) return // no estaba en MailerLite
  if (!s.ok) throw new Error(`ML get subscriber ${s.status}`)
  const id = (await s.json())?.data?.id
  if (!id) return
  const r = await fetchFn(`${ML}/subscribers/${id}/groups/${groupId}`, { method: 'DELETE', headers: mlHeaders(key) })
  if (!r.ok && r.status !== 404) throw new Error(`ML remove ${r.status}`)
}

// ─── Orquestación ────────────────────────────────────────────────────────────
type Rpc = (fn: string, args: Record<string, unknown>) => Promise<{ data: Any; error: Any }>

export interface GuideResult { stored: boolean; status?: string; changed?: boolean; duplicate?: boolean; action: string; sync: boolean; mlError?: string }

/**
 * Guarda el evento (idempotente, en la base) y, si BUYER_SYNC_ENABLED=true, sincroniza MailerLite.
 * Lanza error solo si no se pudo guardar (para que Hotmart reintente). Los errores de MailerLite
 * se anotan en la fila (ml_error) y no cortan nada.
 */
export async function handleGuidePurchase(
  p: GuidePurchase,
  deps: { rpc: Rpc; fetchFn: Fetch; env: Record<string, string | undefined> },
): Promise<GuideResult> {
  const { data, error } = await deps.rpc('hotmart_record_event', { p })
  if (error) throw new Error(`store_failed: ${error.message ?? error}`)
  const row = Array.isArray(data) ? data[0] : data
  const action = mailerliteAction(row?.new_status ?? '', !!row?.changed)
  const sync = deps.env.BUYER_SYNC_ENABLED === 'true'
  const key = deps.env.MAILERLITE_API_KEY
  const product = guideProduct(p.product_id)
  const out: GuideResult = { stored: true, status: row?.new_status, changed: row?.changed, duplicate: row?.duplicate, action, sync }

  if (action === 'none' || !sync || !key || !product || !p.buyer_email || !p.transaction_id) return out
  try {
    if (action === 'add') await mlAddToGroup(deps.fetchFn, key, p.buyer_email, p.buyer_first_name, product.groupId)
    else await mlRemoveFromGroup(deps.fetchFn, key, p.buyer_email, product.groupId)
    await deps.rpc('hotmart_mark_ml_sync', { p_tx: p.transaction_id, p_group: product.group, p_error: null })
  } catch (e) {
    out.mlError = String(e).slice(0, 200)
    await deps.rpc('hotmart_mark_ml_sync', { p_tx: p.transaction_id, p_group: product.group, p_error: out.mlError })
  }
  return out
}
