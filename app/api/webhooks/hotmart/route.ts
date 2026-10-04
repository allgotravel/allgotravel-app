import { NextRequest, NextResponse } from 'next/server'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const HOTMART_HOTTOK = process.env.HOTMART_HOTTOK

// SUPABASE_SERVICE_ROLE_KEY must be added to Vercel environment variables — never expose to client
if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.warn('[hotmart] SUPABASE_SERVICE_ROLE_KEY not set — subscription updates will fail')
}

// Cliente con la clave de servicio, creado solo al usarse (no al cargar el módulo),
// para que la revisión de sesión/token ocurra antes y el build no dependa de la clave.
let _supabaseAdmin: SupabaseClient | null = null
function getAdmin() {
  if (!_supabaseAdmin) {
    _supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
  }
  return _supabaseAdmin
}

// Offer codes from the Hotmart product (Q107023060D)
const OFFER_PLAN: Record<string, PlanType> = {
  osgbatei: 'founding', // Club fundador $14.99/mo (oferta activa)
  ghy5gvr9: 'founding', // Founding $19/mo (oferta vieja/eliminada)
  zk0d9b2e: 'monthly', // Mensual $29/mo
  '2nx7unav': 'annual', // Anual $290/yr
}

// Optional: numeric Hotmart product IDs of the membership product, comma-separated
// (Vercel env HOTMART_MEMBERSHIP_PRODUCT_IDS). Guides (Perro, Turismo, Pack) must never
// grant or remove membership, so anything that is not the membership is ignored.
const MEMBERSHIP_PRODUCT_IDS = (process.env.HOTMART_MEMBERSHIP_PRODUCT_IDS ?? '')
  .split(',')
  .map(x => x.trim())
  .filter(Boolean)

function offerCode(data: HotmartData): string | undefined {
  return data.purchase?.offer?.code ?? data.subscription?.plan?.offer?.code
}

function isMembershipPurchase(data: HotmartData): boolean {
  const code = offerCode(data)
  if (code && OFFER_PLAN[code]) return true
  const pid = data.product?.id
  return pid !== undefined && MEMBERSHIP_PRODUCT_IDS.includes(String(pid))
}

export async function POST(req: NextRequest) {
  // Hotmart sends the token either as a header or in the body ("hottok")
  const headerTok = req.headers.get('x-hotmart-hottok')

  let body: HotmartEvent
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  // Sin HOTMART_HOTTOK configurado no se acepta nada; con él, el token debe coincidir.
  const tok = headerTok ?? body.hottok
  if (!HOTMART_HOTTOK || !tok || tok !== HOTMART_HOTTOK) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { event, data } = body

  // Solo el producto de membresía toca el acceso. Compras de guías se registran y se ignoran.
  if (!data || !isMembershipPurchase(data)) {
    console.log(`[hotmart] Ignored ${event}: not the membership product (offer=${data ? offerCode(data) ?? '-' : '-'}, product=${data?.product?.id ?? '-'})`)
    return NextResponse.json({ received: true, ignored: true })
  }

  switch (event) {
    case 'PURCHASE_APPROVED':
    case 'PURCHASE_COMPLETE':
      await handlePurchase(data, 'active')
      break

    case 'PURCHASE_REFUNDED':
    case 'PURCHASE_CHARGEBACK':
    case 'PURCHASE_CANCELED':
    case 'PURCHASE_CANCELLED':
      await handleStatusChange(buyerEmail(data), 'cancelled')
      break

    case 'SUBSCRIPTION_CANCELLATION':
      await handleStatusChange(buyerEmail(data), 'cancelled')
      break

    default:
      console.log(`[hotmart] Unhandled event: ${event}`)
  }

  // Always 200 so Hotmart doesn't retry indefinitely on handled events
  return NextResponse.json({ received: true })
}

// ─── Handlers ──────────────────────────────────────────────────────────────

