'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { useRouter, usePathname } from '@/i18n/navigation'
import { useLocale } from 'next-intl'
import { createSupabaseBrowser } from '@/lib/supabase-browser'

// ── Deterministic pseudo-random – avoids SSR/client hydration mismatch ────
function pr(seed: number): number {
  return ((seed * 9301 + 49297) % 233280) / 233280
}

const CONFETTI_COLORS = ['#F97316', '#1B6FB5', '#0D9488', '#FBBF24', '#EC4899', '#8B5CF6', '#10B981']
const CONFETTI_DATA = Array.from({ length: 60 }, (_, i) => ({
  left: `${(pr(i * 13 + 1) * 100).toFixed(1)}%`,
  color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
  delay: `${(pr(i * 7 + 2) * 1.6).toFixed(2)}s`,
  dur: `${(1.4 + pr(i * 3 + 3) * 1.2).toFixed(2)}s`,
  size: Math.round(4 + pr(i * 11 + 4) * 8),
  isRect: i % 3 !== 0,
  initRot: Math.round(pr(i * 17 + 5) * 180),
}))

const DISABILITY_OPTIONS = [
  { id: 'motriz',            emoji: '♿',  es: 'Movilidad reducida',     en: 'Reduced mobility' },
  { id: 'visual',            emoji: '👁️', es: 'Discapacidad visual',    en: 'Visual impairment' },
  { id: 'auditiva',          emoji: '👂', es: 'Discapacidad auditiva',  en: 'Hearing impairment' },
  { id: 'autismo',           emoji: '🧩', es: 'Autismo',                en: 'Autism' },
  { id: 'cognitiva',         emoji: '🧠', es: 'Discapacidad cognitiva', en: 'Cognitive disability' },
  { id: 'cronica_invisible', emoji: '🫀', es: 'Enfermedad invisible',   en: 'Invisible illness' },
  { id: 'animal_servicio',   emoji: '🐕', es: 'Animal de servicio',     en: 'Service animal' },
  { id: 'mixta',             emoji: '👨‍👩‍👧', es: 'Viajo con familia',   en: 'Traveling with family' },
]

const FEATURES = [
  { es: '🌍 Alli, tu asistente IA — responde en segundos, 24/7',           en: '🌍 Alli, your AI assistant — responds in seconds, 24/7' },
  { es: '✈️ Planificador de viajes personalizado a tu discapacidad',       en: '✈️ Trip planner personalized to your disability' },
  { es: '🗺️ 24+ destinos con rating real de accesibilidad verificado',     en: '🗺️ 24+ destinations with verified real accessibility ratings' },
  { es: '🏥 Tarjeta Médica de Viaje — lista para imprimir o mostrar',      en: '🏥 Travel Medical Card — ready to print or show' },
  { es: '💬 Tarjeta de Comunicación de emergencia en tu idioma',           en: '💬 Emergency Communication Card in your language' },
  { es: '🐕 Guías de regulaciones para animales de servicio en 22 países', en: '🐕 Service animal regulation guides for 22 countries' },
  { es: '📱 Funciona en iPhone, Android y tablet — siempre contigo',       en: '📱 Works on iPhone, Android and tablet — always with you' },
  { es: '🇺🇸🇲🇽 Todo en español e inglés — sin barreras de idioma',       en: '🇺🇸🇲🇽 Everything in English and Spanish — no language barriers' },
]

type T = (es: string, en: string) => string
type FamilyMember = { name: string; disability: string }

// ─── Step 0: Welcome ──────────────────────────────────────────────────────

// Animated letter-by-letter component
function AnimatedWord({ text, color, baseDelay = 0 }: { text: string; color: string; baseDelay?: number }) {
  return (
    <span>
      {text.split('').map((char, i) => (
        <span
          key={i}
          className="inline-block"
          style={{
            animation: `letterPop 0.5s cubic-bezier(0.36, 0.07, 0.19, 0.97) ${(baseDelay + i * 0.06).toFixed(2)}s both`,
            color: char === ' ' ? 'transparent' : color,
          }}
        >
          {char === ' ' ? ' ' : char}
        </span>
      ))}
    </span>
  )
}

