import { useTranslations, useLocale } from 'next-intl'
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
  const locale = useLocale()
  const en = locale === 'en'

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
            <span className="font-bold text-blue-700 text-lg tracking-tight">AllGo Travel App</span>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Language toggle — always visible */}
            <div className="flex gap-1 bg-gray-100 rounded-lg p-1 text-xs font-bold">
              <a href="/es" className={`px-2.5 py-1 rounded-md transition-all ${locale === 'es' ? 'bg-blue-700 text-white shadow-sm' : 'text-gray-500 hover:text-blue-700'}`}>ES</a>
              <a href="/en" className={`px-2.5 py-1 rounded-md transition-all ${locale === 'en' ? 'bg-blue-700 text-white shadow-sm' : 'text-gray-500 hover:text-blue-700'}`}>EN</a>
            </div>
            <Link
              href="/login"
              className="hidden sm:block text-sm font-medium text-gray-600 hover:text-blue-700 transition px-3 py-1.5"
            >
              {t('navLogin')}
            </Link>
            <Link
              href="/membresia"
              className="hidden sm:block text-sm font-medium text-gray-600 hover:text-blue-700 transition px-3 py-1.5"
            >
              {en ? 'Plans' : 'Planes'}
            </Link>
            <Link
              href="/register"
              className="allgo-tap text-sm font-semibold bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-full shadow-sm"
            >
              {t('navRegister')}
            </Link>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden pt-16">
        {/* Background gradient — aurora animada futurista */}
        <div className="absolute inset-0 allgo-aurora" />
        {/* Rejilla HUD tenue */}
        <div className="absolute inset-0 allgo-grid pointer-events-none z-[1]" />
        {/* Logo de fondo - ocupa todo el hero, encima del gradiente */}
        <div className="absolute inset-0 pointer-events-none select-none z-[1]">
          <Image
            src="/logo-allgo.jpg"
            alt=""
            fill
            className="object-cover opacity-[0.15]"
            style={{ objectPosition: 'center' }}
          />
        </div>
        {/* Decorative circles */}
        <div className="allgo-orb absolute top-20 right-10 w-72 h-72 bg-orange-400/10 rounded-full blur-3xl" />
        <div className="allgo-orb-2 absolute bottom-10 left-10 w-96 h-96 bg-teal-400/10 rounded-full blur-3xl" />
        <div className="allgo-orb-3 absolute top-1/3 left-1/4 w-48 h-48 bg-blue-400/10 rounded-full blur-2xl" />

        <div className="relative z-10 flex flex-col items-center text-center px-4 max-w-4xl mx-auto">
          {/* Tagline pill */}
          <div className="mb-4 inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white/90 text-sm font-medium px-4 py-1.5 rounded-full">
            <span className="w-2 h-2 bg-orange-400 rounded-full animate-pulse" />
            {t('heroTagline')}
          </div>

          {/* Headline */}
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold text-white leading-tight mb-6 tracking-tight">
            {t('heroTitle').split(' ').map((word, i) => (
              i === 1
                ? <span key={i} className="allgo-gradient-text"> {word}</span>
                : <span key={i}>{i > 0 ? ' ' : ''}{word}</span>
            ))}
          </h1>

          {/* Subtitle */}
          <p
            className="w-full font-extrabold text-white leading-none mb-10 text-center tracking-tight"
            style={{ fontSize: 'clamp(2.5rem, 7vw, 7rem)' }}
          >
            {t('heroSubtitle')}
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 allgo-pop">
            <a
              href="/prueba-ali.html"
              className="allgo-tap allgo-cta allgo-glow inline-flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold px-8 py-4 rounded-full text-base shadow-lg shadow-orange-500/30"
            >
              🤖 {locale === 'en' ? 'Try Ali free' : 'Prueba a Ali gratis'}
            </a>
            <Link
              href="/register"
              className="allgo-tap inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/30 text-white font-semibold px-8 py-4 rounded-full text-base"
            >
              🚀 {t('heroCta')}
            </Link>
            <Link
              href="/membresia"
              className="allgo-tap inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/30 text-white font-semibold px-8 py-4 rounded-full text-base"
            >
              💎 {locale === 'en' ? 'See plans' : 'Ver planes'} →
            </Link>
          </div>

          {/* Social proof above the fold */}
          <div className="mt-10 flex flex-col items-center gap-1.5 max-w-md">
            <div className="flex items-center gap-0.5 text-orange-300 text-lg tracking-wide">★★★★★</div>
            <p className="text-white/85 text-sm sm:text-base leading-relaxed italic">
              {en
                ? '“I had no idea about the requirements to travel with my dog… AllGo saved my trip.”'
                : '“No tenía idea de los requisitos para viajar con mi perra… AllGo me salvó el viaje.”'}
            </p>
            <p className="text-white/55 text-xs">{en ? '— Sandra, traveled to Spain with Muffin 🦮' : '— Sandra, viajó a España con Muffin 🦮'}</p>
          </div>

          {/* Scroll indicator */}
          <div className="mt-12 flex flex-col items-center gap-2 text-white/40 text-xs">
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

      {/* ── TRUST BAR ── */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 py-6 grid grid-cols-2 sm:grid-cols-4 gap-5 text-center">
          {[
            { icon: '✅', label: en ? 'Verified info, with source and date' : 'Info verificada, con fuente y fecha' },
            { icon: '🚢', label: en ? 'Airlines and cruises kept up to date' : 'Aerolíneas y cruceros al día' },
            { icon: '💛', label: en ? 'Built by a family that travels with disability' : 'Creado por una familia que viaja con discapacidad' },
            { icon: '🔓', label: en ? 'Start free · cancel anytime' : 'Empieza gratis · cancela cuando quieras' },
          ].map((item, i) => (
            <div key={i} className="flex flex-col items-center gap-1.5">
              <span className="text-2xl">{item.icon}</span>
              <span className="text-gray-600 text-xs sm:text-sm font-medium leading-snug">{item.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── FAMILY BANNER ── */}
      <section className="relative">
        <div className="relative h-[300px] sm:h-[460px] w-full overflow-hidden">
          <Image
            src="/hero-familia.png"
            alt="Familia feliz viajando con su perro de servicio en el aeropuerto"
            fill
            priority
            className="object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-blue-950/80 via-blue-950/10 to-transparent" />
          <div className="absolute bottom-0 inset-x-0 p-6 sm:p-10 text-center">
            <p className="text-white text-2xl sm:text-4xl font-extrabold drop-shadow-lg">{en ? 'Family travel, without barriers 💙🧡' : 'Viajar en familia, sin barreras 💙🧡'}</p>
            <p className="text-white/85 text-sm sm:text-lg mt-2 drop-shadow">{en ? 'Real people. Real trips. With their service dog.' : 'Personas reales. Viajes reales. Con su perro de servicio.'}</p>
          </div>
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
            {FEATURES.map((f, i) => (
              <div key={f.key} style={{ animationDelay: `${i * 90}ms` }} className={`allgo-rise allgo-tap group rounded-2xl border p-6 flex gap-5 items-start ${f.color}`}>
                <div className={`${f.iconBg} text-white text-2xl w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-sm transition-transform duration-200 group-hover:scale-110`}>
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

      {/* ── MÍRALO EN ACCIÓN ── */}
      <section className="py-24 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <span className="inline-block bg-blue-100 text-blue-700 text-sm font-bold px-4 py-1.5 rounded-full mb-4">🎬 {en ? 'See it in action' : 'Míralo en acción'}</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4">{en ? 'Ask Alli. She answers with the source and the date.' : 'Pregúntale a Ali. Te responde con la fuente y la fecha.'}</h2>
            <p className="text-gray-500 max-w-xl mx-auto">{en ? 'Real airline requirements, verified and up to date. And if you prefer, talk to Alli with your voice 🎤 — no typing.' : 'Requisitos reales por aerolínea, verificados y al día. Y si prefieres, le hablas con tu voz 🎤 — sin escribir.'}</p>
          </div>
          <div className="flex gap-5 overflow-x-auto pb-4 snap-x md:flex-wrap md:justify-center md:gap-6 md:overflow-visible">
            {(en
              ? [
                  { src: '/alli-en-1.png', step: '1', label: 'You ask your question' },
                  { src: '/alli-en-2.png', step: '2', label: 'Alli answers' },
                  { src: '/alli-en-3.png', step: '3', label: 'Step by step' },
                  { src: '/alli-en-4.png', step: '4', label: 'With every detail' },
                  { src: '/alli-en-5.png', step: '5', label: 'Source & date ✅' },
                ]
              : [
                  { src: '/ali-1.png', step: '1', label: 'Haces tu pregunta' },
                  { src: '/ali-2.png', step: '2', label: 'Ali te responde' },
                  { src: '/ali-3.png', step: '3', label: 'Con cada detalle' },
                  { src: '/ali-4.png', step: '4', label: 'Fuente y fecha ✅' },
                ]
            ).map((s, i) => (
              <div key={i} style={{ animationDelay: `${i * 90}ms` }} className="allgo-rise snap-center shrink-0 w-56 flex flex-col items-center gap-3">
                <div className="rounded-3xl overflow-hidden border-4 border-gray-900 shadow-xl bg-black w-full">
                  <Image src={s.src} alt={`Alli — ${s.label}`} width={320} height={694} className="w-full h-auto" />
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-orange-500 text-white text-xs font-bold flex items-center justify-center shrink-0">{s.step}</span>
                  <span className="text-gray-700 text-sm font-medium">{s.label}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <a href="/prueba-ali.html" className="allgo-tap allgo-cta inline-flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold px-8 py-4 rounded-full text-base shadow-lg shadow-orange-500/20">
              🤖 {en ? 'Try Alli free' : 'Prueba a Ali gratis'}
            </a>
          </div>
        </div>
      </section>

      {/* ── PLANES / PRODUCTOS ── */}
      <section className="py-24 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <span className="allgo-pop inline-block bg-orange-100 text-orange-600 text-sm font-bold px-4 py-1.5 rounded-full mb-4">💎 {en ? 'Choose how to start' : 'Elige cómo empezar'}</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4">{en ? 'Travel with your service dog — no guessing' : 'Viaja con tu perro de servicio, sin adivinar nada'}</h2>
            <p className="text-gray-500 max-w-xl mx-auto">{en ? 'Verified information, with its source and date. We never make up a fact.' : 'Información verificada, con su fuente y su fecha. Nunca inventamos un dato.'}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
            {/* Membresía — destacada */}
            <div className="allgo-rise allgo-tap relative flex flex-col rounded-2xl bg-white p-7 shadow-xl border-2 border-orange-400 md:-mt-2" style={{ animationDelay: '0ms' }}>
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-orange-500 px-3 py-1 text-xs font-bold text-white whitespace-nowrap allgo-cta">🔥 {en ? 'Most popular' : 'Más popular'}</span>
              <h3 className="text-lg font-extrabold text-blue-700">{en ? 'AllGo App Membership' : 'Membresía AllGo App'}</h3>
              <p className="mt-1 text-xs text-gray-500">{en ? 'All the power of Alli, no limits' : 'Todo el poder de Ali, sin límites'}</p>
              <div className="mt-4"><span className="text-4xl font-extrabold text-gray-900">$19</span><span className="text-gray-500">{en ? '/mo' : '/mes'}</span> <span className="text-xs font-bold text-orange-500">{en ? '· founder' : '· fundador'}</span></div>
              <ul className="mt-4 space-y-2 text-sm text-gray-700 flex-1">
                <li>✅ {en ? 'Alli, your AI assistant, unlimited' : 'Ali, tu asistente con IA, ilimitada'}</li>
                <li>✅ {en ? <>Requirements by airline <b>and cruise</b> 🚢</> : <>Requisitos por aerolínea <b>y crucero</b> 🚢</>}</li>
                <li>✅ {en ? 'Service Dog Travel Hub (7 modules)' : 'Service Dog Travel Hub (7 módulos)'}</li>
                <li>✅ {en ? 'Medical card with QR' : 'Tarjeta médica con QR'}</li>
                <li>🔥 {en ? 'Limited founder spots' : 'Cupos de fundador limitados'}</li>
              </ul>
              <Link href="/membresia" className="allgo-tap allgo-cta mt-5 block rounded-full bg-orange-500 py-3 text-center font-bold text-white hover:bg-orange-600">
                {en ? 'Become a member →' : 'Hazte miembro →'}
              </Link>
              <p className="mt-3 text-center text-xs text-gray-500">🔒 {en ? 'Try Alli free · cancel anytime' : 'Prueba a Ali gratis · cancela cuando quieras'}</p>
            </div>

            {/* Ebook */}
            <div className="allgo-rise allgo-tap flex flex-col rounded-2xl bg-white p-7 shadow-sm border border-gray-100" style={{ animationDelay: '90ms' }}>
              <h3 className="text-lg font-extrabold text-blue-700">{en ? 'Guide «Travel with your Service Dog»' : 'Guía «Viaja con tu Perro de Servicio»'}</h3>
              <p className="mt-1 text-xs text-gray-500">{en ? 'The ebook with all the essentials (ES/EN)' : 'El ebook con todo lo esencial (ES/EN)'}</p>
              <div className="mt-4"><span className="text-4xl font-extrabold text-gray-900">$37</span><span className="text-gray-500">{en ? ' one-time' : ' único pago'}</span></div>
              <ul className="mt-4 space-y-2 text-sm text-gray-700 flex-1">
                <li>✅ {en ? 'Key requirements and documents' : 'Requisitos y documentos clave'}</li>
                <li>✅ {en ? 'How to avoid being turned away' : 'Cómo evitar que te rechacen'}</li>
                <li>✅ {en ? 'Instant download' : 'Descarga inmediata'}</li>
              </ul>
              <a href="https://pay.hotmart.com/Q106793737G" target="_blank" rel="noopener noreferrer" className="allgo-tap mt-5 block rounded-full border-2 border-blue-700 py-3 text-center font-bold text-blue-700 hover:bg-blue-50">
                {en ? 'Get the guide →' : 'Obtener la guía →'}
              </a>
            </div>

            {/* Gratis */}
            <div className="allgo-rise allgo-tap flex flex-col rounded-2xl bg-white p-7 shadow-sm border border-gray-100" style={{ animationDelay: '180ms' }}>
              <h3 className="text-lg font-extrabold text-blue-700">{en ? 'Start free' : 'Empieza gratis'}</h3>
              <p className="mt-1 text-xs text-gray-500">{en ? 'Try the app without paying' : 'Prueba el app sin pagar'}</p>
              <div className="mt-4"><span className="text-4xl font-extrabold text-gray-900">$0</span></div>
              <ul className="mt-4 space-y-2 text-sm text-gray-700 flex-1">
                <li>✅ {en ? 'Create your accessibility profile' : 'Crea tu perfil de accesibilidad'}</li>
                <li>✅ {en ? '3 sample airlines' : '3 aerolíneas de muestra'}</li>
                <li>✅ {en ? 'Meet Alli' : 'Conoce a Ali'}</li>
              </ul>
              <Link href="/register" className="allgo-tap mt-5 block rounded-full border-2 border-gray-200 py-3 text-center font-bold text-gray-700 hover:bg-gray-50">
                {en ? 'Create free account' : 'Crear cuenta gratis'}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIOS ── */}
      <section className="py-24 px-4 bg-gradient-to-b from-orange-50 to-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <span className="inline-block bg-orange-100 text-orange-600 text-sm font-bold px-4 py-1.5 rounded-full mb-4">⭐ {en ? 'Real families' : 'Familias reales'}</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4">{en ? 'They traveled without fear. You can too.' : 'Viajaron sin miedo. Tú también puedes.'}</h2>
            <p className="text-gray-500 max-w-xl mx-auto">{en ? 'What people who already used AllGo for their trip say.' : 'Lo que dicen quienes ya usaron AllGo para su viaje.'}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Sandra */}
            <div className="allgo-rise flex flex-col rounded-2xl bg-white p-7 shadow-md border border-orange-100" style={{ animationDelay: '0ms' }}>
              <div className="flex items-center gap-0.5 text-orange-400 text-lg mb-3">★★★★★</div>
              <p className="text-gray-700 leading-relaxed flex-1">
                {en
                  ? '“I had no idea about the microchip or that the rabies vaccine has to be 21 days ahead. AllGo explained everything, step by step. I traveled to Spain with Muffin without a single scare.”'
                  : '“No tenía idea del microchip ni de que la vacuna de la rabia va 21 días antes. AllGo me lo explicó todo, paso a paso. Viajé a España con Muffin sin un solo susto.”'}
              </p>
              <div className="mt-5 flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-orange-100 flex items-center justify-center text-xl">🦮</div>
                <div>
                  <p className="font-bold text-gray-900 text-sm">Sandra</p>
                  <p className="text-gray-400 text-xs">{en ? 'Traveled to Spain with her service dog' : 'Viajó a España con su perra de servicio'}</p>
                </div>
              </div>
            </div>

            {/* @miamiglamcreations */}
            <div className="allgo-rise flex flex-col rounded-2xl bg-white p-7 shadow-md border border-orange-100" style={{ animationDelay: '90ms' }}>
              <div className="flex items-center gap-0.5 text-orange-400 text-lg mb-3">★★★★★</div>
              <p className="text-gray-700 leading-relaxed flex-1">
                {en
                  ? '“It’s spectacular, so practical. I wish I’d had it on my past trips — it saves you doubts and stress.”'
                  : '“Es espectacular, muy práctico. Ojalá lo hubiera tenido en mis viajes anteriores — te ahorra dudas y estrés.”'}
              </p>
              <div className="mt-5 flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-blue-100 flex items-center justify-center text-xl">💬</div>
                <div>
                  <p className="font-bold text-gray-900 text-sm">@miamiglamcreations</p>
                  <p className="text-gray-400 text-xs">Instagram</p>
                </div>
              </div>
            </div>
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
            {previewDests.map((dest, i) => (
              <div key={dest.id} style={{ animationDelay: `${i * 80}ms` }} className="allgo-rise allgo-tap bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100 hover:shadow-xl group">
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
              className="allgo-tap inline-flex items-center gap-2 bg-blue-700 hover:bg-blue-800 text-white font-semibold px-8 py-3.5 rounded-full shadow-md"
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
            {en ? <>3 <span className="text-orange-400">steps</span> to your accessible trip</> : <>{' '}3 <span className="text-orange-400">pasos</span> para tu viaje accesible</>}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {[
              { num: '1', icon: '👤', titleES: 'Crea tu perfil', titleEN: 'Create your profile', descES: 'Indica tus necesidades de accesibilidad y las de cada miembro de tu grupo familiar.', descEN: 'Tell us the accessibility needs of you and each member of your group.' },
              { num: '2', icon: '🗺️', titleES: 'Elige tu destino', titleEN: 'Choose your destination', descES: '24 destinos verificados con rating de accesibilidad real y atracciones detalladas.', descEN: '24 verified destinations with real accessibility ratings and detailed attractions.' },
              { num: '3', icon: '✈️', titleES: 'Genera tu plan', titleEN: 'Generate your plan', descES: 'La IA crea un itinerario personalizado para todo tu grupo en segundos.', descEN: 'The AI creates a personalized itinerary for your whole group in seconds.' },
            ].map((step, i) => (
              <div key={step.num} style={{ animationDelay: `${i * 120}ms` }} className="allgo-pop flex flex-col items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-orange-500 text-white text-2xl flex items-center justify-center font-extrabold shadow-lg shadow-orange-500/30 allgo-float">
                  {step.num}
                </div>
                <div className="text-4xl">{step.icon}</div>
                <h3 className="font-bold text-lg">{en ? step.titleEN : step.titleES}</h3>
                <p className="text-white/70 text-sm leading-relaxed">{en ? step.descEN : step.descES}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── NUESTRA HISTORIA ── */}
      <section className="py-24 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <span className="inline-block bg-orange-100 text-orange-600 text-sm font-bold px-4 py-1.5 rounded-full mb-4">💛 {en ? 'Our Story' : 'Nuestra Historia'}</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4">{en ? 'An act of love, justice and vision' : 'Un acto de amor, justicia y visión'}</h2>
            <p className="text-gray-500 max-w-xl mx-auto">{en ? 'The story behind AllGo Travel' : 'La historia detrás de AllGo Travel'}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            {/* Photo / visual side */}
            <div className="flex flex-col items-center gap-6">
              <div className="w-64 h-80 rounded-full overflow-hidden shadow-2xl ring-4 ring-orange-100 mx-auto">
                <Image src="/yadira-familia.jpg" alt="Yadira, su familia y su perrita" width={720} height={899} className="object-cover w-full h-full" />
              </div>
              <div className="text-center">
                <p className="font-bold text-xl text-blue-700">{en ? 'Yadira and family' : 'Yadira y familia'}</p>
                <p className="text-gray-500 text-sm">{en ? 'Founder · AllGo Travel' : 'Fundadora · AllGo Travel'}</p>
                <p className="text-gray-400 text-xs mt-1">{en ? 'The story behind AllGo Travel' : 'La historia detrás de AllGo Travel'}</p>
              </div>
              <blockquote className="bg-orange-50 border-l-4 border-orange-400 rounded-r-xl px-5 py-4 max-w-sm">
                <p className="text-orange-700 font-semibold italic text-sm leading-relaxed">
                  {en ? '"Travel is for everyone. We create possible paths."' : '"Viajar es para todos. Creamos caminos posibles."'}
                </p>
              </blockquote>
            </div>

            {/* Story text - short version */}
            <div className="space-y-5 text-gray-600 leading-relaxed">
              {en ? (
                <>
                  <p className="text-lg"><strong className="text-gray-900">AllGo Travel was born where a passion met a need.</strong></p>
                  <p>Its founder, Yadira Suárez —Yadi— is Cuban-American, a healthcare professional and a tireless traveler. But above all, she is a daughter. The daughter of a father with a disability, with whom she has lived firsthand the limits the world imposes when it isn&apos;t built for everyone.</p>
                  <p>Every time she tried to plan a trip with her father, the same obstacles appeared: scarce information, infrastructure that wasn&apos;t adapted, and an industry that overlooks the real needs of this community.</p>
                  <p>That&apos;s how AllGo Travel was born — not as just an agency, but as an <strong className="text-gray-900">act of love, justice and vision</strong>. Travel experiences designed from inclusion, so people with disabilities and their families can explore the world with freedom, safety and dignity. We don&apos;t adapt standard itineraries: we design trips from scratch, with sensitivity and care in every detail.</p>
                  <p className="text-blue-700 font-semibold text-lg">Because everyone deserves to discover the world. 🌍</p>
                </>
              ) : (
                <>
                  <p className="text-lg"><strong className="text-gray-900">AllGo Travel nació del cruce entre una pasión y una necesidad.</strong></p>
                  <p>Su fundadora, Yadira Suárez —Yadi— es cubano-americana, profesional del área de salud y una viajera incansable. Pero por encima de todo, es hija. Hija de un padre con discapacidad, con quien ha vivido en carne propia las limitaciones que impone el mundo cuando no está preparado para todos.</p>
                  <p>Cada vez que intentaba planificar un viaje con su padre surgían los mismos obstáculos: escasa información, infraestructura no adaptada y una industria que no contempla las verdaderas necesidades de este público.</p>
                  <p>Así nació AllGo Travel — no como una simple agencia, sino como un <strong className="text-gray-900">acto de amor, justicia y visión</strong>. Experiencias de viaje diseñadas desde la inclusión, para que las personas con discapacidad y sus familias puedan explorar el mundo con libertad, seguridad y dignidad. Aquí no se adaptan itinerarios estándar: se diseñan viajes desde cero, con sensibilidad y cuidado en cada detalle.</p>
                  <p className="text-blue-700 font-semibold text-lg">Porque todos merecen descubrir el mundo. 🌍</p>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="py-24 px-4 bg-gray-50">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <span className="inline-block bg-blue-100 text-blue-700 text-sm font-bold px-4 py-1.5 rounded-full mb-4">❓ {en ? 'Frequently asked questions' : 'Preguntas frecuentes'}</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900">{en ? 'Before you decide, let’s clear your doubts' : 'Antes de decidir, resolvamos tus dudas'}</h2>
          </div>
          <div className="space-y-4">
            {(en
              ? [
                  { q: 'Do I have to pay to try it?', a: 'No. You can create your account and chat with Alli for free. You only pay the membership when you want all the power, without limits.' },
                  { q: 'Can I cancel anytime?', a: 'Yes. The membership is monthly with no commitment. Cancel anytime, in one click.' },
                  { q: 'Where does the information come from?', a: 'From official sources (airlines, DOT, cruise lines), always with its source and date. We never make up a fact.' },
                  { q: 'Does it work for cruises, not just flights?', a: 'Yes. It includes requirements by airline and by cruise 🚢, plus the Service Dog Travel Hub with 7 modules.' },
                  { q: 'Does it work on my phone?', a: 'Yes. AllGo works on phone, tablet and computer. Nothing to download — you can even talk to Alli with your voice 🎤.' },
                ]
              : [
                  { q: '¿Tengo que pagar para probar?', a: 'No. Puedes crear tu cuenta y hablar con Ali gratis. Solo pagas la membresía cuando quieras todo el poder, sin límites.' },
                  { q: '¿Puedo cancelar cuando quiera?', a: 'Sí. La membresía es mensual y sin permanencia. Cancelas cuando quieras, en un clic.' },
                  { q: '¿De dónde sale la información?', a: 'De fuentes oficiales (aerolíneas, DOT, navieras), siempre con su fuente y su fecha. Nunca inventamos un dato.' },
                  { q: '¿Sirve para cruceros, no solo aviones?', a: 'Sí. Incluye requisitos por aerolínea y por crucero 🚢, además del Service Dog Travel Hub con 7 módulos.' },
                  { q: '¿Funciona en mi teléfono?', a: 'Sí. AllGo funciona en teléfono, tablet y computadora. No tienes que descargar nada — le puedes hablar a Ali con tu voz 🎤.' },
                ]
            ).map((item, i) => (
              <details key={i} className="group rounded-2xl bg-white border border-gray-100 shadow-sm px-6 py-4 [&_summary]:list-none">
                <summary className="flex items-center justify-between cursor-pointer font-bold text-gray-900">
                  {item.q}
                  <span className="text-orange-500 text-xl transition-transform group-open:rotate-45">+</span>
                </summary>
                <p className="mt-3 text-gray-600 text-sm leading-relaxed">{item.a}</p>
              </details>
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
              className="allgo-tap allgo-cta inline-flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold px-8 py-4 rounded-full text-base shadow-lg shadow-orange-500/20"
            >
              🚀 {t('ctaRegister')}
            </Link>
            <Link
              href="/membresia"
              className="allgo-tap inline-flex items-center justify-center gap-2 border-2 border-blue-700 text-blue-700 hover:bg-blue-50 font-semibold px-8 py-4 rounded-full text-base"
            >
              💎 {en ? 'See plans' : 'Ver planes'}
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
            <span className="font-bold text-white">AllGo Travel App</span>
            <span className="text-gray-500 text-xs">· {t('footerTagline')}</span>
          </div>
          <div className="flex gap-4 text-gray-500 text-xs">
            <Link href="/nosotros" className="hover:text-white transition">{en ? 'Our Story' : 'Nuestra Historia'}</Link>
            <Link href="/membresia" className="hover:text-white transition">{en ? 'Plans' : 'Planes'}</Link>
          </div>
          <div className="text-center sm:text-right">
            <p className="text-gray-400 text-xs">All Go Travel LLC · Weston, FL 🇺🇸</p>
            <p className="text-gray-500 text-xs mt-0.5">© 2026 AllGo Travel App. {t('footerRights')}</p>
          </div>
        </div>
      </footer>

    </div>
  )
}
