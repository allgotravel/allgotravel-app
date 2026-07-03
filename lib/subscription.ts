import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function checkSubscription() {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll() } }
  )

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { user: null, isSubscribed: false }

  const { data: profile } = await supabase
    .from('profiles')
    .select('subscription_status')
    .eq('id', user.id)
    .single()

  // If column doesn't exist yet, allow access
  const isSubscribed = !profile || profile.subscription_status === undefined
    ? true
    : profile.subscription_status === 'active'

  return { user, isSubscribed }
}
