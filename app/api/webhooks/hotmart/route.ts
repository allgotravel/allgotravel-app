import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const HOTMART_HOTTOK = process.env.HOTMART_HOTTOK

// SUPABASE_SERVICE_ROLE_KEY must be added to Vercel environment variables — never expose to client
if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.warn('[hotmart] SUPABASE_SERVICE_ROLE_KEY not set — subscription updates will fail')
}

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  const hottok = req.headers.get('x-hotmart-hottok')
  if (HOTMART_HOTTOK && hottok !== HOTMART_HOTTOK) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: HotmartEvent
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { event, data } = body

  switch (event) {
    case 'PURCHASE_APPROVED':
    case 'PURCHASE_COMPLETE':
      // TODO(meta-pixel): This webhook fires server-to-server from Hotmart, with no
      // browser in the loop, so the client-side Meta Pixel (components/MetaPixel.tsx)
      // can't fire Subscribe/Purchase from here. To track this event, send it via the
      // Meta Conversions API (server-side) using data.buyer.email (hashed) — see
      // https://developers.facebook.com/docs/marketing-api/conversions-api — or fire
      // Subscribe/Purchase client-side from a checkout-return page if one is added later.
      await handlePurchase(data, 'active')
      break

    case 'PURCHASE_REFUNDED':
    case 'PURCHASE_CHARGEBACK':
    case 'PURCHASE_CANCELLED':
      await handleSubscriptionUpdate(data.buyer?.email, 'cancelled')
      break

    case 'SUBSCRIPTION_CANCELLATION':
      await handleSubscriptionUpdate(data.buyer?.email ?? data.subscriber?.email, 'cancelled')
      break

    default:
      console.log(`[hotmart] Unhandled event: ${event}`)
  }

  return NextResponse.json({ received: true })
}

async function handlePurchase(data: HotmartData, status: SubscriptionStatus) {
  const email = data.buyer?.email
  if (!email) return

  const planName = data.subscription?.plan?.name ?? data.product?.name ?? ''
  const plan = /anual|annual|yearly|year/i.test(planName) ? 'annual' : 'monthly'

  const userId = await getUserIdByEmail(email)
  if (!userId) {
    console.warn(`[hotmart] No profile found for email: ${email}`)
    return
  }

  await supabaseAdmin
    .from('profiles')
    .update({
      subscription_status: status,
      subscription_provider: 'hotmart',
      subscription_plan: plan,
      hotmart_purchase_id: data.purchase?.transaction ?? null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId)
}

async function handleSubscriptionUpdate(email: string | undefined, status: SubscriptionStatus) {
  if (!email) return

  const userId = await getUserIdByEmail(email)
  if (!userId) {
    console.warn(`[hotmart] No profile found for email: ${email}`)
    return
  }

  await supabaseAdmin
    .from('profiles')
    .update({ subscription_status: status, updated_at: new Date().toISOString() })
    .eq('id', userId)
}

async function getUserIdByEmail(email: string): Promise<string | null> {
  const { data, error } = await supabaseAdmin.auth.admin.listUsers()
  if (error || !data) return null
  const user = data.users.find(u => u.email === email)
  return user?.id ?? null
}

// ─── Types ─────────────────────────────────────────────────────────────────

type SubscriptionStatus = 'active' | 'cancelled' | 'free' | 'expired'

interface HotmartEvent {
  event: string
  version?: string
  data: HotmartData
}

interface HotmartData {
  buyer?: { email: string; name: string }
  subscriber?: { email: string }
  purchase?: { transaction: string; status?: string }
  product?: { id?: number; name?: string }
  subscription?: { plan?: { name?: string } }
}