async function handlePurchase(data: HotmartData, status: SubscriptionStatus) {
  const email = buyerEmail(data)
  if (!email) {
    console.warn('[hotmart] Purchase event without buyer email')
    return
  }

  const plan = detectPlan(data)
  const purchaseId =
    data.purchase?.transaction ?? data.subscription?.subscriber?.code ?? null

  const userId = await getUserIdByEmail(email)

  if (!userId) {
    // Buyer paid before creating an app account. Store the entitlement so it is
    // granted automatically the moment they sign up with this email.
    await getAdmin()
      .from('pending_entitlements')
      .upsert(
        {
          email,
          subscription_status: status,
          subscription_plan: plan,
          subscription_provider: 'hotmart',
          purchase_id: purchaseId,
          claimed_at: null,
          claimed_user_id: null,
        },
        { onConflict: 'email' }
      )
    console.log(`[hotmart] Stored pending entitlement (${plan}) for ${email}`)
    return
  }

  await getAdmin()
    .from('profiles')
    .update({
      subscription_status: status,
      subscription_provider: 'hotmart',
      subscription_plan: plan,
      hotmart_purchase_id: purchaseId,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId)

  await upsertMembership(userId, plan, 'active', purchaseId)
  console.log(`[hotmart] Activated ${plan} for ${email}`)
}

async function handleStatusChange(email: string | undefined, status: SubscriptionStatus) {
  if (!email) return

  const userId = await getUserIdByEmail(email)

  if (!userId) {
    // Not signed up yet — reflect the change on the pending entitlement so a
    // refunded/cancelled buyer never gets access on later signup.
    await getAdmin()
      .from('pending_entitlements')
      .update({ subscription_status: status })
      .eq('email', email)
      .is('claimed_at', null)
    return
  }

  await getAdmin()
    .from('profiles')
    .update({ subscription_status: status, updated_at: new Date().toISOString() })
    .eq('id', userId)

  await getAdmin()
    .from('memberships')
    .update({ status: status, updated_at: new Date().toISOString() })
    .eq('user_id', userId)
}

// ─── Helpers ───────────────────────────────────────────────────────────────

function buyerEmail(data: HotmartData): string | undefined {
  const raw =
    data.buyer?.email ??
    data.subscriber?.email ??
    data.subscription?.subscriber?.email
  return raw ? raw.trim().toLowerCase() : undefined
}

function detectPlan(data: HotmartData): PlanType {
  const code = offerCode(data)
  if (code && OFFER_PLAN[code]) return OFFER_PLAN[code]

  const name = `${data.subscription?.plan?.name ?? ''} ${data.product?.name ?? ''}`
  if (/found/i.test(name)) return 'founding'
  if (/anual|annual|yearly|year/i.test(name)) return 'annual'
  return 'monthly'
}

// Look up the user by email via the profiles table (email is stored there on
// signup). More reliable than paginating auth.admin.listUsers().
async function getUserIdByEmail(email: string): Promise<string | null> {
  const { data } = await getAdmin()
    .from('profiles')
    .select('id')
    .eq('email', email)
    .maybeSingle()
  return data?.id ?? null
}

async function upsertMembership(
  userId: string,
  plan: PlanType,
  status: string,
  purchaseId: string | null
) {
  const { data: existing } = await getAdmin()
    .from('memberships')
    .select('id')
    .eq('user_id', userId)
    .maybeSingle()

  if (existing) {
    await getAdmin()
      .from('memberships')
      .update({
        plan_type: plan,
        status,
        hotmart_subscription_id: purchaseId,
        updated_at: new Date().toISOString(),
      })
      .eq('id', existing.id)
  } else {
    await getAdmin().from('memberships').insert({
      user_id: userId,
      plan_type: plan,
      status,
      hotmart_subscription_id: purchaseId,
    })
  }
}

// ─── Types ─────────────────────────────────────────────────────────────────

type SubscriptionStatus = 'active' | 'cancelled' | 'free' | 'expired'
type PlanType = 'founding' | 'monthly' | 'annual'

interface HotmartEvent {
  event: string
  version?: string
  hottok?: string
  data: HotmartData
}

interface HotmartOffer {
  code?: string
}

interface HotmartData {
  buyer?: { email?: string; name?: string }
  subscriber?: { email?: string }
  purchase?: { transaction?: string; status?: string; offer?: HotmartOffer }
  product?: { id?: number; name?: string }
  subscription?: {
    subscriber?: { code?: string; email?: string }
    plan?: { name?: string; offer?: HotmartOffer }
  }
}
