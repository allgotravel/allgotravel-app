import { redirect } from 'next/navigation'
import { getLocale } from 'next-intl/server'
import { createSupabaseServer } from '@/lib/supabase-server'
import { Link } from '@/i18n/navigation'
import DocumentsVault from '@/components/DocumentsVault'
import { TravelDocument } from '@/lib/expiry'

export const dynamic = 'force-dynamic'

export default async function DocumentosPage() {
  const locale = await getLocale()
  const en = locale === 'en'

  const supabase = await createSupabaseServer()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data } = await supabase
    .from('documents')
    .select('*')
    .eq('user_id', user.id)

  const docs = (data ?? []) as TravelDocument[]

  return (
    <main className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-100 py-10 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <Link href="/dashboard" className="text-teal-700 hover:underline text-sm font-medium">
            ← {en ? 'Dashboard' : 'Panel'}
          </Link>
        </div>

        <div className="mb-6">
          <h1 className="text-3xl font-bold text-teal-700">
            📁 {en ? 'Travel Vault' : 'Bóveda de Viaje'}
          </h1>
          <p className="text-gray-600 mt-2 text-lg">
            {en
              ? 'Keep your documents and their expiry dates here. Alli will remind you 90, 60 and 30 days before each one expires — for you and your service dog.'
              : 'Guarda aquí tus documentos y sus fechas de vencimiento. Alli te avisará 90, 60 y 30 días antes de que cada uno venza — tuyos y de tu perro de servicio.'}
          </p>
        </div>

        <DocumentsVault initialDocs={docs} userId={user.id} en={en} />
      </div>
    </main>
  )
}