function StepWelcome({ t, onNext }: { t: T; onNext: () => void }) {
  const brandName = 'AllGo Travel'
  const greeting = t('Bienvenido a', 'Welcome to')

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 pt-20 pb-16 text-center">
      {/* Logo with triple pulsing ring */}
      <div className="relative mb-6">
        <div
          className="absolute -inset-3 rounded-full bg-orange-400/30"
          style={{ animation: 'pulseRing 2.2s ease-out infinite' }}
        />
        <div
          className="absolute -inset-6 rounded-full bg-orange-400/15"
          style={{ animation: 'pulseRing 2.2s ease-out infinite 0.5s' }}
        />
        <div
          className="absolute -inset-10 rounded-full bg-teal-400/10"
          style={{ animation: 'pulseRing 2.2s ease-out infinite 1s' }}
        />
        <div
          className="relative w-28 h-28 rounded-full overflow-hidden ring-4 ring-white/30 shadow-2xl shadow-blue-950/80"
          style={{ animation: 'floatY 3s ease-in-out infinite' }}
        >
          <Image src="/logo-allgo.jpg" alt="AllGo Travel" fill className="object-cover" />
        </div>
      </div>

      {/* Animated title */}
      <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight mb-2" style={{ animation: 'fadeInUp 0.4s ease-out 0.1s both' }}>
        <span className="text-white/80">{greeting} </span>
      </h1>
      <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight mb-3">
        <AnimatedWord text={brandName} color="#F97316" baseDelay={0.3} />
        {' '}
        <span className="inline-block" style={{ animation: 'floatY 2s ease-in-out infinite 1.2s, fadeInUp 0.4s ease-out 1.1s both' }}>
          🌍
        </span>
      </h1>

      <p className="text-white/60 text-base mb-8 max-w-xs" style={{ animation: 'fadeInUp 0.5s ease-out 1.3s both' }}>
        {t('Tu compañero de viajes accesibles', 'Your accessible travel companion')}
      </p>

      {/* Alli speech bubble */}
      <div
        className="relative bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl rounded-bl-sm px-5 py-4 max-w-xs mb-7 text-left"
        style={{ animation: 'fadeInUp 0.5s ease-out 1.5s both, floatY 4s ease-in-out infinite 2.5s' }}
      >
        <div className="flex items-start gap-3">
          <span className="text-3xl shrink-0 leading-none mt-0.5">🌍</span>
          <p className="text-white/90 text-sm leading-relaxed">
            {t(
              '¡Hola! Estoy aquí para ayudarte a viajar sin límites.',
              "Hi! I'm here to help you travel without limits."
            )}
          </p>
        </div>
        <div
          className="absolute -bottom-2.5 left-5 w-5 h-5 bg-white/10 border-b border-l border-white/20"
          style={{ transform: 'rotate(-45deg)', borderRadius: '0 0 0 6px' }}
        />
      </div>

      {/* Emotional hook — splash explosion */}
      <div className="w-full max-w-xs mb-9 relative">
        <div className="border-t border-white/20 pt-5">
          <p
            className="text-white/55 text-sm text-center leading-relaxed"
            style={{ animation: 'fadeInUp 0.5s ease-out 1.8s both' }}
          >
            {t(
              'El 87% de las personas con discapacidad dicen que viajar es complicado.',
              '87% of people with disabilities say travel is complicated.'
            )}
          </p>

          {/* SPLASH container */}
          <div className="relative flex items-center justify-center mt-4">
            {/* Burst rings — loop every 4s */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="absolute w-48 h-12 rounded-full bg-orange-400/30"
                style={{ animation: 'splashRing 4s ease-out 2.2s infinite' }} />
              <div className="absolute w-64 h-16 rounded-full bg-orange-400/20"
                style={{ animation: 'splashRing 4s ease-out 2.5s infinite' }} />
              <div className="absolute w-80 h-20 rounded-full bg-orange-300/15"
                style={{ animation: 'splashRing 4s ease-out 2.8s infinite' }} />
            </div>
            {/* Spark dots — loop every 4s */}
            {[0,45,90,135,180,225,270,315].map((deg, i) => (
              <div
                key={i}
                className="absolute w-2.5 h-2.5 rounded-full bg-orange-400"
                style={{
                  animation: `spark 4s ease-out ${(2.2 + i * 0.05).toFixed(2)}s infinite`,
                  ['--spark-x' as string]: `${Math.cos(deg * Math.PI / 180) * 70}px`,
                  ['--spark-y' as string]: `${Math.sin(deg * Math.PI / 180) * 30}px`,
                }}
              />
            ))}
            {/* The text itself */}
            <p
              className="relative z-10 text-orange-400 text-2xl font-extrabold text-center leading-tight px-2"
              style={{
                animation: 'splashText 0.7s cubic-bezier(0.36, 0.07, 0.19, 0.97) 2.1s both, splashGlow 2s ease-in-out 2.8s infinite',
              }}
            >
              {t('AllGo Travel lo hace posible.', 'AllGo Travel makes it possible.')}
            </p>
          </div>
        </div>
      </div>

      <button
        onClick={onNext}
        className="bg-orange-500 hover:bg-orange-400 active:scale-95 text-white font-extrabold text-xl px-14 py-5 rounded-full shadow-2xl shadow-orange-500/40 transition-all duration-200"
        style={{ animation: 'fadeInUp 0.5s ease-out 2.1s both' }}
      >
        {t('Comenzar', 'Get started')} ✨
      </button>
    </div>
  )
}

// ─── Step 1: Name ─────────────────────────────────────────────────────────

function StepName({
  t,
  firstName,
  setFirstName,
  onNext,
  saving,
}: {
  t: T
  firstName: string
  setFirstName: (v: string) => void
  onNext: () => void
  saving: boolean
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 pt-20 pb-16 text-center">
      <div
        className="text-6xl mb-6 select-none"
        style={{ animation: 'floatY 3.5s ease-in-out infinite' }}
      >
        👤
      </div>
      <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-3">
        {t('¿Cómo te llamas?', "What's your name?")}
      </h1>
      <p className="text-white/60 text-sm mb-10 max-w-xs">
        {t(
          'Así te llamará Alli cuando chatees con ella',
          'This is how Alli will address you'
        )}
      </p>

      <div className="w-full max-w-xs mb-6">
        <input
          type="text"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          placeholder={t('Tu nombre...', 'Your name...')}
          autoFocus
          className="w-full bg-white text-gray-800 text-2xl font-bold text-center rounded-2xl px-6 py-5 outline-none focus:ring-4 focus:ring-orange-400/60 shadow-xl placeholder:text-gray-300 placeholder:font-normal transition-shadow"
          onKeyDown={(e) => e.key === 'Enter' && firstName.trim() && onNext()}
        />
      </div>

      <div className="h-8 mb-8 flex items-center justify-center">
        {firstName.trim() && (
          <p
            className="text-orange-300 text-base font-semibold"
            style={{ animation: 'fadeInUp 0.3s ease-out both' }}
          >
            {t(`¡Hola, ${firstName}! 👋`, `Hello, ${firstName}! 👋`)}
          </p>
        )}
      </div>

      <button
        onClick={onNext}
        disabled={!firstName.trim() || saving}
        className="bg-orange-500 hover:bg-orange-400 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-lg px-12 py-4 rounded-full shadow-xl shadow-orange-500/30 transition-all duration-200 min-w-[220px]"
      >
        {saving ? '···' : t('Continuar', 'Continue')} →
      </button>
    </div>
  )
}

