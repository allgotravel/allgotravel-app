// Webhook de Hotmart (v2) -> Supabase (hotmart_purchases) -> MailerLite (grupo "Compradores · <Producto>").
// Seguridad: solo acepta POST con el header X-HOTMART-HOTTOK igual al secreto HOTMART_HOTTOK.
// Sin HOTMART_HOTTOK configurado rechaza todo. La sincronización con MailerLite está apagada
// salvo que BUYER_SYNC_ENABLED sea exactamente "true". Nunca se registra el payload ni datos personales.
import {
  addToGroup, ensureGroup, mailerliteAction, normalize, PRODUCTS, removeFromGroup, safeLog, tokenMatches,
} from './lib.ts'

const json = (status: number, body: Record<string, unknown>) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } })

async function rpc(name: string, args: Record<string, unknown>) {
  const url = Deno.env.get('SUPABASE_URL')!
  const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  const r = await fetch(`${url}/rest/v1/rpc/${name}`, {
    method: 'POST',
    headers: { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(args),
  })
  if (!r.ok) throw new Error(`rpc ${name} ${r.status}`)
  return r.status === 204 ? null : await r.json()
}

Deno.serve(async (req: Request) => {
  if (req.method !== 'POST') return json(405, { error: 'method_not_allowed' })

  if (!tokenMatches(req.headers.get('x-hotmart-hottok'), Deno.env.get('HOTMART_HOTTOK'))) {
    return json(401, { error: 'unauthorized' })
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return json(400, { error: 'invalid_json' })
  }

  const n = normalize(body)
  if (!n.transaction_id) {
    console.log('[hotmart] sin transacción', safeLog(n))
    return json(200, { received: true, ignored: 'no_transaction' })
  }

  let result: { new_status: string; changed: boolean; duplicate: boolean } | null = null
  try {
    const rows = await rpc('hotmart_record_event', { p: n })
    result = Array.isArray(rows) ? rows[0] : rows
  } catch (e) {
    console.error('[hotmart] error guardando', safeLog(n, { err: String(e) }))
    return json(500, { error: 'store_failed' }) // Hotmart reintenta
  }

  const action = mailerliteAction(result?.new_status ?? '', !!result?.changed)
  const product = n.product_id ? PRODUCTS[n.product_id] : undefined
  const syncOn = Deno.env.get('BUYER_SYNC_ENABLED') === 'true'
  const mlKey = Deno.env.get('MAILERLITE_API_KEY')

  if (action !== 'none' && syncOn && mlKey && product && n.buyer_email) {
    try {
      const groupId = await ensureGroup(fetch, mlKey, product.group)
      if (action === 'add') await addToGroup(fetch, mlKey, n.buyer_email, n.buyer_first_name, groupId)
      else await removeFromGroup(fetch, mlKey, n.buyer_email, groupId)
      await rpc('hotmart_mark_ml_sync', { p_tx: n.transaction_id, p_group: product.group, p_error: null })
    } catch (e) {
      // La compra ya quedó guardada; el error queda anotado para reintentar a mano.
      await rpc('hotmart_mark_ml_sync', { p_tx: n.transaction_id, p_group: product.group, p_error: String(e).slice(0, 200) })
        .catch(() => {})
      console.error('[hotmart] error MailerLite', safeLog(n, { action }))
    }
  }

  console.log('[hotmart] ok', safeLog(n, { status: result?.new_status, changed: result?.changed, dup: result?.duplicate, action, sync: syncOn }))
  return json(200, { received: true })
})
