import { redirect } from 'next/navigation'
import Image from 'next/image'
import { createSupabaseServer } from '@/lib/supabase-server'
import { Link } from '@/i18n/navigation'
import { Profile, DISABILITY_ICONS, DISABILITY_LABELS } from '@/types/profile'
import PrintButton from '@/components/PrintButton'
import MedicalQRCode from '@/components/MedicalQRCode'

export const dynamic = 'force-dynamic'

export default async function TarjetaMedicaPage() {
  const supabase = await createSupabaseServer()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  const safeProfile: Profile = {
    id: user.id,
    email: user.email ?? '',
    full_name: profile?.full_name ?? '',
    avatar_url: profile?.avatar_url ?? null,
    disability_types: profile?.disability_types ?? [],
    chronic_conditions: profile?.chronic_conditions ?? null,
    invisible_needs: profile?.invisible_needs ?? null,
    medications: profile?.medications ?? [],
    timezone: profile?.timezone ?? 'America/Mexico_City',
    is_group_profile: profile?.is_group_profile ?? false,
    group_members: profile?.group_members ?? [],
    preferred_language: profile?.preferred_language ?? 'es',
    created_at: profile?.created_at ?? new Date().toISOString(),
    updated_at: profile?.updated_at ?? new Date().toISOString(),
  }

  return (
    <main className="min-h-screen bg-gray-100 py-10 px-4">
      <style>{`
        @media print {
          body { background: white; }
          .no-print { display: none !important; }
          .card-container { box-shadow: none !important; margin: 0 !important; max-width: 100% !important; }
        }
      `}</style>

      {/* Back link + print button */}
      <div className="no-print max-w-3xl mx-auto flex items-center justify-between mb-6">
        <Link href="/dashboard" className="text-[#1B6FB5] hover:underline text-sm font-medium">
          ← Dashboard
        </Link>
        <PrintButton label="Imprimir / Save as PDF" />
      </div>

      {/* Medical card */}
      <div className="card-container max-w-3xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Card header */}
        <div className="bg-[#1B6FB5] text-white px-8 py-5 flex items-center gap-4">
          <div className="relative w-12 h-12 flex-shrink-0">
            <Image
              src="/logo-allgo.jpg"
              alt="AllGo Travel"
              fill
              className="object-contain rounded-lg"
            />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest opacity-80">AllGo Travel</p>
            <h1 className="text-xl font-bold leading-tight">Tarjeta Médica de Viaje</h1>
            <p className="text-xs opacity-70">Travel Medical Card</p>
          </div>
          <div className="ml-auto text-right">
            <span className="text-3xl">🏥</span>
          </div>
        </div>

        <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Left / main info */}
          <div className="md:col-span-2 space-y-6">
            {/* Name */}
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Nombre / Name</p>
              <p className="text-2xl font-bold text-gray-800">
                {safeProfile.full_name || '—'}
              </p>
            </div>

            {/* Disability types */}
            {safeProfile.disability_types.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                  Necesidades de accesibilidad / Accessibility needs
                </p>
                <div className="flex flex-wrap gap-2">
                  {safeProfile.disability_types.map(type => (
                    <span
                      key={type}
                      className="inline-flex items-center gap-1.5 bg-blue-50 border border-blue-200 text-[#1B6FB5] rounded-full px-3 py-1 text-sm font-medium"
                    >
                      {DISABILITY_ICONS[type]} {DISABILITY_LABELS[type]}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Chronic conditions */}
            {safeProfile.chronic_conditions && (
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">
                  Condiciones crónicas / Chronic conditions
                </p>
                <p className="text-gray-700 text-sm leading-relaxed">{safeProfile.chronic_conditions}</p>
              </div>
            )}

            {/* Invisible needs */}
            {safeProfile.invisible_needs && (
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">
                  Necesidades invisibles / Invisible needs
                </p>
                <p className="text-gray-700 text-sm leading-relaxed">{safeProfile.invisible_needs}</p>
              </div>
            )}

            {/* Medications */}
            {safeProfile.medications.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                  Medicamentos / Medications
                </p>
                <div className="space-y-1">
                  {safeProfile.medications.map((med, i) => (
                    <div key={i} className="flex items-baseline gap-2 text-sm text-gray-700">
                      <span className="text-[#F97316] font-bold">•</span>
                      <span>
                        <span className="font-semibold">{med.name}</span>
                        {med.dose && <span className="text-gray-500"> — {med.dose}</span>}
                        {med.times?.length > 0 && (
                          <span className="text-gray-400"> ({med.times.join(', ')})</span>
                        )}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Emergency message */}
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <p className="text-xs font-bold text-red-600 uppercase tracking-wide mb-2">⚠️ Emergencia / Emergency</p>
              <p className="text-sm text-gray-800 leading-relaxed">
                Esta persona viaja con necesidades especiales de accesibilidad. Por favor contacte a su acompañante.
              </p>
              <p className="text-sm text-gray-600 leading-relaxed mt-1 italic">
                This person travels with special accessibility needs. Please contact their companion.
              </p>
            </div>
          </div>

          {/* Right column: QR code */}
          <div className="flex flex-col items-center justify-start gap-4">
            <MedicalQRCode token={profile?.emergency_token ?? null} />

            <div className="mt-2 text-center">
              <p className="text-xs text-gray-400">Generado por / Generated by</p>
              <p className="text-sm font-bold text-[#1B6FB5]">AllGo Travel</p>
              <p className="text-xs text-gray-400">allgotravel.app</p>
            </div>
          </div>
        </div>

        {/* Footer stripe */}
        <div className="bg-[#0D9488] px-8 py-3 flex items-center justify-between">
          <p className="text-white text-xs opacity-80">
            🌍 allgotravel.app — Turismo accesible para todos
          </p>
          <span className="text-white text-xs opacity-60">
            {new Date().getFullYear()}
          </span>
        </div>
      </div>
    </main>
  )
}