// ─── Step 2: Accessibility Needs ──────────────────────────────────────────

function StepAccessibility({
  t,
  selected,
  toggle,
  onNext,
  saving,
}: {
  t: T
  selected: string[]
  toggle: (id: string) => void
  onNext: () => void
  saving: boolean
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 pt-20 pb-16">
      <div className="text-center mb-8 px-2">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white mb-2 leading-snug">
          {t(
            '¿Cuáles son tus necesidades de accesibilidad?',
            'What are your accessibility needs?'
          )}
        </h1>
        <p className="text-white/60 text-sm">
          {t('Selecciona todas las que apliquen', 'Select all that apply')}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 w-full max-w-sm mb-8">
        {DISABILITY_OPTIONS.map((opt) => {
          const sel = selected.includes(opt.id)
          return (
            <button
              key={opt.id}
              onClick={() => toggle(opt.id)}
              className={`relative flex flex-col items-center gap-2.5 p-4 rounded-2xl border-2 text-center transition-all duration-200 active:scale-95 select-none ${
                sel
                  ? 'bg-orange-500/20 border-orange-400 shadow-lg shadow-orange-500/25 scale-[1.02]'
                  : 'bg-white/10 border-white/20 hover:bg-white/15 hover:border-white/30'
              }`}
            >
              {sel && (
                <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-orange-400 flex items-center justify-center text-white text-xs font-bold shadow-md">
                  ✓
                </div>
              )}
              <span className="text-3xl leading-none">{opt.emoji}</span>
              <span className="text-white text-xs font-semibold leading-tight">
                {t(opt.es, opt.en)}
              </span>
            </button>
          )
        })}
      </div>

      <button
        onClick={onNext}
        disabled={saving}
        className="bg-orange-500 hover:bg-orange-400 active:scale-95 disabled:opacity-40 text-white font-bold text-lg px-12 py-4 rounded-full shadow-xl shadow-orange-500/30 transition-all duration-200 min-w-[220px]"
      >
        {saving ? '···' : t('Continuar', 'Continue')} →
      </button>
      <p className="text-white/35 text-xs mt-3">
        {t('Puedes saltarte este paso', 'You can skip this step')}
      </p>
    </div>
  )
}

// ─── Step 3: Travel Group ─────────────────────────────────────────────────

function StepGroup({
  t,
  travelSolo,
  setTravelSolo,
  members,
  setMembers,
  onNext,
  saving,
}: {
  t: T
  travelSolo: boolean | null
  setTravelSolo: (v: boolean) => void
  members: FamilyMember[]
  setMembers: (v: FamilyMember[]) => void
  onNext: () => void
  saving: boolean
}) {
  const updateMember = (i: number, field: keyof FamilyMember, val: string) => {
    const next = [...members]
    next[i] = { ...next[i], [field]: val }
    setMembers(next)
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 pt-20 pb-16">
      <div className="text-center mb-8">
        <div
          className="text-5xl mb-4 select-none"
          style={{ animation: 'floatY 3s ease-in-out infinite' }}
        >
          ✈️
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white mb-2">
          {t('¿Viajas con alguien?', 'Are you traveling with someone?')}
        </h1>
      </div>

      <div className="flex flex-col gap-4 w-full max-w-xs mb-6">
        {[
          {
            value: true as boolean,
            emoji: '🧳',
            title: t('Viajo solo/a', 'Traveling solo'),
            sub: t('Solo tengo mi perfil', 'Just my profile'),
          },
          {
            value: false as boolean,
            emoji: '👨‍👩‍👧',
            title: t('Viajo con familia o grupo', 'Traveling with family or group'),
            sub: t('Añadiré los perfiles del grupo', "I'll add group profiles"),
          },
        ].map((opt) => (
          <button
            key={String(opt.value)}
            onClick={() => setTravelSolo(opt.value)}
            className={`flex items-center gap-4 p-5 rounded-2xl border-2 transition-all duration-200 active:scale-[0.98] ${
              travelSolo === opt.value
                ? 'bg-orange-500/20 border-orange-400 shadow-lg shadow-orange-400/20'
                : 'bg-white/10 border-white/20 hover:bg-white/15'
            }`}
          >
            <span className="text-4xl shrink-0 select-none">{opt.emoji}</span>
            <div className="text-left flex-1 min-w-0">
              <p className="text-white font-bold text-base">{opt.title}</p>
              <p className="text-white/50 text-xs mt-0.5">{opt.sub}</p>
            </div>
            {travelSolo === opt.value && (
              <span className="text-orange-400 text-xl font-bold shrink-0">✓</span>
            )}
          </button>
        ))}
      </div>

      {travelSolo === false && (
        <div
          className="w-full max-w-xs mb-6 space-y-3"
          style={{ animation: 'fadeInUp 0.3s ease-out both' }}
        >
          {members.map((m, i) => (
            <div key={i} className="bg-white/10 border border-white/20 rounded-2xl p-4 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-white/70 text-xs font-semibold uppercase tracking-wider">
                  {t('Miembro', 'Member')} {i + 1}
                </span>
                {members.length > 1 && (
                  <button
                    onClick={() => setMembers(members.filter((_, j) => j !== i))}
                    className="text-white/40 hover:text-red-400 text-sm transition-colors px-1"
                  >
                    ✕
                  </button>
                )}
              </div>
              <input
                type="text"
                placeholder={t('Nombre', 'Name')}
                value={m.name}
                onChange={(e) => updateMember(i, 'name', e.target.value)}
                className="w-full bg-white/15 text-white placeholder:text-white/40 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-orange-400/50 transition-shadow"
              />
              <select
                value={m.disability}
                onChange={(e) => updateMember(i, 'disability', e.target.value)}
                className="w-full bg-white/15 text-white rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-orange-400/50 appearance-none cursor-pointer"
              >
                {DISABILITY_OPTIONS.map((d) => (
                  <option key={d.id} value={d.id} className="bg-blue-900 text-white">
                    {d.emoji} {t(d.es, d.en)}
                  </option>
                ))}
              </select>
            </div>
          ))}
          <button
            onClick={() => setMembers([...members, { name: '', disability: 'motriz' }])}
            className="w-full border-2 border-dashed border-white/30 hover:border-white/50 text-white/60 hover:text-white rounded-2xl py-3 text-sm font-medium transition-all duration-200"
          >
            + {t('Agregar otro miembro', 'Add another member')}
          </button>
        </div>
      )}

      <button
        onClick={onNext}
        disabled={saving || travelSolo === null}
        className="bg-orange-500 hover:bg-orange-400 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-lg px-12 py-4 rounded-full shadow-xl shadow-orange-500/30 transition-all duration-200 min-w-[220px]"
      >
        {saving ? '···' : t('Continuar', 'Continue')} →
      </button>
    </div>
  )
}

