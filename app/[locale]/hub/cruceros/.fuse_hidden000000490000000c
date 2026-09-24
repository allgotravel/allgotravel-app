import { getLocale } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { createSupabaseServer } from '@/lib/supabase-server'
import { requireMember } from '@/lib/subscription'

export const dynamic = 'force-dynamic'

const BLUE = '#1B6FB5'

type CruiseLine = {
  id: number
  priority: number | null
  name: string
  slug: string
  region: string | null
  status: string | null
}
type CruisePolicy = {
  cruise_slug: string
  acepta_perro_servicio: string | null
  acepta_esa: string | null
  aviso_previo: string | null
  documentos: string | null
  prueba_obligatoria: string | null
  areas_alivio: string | null
  contacto_accesibilidad: string | null
  camarotes_accesibles: string | null
  notas: string | null
  url_fuente: string | null
  fecha_verificacion: string | null
  url_reserva: string | null
}

function yesNo(v: string | null): 'yes' | 'no' | 'limited' | 'unknown' {
  if (!v) return 'unknown'
  const t = v.trim().toLowerCase()
  if (t.startsWith('no')) return 'no'
  if (t.startsWith('sí') || t.startsWith('si')) return v.length > 6 ? 'limited' : 'yes'
  return 'limited'
}

function Badge({ state, label }: { state: 'yes' | 'no' | 'limited' | 'unknown'; label: string }) {
  const styles: Record<string, string> = {
    yes: 'bg-green-100 text-green-800',
    no: 'bg-red-100 text-red-700',
    limited: 'bg-amber-100 text-amber-800',
    unknown: 'bg-gray-100 text-gray-500',
  }
  const icon = state === 'yes' ? '✅' : state === 'no' ? '❌' : state === 'limited' ? '⚠️' : '—'
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${styles[state]}`}>
      {icon} {label}
    </span>
  )
}

function Field({ label, value }: { label: string; value: string | null }) {
  if (!value) return null
  return (
    <div className="text-sm">
      <span className="font-semibold text-gray-700">{label}: </span>
      <span className="text-gray-600">{value}</span>
    </div>
  )
}

export default async function HubCrucerosPage() {
  const locale = await getLocale()
  const en = locale === 'en'
  await requireMember(locale)

  const supabase = await createSupabaseServer()
  const [{ data: linesData }, { data: policiesData }] = await Promise.all([
    supabase.from('cruise_lines').select('*').order('priority', { nullsFirst: false }).order('name'),
    supabase.from('cruise_accessibility_policies').select('*'),
  ])

  const lines = (linesData ?? []) as CruiseLine[]
  const policies = (policiesData ?? []) as CruisePolicy[]
  const bySlug = new Map(policies.map((p) => [p.cruise_slug, p]))

  return (
    <main className="min-h-screen bg-[#f5f8f8] text-[#16292b]">
      <section className="px-5 pt-10 pb-8 text-white" style={{ background: `linear-gradient(135deg, ${BLUE}, #0E4E85)` }}>
        <div className="max-w-3xl mx-auto">
          <Link href="/hub" className="text-white/70 hover:text-white text-sm font-medium">← Hub</Link>
          <h1 className="mt-3 text-3xl font-extrabold">🚢 {en ? 'Requirements by Cruise Line' : 'Requisitos por Crucero'}</h1>
          <p className="mt-2 text-white/80">
            {en
              ? `${lines.length} verified cruise lines. Tap any one to see the requirements for service dogs, accessibility, and reduced mobility, with its official source and the date it was verified.`
              : `${lines.length} navieras verificadas. Toca cada una para ver los requisitos de perro de servicio, accesibilidad y movilidad reducida, con su fuente oficial y la fecha de verificación.`}
          </p>
        </div>
      </section>

      <section className="px-5 py-8">
        <div className="max-w-3xl mx-auto space-y-3">
          {lines.map((c, i) => {
            const p = bySlug.get(c.slug)
            const dog = yesNo(p?.acepta_perro_servicio ?? null)
            const esa = yesNo(p?.acepta_esa ?? null)
            const cabin = yesNo(p?.camarotes_accesibles ?? null)
            return (
              <details
                key={c.id}
                style={{ animationDelay: `${i * 60}ms` }}
                className="allgo-rise allgo-tap group rounded-2xl bg-white shadow-sm border border-gray-100 overflow-hidden"
              >
                <summary className="cursor-pointer list-none px-5 py-4 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-bold text-gray-800">{c.name}</p>
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      <Badge state={dog} label={en ? 'Service dog' : 'Perro de servicio'} />
                      <Badge state={esa} label={esa === 'no' ? (en ? 'No ESA' : 'ESA no') : 'ESA'} />
                      {cabin === 'yes' || cabin === 'limited' ? <Badge state="limited" label={en ? 'Accessible cabin' : 'Camarote accesible'} /> : null}
                    </div>
                  </div>
                  <span className="text-gray-400 group-open:rotate-180 transition shrink-0">▾</span>
                </summary>
                <div className="allgo-rise px-5 pb-5 pt-1 space-y-2 border-t border-gray-100">
                  {p ? (
                    <>
                      <Field label={en ? 'Service dog' : 'Perro de servicio'} value={p.acepta_perro_servicio} />
                      <Field label={en ? 'Emotional support (ESA)' : 'Apoyo emocional (ESA)'} value={p.acepta_esa} />
                      <Field label={en ? 'Advance notice' : 'Aviso previo'} value={p.aviso_previo} />
                      <Field label={en ? 'Documents' : 'Documentos'} value={p.documentos} />
                      <Field label={en ? 'Relief areas' : 'Áreas de alivio'} value={p.areas_alivio} />
                      <Field label={en ? 'Accessible cabins / mobility' : 'Camarotes accesibles / movilidad'} value={p.camarotes_accesibles} />
                      <Field label={en ? 'Accessibility contact' : 'Contacto de accesibilidad'} value={p.contacto_accesibilidad} />
                      <Field label={en ? 'Notes' : 'Notas'} value={p.notas} />
                      {p.url_reserva && (
                        <a
                          href={p.url_reserva}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="allgo-tap allgo-cta mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-extrabold text-white sm:w-auto"
                          style={{ background: 'linear-gradient(135deg, #F97316, #ea6a0a)' }}
                        >
                          🚢 {en ? `Book with ${c.name} →` : `Reservar en ${c.name} →`}
                        </a>
                      )}
                      <div className="pt-2 flex flex-wrap items-center gap-3 text-xs text-gray-400">
                        {p.fecha_verificacion && <span>{en ? 'Verified' : 'Verificado'}: {p.fecha_verificacion}</span>}
                        {p.url_fuente && (
                          <a href={p.url_fuente} target="_blank" rel="noopener noreferrer" className="allgo-tap inline-block font-semibold underline" style={{ color: BLUE }}>
                            {en ? 'Official source →' : 'Fuente oficial →'}
                          </a>
                        )}
                      </div>
                    </>
                  ) : (
                    <p className="text-sm text-gray-500">{en ? 'Policy under verification. We don’t show unconfirmed data.' : 'Política en verificación. No mostramos datos sin confirmar.'}</p>
                  )}
                </div>
              </details>
            )
          })}
        </div>
        <p className="mt-8 text-center text-xs text-gray-400">
          {en
            ? 'Every policy is verified against the cruise line’s official source. A cruise letting your dog board doesn’t guarantee it can disembark at every port: always confirm each country’s rules before you travel.'
            : 'Cada política se verifica en la fuente oficial de la naviera. Que el crucero deje subir a tu perro no garantiza que pueda bajar en cada puerto: confirma siempre las reglas del país antes de viajar.'}
        </p>
      </section>
    </main>
  )
}
