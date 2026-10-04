import { Link } from '@/i18n/navigation'
import PrepUpsell, { type PrepTema } from '@/components/PrepUpsell'

export const dynamic = 'force-dynamic'

// Página a la que llevan las funciones bloqueadas. Ya no manda al Club (pausado):
// ofrece las guías y el Pack. ?tema=perro|movilidad decide qué guía va primero.
export default async function PaywallPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ tema?: string }>
}) {
  const { locale } = await params
  const { tema } = await searchParams
  const en = locale === 'en'
  const t: PrepTema = tema === 'movilidad' ? 'movilidad' : 'perro'

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 py-10 px-4">
      <div className="max-w-md mx-auto space-y-4">
        <Link href="/dashboard" className="inline-block text-sm text-blue-700 hover:underline">
          ← {en ? 'Back to dashboard' : 'Volver al panel'}
        </Link>
        <PrepUpsell en={en} tema={t} />
        <p className="text-xs text-gray-500 text-center">
          {en
            ? 'AllGo Travel App · one-time payment on Hotmart · 7-day guarantee'
            : 'AllGo Travel App · pago único en Hotmart · garantía de 7 días'}
        </p>
      </div>
    </main>
  )
}
