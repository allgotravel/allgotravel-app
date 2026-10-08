// Pruebas de las compras de guías de Hotmart (datos falsos; MailerLite y la base simulados).
// Correr desde la raíz del repo:  npx jiti lib/hotmartPurchases.test.ts
import assert from 'node:assert/strict'
import {
  guideProduct, handleGuidePurchase, mailerliteAction, mlAddToGroup, mlRemoveFromGroup, normalizeGuideEvent, safeLog,
} from './hotmartPurchases'

async function main() {
  let passed = 0
  const test = async (name: string, fn: () => void | Promise<void>) => { await fn(); passed++; console.log('  ✓', name) }
  console.log('hotmartPurchases')

  // Evento con la forma del webhook v2 de Hotmart (todo inventado)
  const approved = {
    id: 'evt-0001', event: 'PURCHASE_APPROVED', version: '2.0.0',
    data: {
      product: { id: 8681979, name: 'Patitas Viajeras Sin Fronteras' },
      buyer: { email: '  Prueba.Compradora@Example.INVALID ', name: 'Ana María Prueba', checkout_phone: '+10000000000', document: '000' },
      purchase: { transaction: 'HP0000000001', price: { value: 17, currency_value: 'USD' }, origin: { sck: 'ig-mc-mexico', src: 'reel1' } },
    },
  }

  await test('normaliza solo los campos que usamos (sin teléfono ni documento)', () => {
    const n = normalizeGuideEvent(approved)
    assert.deepEqual(
      [n.event, n.event_id, n.transaction_id, n.product_key, n.buyer_email, n.buyer_first_name, n.price, n.currency, n.sck, n.src, n.marketing_ok],
      ['PURCHASE_APPROVED', 'evt-0001', 'HP0000000001', 'mexico', 'prueba.compradora@example.invalid', 'Ana', 17, 'USD', 'ig-mc-mexico', 'reel1', false])
    for (const k of ['checkout_phone', 'document']) assert.ok(!(k in n))
  })

  await test('los 6 productos de guías; el Club y otros IDs no son guías', () => {
    assert.deepEqual([8150917, 8020788, 8605596, 8335262, 8374052, 8681979].map(id => guideProduct(id)?.group),
      ['Compradores · Perro', 'Compradores · Turismo', 'Compradores · Pack', 'Compradores · Kit', 'Compradores · Kit', 'Compradores · México'])
    assert.equal(guideProduct(1234), undefined)
    assert.equal(guideProduct(undefined), undefined)
  })

  await test('acciones de MailerLite según el cambio de estado', () => {
    assert.deepEqual([['active', true], ['active', false], ['refunded', true], ['chargeback', true], ['canceled', true], ['pending', true]]
      .map(([s, c]) => mailerliteAction(s as string, c as boolean)), ['add', 'none', 'remove', 'remove', 'remove', 'none'])
  })

  await test('el log no lleva correo, nombre ni transacción completa', () => {
    const line = safeLog(normalizeGuideEvent(approved), { status: 'active' })
    assert.ok(!line.includes('example.invalid') && !line.includes('Ana') && !line.includes('HP0000000001'))
  })

  // MailerLite simulado
  const calls: string[] = []
  const fakeFetch = async (url: string, init: { method?: string } = {}) => {
    const m = init.method ?? 'GET'
    calls.push(`${m} ${url.replace('https://connect.mailerlite.com/api', '')}`)
    const res = (status: number, data: unknown) => ({ ok: status < 300, status, json: async () => data })
    if (m === 'POST' && url.endsWith('/subscribers')) return res(200, { data: { id: '900' } })
    if (m === 'GET') return url.includes('nadie') ? res(404, {}) : res(200, { data: { id: '900' } })
    if (m === 'DELETE') return res(204, null)
    return res(500, {})
  }

  await test('MailerLite: alta con grupo y nombre; baja usa el ID del suscriptor; baja sin suscriptor no falla', async () => {
    await mlAddToGroup(fakeFetch, 'k', 'a@example.invalid', 'Ana', '22')
    await mlRemoveFromGroup(fakeFetch, 'k', 'a@example.invalid', '22')
    await mlRemoveFromGroup(fakeFetch, 'k', 'nadie@example.invalid', '22')
    assert.deepEqual(calls, ['POST /subscribers', 'GET /subscribers/a%40example.invalid', 'DELETE /subscribers/900/groups/22', 'GET /subscribers/nadie%40example.invalid'])
  })

  // Base simulada con la misma regla que hotmart_record_event (probada aparte en Supabase)
  const fakeDb = () => {
    const rows = new Map<string, { status: string; eid: string | null }>()
    const marks: unknown[] = []
    const rpc = async (fn: string, args: Record<string, unknown>) => {
      if (fn === 'hotmart_mark_ml_sync') { marks.push(args); return { data: null, error: null } }
      const p = args.p as { transaction_id: string; event: string; event_id: string | null }
      const next = ({ PURCHASE_APPROVED: 'active', PURCHASE_COMPLETE: 'active', PURCHASE_REFUNDED: 'refunded' } as Record<string, string>)[p.event]
      const prev = rows.get(p.transaction_id)
      if (prev && p.event_id && prev.eid === p.event_id) return { data: [{ new_status: prev.status, changed: false, duplicate: true }], error: null }
      const status = next ?? prev?.status ?? 'pending'
      rows.set(p.transaction_id, { status, eid: p.event_id })
      return { data: [{ new_status: status, changed: prev?.status !== status && !!next, duplicate: false }], error: null }
    }
    return { rpc, rows, marks }
  }
  const refund = { ...approved, id: 'evt-0002', event: 'PURCHASE_REFUNDED' }

  await test('flag apagado (por defecto): guarda la compra y NO llama a MailerLite', async () => {
    const db = fakeDb(); calls.length = 0
    const r = await handleGuidePurchase(normalizeGuideEvent(approved), { rpc: db.rpc, fetchFn: fakeFetch, env: { MAILERLITE_API_KEY: 'k' } })
    assert.equal(r.status, 'active'); assert.equal(r.action, 'add'); assert.equal(r.sync, false)
    assert.equal(calls.length, 0); assert.equal(db.marks.length, 0)
  })

  await test('flag encendido: aprobada -> alta; duplicada -> nada; reembolso -> baja', async () => {
    const db = fakeDb(); calls.length = 0
    const env = { BUYER_SYNC_ENABLED: 'true', MAILERLITE_API_KEY: 'k' }
    const a = await handleGuidePurchase(normalizeGuideEvent(approved), { rpc: db.rpc, fetchFn: fakeFetch, env })
    const d = await handleGuidePurchase(normalizeGuideEvent(approved), { rpc: db.rpc, fetchFn: fakeFetch, env })
    const f = await handleGuidePurchase(normalizeGuideEvent(refund), { rpc: db.rpc, fetchFn: fakeFetch, env })
    assert.deepEqual([a.action, d.action, d.duplicate, f.status, f.action], ['add', 'none', true, 'refunded', 'remove'])
    assert.deepEqual(calls, ['POST /subscribers', 'GET /subscribers/prueba.compradora%40example.invalid', 'DELETE /subscribers/900/groups/200797006221804568'])
    assert.equal(db.marks.length, 2)
  })

  await test('error de MailerLite: la compra queda guardada y el error anotado (no lanza)', async () => {
    const db = fakeDb()
    const broken = async () => ({ ok: false, status: 503, json: async () => ({}) })
    const r = await handleGuidePurchase(normalizeGuideEvent(approved), { rpc: db.rpc, fetchFn: broken, env: { BUYER_SYNC_ENABLED: 'true', MAILERLITE_API_KEY: 'k' } })
    assert.equal(r.stored, true); assert.match(r.mlError ?? '', /503/)
    assert.equal((db.marks[0] as { p_error: string }).p_error.includes('503'), true)
  })

  await test('si la base falla, lanza error (la ruta responde 500 y Hotmart reintenta)', async () => {
    const rpc = async () => ({ data: null, error: { message: 'down' } })
    await assert.rejects(handleGuidePurchase(normalizeGuideEvent(approved), { rpc, fetchFn: fakeFetch, env: {} }), /store_failed/)
  })

  console.log(`\n${passed} pruebas OK`)
}

main().catch(e => { console.error(e); process.exit(1) })
