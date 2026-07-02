import { useTranslations } from 'next-intl'
import Image from 'next/image'
import { Link } from '@/i18n/navigation'
import LanguageSwitcher from '@/components/LanguageSwitcher'
import { DESTINATIONS } from '@/lib/destinations'
import { ATTRACTION_TYPE_LABELS } from '@/lib/destinations'

const PREVIEW_DESTINATIONS = ['san-juan', 'costa-rica', 'barcelona', 'tokio', 'orlando', 'medellin']

const FEATURES = [
  {
    icon: '🤖',
    key: 'feature1',
    color: 'bg-blue-50 border-blue-100',
    iconBg: 'bg-blue-600',
  },
  {
    icon: '✈️',
    key: 'feature2',
    color: 'bg-orange-50 border-orange-100',
    iconBg: 'bg-orange-500',
  },
  {
    icon: '🗺️',
    key: 'feature3',
    color: 'bg-teal-50 border-teal-100',
    iconBg: 'bg-teal-600',
  },
  {
    icon: '♿',
    key: 'feature4',
    color: 'bg-indigo-50 border-indigo-100',
    iconBg: 'bg-indigo-600',
  },
]

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(n => (
        <span key={n} className={`text-xs ${n <= rating ? 'text-teal-500' : 'text-gray-200'}`}>♿</span>
      ))}
    </div>
  )
}

