import { getLocale } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { requireMember } from '@/lib/subscription'
import HubChecklist from '@/components/HubChecklist'

export const dynamic = 'force-dynamic'

const BLUE = '#1B6FB5'

export default async function HubChecklistPage() {
  const locale = await getLocale()
  const en = locale === 'en'
  await requireMember(locale)

  return (
    <main className="min-h-screen bg-[#f5f8f8] text-[#16292b]">
      <section className="px-5 pt-10 pb-8 text-white" style={{ background: `linear-gradient(135deg, ${BLUE}, #0E4E85)` }}>
        <div className="max-w-2xl mx-auto">
          <Link href="/hub" className="text-white/70 hover:text-white text-sm font-medium">← Hub</Link>
          <h1 className="mt-3 text-3xl font-extrabold">✅ {en ? 'Personalized Checklist' : 'Checklist Personalizado'}</h1>
          <p className="mt-2 text-white/80">
            {en
              ? 'Your step-by-step prep list. Check off items as you go — it saves automatically.'
              : 'Tu lista de preparación paso a paso. Marca lo que vayas completando — se guarda solo.'}
          </p>
        </div>
      </section>

      <section className="px-5 py-8">
        <div className="max-w-2xl mx-auto">
          <HubChecklist />
        </div>
      </section>
    </main>
  )
}
