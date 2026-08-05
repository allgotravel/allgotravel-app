import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

// Miembro = suscripción activa. En desarrollo se trata como miembro para no bloquear el trabajo local.
export function isDevBypass() {
  return process.env.NODE_ENV === 'development'
}

// Devuelve true si el usuario actual es miembro (suscripción activa).
export async function isMember(): Promise<boolean> {
  if (isDevBypass()) return true
  const { isSubscribed } = await checkSubscription()
  return isSubscribed
}

// Guard para páginas premium: si no hay sesión → login; si no es miembro → página de membresía.
export async function requireMember(locale: string) {
  if (isDevBypass()) return
  const { user, isSubscribed } = await checkSubscription()
  if (!user) redirect(`/${locale}/login`)
  if (!isSubscribed) redirect(`/${locale}/membresia`)
}

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
