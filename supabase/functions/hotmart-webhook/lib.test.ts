// Pruebas de la lógica del webhook (datos falsos). Correr desde la raíz del repo:
//   npx jiti supabase/functions/hotmart-webhook/lib.test.ts
import assert from 'node:assert/strict'
import { addToGroup, ensureGroup, mailerliteAction, normalize, removeFromGroup, safeLog, tokenMatches } from './lib.ts'

let passed = 0
const test = async (name: string, fn: () => void | Promise<void>) => {
  await fn(); passed++; console.log('  ✓', name)
}

// Evento de ejemplo con la forma del webhook v2 de Hotmart (todo inventado)
const approved = {
  id: 'evt-0001', event: 'PURCHASE_APPROVED', version: '2.0.0',
  data: {
    product: { id: 8681979, name: 'Patitas Viajeras Sin Fronteras' },
    buyer: { email: '  Prueba.Compradora@Example.INVALID ', name: 'Ana María Prueba', first_name: 'Ana', checkout_phone: '+10000000000',
             address: { city: 'Ciudad Falsa' }, document: '000' },
    purchase: { transaction: 'HP0000000001', status: 'APPROVED', price: { value: 17, currency_value: 'USD' },
                origin: { sck: 'ig-mc-mexico', src: 'reel1', xcod: 'x' } },
  },
}

await (async () => {
  console.log('hotmart-webhook · lib')

  await test('hottok: igual pasa, distinto/vacío/sin secreto no', () => {
    assert.equal(tokenMatches('abc123', 'abc123'), true)
    assert.equal(tokenMatches('abc124', 'abc123'), false)
    assert.equal(tokenMatches('abc12', 'abc123'), false)
    assert.equal(tokenMatches(null, 'abc123'), false)
    assert.equal(tokenMatches('abc123', undefined), false)
    assert.equal(tokenMatches('', ''), false)
  })

  await test('normaliza un evento aprobado (solo los campos que usamos)', () => {
    const n = normalize(approved)
    assert.equal(n.event, 'PURCHASE_APPROVED')
    assert.equal(n.event_id, 'evt-0001')
    assert.equal(n.transaction_id, 'HP0000000001')
    assert.equal(n.product_key, 'mexico')
    assert.equal(n.buyer_email, 'prueba.compradora@example.invalid')
    assert.equal(n.buyer_first_name, 'Ana')
    assert.equal(n.price, 17)
    assert.equal(n.currency, 'USD')
    assert.equal(n.sck, 'ig-mc-mexico')
    assert.equal(n.src, 'reel1')
    assert.equal(n.marketing_ok, false)
    const keys = Object.keys(n)
    for (const k of ['checkout_phone', 'address', 'document']) assert.ok(!keys.includes(k), `no guarda ${k}`)
  })

  await test('mapea los 6 productos; ID desconocido -> unknown', () => {
    const k = (id: number) => normalize({ data: { product: { id } } }).product_key
    assert.deepEqual([8150917, 8020788, 8605596, 8335262, 8374052, 8681979].map(k), ['perro', 'turismo', 'pack', 'kit', 'kit_silla', 'mexico'])
    assert.equal(k(1234), 'unknown')
  })

  await test('acciones de MailerLite: alta en aprobada, baja en reembolso, nada si no cambió', () => {
    assert.equal(mailerliteAction('active', true), 'add')
    assert.equal(mailerliteAction('active', false), 'none') // duplicado
    assert.equal(mailerliteAction('refunded', true), 'remove')
    assert.equal(mailerliteAction('chargeback', true), 'remove')
    assert.equal(mailerliteAction('canceled', true), 'remove')
    assert.equal(mailerliteAction('pending', true), 'none')
  })

  await test('el log no lleva correo, nombre ni transacción completa', () => {
    const line = safeLog(normalize(approved), { status: 'active' })
    assert.ok(!line.includes('example.invalid') && !line.includes('Ana') && !line.includes('HP0000000001'))
  })

  // MailerLite simulado
  const calls: string[] = []
  const groups: { id: string; name: string }[] = [{ id: '11', name: 'Compradores · Perro' }]
  const fakeFetch = async (url: string, init: { method?: string; body?: string } = {}) => {
    const m = init.method ?? 'GET'
    calls.push(`${m} ${url.replace('https://connect.mailerlite.com/api', '')}`)
    const res = (status: number, data: unknown) => ({ ok: status < 300, status, json: async () => data })
    if (m === 'GET' && url.includes('/groups?')) return res(200, { data: groups })
    if (m === 'POST' && url.endsWith('/groups')) { const g = { id: '22', name: JSON.parse(init.body!).name }; groups.push(g); return res(201, { data: g }) }
    if (m === 'POST' && url.endsWith('/subscribers')) return res(200, { data: { id: '900' } })
    if (m === 'GET' && url.includes('/subscribers/')) return url.includes('nadie') ? res(404, {}) : res(200, { data: { id: '900' } })
    if (m === 'DELETE') return res(204, null)
    return res(500, {})
  }

  await test('MailerLite: usa el grupo si existe y lo crea si falta', async () => {
    assert.equal(await ensureGroup(fakeFetch, 'k', 'Compradores · Perro'), '11')
    assert.equal(await ensureGroup(fakeFetch, 'k', 'Compradores · México'), '22')
    assert.ok(calls.some(c => c === 'POST /groups'))
  })

  await test('MailerLite: alta con grupo y nombre; baja del grupo; baja sin suscriptor no falla', async () => {
    calls.length = 0
    await addToGroup(fakeFetch, 'k', 'a@example.invalid', 'Ana', '22')
    await removeFromGroup(fakeFetch, 'k', 'a@example.invalid', '22')
    await removeFromGroup(fakeFetch, 'k', 'nadie@example.invalid', '22')
    assert.deepEqual(calls, ['POST /subscribers', 'GET /subscribers/a%40example.invalid', 'DELETE /subscribers/900/groups/22', 'GET /subscribers/nadie%40example.invalid'])
  })

  console.log(`\n${passed} pruebas OK`)
})()
