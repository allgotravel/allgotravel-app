import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// SUPABASE_SERVICE_ROLE_KEY must be added to Vercel environment variables — never expose to client
if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.warn('[gumroad] SUPABASE_SERVICE_ROLE_KEY not set — subscription updates will fail')
}

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Gumroad sends POST with application/x-www-form-urlencoded, not JSON
export async function POST(req: NextRequest) {
  let form: FormData
  try {
    form = await req.formData()
  } catch {
    return NextResponse.json({ error: 'Invalid form data' }, { status: 400 })
  }

  const email = form.get('email') as string | null
  const saleId = form.get('sale_id') as string | null
  const recurrence = form.get('recurrence') as string | null
  const refunded = form.get('refunded') as string | null
  const subscriptionCancelled = form.get('subscription_cancelled_at') as string | null

  if (!email) {
    return NextResponse.json({ error: 'Missing email' }, { status: 400 })
  }

  const isCancelled = refunded === 'true' || subscriptionCancelled != null

  if (isCancelled) {
    await handleSubscriptionUpdate(email, 'cancelled')
  } else {
    const plan = /year|annual|anual/i.test(recurrence ?? '') ? 'annual' : 'monthly'
    await handlePurchase(email, saleId, plan, 'active')
  }

  return NextResponse.json({ received: true })
}

async function handlePurchase(
  email: string,
  saleId: string | null,
  plan: string,
  status: SubscriptionStatus
) {
  const userId = await getUserIdByEmail(email)
  if (!userId) {
    console.warn(`[gumroad] No profile found for email: ${email}`)
    return
  }

  await supabaseAdmin
    .from('profiles')
    .update({
      subscription_status: status,
      subscription_provider: 'gumroad',
      subscription_plan: plan,
      gumroad_sale_id: saleId ?? null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId)
}

async function handleSubscriptionUpdate(email: string, status: SubscriptionStatus) {
  const userId = await getUserIdByEmail(email)
  if (!userId) {
    console.warn(`[gumroad] No profile found for email: ${email}`)
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