export default function HomePage() {
  const t = useTranslations('home')
  const tD = useTranslations('disabilities')

  const previewDests = DESTINATIONS.filter(d => PREVIEW_DESTINATIONS.includes(d.id))

  return (
    <div className="min-h-screen bg-white">

      {/* ── NAV ── */}
      <nav className="fixed top-0 inset-x-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image
              src="/logo-allgo.jpg"
              alt="AllGo Travel"
              width={40}
              height={40}
              className="rounded-full object-cover"
            />
            <span className="font-bold text-blue-700 text-lg tracking-tight">AllGo Travel</span>
          </div>
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <Link
              href="/login"
              className="text-sm font-medium text-gray-600 hover:text-blue-700 transition px-3 py-1.5"
            >
              {t('navLogin')}
            </Link>
            <Link
              href="/register"
              className="text-sm font-semibold bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-full transition shadow-sm"
            >
              {t('navRegister')}
            </Link>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden pt-16">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-950 via-blue-800 to-teal-700" />
        {/* Logo de fondo - ocupa todo el hero, encima del gradiente */}
        <div className="absolute inset-0 pointer-events-none select-none z-[1]">
          <Image
            src="/logo-allgo.jpg"
            alt=""
            fill
            className="object-contain opacity-[0.15]"
            style={{ objectPosition: 'center' }}
          />
        </div>
        {/* Decorative circles */}
        <div className="absolute top-20 right-10 w-72 h-72 bg-orange-400/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-teal-400/10 rounded-full blur-3xl" />
        <div className="absolute top-1/3 left-1/4 w-48 h-48 bg-blue-400/10 rounded-full blur-2xl" />

        <div className="relative z-10 flex flex-col items-center text-center px-4 w-full">
          {/* Tagline pill y headline dentro de max-w-4xl */}
          <div className="max-w-4xl mx-auto w-full flex flex-col items-center">
            {/* Tagline pill */}
            <div className="mb-4 inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white/90 text-sm font-medium px-4 py-1.5 rounded-full">
              <span className="w-2 h-2 bg-orange-400 rounded-full animate-pulse" />
              {t('heroTagline')}
            </div>

            {/* Headline */}
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold text-white leading-tight mb-6 tracking-tight">
              {t('heroTitle').split(' ').map((word, i) => (
                i === 1
                  ? <span key={i} className="text-orange-400"> {word}</span>
                  : <span key={i}>{i > 0 ? ' ' : ''}{word}</span>
              ))}
            </h1>
          </div>

          {/* Subtitle - ancho completo, fuera del max-w */}
          <p
            className="w-full font-extrabold text-white leading-none mb-10 text-center tracking-tighter px-2"
            style={{ fontSize: 'clamp(3rem, 9vw, 12rem)' }}
          >
            {t('heroSubtitle')}
          </p>

          {/* CTAs dentro de max-w-4xl */}
          <div className="max-w-4xl mx-auto flex flex-col sm:flex-row gap-4">
            <Link
              href="/register"
              className="inline-flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold px-8 py-4 rounded-full text-base shadow-lg shadow-orange-500/30 transition transform hover:scale-105"
            >
              🚀 {t('heroCta')}
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/30 text-white font-semibold px-8 py-4 rounded-full text-base transition"
            >
              {t('heroLogin')} →
            </Link>
          </div>

          {/* Scroll indicator */}
          <div className="mt-16 flex flex-col items-center gap-2 text-white/40 text-xs">
            <div className="w-px h-8 bg-white/20" />
            <span>↓</span>
          </div>
        </div>
      </section>

      {/* ── STATS BAR ── */}
      <section className="bg-blue-700 text-white">
        <div className="max-w-5xl mx-auto px-4 py-6 grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
          {[
            { num: '24', label: t('statsDestinations') },
            { num: '15+', label: t('statsCountries') },
            { num: '🤖', label: t('statsChatbot') },
            { num: '👨‍👩‍👧', label: t('statsGroup') },
          ].map((s, i) => (
            <div key={i}>
              <p className="text-3xl font-extrabold text-orange-300">{s.num}</p>
              <p className="text-sm text-white/80 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="py-24 px-4 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4">{t('featuresTitle')}</h2>
            <p className="text-gray-500 max-w-xl mx-auto">{t('featuresSubtitle')}</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {FEATURES.map(f => (
              <div key={f.key} className={`rounded-2xl border p-6 flex gap-5 items-start ${f.color}`}>
                <div className={`${f.iconBg} text-white text-2xl w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-sm`}>
                  {f.icon}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-base mb-1">{t(`${f.key}Title` as Parameters<typeof t>[0])}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{t(`${f.key}Desc` as Parameters<typeof t>[0])}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── DESTINATIONS PREVIEW ── */}
      <section className="py-24 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4">{t('destinationsTitle')}</h2>
            <p className="text-gray-500">{t('destinationsSubtitle')}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {previewDests.map(dest => (
              <div key={dest.id} className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100 hover:shadow-xl transition-shadow group">
                {/* Color header */}
                <div className={`${dest.bgColor} h-36 flex items-center justify-center relative`}>
                  <span className="text-7xl group-hover:scale-110 transition-transform duration-300">{dest.flag}</span>
                  <div className="absolute bottom-2 left-3 flex gap-1">
                    {dest.attractionTypes.slice(0, 4).map(a => (
                      <span key={a} className="text-base bg-black/20 backdrop-blur-sm rounded-full px-1.5 py-0.5">
                        {ATTRACTION_TYPE_LABELS[a].icon}
                      </span>
                    ))}
                  </div>
                  <div className="absolute top-2 right-3 bg-white/90 backdrop-blur-sm rounded-full px-2.5 py-1 text-xs font-bold text-teal-700">
                    {'♿'.repeat(dest.accessibilityRating)}
                  </div>
                </div>
                <div className="p-5 space-y-3">
                  <div>
                    <h3 className="font-bold text-gray-900 text-base">{dest.name}</h3>
                    <p className="text-xs text-gray-400">{dest.country}</p>
                  </div>
                  <StarRating rating={dest.accessibilityRating} />
                  <div className="flex flex-wrap gap-1">
                    {dest.disabilityTypes.slice(0, 4).map(d => (
                      <span key={d} className="text-base">{['motriz', 'visual', 'auditiva', 'autismo', 'cognitiva', 'cronica_invisible', 'mixta'].includes(d) ? ({ motriz: '♿', visual: '👁️', auditiva: '👂', autismo: '🧩', cognitiva: '🧠', cronica_invisible: '🫀', mixta: '👨‍👩‍👧' } as Record<string, string>)[d] : d}</span>
                    ))}
                  </div>
                  <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                    {dest.descriptionES}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-10">
            <Link
              href="/destinos"
              className="inline-flex items-center gap-2 bg-blue-700 hover:bg-blue-800 text-white font-semibold px-8 py-3.5 rounded-full transition shadow-md"
            >
              🗺️ {t('destinationsCta')}
            </Link>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="py-24 px-4 bg-gradient-to-br from-blue-950 via-blue-900 to-teal-800 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold mb-16">
            {' '}3 <span className="text-orange-400">pasos</span> para tu viaje accesible
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {[
              { num: '1', icon: '👤', titleES: 'Crea tu perfil', descES: 'Indica tus necesidades de accesibilidad y las de cada miembro de tu grupo familiar.' },
              { num: '2', icon: '🗺️', titleES: 'Elige tu destino', descES: '24 destinos verificados con rating de accesibilidad real y atracciones detalladas.' },
              { num: '3', icon: '✈️', titleES: 'Genera tu plan', descES: 'La IA crea un itinerario personalizado para todo tu grupo en segundos.' },
            ].map(step => (
              <div key={step.num} className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-orange-500 text-white text-2xl flex items-center justify-center font-extrabold shadow-lg shadow-orange-500/30">
                  {step.num}
                </div>
                <div className="text-4xl">{step.icon}</div>
                <h3 className="font-bold text-lg">{step.titleES}</h3>
                <p className="text-white/70 text-sm leading-relaxed">{step.descES}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="py-24 px-4 bg-white">
        <div className="max-w-2xl mx-auto text-center">
          <div className="mb-6 w-20 h-20 mx-auto rounded-full overflow-hidden shadow-xl ring-4 ring-orange-100">
            <Image
              src="/logo-allgo.jpg"
              alt="AllGo Travel"
              width={80}
              height={80}
              className="object-cover w-full h-full"
            />
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4">{t('ctaTitle')}</h2>
          <p className="text-gray-500 mb-8">{t('ctaSubtitle')}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              className="inline-flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold px-8 py-4 rounded-full text-base shadow-lg shadow-orange-500/20 transition transform hover:scale-105"
            >
              🚀 {t('ctaRegister')}
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 border-2 border-blue-700 text-blue-700 hover:bg-blue-50 font-semibold px-8 py-4 rounded-full text-base transition"
            >
              {t('ctaLogin')}
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-gray-900 text-white py-10 px-4">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Image
              src="/logo-allgo.jpg"
              alt="AllGo Travel"
              width={32}
              height={32}
              className="rounded-full object-cover"
            />
            <span className="font-bold text-white">AllGo Travel</span>
            <span className="text-gray-500 text-xs">· {t('footerTagline')}</span>
          </div>
          <p className="text-gray-500 text-xs">© 2025 AllGo Travel. {t('footerRights')}</p>
        </div>
      </footer>

    </div>
  )
}
