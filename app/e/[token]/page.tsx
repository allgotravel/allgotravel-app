import { supabase } from '@/lib/supabase'
import { Medication } from '@/types/profile'

export const dynamic = 'force-dynamic'

interface EmergencyCard {
  full_name: string | null
  chronic_conditions: string | null
  invisible_needs: string | null
  medications: Medication[] | null
}

export default async function EmergencyCardPage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params

  let card: EmergencyCard | null = null
  try {
    const { data } = await supabase.rpc('get_emergency_card', { token })
    card = (data as EmergencyCard[] | null)?.[0] ?? null
  } catch {
    card = null
  }

  if (!card) {
    return (
      <main className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <span className="text-4xl">🏥</span>
          <h1 className="text-xl font-bold text-gray-800 mt-4">
            Tarjeta no disponible
          </h1>
          <p className="text-sm text-gray-500 mt-2">
            Este código no es válido o el usuario desactivó el acceso de
            emergencia.
          </p>
          <p className="text-xs text-gray-400 mt-1 italic">
            This card is unavailable or emergency access is turned off.
          </p>
        </div>
      </main>
    )
  }

  const meds = card.medications ?? []

  return (
    <main className="min-h-screen bg-gray-100 py-10 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="bg-[#1B6FB5] text-white px-8 py-5 flex items-center gap-4">
          <span className="text-3xl">🏥</span>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest opacity-80">
              AllGo Travel
            </p>
            <h1 className="text-xl font-bold leading-tight">
              Tarjeta Médica de Emergencia
            </h1>
            <p className="text-xs opacity-70">Emergency Medical Card</p>
          </div>
        </div>

        {/* Emergency banner */}
        <div className="bg-red-50 border-b border-red-200 px-8 py-4">
          <p className="text-xs font-bold text-red-600 uppercase tracking-wide mb-1">
            ⚠️ Información de emergencia / Emergency information
          </p>
          <p className="text-sm text-gray-800 leading-relaxed">
            Esta persona viaja con necesidades especiales de accesibilidad. Por
            favor use esta información para asistirla.
          </p>
          <p className="text-sm text-gray-600 leading-relaxed mt-1 italic">
            This person travels with special accessibility needs. Please use this
            information to assist them.
          </p>
        </div>

        <div className="p-8 space-y-6">
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">
              Nombre / Name
            </p>
            <p className="text-2xl font-bold text-gray-800">
              {card.full_name || '—'}
            </p>
          </div>

          {card.chronic_conditions && (
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">
                Condiciones crónicas / Chronic conditions
              </p>
              <p className="text-gray-700 text-sm leading-relaxed">
                {card.chronic_conditions}
              </p>
            </div>
          )}

          {card.invisible_needs && (
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">
                Necesidades de accesibilidad / Accessibility needs
              </p>
              <p className="text-gray-700 text-sm leading-relaxed">
                {card.invisible_needs}
              </p>
            </div>
          )}

          {meds.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                Medicamentos / Medications
              </p>
              <div className="space-y-1">
                {meds.map((m, i) => (
                  <div
                    key={i}
                    className="flex items-baseline gap-2 text-sm text-gray-700"
                  >
                    <span className="text-[#F97316] font-bold">•</span>
                    <span>
                      <span className="font-semibold">{m.name}</span>
                      {m.dose && (
                        <span className="text-gray-500"> — {m.dose}</span>
                      )}
                      {m.times?.length > 0 && (
                        <span className="text-gray-400">
                          {' '}
                          ({m.times.join(', ')})
                        </span>
                      )}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-[#0D9488] px-8 py-3 flex items-center justify-between">
          <p className="text-white text-xs opacity-80">
            🌍 allgotravel.app — Turismo accesible para todos
          </p>
          <span className="text-white text-xs opacity-60">
            {new Date().getFullYear()}
          </span>
        </div>
      </div>

      <p className="max-w-2xl mx-auto text-center text-xs text-gray-400 mt-4">
        Solo lectura · Información compartida por su titular · Read-only
      </p>
    </main>
  )
}
