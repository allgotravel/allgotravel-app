import { getLocale } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { createSupabaseServer } from '@/lib/supabase-server'
import { requireMember } from '@/lib/subscription'

export const dynamic = 'force-dynamic'

const BLUE = '#1B6FB5'

type Airline = {
  id: number
  priority: number | null
  name: string
  iata_code: string
  country: string | null
  region: string | null
  status: string | null
}
type Policy = {
  airline_iata: string
  acepta_perro_servicio: string | null
  acepta_esa: string | null
  exige_dot: string | null
  horas_anticipacion: string | null
  metodo_envio: string | null
  restriccion_tamano_peso: string | null
  max_animales: string | null
  notas: string | null
  url_fuente: string | null
  fecha_verificacion: string | null
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

export default async function HubAerolineasPage() {
  const locale = await getLocale()
  const en = locale === 'en'
  await requireMember(locale)

  const supabase = await createSupabaseServer()
  const [{ data: airlinesData }, { data: policiesData }] = await Promise.all([
    supabase.from('airlines').select('*').order('priority', { nullsFirst: false }).order('name'),
    supabase.from('service_animal_policies').select('*'),
  ])

  const airlines = (airlinesData ?? []) as Airline[]
  const policies = (policiesData ?? []) as Policy[]
  const byIata = new Map(policies.map((p) => [p.airline_iata, p]))

  // Agrupar por región
  const groups = new Map<string, Airline[]>()
  for (const a of airlines) {
    const key = a.region || a.country || (en ? 'Other' : 'Otras')
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key)!.push(a)
  }

  return (
    <main className="min-h-screen bg-[#f5f8f8] text-[#16292b]">
      <section className="px-5 pt-10 pb-8 text-white" style={{ background: `linear-gradient(135deg, ${BLUE}, #0E4E85)` }}>
        <div className="max-w-3xl mx-auto">
          <Link href="/hub" className="text-white/70 hover:text-white text-sm font-medium">← Hub</Link>
          <h1 className="mt-3 text-3xl font-extrabold">✈️ {en ? 'Requirements by Airline' : 'Requisitos por Aerolínea'}</h1>
          <p className="mt-2 text-white/80">
            {en
              ? `${airlines.length} verified airlines. Tap any one to see all the requirements, with its official source and the date it was verified.`
              : `${airlines.length} aerolíneas verificadas. Toca cada una para ver todos los requisitos, con su fuente oficial y la fecha de verificación.`}
          </p>
        </div>
      </section>

      <section className="px-5 py-8">
        <div className="max-w-3xl mx-auto space-y-8">
          {[...groups.entries()].map(([region, list]) => (
            <div key={region}>
              <h2 className="text-sm font-bold uppercase tracking-wide text-gray-500 mb-3">{region}</h2>
              <div className="space-y-3">
                {list.map((a) => {
                  const p = byIata.get(a.iata_code)
                  const esa = yesNo(p?.acepta_esa ?? null)
                  const dog = yesNo(p?.acepta_perro_servicio ?? null)
                  const dot = yesNo(p?.exige_dot ?? null)
                  return (
                    <details key={a.id} className="group rounded-2xl bg-white shadow-sm border border-gray-100 overflow-hidden">
                      <summary className="cursor-pointer list-none px-5 py-4 flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <p className="font-bold text-gray-800">{a.name}</p>
                          <div className="mt-1.5 flex flex-wrap gap-1.5">
                            <Badge state={dog} label={en ? 'Service dog' : 'Perro de servicio'} />
                            <Badge state={esa} label={esa === 'no' ? (en ? 'No ESA' : 'ESA no') : 'ESA'} />
                            {dot === 'yes' || dot === 'limited' ? <Badge state="limited" label={en ? 'DOT form' : 'Formulario DOT'} /> : null}
                          </div>
                        </div>
                        <span className="text-gray-400 group-open:rotate-180 transition shrink-0">▾</span>
                      </summary>
                      <div className="px-5 pb-5 pt-1 space-y-2 border-t border-gray-100">
                        {p ? (
                          <>
                            <Field label={en ? 'Service dog' : 'Perro de servicio'} value={p.acepta_perro_servicio} />
                            <Field label={en ? 'Emotional support (ESA)' : 'Apoyo emocional (ESA)'} value={p.acepta_esa} />
                            <Field label={en ? 'DOT form' : 'Formulario DOT'} value={p.exige_dot} />
                            <Field label={en ? 'Advance notice (hours)' : 'Aviso previo (horas)'} value={p.horas_anticipacion} />
                            <Field label={en ? 'Size / weight' : 'Tamaño / peso'} value={p.restriccion_tamano_peso} />
                            <Field label={en ? 'Notes' : 'Notas'} value={p.notas} />
                            <div className="pt-2 flex flex-wrap items-center gap-3 text-xs text-gray-400">
                              {p.fecha_verificacion && <span>{en ? 'Verified' : 'Verificado'}: {p.fecha_verificacion}</span>}
                              {p.url_fuente && (
                                <a href={p.url_fuente} target="_blank" rel="noopener noreferrer" className="font-semibold underline" style={{ color: BLUE }}>
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
            </div>
          ))}
        </div>
        <p className="mt-8 text-center text-xs text-gray-400">
          {en
            ? 'Every policy is verified against the airline’s official source. Always confirm before you fly, because rules can change.'
            : 'Cada política se verifica en la fuente oficial de la aerolínea. Confirma siempre antes de volar, porque las reglas pueden cambiar.'}
        </p>
      </section>
    </main>
  )
}
