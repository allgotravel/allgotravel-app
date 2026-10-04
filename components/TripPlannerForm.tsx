'use client'

import { useState } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import type { Profile } from '@/types/profile'
import { DISABILITY_ICONS } from '@/types/profile'

interface Props {
  profile: Profile
}

interface DiagnosisItem { area: string; status: 'ok' | 'warn'; note: string }
interface Diagnosis { title: string; items: DiagnosisItem[]; tema: 'perro' | 'movilidad' }

const TRIP_TYPES = {
  relax: { es: 'Descanso y relax', en: 'Rest & relaxation', icon: '🌴' },
  cultural: { es: 'Turismo cultural', en: 'Cultural tourism', icon: '🏛️' },
  naturaleza: { es: 'Naturaleza y ecoturismo', en: 'Nature & ecotourism', icon: '🌿' },
  aventura: { es: 'Aventura adaptada', en: 'Adapted adventure', icon: '🧗' },
  playa: { es: 'Playa y sol', en: 'Beach & sun', icon: '🏖️' },
  ciudad: { es: 'Turismo urbano', en: 'City break', icon: '🏙️' },
}

export default function TripPlannerForm({ profile }: Props) {
  const t = useTranslations('planner')
  const tD = useTranslations('disabilities')
  const locale = useLocale()

  const [destination, setDestination] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [tripType, setTripType] = useState('relax')
  const [plan, setPlan] = useState<Diagnosis | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const isGroup = profile.is_group_profile && profile.group_members?.length > 0

  async function generatePlan(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setPlan(null)
    setError('')

    try {
      const res = await fetch('/api/planificador', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ destination, startDate, endDate, tripType, locale }),
      })

      if (res.status === 401) {
        setError(locale === 'es' ? 'Inicia sesión para usar el planificador.' : 'Please log in to use the planner.')
        return
      }
      if (res.status === 403) {
        window.location.href = `/${locale}/paywall?tema=movilidad`
        return
      }
      if (res.status === 429) {
        setError(locale === 'es' ? 'Llegaste al límite de diagnósticos de hoy. Intenta de nuevo mañana.' : "You've reached today's limit. Please try again tomorrow.")
        return
      }
      if (!res.ok) throw new Error('Error generating plan')
      setPlan((await res.json()) as Diagnosis)
    } catch {
      setError(locale === 'es' ? 'Ocurrió un error. Por favor intenta de nuevo.' : 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">

      {/* Group summary */}
      {isGroup && (
        <div className="bg-white rounded-2xl shadow p-5 space-y-3">
          <h2 className="text-base font-semibold text-blue-700 flex items-center gap-2">
            👨‍👩‍👧 {t('groupSummary')}
          </h2>
          <div className="space-y-2">
            {/* Main traveler */}
            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl">
              <span className="text-2xl">🧳</span>
              <div>
                <p className="text-sm font-medium text-gray-800">{profile.full_name || t('mainTraveler')}</p>
                <p className="text-xs text-gray-500">
                  {profile.disability_types.map(d => `${DISABILITY_ICONS[d]} ${tD(d)}`).join(' · ') || t('noNeeds')}
                </p>
              </div>
            </div>
            {/* Group members */}
            {profile.group_members.map((m, i) => (
              <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <span className="text-2xl">👤</span>
                <div>
                  <p className="text-sm font-medium text-gray-800">
                    {m.name}{m.age ? ` · ${m.age} ${locale === 'es' ? 'años' : 'y/o'}` : ''}
                  </p>
                  <p className="text-xs text-gray-500">
                    {m.disability_types.length
                      ? m.disability_types.map(d => `${DISABILITY_ICONS[d]} ${tD(d)}`).join(' · ')
                      : t('noNeeds')}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-400">{t('groupHint')}</p>
        </div>
      )}

      {/* Plan form */}
      <form onSubmit={generatePlan} className="bg-white rounded-2xl shadow p-6 space-y-5">
        <h2 className="text-base font-semibold text-blue-700">{t('planDetails')}</h2>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('destination')}</label>
          <input
            type="text"
            required
            value={destination}
            onChange={e => setDestination(e.target.value)}
            placeholder={t('destinationPlaceholder')}
            className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('startDate')}</label>
            <input
              type="date"
              required
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              className="w-full min-w-0 max-w-full appearance-none bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('endDate')}</label>
            <input
              type="date"
              required
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
              className="w-full min-w-0 max-w-full appearance-none bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">{t('tripType')}</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {Object.entries(TRIP_TYPES).map(([key, val]) => (
              <button
                key={key}
                type="button"
                onClick={() => setTripType(key)}
                className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 text-xs transition
                  ${tripType === key
                    ? 'border-blue-500 bg-blue-50 text-blue-800 font-semibold'
                    : 'border-gray-200 text-gray-600 hover:border-blue-300'}`}
              >
                <span className="text-xl">{val.icon}</span>
                <span>{locale === 'es' ? val.es : val.en}</span>
              </button>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition text-sm"
        >
          {loading ? t('generating') : t('generate')}
        </button>

        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
      </form>

      {/* Diagnóstico corto */}
      {loading && (
        <div className="bg-white rounded-2xl shadow p-6 text-sm text-blue-500">
          {locale === 'es' ? 'Analizando tu viaje…' : 'Analyzing your trip…'}
        </div>
      )}
      {plan && !loading && (
        <div className="bg-white rounded-2xl shadow p-6">
          <h2 className="text-base font-bold text-blue-700 mb-4 break-words">✈️ {plan.title}</h2>
          <ul className="space-y-3">
            {plan.items.map(item => (
              <li key={item.area} className="flex gap-3 min-w-0">
                <span className="shrink-0 text-lg leading-6">{item.status === 'ok' ? '✓' : '⚠️'}</span>
                <span className="min-w-0">
                  <span className="block text-sm font-semibold text-gray-800 break-words">{item.area}</span>
                  <span className="block text-xs text-gray-500 break-words">{item.note}</span>
                </span>
              </li>
            ))}
          </ul>
          <a
            href={`/${locale}/paywall?tema=${plan.tema}`}
            className="mt-5 block w-full text-center bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm py-3 rounded-xl"
          >
            {locale === 'es' ? 'Desbloquear mi preparación completa →' : 'Unlock my complete preparation →'}
          </a>
        </div>
      )}

      {/* Booking platforms — shown once plan is ready */}
      {plan && !loading && (
        <div className="bg-white rounded-2xl shadow p-6 space-y-4">
          <h2 className="text-base font-semibold text-blue-700 flex items-center gap-2">
            🔗 {locale === 'es' ? `Reservar en ${destination}` : `Book in ${destination}`}
          </h2>

          <div className="space-y-3">
            {/* Hotels */}
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase mb-2">🏨 {locale === 'es' ? 'Hoteles accesibles' : 'Accessible hotels'}</p>
              <div className="flex flex-wrap gap-2">
                {[
                  { name: 'Booking.com', url: `https://www.booking.com/search.html?ss=${encodeURIComponent(destination)}`, color: 'bg-blue-600' },
                  { name: 'Expedia', url: `https://www.expedia.com/Hotel-Search?destination=${encodeURIComponent(destination)}`, color: 'bg-yellow-500' },
                  { name: 'Hotels.com', url: `https://www.hotels.com/search.do?q-destination=${encodeURIComponent(destination)}`, color: 'bg-red-600' },
                  { name: 'Airbnb', url: `https://www.airbnb.com/s/${encodeURIComponent(destination)}/homes`, color: 'bg-rose-500' },
                ].map(p => (
                  <a key={p.name} href={p.url} target="_blank" rel="noopener noreferrer"
                    className={`${p.color} text-white text-xs font-semibold px-3 py-1.5 rounded-full hover:opacity-90 transition`}>
                    {p.name}
                  </a>
                ))}
              </div>
            </div>

            {/* Flights */}
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase mb-2">✈️ {locale === 'es' ? 'Vuelos' : 'Flights'}</p>
              <div className="flex flex-wrap gap-2">
                {[
                  { name: 'Google Flights', url: `https://www.google.com/travel/flights?q=${encodeURIComponent('flights to ' + destination)}`, color: 'bg-indigo-600' },
                  { name: 'Kayak', url: `https://www.kayak.com/flights/to-${encodeURIComponent(destination)}`, color: 'bg-orange-500' },
                  { name: 'Skyscanner', url: `https://www.skyscanner.com/flights-to/${encodeURIComponent(destination.toLowerCase())}`, color: 'bg-blue-600' },
                ].map(p => (
                  <a key={p.name} href={p.url} target="_blank" rel="noopener noreferrer"
                    className={`${p.color} text-white text-xs font-semibold px-3 py-1.5 rounded-full hover:opacity-90 transition`}>
                    {p.name}
                  </a>
                ))}
              </div>
            </div>

            {/* Activities & Cars */}
            <div className="flex flex-wrap gap-6">
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase mb-2">🎭 {locale === 'es' ? 'Actividades' : 'Activities'}</p>
                <div className="flex flex-wrap gap-2">
                  {[
                    { name: 'Viator', url: `https://www.viator.com/search/${encodeURIComponent(destination)}`, color: 'bg-blue-600' },
                    { name: 'GetYourGuide', url: `https://www.getyourguide.com/s/?q=${encodeURIComponent(destination)}`, color: 'bg-purple-600' },
                  ].map(p => (
                    <a key={p.name} href={p.url} target="_blank" rel="noopener noreferrer"
                      className={`${p.color} text-white text-xs font-semibold px-3 py-1.5 rounded-full hover:opacity-90 transition`}>
                      {p.name}
                    </a>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase mb-2">🚗 {locale === 'es' ? 'Autos' : 'Cars'}</p>
                <a href={`https://www.rentalcars.com/SearchResults.do?location=${encodeURIComponent(destination)}`}
                  target="_blank" rel="noopener noreferrer"
                  className="inline-block bg-sky-600 text-white text-xs font-semibold px-3 py-1.5 rounded-full hover:opacity-90 transition">
                  Rentalcars.com
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
