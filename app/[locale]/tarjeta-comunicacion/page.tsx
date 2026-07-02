import { redirect } from 'next/navigation'
import { createSupabaseServer } from '@/lib/supabase-server'
import { Link } from '@/i18n/navigation'
import PrintButton from '@/components/PrintButton'

export const dynamic = 'force-dynamic'

const CARDS = [
  {
    icon: '🦽',
    es: 'Necesito acceso para silla de ruedas',
    en: 'I need wheelchair access',
    bg: 'bg-blue-100',
    border: 'border-blue-300',
    text: 'text-blue-900',
  },
  {
    icon: '🔇',
    es: 'Soy sordo/a — por favor escríbame',
    en: 'I am deaf — please write to me',
    bg: 'bg-teal-100',
    border: 'border-teal-300',
    text: 'text-teal-900',
  },
  {
    icon: '👁️',
    es: 'Tengo baja visión — necesito ayuda',
    en: 'I have low vision — I need assistance',
    bg: 'bg-indigo-100',
    border: 'border-indigo-300',
    text: 'text-indigo-900',
  },
  {
    icon: '🧩',
    es: 'Tengo autismo — por favor sea paciente',
    en: 'I have autism — please be patient',
    bg: 'bg-violet-100',
    border: 'border-violet-300',
    text: 'text-violet-900',
  },
  {
    icon: '💊',
    es: 'Necesito tomar mi medicamento',
    en: 'I need to take my medication',
    bg: 'bg-orange-100',
    border: 'border-orange-300',
    text: 'text-orange-900',
  },
  {
    icon: '🚽',
    es: 'Necesito un baño accesible urgente',
    en: 'I need an accessible restroom urgently',
    bg: 'bg-red-100',
    border: 'border-red-300',
    text: 'text-red-900',
  },
  {
    icon: '🏨',
    es: '¿Tiene habitación accesible?',
    en: 'Do you have an accessible room?',
    bg: 'bg-green-100',
    border: 'border-green-300',
    text: 'text-green-900',
  },
  {
    icon: '🍽️',
    es: 'Tengo restricciones alimentarias',
    en: 'I have dietary restrictions',
    bg: 'bg-yellow-100',
    border: 'border-yellow-300',
    text: 'text-yellow-900',
  },
]

export default async function TarjetaComunicacionPage() {
  const supabase = await createSupabaseServer()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return (
    <main className="min-h-screen bg-gray-100 py-10 px-4">
      <style>{`
        @media print {
          body { background: white; }
          .no-print { display: none !important; }
          .cards-grid { gap: 16px !important; }
        }
      `}</style>

      {/* Header */}
      <div className="no-print max-w-4xl mx-auto flex items-center justify-between mb-6">
        <div>
          <Link href="/dashboard" className="text-[#1B6FB5] hover:underline text-sm font-medium">
            ← Dashboard
          </Link>
          <h1 className="text-2xl font-bold text-gray-800 mt-1">
            Tarjeta de Comunicación
          </h1>
          <p className="text-gray-500 text-sm">
            Muestra estas tarjetas en pantalla o imprímelas para usar en tu destino.
            <br />
            <span className="text-gray-400">
              Show these cards on screen or print them to use at your destination.
            </span>
          </p>
        </div>
        <PrintButton label="Imprimir / Save as PDF" />
      </div>

      {/* Cards grid */}
      <div className="cards-grid max-w-4xl mx-auto grid grid-cols-2 gap-6 md:grid-cols-4">
        {CARDS.map((card, i) => (
          <div
            key={i}
            className={`${card.bg} ${card.border} ${card.text} border-2 rounded-2xl shadow p-6 flex flex-col items-center text-center gap-3`}
          >
            <span className="text-6xl leading-none">{card.icon}</span>
            <p className="font-bold text-base leading-snug">{card.es}</p>
            <p className="text-sm text-gray-500 leading-snug">{card.en}</p>
          </div>
        ))}
      </div>

      <p className="no-print text-center text-xs text-gray-400 mt-8">
        AllGo Travel · Turismo accesible para todos 🌍
      </p>
    </main>
  )
}
