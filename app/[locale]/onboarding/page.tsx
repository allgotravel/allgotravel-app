'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { useRouter } from '@/i18n/navigation'
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
  { id: 'motriz',            emoji: '♿',  es: 'Movilidad reducida',    en: 'Reduced mobility' },
  { id: 'visual',            emoji: '👁️', es: 'Discapacidad visual',   en: 'Visual impairment' },
  { id: 'auditiva',          emoji: '👂', es: 'Discapacidad auditiva', en: 'Hearing impairment' },
  { id: 'autismo',           emoji: '🧩', es: 'Autismo',               en: 'Autism' },
  { id: 'cognitiva',         emoji: '🧠', es: 'Discapacidad cognitiva',en: 'Cognitive disability' },
  { id: 'cronica_invisible', emoji: '🫀', es: 'Enfermedad invisible',  en: 'Invisible illness' },
  { id: 'animal_servicio',   emoji: '🐕', es: 'Animal de servicio',    en: 'Service animal' },
  { id: 'mixta',             emoji: '👨‍👩‍👧', es: 'Viajo con familia',   en: 'Traveling with family' },
]

type T = (es: string, en: string) => string
type FamilyMember = { name: string; disability: string }

// ─── Step 0: Welcome ──────────────────────────────────────────────────────