// ─── Step 4: Profile ready — transition to pricing ────────────────────────

function StepReady({
  t,
  firstName,
  onNext,
}: {
  t: T
  firstName: string
  onNext: () => void
}) {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center px-6 pt-16 pb-16 text-center overflow-hidden">
      {/* Confetti rain */}
      {CONFETTI_DATA.map((c, i) => (
        <div
          key={i}
          className="fixed pointer-events-none"
          style={{
            top: 0,
            left: c.left,
            width: c.isRect ? `${Math.round(c.size * 0.55)}px` : `${c.size}px`,
            height: c.isRect ? `${Math.round(c.size * 1.6)}px` : `${c.size}px`,
            backgroundColor: c.color,
            borderRadius: c.isRect ? '2px' : '50%',
            animation: `confettiFall ${c.dur} ${c.delay} ease-in both`,
            transform: c.isRect ? `rotate(${c.initRot}deg)` : undefined,
            zIndex: 10,
          }}
        />
      ))}

      <div className="relative z-20">
        <div
          className="text-8xl sm:text-9xl mb-6 select-none leading-none"
          style={{ animation: 'celebrationPop 0.8s cubic-bezier(0.36, 0.07, 0.19, 0.97) both' }}
        >
          🎉
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-3 leading-tight">
          {t(`¡Tu perfil está listo, ${firstName}!`, `Your profile is ready, ${firstName}!`)}
        </h1>
        <p
          className="text-white/70 mb-10 max-w-xs mx-auto text-base"
          style={{ animation: 'fadeInUp 0.5s ease-out 0.4s both' }}
        >
          {t(
            'Antes de comenzar, déjame mostrarte algo especial...',
            'Before we start, let me show you something special...'
          )}
        </p>

        <button
          onClick={onNext}
          className="bg-orange-500 hover:bg-orange-400 active:scale-95 text-white font-extrabold text-xl px-14 py-5 rounded-full shadow-2xl shadow-orange-500/40 transition-all duration-200"
          style={{ animation: 'fadeInUp 0.5s ease-out 0.7s both' }}
        >
          {t('Ver mi preview personalizado', 'See my personalized preview')} →
        </button>
      </div>
    </div>
  )
}

// ─── Step 5: Alli Value Preview (personalized) ───────────────────────────

const ALLI_INSIGHTS: Record<string, { emoji: string; es: string; en: string }> = {
  motriz: {
    emoji: '🏖️',
    es: 'Encontré 12 hoteles en Cancún con acceso en silla de ruedas, elevadores de piscina y habitaciones adaptadas.',
    en: 'I found 12 hotels in Cancún with wheelchair access, pool lifts, and adapted rooms.',
  },
  visual: {
    emoji: '🛫',
    es: 'Puedo solicitar asistencia de abordaje anticipado en tu nombre en cualquier aeropuerto del mundo.',
    en: 'I can request pre-boarding assistance on your behalf at any airport in the world.',
  },
  auditiva: {
    emoji: '💬',
    es: 'Tengo tarjetas de comunicación de emergencia listas en 5 idiomas para tu próximo viaje.',
    en: 'I have emergency communication cards ready in 5 languages for your next trip.',
  },
  autismo: {
    emoji: '🗺️',
    es: 'Antes de cada vuelo te preparo el mapa del aeropuerto y los horarios para evitar sorpresas.',
    en: 'Before each flight I'll prepare the airport map and schedules to avoid surprises.',
  },
  cognitiva: {
    emoji: '📋',
    es: 'Preparo tu itinerario paso a paso, en lenguaje simple y en el idioma que prefieras.',
    en: 'I create your itinerary step by step, in simple language and your preferred language.',
  },
  cronica_invisible: {
    emoji: '🏥',
    es: 'Identifico hospitales y farmacias cerca de tu hotel en cada destino que planifiques.',
    en: 'I find hospitals and pharmacies near your hotel for every destination you plan.',
  },
  animal_servicio: {
    emoji: '🐕',
    es: 'Tengo las regulaciones para animales de servicio en 22 países — listas para ti ahora mismo.',
    en: 'I have service animal regulations for 22 countries — ready for you right now.',
  },
  mixta: {
    emoji: '👨‍👩‍👧',
    es: 'Planifico para cada miembro de tu grupo con sus necesidades específicas en un solo viaje.',
    en: 'I plan for each group member with their specific needs in one trip.',
  },
}

