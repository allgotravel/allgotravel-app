import type { Metadata } from 'next'
import { headers } from 'next/headers'
import { createHash } from 'crypto'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { Medication, ServiceDog } from '@/types/profile'
import { formatMedTimes } from '@/lib/medtime'

export const dynamic = 'force-dynamic'
export const revalidate = 0

// Personal medical data: never index, never cache, never send the URL (token) as a referrer.
export const metadata: Metadata = {
  title: 'Tarjeta médica de emergencia · AllGo Travel',
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
  referrer: 'no-referrer',
}

// Minimal data for first responders (see get_emergency_card in Supabase).
interface EmergencyCard {
  full_name: string | null
  blood_type: string | null
  allergies: string | null
  allergy_severity: string | null
  chronic_conditions: string | null
  invisible_needs: string | null
  medical_devices: string | null
  medications: Medication[] | null
  primary_language: string | null
  emergency_contact_name: string | null
  emergency_contact_phone: string | null
  emergency_contact2_name: string | null
  emergency_contact2_phone: string | null
  emergency_contact3_name: string | null
  emergency_contact3_phone: string | null
  doctor_name: string | null
  doctor_phone: string | null
  service_dog: ServiceDog | null
}

// New tokens are 32 base64url characters (192 random bits). Anything else is rejected
// without touching the database.
const TOKEN_RE = /^[A-Za-z0-9_-]{32,64}$/

// Per-visitor limit: 30 card views per 10 minutes. The IP is hashed, never stored raw.
const RATE_LIMIT = 30
const RATE_WINDOW_SECONDS = 600

async function visitorBucket(): Promise<string> {
  const h = await headers()
  const ip =
    h.get('x-real-ip') ??
    h.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    'unknown'
  const salt = process.env.RATE_LIMIT_SALT ?? 'allgo-e-card'
  return 'e:' + createHash('sha256').update(salt + ':' + ip).digest('hex').slice(0, 32)
}

function Notice({ title, body, bodyEn }: { title: string; body: string; bodyEn: string }) {
  return (
    <main className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        <span className="text-4xl">🏥</span>
        <h1 className="text-xl font-bold text-gray-800 mt-4">{title}</h1>
        <p className="text-sm text-gray-500 mt-2">{body}</p>
        <p className="text-xs text-gray-400 mt-1 italic">{bodyEn}</p>
      </div>
    </main>
  )
}

const Unavailable = () => (
  <Notice
    title="Tarjeta no disponible"
    body="Este código no es válido o el usuario desactivó el acceso de emergencia."
    bodyEn="This card is unavailable or emergency access is turned off."
  />
)