function StepWelcome({ t, onNext }: { t: T; onNext: () => void }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 pt-20 pb-16 text-center">
      {/* Logo with pulsing ring */}
      <div className="relative mb-8">
        <div
          className="absolute -inset-4 rounded-full bg-orange-400/25"
          style={{ animation: 'pulseRing 2s ease-out infinite' }}
        />
        <div
          className="absolute -inset-8 rounded-full bg-orange-400/10"
          style={{ animation: 'pulseRing 2s ease-out infinite 0.4s' }}
        />
        <div
          className="relative w-32 h-32 rounded-full overflow-hidden ring-4 ring-white/25 shadow-2xl shadow-blue-950/80"
          style={{ animation: 'floatY 3s ease-in-out infinite' }}
        >
          <Image src="/logo-allgo.jpg" alt="AllGo Travel" fill className="object-cover" />
        </div>
      </div>

      <h1 className="text-4xl sm:text-5xl font-extrabold text-white leading-tight mb-3">
        {t('Bienvenido a', 'Welcome to')}{' '}
        <span className="text-orange-400">AllGo Travel</span>{' '}
        <span className="inline-block" style={{ animation: 'floatY 2s ease-in-out infinite 0.2s' }}>🌍</span>
      </h1>
      <p className="text-white/65 text-lg mb-12 max-w-xs">
        {t('Tu compañero de viajes accesibles', 'Your accessible travel companion')}
      </p>

      {/* Alli speech bubble */}
      <div
        className="relative bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl rounded-bl-sm px-5 py-4 max-w-xs mb-14 text-left"
        style={{ animation: 'floatY 4s ease-in-out infinite 0.8s' }}
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

      <button
        onClick={onNext}
        className="bg-orange-500 hover:bg-orange-400 active:scale-95 text-white font-extrabold text-xl px-14 py-5 rounded-full shadow-2xl shadow-orange-500/40 transition-all duration-200"
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
      <div className="text-6xl mb-6 select-none" style={{ animation: 'floatY 3.5s ease-in-out infinite' }}>
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
        <div className="text-5xl mb-4 select-none" style={{ animation: 'floatY 3s ease-in-out infinite' }}>
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

      {/* Family member form */}
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

// ─── Step 4: All Done! ────────────────────────────────────────────────────

function StepDone({
  t,
  firstName,
  onNext,
  saving,
}: {
  t: T
  firstName: string
  onNext: () => void
  saving: boolean
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

      {/* Celebration content */}
      <div className="relative z-20">
        <div
          className="text-8xl sm:text-9xl mb-6 select-none leading-none"
          style={{ animation: 'celebrationPop 0.8s cubic-bezier(0.36, 0.07, 0.19, 0.97) both' }}
        >
          🎉
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-3 leading-tight">
          {t(`¡Todo listo, ${firstName}!`, `You're all set, ${firstName}!`)}
        </h1>
        <p className="text-white/70 mb-10 max-w-xs mx-auto text-base">
          {t(
            'Alli ya conoce tus necesidades. ¡Empieza a explorar!',
            'Alli now knows your needs. Start exploring!'
          )}
        </p>

        {/* Benefit icons row */}
        <div className="flex justify-center gap-5 mb-12">
          {[
            { icon: '✈️', label: t('Destinos', 'Destinations') },
            { icon: '🤖', label: 'Alli' },
            { icon: '🗺️', label: t('Planificador', 'Planner') },
          ].map((b, i) => (
            <div
              key={b.label}
              className="flex flex-col items-center gap-2"
              style={{ animation: `fadeInUp 0.4s ease-out ${(i * 0.1 + 0.3).toFixed(1)}s both` }}
            >
              <div className="w-16 h-16 bg-white/15 backdrop-blur-sm border border-white/20 rounded-2xl flex items-center justify-center text-2xl shadow-lg shadow-black/20">
                {b.icon}
              </div>
              <span className="text-white/70 text-xs font-semibold">{b.label}</span>
            </div>
          ))}
        </div>

        <button
          onClick={onNext}
          disabled={saving}
          className="bg-orange-500 hover:bg-orange-400 active:scale-95 disabled:opacity-50 text-white font-extrabold text-xl px-14 py-5 rounded-full shadow-2xl shadow-orange-500/40 transition-all duration-200"
          style={{
            animation: saving ? undefined : 'floatY 2.5s ease-in-out infinite',
          }}
        >
          {saving ? '···' : t('¡Ir al Dashboard!', 'Go to Dashboard!')}
          {!saving && ' 🚀'}
        </button>
      </div>
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────

export default function OnboardingPage() {
  const locale = useLocale()
  const isES = locale === 'es'
  const t: T = (es, en) => (isES ? es : en)

  const router = useRouter()
  const supabase = createSupabaseBrowser()

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

    if (step === 4) {
      if (uid) {
        await supabase.from('profiles').update({ onboarding_completed: true }).eq('id', uid)
      }
      router.push('/dashboard')
    } else {
      goTo(step + 1)
    }
  }

  const toggle = (id: string) =>
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id]
    )

  const displayName = firstName.trim() || t('viajero/a', 'traveler')

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
          from { opacity: 0; transform: translateY(10px); }
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
        .slide-right { animation: slideFromRight 0.38s cubic-bezier(0.22, 1, 0.36, 1) both; }
        .slide-left  { animation: slideFromLeft  0.38s cubic-bezier(0.22, 1, 0.36, 1) both; }
      `}</style>

      <div className="relative min-h-screen overflow-x-hidden bg-gradient-to-br from-blue-950 via-blue-800 to-teal-700">

        {/* Ambient blobs */}
        <div className="fixed top-10 right-8 w-80 h-80 bg-orange-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="fixed bottom-8 left-6 w-96 h-96 bg-teal-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="fixed top-1/2 left-1/4 w-56 h-56 bg-blue-400/10 rounded-full blur-2xl pointer-events-none" />
        <div className="fixed top-3/4 right-1/4 w-40 h-40 bg-orange-300/8 rounded-full blur-2xl pointer-events-none" />

        {/* Progress dots */}
        <div className="fixed top-0 inset-x-0 z-50 flex justify-center items-center gap-3 py-4">
          {Array.from({ length: 5 }, (_, i) => (
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
                transform: i === step ? 'scale(1)' : 'scale(1)',
              }}
            />
          ))}
        </div>

        {/* Back button — steps 1–3 only */}
        {step > 0 && step < 4 && (
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
            <StepDone
              t={t}
              firstName={displayName}
              onNext={handleNext}
              saving={saving}
            />
          )}
        </div>
      </div>
    </>
  )
}
