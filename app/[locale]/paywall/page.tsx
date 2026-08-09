import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

// El paywall antiguo quedó obsoleto (precios viejos). La oferta oficial vive en /membresia.
export default async function PaywallPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  redirect(`/${locale}/membresia`)
}