function StepValuePreview({
  t,
  firstName,
  selected,
  onNext,
}: {
  t: T
  firstName: string
  selected: string[]
  onNext: () => void
}) {
  const primaryDisability = selected.find((s) => ALLI_INSIGHTS[s]) ?? ''
  const insight = primaryDisability
    ? ALLI_INSIGHTS[primaryDisability]
    : {
        emoji: '🌍',
        es: 'Puedo planificar tu viaje accesible a cualquier destino del mundo en segundos.',
        en: 'I can plan your accessible trip to any destination in the world in seconds.',
      }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 pt-20 pb-16 text-center">
      {/* Alli avatar */}
      <div className="relative mb-5">
        <div
          className="w-24 h-24 rounded-full bg-gradient-to-br from-teal-400 to-blue-500 flex items-center justify-center shadow-2xl shadow-teal-500/40"
          style={{ animation: 'floatY 3s ease-in-out infinite' }}
        >
          <span className="text-5xl">🌍</span>
        </div>
        <div className="absolute -bottom-1 -right-1 bg-green-400 w-5 h-5 rounded-full border-2 border-blue-900 flex items-center justify-center">
          <span className="text-white text-xs font-bold">✓</span>
        </div>
      </div>

      <p
        className="text-white/60 text-sm mb-3"
        style={{ animation: 'fadeInUp 0.4s ease-out 0.2s both' }}
      >
        {t(`Alli ya revisó tu perfil, ${firstName} 👀`, `Alli already reviewed your profile, ${firstName} 👀`)}
      </p>

      {/* Speech bubble — personalized insight */}
      <div
        className="relative bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl rounded-tl-sm px-6 py-5 max-w-sm mb-3 text-left"
        style={{ animation: 'fadeInUp 0.5s ease-out 0.4s both' }}
      >
        <p className="text-white text-base leading-relaxed font-medium">
          <span className="text-2xl mr-2">{insight.emoji}</span>
          {t(insight.es, insight.en)}
        </p>
        {/* Bubble tail */}
        <div
          className="absolute -top-2.5 left-5 w-5 h-5 bg-white/10 border-t border-l border-white/20"
          style={{ transform: 'rotate(45deg)', borderRadius: '4px 0 0 0' }}
        />
      </div>

      <p
        className="text-white/45 text-xs mb-10 max-w-xs leading-relaxed"
        style={{ animation: 'fadeInUp 0.4s ease-out 0.7s both' }}
      >
        {t(
          'Esto es solo una muestra. Con AllGo tienes a Alli disponible 24/7 para cada viaje.',
          'This is just a sample. With AllGo you have Alli available 24/7 for every trip.'
        )}
      </p>

      <button
        onClick={onNext}
        className="bg-orange-500 hover:bg-orange-400 active:scale-95 text-white font-extrabold text-xl px-14 py-5 rounded-full shadow-2xl shadow-orange-500/40 transition-all duration-200"
        style={{ animation: 'fadeInUp 0.5s ease-out 0.9s both' }}
      >
        {t('Ver mi plan completo', 'See my full plan')} →
      </button>
    </div>
  )
}

// ─── Step 6: Value + Pricing ──────────────────────────────────────────────