export default async function EmergencyCardPage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params

  if (!TOKEN_RE.test(token)) return <Unavailable />

  let card: EmergencyCard | null = null
  let limited = false
  try {
    const admin = getSupabaseAdmin()
    const { data: allowed, error: rlError } = await admin.rpc('hit_rate_limit', {
      p_bucket: await visitorBucket(),
      p_limit: RATE_LIMIT,
      p_window_seconds: RATE_WINDOW_SECONDS,
    })
    limited = !rlError && allowed === false
    if (!limited) {
      const { data } = await admin.rpc('get_emergency_card', { token })
      card = (data as EmergencyCard[] | null)?.[0] ?? null
    }
  } catch {
    card = null
  }

  if (limited) {
    return (
      <Notice
        title="Demasiadas consultas"
        body="Espera unos minutos y vuelve a escanear el código. En una emergencia llama al 911."
        bodyEn="Too many requests. Wait a few minutes and scan again. In an emergency call 911."
      />
    )
  }
  if (!card) return <Unavailable />

  const meds = card.medications ?? []
  const dog = card.service_dog

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
            <span className="allgo-heartbeat">⚠️</span> Información de emergencia / Emergency information
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

          {/* Contacto de emergencia + tipo de sangre (arriba, muy visible) */}
          {(card.emergency_contact_name || card.emergency_contact_phone || card.blood_type) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {(card.emergency_contact_name || card.emergency_contact_phone) && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <p className="text-xs font-bold text-[#1B6FB5] uppercase tracking-wide mb-1">
                    📞 Contacto de emergencia / Emergency contact
                  </p>
                  <p className="text-gray-800 text-base font-semibold">
                    {card.emergency_contact_name || '—'}
                  </p>
                  {card.emergency_contact_phone && (
                    <a
                      href={`tel:${card.emergency_contact_phone}`}
                      className="text-[#1B6FB5] text-lg font-bold underline"
                    >
                      {card.emergency_contact_phone}
                    </a>
                  )}
                </div>
              )}
              {card.blood_type && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                  <p className="text-xs font-bold text-red-600 uppercase tracking-wide mb-1">
                    <span className="allgo-blood">🩸</span> Tipo de sangre / Blood type
                  </p>
                  <p className="text-2xl font-extrabold text-gray-800">{card.blood_type}</p>
                </div>
              )}
            </div>
          )}

          {/* Contactos de emergencia adicionales */}
          {(card.emergency_contact2_name || card.emergency_contact2_phone || card.emergency_contact3_name || card.emergency_contact3_phone) && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 space-y-2">
              <p className="text-xs font-bold text-[#1B6FB5] uppercase tracking-wide">
                📞 Más contactos / More contacts
              </p>
              {(card.emergency_contact2_name || card.emergency_contact2_phone) && (
                <p className="text-gray-800 text-sm">
                  {card.emergency_contact2_name}
                  {card.emergency_contact2_phone && (
                    <>{card.emergency_contact2_name ? ' — ' : ''}<a href={`tel:${card.emergency_contact2_phone}`} className="text-[#1B6FB5] font-semibold underline">{card.emergency_contact2_phone}</a></>
                  )}
                </p>
              )}
              {(card.emergency_contact3_name || card.emergency_contact3_phone) && (
                <p className="text-gray-800 text-sm">
                  {card.emergency_contact3_name}
                  {card.emergency_contact3_phone && (
                    <>{card.emergency_contact3_name ? ' — ' : ''}<a href={`tel:${card.emergency_contact3_phone}`} className="text-[#1B6FB5] font-semibold underline">{card.emergency_contact3_phone}</a></>
                  )}
                </p>
              )}
            </div>
          )}

          {card.primary_language && (
            <div className="flex flex-wrap gap-3 text-sm">
              <span className="bg-gray-100 rounded-lg px-3 py-1.5"><span className="font-semibold">🗣️ Idioma / Language:</span> {card.primary_language}</span>
            </div>
          )}

          {card.allergies && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <p className="text-xs font-bold text-red-600 uppercase tracking-wide mb-1">
                ⚠️ Alergias / Allergies
              </p>
              <p className="text-gray-800 text-sm leading-relaxed">
                {card.allergies}
                {card.allergy_severity && (
                  <span className="block mt-1 font-bold text-red-700">
                    Severidad / Severity: {card.allergy_severity}
                  </span>
                )}
              </p>
            </div>
          )}

          {card.chronic_conditions && (
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">
                Condiciones médicas / Medical conditions
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

          {card.medical_devices && (
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">
                🔧 Dispositivos médicos / Medical devices
              </p>
              <p className="text-gray-700 text-sm leading-relaxed">{card.medical_devices}</p>
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
                          ({formatMedTimes(m.times)})
                        </span>
                      )}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Médico */}
          {(card.doctor_name || card.doctor_phone) && (
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">
                🩺 Médico / Doctor
              </p>
              <p className="text-gray-800 text-sm">
                {card.doctor_name}
                {card.doctor_phone && (
                  <>
                    {card.doctor_name ? ' — ' : ''}
                    <a href={`tel:${card.doctor_phone}`} className="text-[#1B6FB5] font-semibold underline">
                      {card.doctor_phone}
                    </a>
                  </>
                )}
              </p>
            </div>
          )}

          {/* Perro de servicio */}
          {dog?.has && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <p className="text-xs font-bold text-amber-700 uppercase tracking-wide mb-2">
                <span className="allgo-dog">🐕‍🦺</span> Perro de servicio / Service dog
              </p>
              <div className="space-y-1 text-sm text-gray-800">
                {dog.name && (
                  <p><span className="font-semibold">Nombre / Name:</span> {dog.name}</p>
                )}
                {(dog.breed || dog.size) && (
                  <p>
                    <span className="font-semibold">Raza / Breed:</span>{' '}
                    {[dog.breed, dog.size].filter(Boolean).join(' · ')}
                  </p>
                )}
                {dog.tasks && (
                  <p><span className="font-semibold">Tareas / Tasks:</span> {dog.tasks}</p>
                )}
                {dog.trained_dot && (
                  <p className="text-blue-700 font-medium">
                    ✓ Entrenado · formulario del DOT en regla / Trained · DOT form on file
                  </p>
                )}
                {(dog.vet_name || dog.vet_phone) && (
                  <p>
                    <span className="font-semibold">Veterinario / Vet:</span>{' '}
                    {dog.vet_name}
                    {dog.vet_phone && (
                      <>
                        {' — '}
                        <a href={`tel:${dog.vet_phone}`} className="text-[#1B6FB5] underline font-semibold">
                          {dog.vet_phone}
                        </a>
                      </>
                    )}
                  </p>
                )}
                {dog.vaccines_current && (
                  <p className="text-blue-700 font-medium">✓ Vacunas al día / Vaccines current</p>
                )}
                {dog.rabies_date && (
                  <p><span className="font-semibold">💉 Antirrábica vence / Rabies expires:</span> {dog.rabies_date}</p>
                )}
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
