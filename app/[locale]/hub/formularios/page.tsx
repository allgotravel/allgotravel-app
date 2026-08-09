import { getLocale } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { requireMember } from '@/lib/subscription'

export const dynamic = 'force-dynamic'

const BLUE = '#1B6FB5'
const ORANGE = '#F97316'

type Doc = {
  emoji: string
  title: string
  what: string
  when: string
  url: string
  urlLabel: string
}

const FORMS: Doc[] = [
  {
    emoji: '📝',
    title: 'Formulario DOT — Transporte Aéreo de Animal de Servicio',
    what: 'Certifica que tu perro está sano, entrenado y se comportará a bordo. Lo firma el dueño (no hace falta un médico).',
    when: 'Requerido por las aerolíneas de EE.UU. para todo vuelo con perro de servicio.',
    url: 'https://www.transportation.gov/individuals/aviation-consumer-protection/service-animals',
    urlLabel: 'Descargar en el sitio oficial del DOT →',
  },
  {
    emoji: '⏱️',
    title: 'Formulario DOT — Alivio Sanitario (vuelos de 8+ horas)',
    what: 'Declara que tu perro puede aguantar el vuelo sin hacer sus necesidades, o que puede hacerlo de forma higiénica.',
    when: 'Solo para vuelos que duran 8 horas o más.',
    url: 'https://www.transportation.gov/individuals/aviation-consumer-protection/service-animals',
    urlLabel: 'Descargar en el sitio oficial del DOT →',
  },
  {
    emoji: '🇺🇸',
    title: 'CDC Dog Import Form (entrada a EE.UU.)',
    what: 'Formulario del CDC para perros que ingresan a Estados Unidos. Se genera en línea y te dan un recibo con código QR.',
    when: 'Requerido para perros que entran a EE.UU. (aplica desde las reglas del CDC de 2024).',
    url: 'https://www.cdc.gov/importation/dogs/index.html',
    urlLabel: 'Ir al formulario del CDC →',
  },
]

const CHECKLIST = [
  'Formulario DOT firmado (y el de alivio si el vuelo es de 8+ h)',
  'Carné de vacunas al día — especialmente rabia',
  'Certificado de salud veterinario reciente',
  'Identificación de tu perro de servicio (arnés, placa o carné del entrenamiento)',
  'CDC Dog Import Form si viajas a EE.UU. (guarda el recibo con QR)',
  'Documentos extra que pida tu aerolínea o país de destino',
]

export default async function HubFormulariosPage() {
  const locale = await getLocale()
  await requireMember(locale)

  return (
    <main className="min-h-screen bg-[#f5f8f8] text-[#16292b]">
      <section className="px-5 pt-10 pb-8 text-white" style={{ background: `linear-gradient(135deg, ${BLUE}, #0E4E85)` }}>
        <div className="max-w-3xl mx-auto">
          <Link href="/hub" className="text-white/70 hover:text-white text-sm font-medium">← Hub</Link>
          <h1 className="mt-3 text-3xl font-extrabold">📋 Formularios y Documentos</h1>
          <p className="mt-2 text-white/80">
            Los formularios oficiales y la lista de documentos que necesitas antes de volar. Todos los
            enlaces van directo a la fuente oficial.
          </p>
        </div>
      </section>

      <section className="px-5 py-8">
        <div className="max-w-3xl mx-auto space-y-5">
          {FORMS.map((f) => (
            <div key={f.title} className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100">
              <div className="flex items-start gap-3">
                <span className="text-3xl">{f.emoji}</span>
                <div className="min-w-0">
                  <h3 className="font-extrabold text-gray-800 leading-tight">{f.title}</h3>
                  <p className="mt-2 text-sm text-gray-600">{f.what}</p>
                  <p className="mt-1 text-sm text-gray-500"><span className="font-semibold">Cuándo:</span> {f.when}</p>
                  <a
                    href={f.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-block text-sm font-bold underline"
                    style={{ color: BLUE }}
                  >
                    {f.urlLabel}
                  </a>
                </div>
              </div>
            </div>
          ))}

          <div className="rounded-2xl bg-white p-6 shadow-sm border-2" style={{ borderColor: ORANGE }}>
            <h3 className="font-extrabold" style={{ color: BLUE }}>🧳 Lo que debes llevar</h3>
            <ul className="mt-3 space-y-2">
              {CHECKLIST.map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-gray-700">
                  <span style={{ color: ORANGE }}>✓</span> {item}
                </li>
              ))}
            </ul>
          </div>

          <p className="text-center text-xs text-gray-400">
            Los formularios del DOT se descargan gratis del sitio oficial — nunca pagues por ellos. Ningún
            «certificado de registro» de internet es obligatorio ni oficial.
          </p>
        </div>
      </section>
    </main>
  )
}