function StepPricing({ t, uid }: { t: T; uid: string | null }) { // step 6
  const router = useRouter()
  const supabase = createSupabaseBrowser()
  const [finishing, setFinishing] = useState(false)

  const finish = async (destination: string) => {
    setFinishing(true)
    if (uid) {
      await supabase.from('profiles').update({ onboarding_completed: true }).eq('id', uid)
    }
    if (destination === 'dashboard') {
      router.push('/dashboard')
    } else {
      window.location.href = destination
    }
  }

  return (
    <div className="min-h-screen overflow-y-auto flex flex-col items-center pt-8 pb-12 px-4">

      {/* 🔥 Urgency banner — founder pricing */}
      <div
        className="w-full max-w-sm mb-5 mt-10"
        style={{ animation: 'fadeInUp 0.4s ease-out 0.05s both' }}
      >
        <div className="bg-orange-500/20 border border-orange-400/50 rounded-xl px-4 py-2.5 flex items-center gap-2">
          <span className="text-lg shrink-0">🔥</span>
          <p className="text-orange-300 text-xs font-bold leading-snug">
            {t(
              'Precio de fundadores — solo por tiempo limitado. El precio subirá pronto.',
              'Founder pricing — limited time only. Price will increase soon.'
            )}
          </p>
        </div>
      </div>

      {/* Emotional hook */}
      <div
        className="text-center mb-6 max-w-xs"
        style={{ animation: 'fadeInUp 0.5s ease-out 0.15s both' }}
      >
        <p className="text-white/80 text-base italic leading-relaxed">
          {t('Tú mereces explorar el mundo.', 'You deserve to explore the world.')}
        </p>
        <p className="text-white font-bold text-lg italic leading-relaxed mt-1">
          {t(
            'Sin barreras. Sin preocupaciones. Sin límites.',
            'Without barriers. Without worries. Without limits.'
          )}
        </p>
      </div>

      {/* Headline */}
      <h1
        className="text-2xl sm:text-3xl font-extrabold text-white text-center mb-5 max-w-xs leading-snug"
        style={{ animation: 'fadeInUp 0.5s ease-out 0.25s both' }}
      >
        {t(
          'Todo esto incluido con AllGo Travel',
          'Everything included with AllGo Travel'
        )}
      </h1>

      {/* Feature list — staggered, more specific */}
      <div className="w-full max-w-sm space-y-2 mb-6">
        {FEATURES.map((f, i) => (
          <div
            key={i}
            className="flex items-center gap-3 bg-white/10 border border-white/15 rounded-xl px-4 py-2.5"
            style={{ animation: `fadeInUp 0.4s ease-out ${(i * 0.07 + 0.35).toFixed(2)}s both` }}
          >
            <span className="text-white/90 text-sm leading-snug">{t(f.es, f.en)}</span>
          </div>
        ))}
      </div>

      {/* Social proof */}
      <div
        className="flex items-center gap-2 mb-6 max-w-xs"
        style={{ animation: 'fadeInUp 0.4s ease-out 1.0s both' }}
      >
        <div className="flex -space-x-1.5 shrink-0">
          {['#F97316', '#1B6FB5', '#0D9488', '#8B5CF6'].map((c, i) => (
            <div
              key={i}
              className="w-7 h-7 rounded-full border-2 border-blue-900 flex items-center justify-center text-xs font-bold text-white shadow"
              style={{ backgroundColor: c }}
            >
              {['M', 'L', 'A', 'R'][i]}
            </div>
          ))}
        </div>
        <p className="text-white/60 text-xs leading-snug">
          {t(
            'Cientos de viajeros con discapacidad ya confían en AllGo para cada viaje',
            'Hundreds of travelers with disabilities already trust AllGo for every trip'
          )}
        </p>
      </div>

      {/* Pricing cards */}
      <div
        className="flex flex-col gap-4 w-full max-w-sm mb-4"
        style={{ animation: 'fadeInUp 0.5s ease-out 1.1s both' }}
      >
        {/* Annual — recommended */}
        <div className="relative bg-gradient-to-br from-orange-500/25 to-orange-600/10 border-2 border-orange-400 rounded-2xl p-5 shadow-xl shadow-orange-500/20">
          <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-orange-400 text-white text-xs font-extrabold px-4 py-1 rounded-full shadow-md whitespace-nowrap">
            ⭐ {t('Más popular', 'Most popular')}
          </div>

          <div className="flex items-start justify-between mb-1 mt-1">
            <div>
              <p className="text-white font-extrabold text-lg leading-tight">
                {t('Plan Anual', 'Annual Plan')}
              </p>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <span className="bg-orange-400 text-white text-xs font-bold px-2.5 py-0.5 rounded-full">
                  {t('Ahorra 46%', 'Save 46%')}
                </span>
                <span className="text-white/50 text-xs line-through">$276</span>
              </div>
            </div>
            <div className="text-right shrink-0">
              <p className="text-orange-300 font-extrabold text-3xl leading-none">$97</p>
              <p className="text-white/55 text-xs mt-0.5">{t('/año', '/year')}</p>
            </div>
          </div>

          {/* Price anchoring — per day & per month */}
          <div className="flex items-center gap-3 mb-4 mt-2">
            <span className="bg-white/10 rounded-lg px-3 py-1 text-xs text-white/80 font-semibold">
              {t('≈ $8/mes', '≈ $8/mo')}
            </span>
            <span className="bg-green-500/20 border border-green-400/40 rounded-lg px-3 py-1 text-xs text-green-300 font-semibold">
              {t('$0.27/día — menos que un café ☕', '$0.27/day — less than a coffee ☕')}
            </span>
          </div>

          <button
            onClick={() => finish('https://pay.hotmart.com/P106494873O?off=jqgv7nc8')}
            disabled={finishing}
            className="w-full bg-orange-500 hover:bg-orange-400 active:scale-[0.98] disabled:opacity-60 text-white font-extrabold text-base py-4 rounded-xl shadow-lg shadow-orange-500/30 transition-all duration-200"
          >
            {finishing ? '···' : t('Comenzar por $97/año', 'Start for $97/year')} →
          </button>
          <p className="text-center text-orange-200/70 text-xs mt-2">
            {t('✅ Pago seguro · 🔒 Garantía 7 días', '✅ Secure payment · 🔒 7-day guarantee')}
          </p>
        </div>

        {/* Monthly */}
        <div className="bg-white/10 border border-white/20 rounded-2xl p-5">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-white font-extrabold text-lg leading-tight">
                {t('Plan Mensual', 'Monthly Plan')}
              </p>
              <p className="text-white/50 text-xs mt-1">
                {t('Sin compromiso de largo plazo', 'No long-term commitment')}
              </p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-white font-extrabold text-3xl leading-none">$14.99</p>
              <p className="text-white/55 text-xs mt-0.5">{t('/mes', '/month')}</p>
            </div>
          </div>
          <button
            onClick={() => finish('https://pay.hotmart.com/P106494873O')}
            disabled={finishing}
            className="w-full bg-white/20 hover:bg-white/30 active:scale-[0.98] disabled:opacity-60 border border-white/30 text-white font-bold text-base py-4 rounded-xl transition-all duration-200"
          >
            {finishing ? '···' : t('Comenzar mensual — $14.99', 'Start monthly — $14.99')} →
          </button>
        </div>
      </div>

      {/* 7-day guarantee */}
      <div
        className="w-full max-w-sm mb-4"
        style={{ animation: 'fadeInUp 0.4s ease-out 1.3s both' }}
      >
        <div className="bg-white/5 border border-white/15 rounded-xl px-4 py-3 flex items-start gap-3">
          <span className="text-2xl shrink-0">🔒</span>
          <div>
            <p className="text-white font-bold text-sm">
              {t('Garantía de satisfacción 7 días', '7-day satisfaction guarantee')}
            </p>
            <p className="text-white/50 text-xs mt-0.5 leading-relaxed">
              {t(
                'Si no estás satisfecho en los primeros 7 días, te devolvemos tu dinero. Sin preguntas.',
                'If you\'re not satisfied in the first 7 days, we refund you. No questions asked.'
              )}
            </p>
          </div>
        </div>
      </div>

      <p className="text-white/40 text-xs text-center mb-6">
        {t('Cancela cuando quieras. Sin compromisos.', 'Cancel anytime. No commitments.')}
      </p>

      <button
        onClick={() => finish('dashboard')}
        disabled={finishing}
        className="text-white/45 hover:text-white/80 text-sm transition-colors underline underline-offset-2 disabled:opacity-40"
      >
        {t('Ya tengo membresía →', 'I already have a membership →')}
      </button>
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────

export default function OnboardingPage() {
  const locale = useLocale()
  const isES = locale === 'es'
  const t: T = (es, en) => (isES ? es : en)

  const router = useRouter()
  const pathname = usePathname()
  const supabase = createSupabaseBrowser()

  const switchLocale = (next: string) => {
    router.replace(pathname, { locale: next })
  }

  const [step, setStep] = useState(0)
  const [entryDir, setEntryDir] = useState<'right' | 'left'>('right')
  const [firstName, setFirstName] = useState('')
  const [selected, setSelected] = useState<string[]>([])
  const [travelSolo, setTravelSolo] = useState<boolean | null>(null)
  const [members, setMembers] = useState<FamilyMember[]>([{ name: '', disability: 'motriz' }])
  const [saving, setSaving] = useState(false)
  const [uid, setUid] = useState<string | null>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        router.push('/login')
        return
      }
      setUid(data.user.id)
      supabase
        .from('profiles')
        .select('full_name, disability_types')
        .eq('id', data.user.id)
        .single()
        .then(({ data: p }) => {
          if (p?.full_name) setFirstName(p.full_name)
          if (Array.isArray(p?.disability_types) && p.disability_types.length)
            setSelected(p.disability_types)
        })
    })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const goTo = (target: number) => {
    setEntryDir(target > step ? 'right' : 'left')
    setStep(target)
  }

  const handleNext = async () => {
    setSaving(true)
    try {
      if (step === 1 && uid && firstName.trim()) {
        await supabase.from('profiles').update({ full_name: firstName.trim() }).eq('id', uid)
      }
      if (step === 2 && uid) {
        await supabase.from('profiles').update({ disability_types: selected }).eq('id', uid)
      }
      if (step === 3 && uid && travelSolo === false) {
        const valid = members.filter((m) => m.name.trim())
        if (valid.length > 0) {
          try {
            await supabase.from('family_members').insert(
              valid.map((m) => ({
                user_id: uid,
                name: m.name.trim(),
                disability_type: m.disability,
              }))
            )
          } catch {
            console.log('family_members table may not exist yet — skipping')
          }
        }
      }
    } catch (err) {
      console.error('Onboarding save error:', err)
    } finally {
      setSaving(false)
    }
    goTo(step + 1)
  }

  const toggle = (id: string) =>
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id]
    )

  const displayName = firstName.trim() || t('viajero/a', 'traveler')

  // Step 6 (pricing) gets its own full-page layout — no progress dots, no back button
  const showProgress = step < 6
  const showBack = step > 0 && step < 4

  return (
    <>
      <style>{`
        @keyframes floatY {
          0%, 100% { transform: translateY(0); }
          50%       { transform: translateY(-14px); }
        }
        @keyframes pulseRing {
          0%   { transform: scale(1);   opacity: 0.7; }
          100% { transform: scale(2);   opacity: 0; }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideFromRight {
          from { opacity: 0; transform: translateX(60px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes slideFromLeft {
          from { opacity: 0; transform: translateX(-60px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes confettiFall {
          0%   { transform: translateY(-20px) rotate(0deg);   opacity: 1;   }
          100% { transform: translateY(100vh) rotate(540deg); opacity: 0.1; }
        }
        @keyframes celebrationPop {
          0%   { transform: scale(0.2) rotate(-15deg); opacity: 0; }
          60%  { transform: scale(1.2) rotate(6deg);   opacity: 1; }
          80%  { transform: scale(0.92) rotate(-3deg); }
          100% { transform: scale(1) rotate(0deg);     opacity: 1; }
        }
        @keyframes letterPop {
          0%   { opacity: 0; transform: translateY(20px) scale(0.6) rotate(-8deg); }
          60%  { opacity: 1; transform: translateY(-4px) scale(1.1) rotate(2deg); }
          80%  { transform: translateY(2px) scale(0.97) rotate(-1deg); }
          100% { opacity: 1; transform: translateY(0) scale(1) rotate(0deg); }
        }
        @keyframes shimmer {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.65; }
        }
        @keyframes splashText {
          0%   { opacity: 0; transform: scale(0.3) rotate(-6deg); filter: blur(8px); }
          55%  { opacity: 1; transform: scale(1.22) rotate(2deg); filter: blur(0); }
          75%  { transform: scale(0.95) rotate(-1deg); }
          90%  { transform: scale(1.06); }
          100% { opacity: 1; transform: scale(1) rotate(0deg); }
        }
        @keyframes splashGlow {
          0%, 100% { text-shadow: 0 0 20px rgba(249,115,22,0.8), 0 0 40px rgba(249,115,22,0.4); }
          50%       { text-shadow: 0 0 30px rgba(249,115,22,1),   0 0 60px rgba(249,115,22,0.6); }
        }
        @keyframes splashRing {
          0%, 75%, 100% { opacity: 0; transform: scale(0.1); }
          5%  { opacity: 0.8; transform: scale(0.1); }
          50% { opacity: 0.3; transform: scale(1); }
          65% { opacity: 0;   transform: scale(1.05); }
        }
        @keyframes spark {
          0%, 75%, 100% { opacity: 0; transform: translate(0,0) scale(0); }
          5%  { opacity: 1; transform: translate(0, 0) scale(1.2); }
          50% { opacity: 0.4; transform: translate(var(--spark-x), var(--spark-y)) scale(0.4); }
          65% { opacity: 0;  transform: translate(var(--spark-x), var(--spark-y)) scale(0.1); }
        }
        .slide-right { animation: slideFromRight 0.38s cubic-bezier(0.22, 1, 0.36, 1) both; }
        .slide-left  { animation: slideFromLeft  0.38s cubic-bezier(0.22, 1, 0.36, 1) both; }
      `}</style>

      <div className="relative min-h-screen overflow-x-hidden bg-gradient-to-br from-blue-950 via-blue-800 to-teal-700">

        {/* Ambient blobs */}
        <div className="fixed top-10 right-8 w-80 h-80 bg-orange-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="fixed bottom-8 left-6 w-96 h-96 bg-teal-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="fixed top-1/2 left-1/4 w-56 h-56 bg-blue-400/10 rounded-full blur-2xl pointer-events-none" />
        <div className="fixed top-3/4 right-1/4 w-40 h-40 bg-orange-300/5 rounded-full blur-2xl pointer-events-none" />

        {/* Language switcher — always visible top-right */}
        <div className="fixed top-4 right-4 z-[100] flex gap-1 bg-blue-950/80 backdrop-blur-sm border border-white/30 rounded-xl p-1.5 shadow-lg">
          <button
            onClick={() => switchLocale('es')}
            className={`px-3 py-1.5 rounded-lg text-sm font-bold transition-all duration-200 ${
              locale === 'es' ? 'bg-orange-500 text-white shadow' : 'text-white/70 hover:text-white hover:bg-white/10'
            }`}
          >
            🇲🇽 ES
          </button>
          <button
            onClick={() => switchLocale('en')}
            className={`px-3 py-1.5 rounded-lg text-sm font-bold transition-all duration-200 ${
              locale === 'en' ? 'bg-orange-500 text-white shadow' : 'text-white/70 hover:text-white hover:bg-white/10'
            }`}
          >
            🇺🇸 EN
          </button>
        </div>

        {/* Progress dots — steps 0–5 only */}
        {showProgress && (
          <div className="fixed top-0 inset-x-0 z-50 flex justify-center items-center gap-3 py-4">
            {Array.from({ length: 6 }, (_, i) => (
              <div
                key={i}
                className="rounded-full transition-all duration-500"
                style={{
                  width:  i === step ? '18px' : '10px',
                  height: i === step ? '18px' : '10px',
                  backgroundColor:
                    i < step   ? '#ffffff' :
                    i === step ? '#F97316' :
                                 'rgba(255,255,255,0.22)',
                  boxShadow:
                    i === step ? '0 0 14px rgba(249,115,22,0.75)' :
                    i < step   ? '0 0 6px rgba(255,255,255,0.4)'  : 'none',
                }}
              />
            ))}
          </div>
        )}

        {/* Back button — steps 1–3 only */}
        {showBack && (
          <button
            onClick={() => goTo(step - 1)}
            className="fixed top-3 left-4 z-50 flex items-center gap-1 text-white/55 hover:text-white transition-colors text-sm font-medium px-2 py-2"
          >
            ← {t('Atrás', 'Back')}
          </button>
        )}

        {/* Animated step container */}
        <div key={step} className={entryDir === 'right' ? 'slide-right' : 'slide-left'}>
          {step === 0 && <StepWelcome t={t} onNext={handleNext} />}
          {step === 1 && (
            <StepName
              t={t}
              firstName={firstName}
              setFirstName={setFirstName}
              onNext={handleNext}
              saving={saving}
            />
          )}
          {step === 2 && (
            <StepAccessibility
              t={t}
              selected={selected}
              toggle={toggle}
              onNext={handleNext}
              saving={saving}
            />
          )}
          {step === 3 && (
            <StepGroup
              t={t}
              travelSolo={travelSolo}
              setTravelSolo={setTravelSolo}
              members={members}
              setMembers={setMembers}
              onNext={handleNext}
              saving={saving}
            />
          )}
          {step === 4 && (
            <StepReady
              t={t}
              firstName={displayName}
              onNext={handleNext}
            />
          )}
          {step === 5 && (
            <StepValuePreview
              t={t}
              firstName={displayName}
              selected={selected}
              onNext={handleNext}
            />
          )}
          {step === 6 && <StepPricing t={t} uid={uid} />}
        </div>
      </div>
    </>
  )
}
