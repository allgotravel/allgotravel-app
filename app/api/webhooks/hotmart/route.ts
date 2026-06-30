import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// Hotmart sends this header to verify the webhook is authentic
const HOTMART_HOTTOK = process.env.HOTMART_HOTTOK!

export async function POST(req: NextRequest) {
  // 1. Verify the token
  const hottok = req.headers.get('x-hotmart-hottok')
  if (hottok !== HOTMART_HOTTOK) {
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
      await handlePurchase(data, 'active')
      break

    case 'PURCHASE_REFUNDED':
    case 'PURCHASE_CHARGEBACK':
    case 'PURCHASE_CANCELLED':
      await handlePurchase(data, 'cancelled')
      break

    case 'SUBSCRIPTION_CANCELLATION':
      await handleSubscriptionCancellation(data)
      break

    default:
      // Event not handled — still return 200 so Hotmart doesn't retry
      console.log(`Unhandled Hotmart event: ${event}`)
  }

  return NextResponse.json({ received: true })
}

async function handlePurchase(data: HotmartData, status: MemberStatus) {
  const email = data.buyer?.email
  if (!email) return

  await supabaseAdmin.from('members').upsert(
    {
      email,
      name: data.buyer?.name ?? '',
      hotmart_purchase_id: data.purchase?.transaction,
      hotmart_product_id: String(data.product?.id ?? ''),
      status,
      plan: data.product?.name ?? 'ebook',
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'email' }
  )
}

async function handleSubscriptionCancellation(data: HotmartData) {
  const email = data.subscriber?.email
  if (!email) return

  await supabaseAdmin
    .from('members')
    .update({ status: 'cancelled', updated_at: new Date().toISOString() })
    .eq('email', email)
}

// ─── Types ──────────────────────────────────────────────────

type MemberStatus = 'active' | 'cancelled' | 'pending'

interface HotmartEvent {
  event: string
  version: string
  data: HotmartData
}

interface HotmartData {
  buyer?: { email: string; name: string }
  subscriber?: { email: string }
  purchase?: { transaction: string }
  product?: { id: number; name: string }
}
