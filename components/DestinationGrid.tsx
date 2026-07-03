'use client'

import { useState, useMemo } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { DESTINATIONS, ATTRACTION_TYPE_LABELS, type Destination, type AttractionType } from '@/lib/destinations'
import { DISABILITY_ICONS, type DisabilityType } from '@/types/profile'

const ALL_DISABILITY_FILTERS: DisabilityType[] = ['motriz', 'visual', 'auditiva', 'autismo', 'cognitiva', 'cronica_invisible']
const ALL_ATTRACTION_FILTERS: AttractionType[] = ['termales', 'fincas', 'parques_naturales', 'spas', 'playas', 'museos', 'parques_tematicos', 'gastronomia', 'cultura']

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5" aria-label={`Accesibilidad: ${rating} de 5`}>
      {[1, 2, 3, 4, 5].map(n => (
        <span key={n} className={n <= rating ? 'text-teal-500' : 'text-gray-200'}>♿</span>
      ))}
    </div>
  )
}

interface ModalProps {
  destination: Destination
  userId: string
  onClose: () => void
}

function DestinationModal({ destination, userId, onClose }: ModalProps) {
  const locale = useLocale()
  const t = useTranslations('destinations')
  const tD = useTranslations('disabilities')
  const [aiInfo, setAiInfo] = useState('')
  const [loading, setLoading] = useState(false)
  const [requested, setRequested] = useState(false)

  const features = locale === 'es' ? destination.featuresES : destination.featuresEN
  const description = locale === 'es' ? destination.descriptionES : destination.descriptionEN

  async function askAI() {
    if (requested) return
    setRequested(true)
    setLoading(true)

    const question = locale === 'es'
      ? `Dame consejos prácticos y detallados de accesibilidad para viajar a ${destination.name}, ${destination.country}. Incluye: mejores hoteles accesibles, cómo moverse, qué actividades son más accesibles, y consejos específicos para viajeros con discapacidad motriz, visual y auditiva. Sé concreto y práctico.`
      : `Give me practical and detailed accessibility tips for traveling to ${destination.name}, ${destination.country}. Include: best accessible hotels, how to get around, which activities are most accessible, and specific tips for travelers with motor, visual, and hearing disabilities. Be concrete and practical.`

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: question }],
          userId,
          locale,
        }),
      })
      const reader = res.body?.getReader()
      const decoder = new TextDecoder()
      if (!reader) return
      let text = ''
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        text += decoder.decode(value, { stream: true })
        setAiInfo(text)
      }
    } catch {
      setAiInfo(locale === 'es' ? 'Error al cargar información. Intenta de nuevo.' : 'Error loading info. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  function renderMarkdown(text: string) {
    return (
      <div className="space-y-1 text-sm">
        {text.split('\n').map((line, i) => {
          if (line.startsWith('## ')) return <h3 key={i} className="font-bold text-teal-700 mt-3">{line.slice(3)}</h3>
          if (line.startsWith('### ')) return <h4 key={i} className="font-semibold text-teal-600 mt-2">{line.slice(4)}</h4>
          if (line.startsWith('- ') || line.startsWith('• ')) return <p key={i} className="pl-3 text-gray-700 before:content-['•'] before:mr-2 before:text-teal-400">{parseLine(line.slice(2))}</p>
          if (line.trim() === '') return <div key={i} className="h-1.5" />
          return <p key={i} className="text-gray-700">{parseLine(line)}</p>
        })}
      </div>
    )
  }

  function parseLine(text: string): React.ReactNode {
    const parts = text.split(/(\*\*[^*]+\*\*)/g)
    return parts.map((p, i) =>
      p.startsWith('**') && p.endsWith('**')
        ? <strong key={i} className="font-semibold text-gray-900">{p.slice(2, -2)}</strong>
        : p
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`${destination.bgColor} rounded-t-2xl p-6 text-white`}>
          <div className="flex items-start justify-between">
            <div>
              <span className="text-4xl">{destination.flag}</span>
              <h2 className="text-2xl font-bold mt-2">{destination.name}</h2>
              <p className="text-white/80 text-sm">{destination.country}</p>
            </div>
            <button onClick={onClose} className="text-white/70 hover:text-white text-2xl leading-none">×</button>
          </div>
          <div className="mt-3 flex items-center gap-3">
            <StarRating rating={destination.accessibilityRating} />
            <div className="flex gap-1.5">
              {destination.attractionTypes.map(a => (
                <span key={a} className="text-lg" title={locale === 'es' ? ATTRACTION_TYPE_LABELS[a].es : ATTRACTION_TYPE_LABELS[a].en}>
                  {ATTRACTION_TYPE_LABELS[a].icon}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="p-6 space-y-5">
          <p className="text-gray-600 text-sm">{description}</p>

          {/* Highlighted attractions */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase mb-3">{t('highlights')}</p>
            <div className="space-y-3">
              {destination.highlights.map((h, i) => {
                const attrLabel = ATTRACTION_TYPE_LABELS[h.type]
                const name = locale === 'es' ? h.nameES : h.nameEN
                const desc = locale === 'es' ? h.descES : h.descEN
                return (
                  <div key={i} className="bg-gray-50 rounded-xl p-3.5 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{attrLabel.icon}</span>
                      <div>
                        <p className="text-sm font-semibold text-gray-800">{name}</p>
                        <p className="text-xs text-teal-600">{locale === 'es' ? attrLabel.es : attrLabel.en}</p>
                      </div>
                    </div>
                    <p className="text-xs text-gray-600 leading-relaxed">{desc}</p>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Disability types covered */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase mb-2">{t('coveredNeeds')}</p>
            <div className="flex flex-wrap gap-2">
              {destination.disabilityTypes.map(d => (
                <span key={d} className="inline-flex items-center gap-1 text-xs bg-teal-50 text-teal-700 border border-teal-200 px-2.5 py-1 rounded-full">
                  {DISABILITY_ICONS[d]} {tD(d)}
                </span>
              ))}
            </div>
          </div>

          {/* Accessible features */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase mb-2">{t('features')}</p>
            <ul className="space-y-1.5">
              {features.map((f, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="text-teal-500 mt-0.5 shrink-0">✓</span> {f}
                </li>
              ))}
            </ul>
          </div>

          {/* Booking platforms */}
          <div className="border-t pt-4">
            <p className="text-xs font-semibold text-gray-500 uppercase mb-3">
              {locale === 'es' ? '🔗 Reservar en plataformas populares' : '🔗 Book on popular platforms'}
            </p>

            {/* Hotels */}
            <div className="mb-3">
              <p className="text-xs text-gray-400 font-medium mb-1.5">🏨 {locale === 'es' ? 'Hoteles' : 'Hotels'}</p>
              <div className="flex flex-wrap gap-2">
                {[
                  { name: 'Booking.com', url: `https://www.booking.com/search.html?ss=${encodeURIComponent(destination.name)}`, color: 'bg-blue-600' },
                  { name: 'Expedia', url: `https://www.expedia.com/Hotel-Search?destination=${encodeURIComponent(destination.name + ', ' + destination.country)}`, color: 'bg-yellow-500' },
                  { name: 'Hotels.com', url: `https://www.hotels.com/search.do?q-destination=${encodeURIComponent(destination.name)}`, color: 'bg-red-600' },
                  { name: 'Airbnb', url: `https://www.airbnb.com/s/${encodeURIComponent(destination.name)}/homes`, color: 'bg-rose-500' },
                ].map(p => (
                  <a key={p.name} href={p.url} target="_blank" rel="noopener noreferrer"
                    className={`${p.color} text-white text-xs font-semibold px-3 py-1.5 rounded-full hover:opacity-90 transition`}>
                    {p.name}
                  </a>
                ))}
              </div>
            </div>

            {/* Flights */}
            <div className="mb-3">
              <p className="text-xs text-gray-400 font-medium mb-1.5">✈️ {locale === 'es' ? 'Vuelos' : 'Flights'}</p>
              <div className="flex flex-wrap gap-2">
                {[
                  { name: 'Google Flights', url: `https://www.google.com/travel/flights?q=${encodeURIComponent('flights to ' + destination.name)}`, color: 'bg-indigo-600' },
                  { name: 'Kayak', url: `https://www.kayak.com/flights/anywhere-${encodeURIComponent(destination.name)}`, color: 'bg-orange-500' },
                  { name: 'Skyscanner', url: `https://www.skyscanner.com/flights-to/${encodeURIComponent(destination.name.toLowerCase())}`, color: 'bg-teal-600' },
                ].map(p => (
                  <a key={p.name} href={p.url} target="_blank" rel="noopener noreferrer"
                    className={`${p.color} text-white text-xs font-semibold px-3 py-1.5 rounded-full hover:opacity-90 transition`}>
                    {p.name}
                  </a>
                ))}
              </div>
            </div>

            {/* Activities & Cars */}
            <div className="flex flex-wrap gap-4">
              <div>
                <p className="text-xs text-gray-400 font-medium mb-1.5">🎭 {locale === 'es' ? 'Actividades' : 'Activities'}</p>
                <div className="flex flex-wrap gap-2">
                  {[
                    { name: 'Viator', url: `https://www.viator.com/search/${encodeURIComponent(destination.name)}`, color: 'bg-emerald-600' },
                    { name: 'GetYourGuide', url: `https://www.getyourguide.com/s/?q=${encodeURIComponent(destination.name)}`, color: 'bg-purple-600' },
                  ].map(p => (
                    <a key={p.name} href={p.url} target="_blank" rel="noopener noreferrer"
                      className={`${p.color} text-white text-xs font-semibold px-3 py-1.5 rounded-full hover:opacity-90 transition`}>
                      {p.name}
                    </a>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-400 font-medium mb-1.5">🚗 {locale === 'es' ? 'Autos' : 'Cars'}</p>
                <div className="flex flex-wrap gap-2">
                  <a href={`https://www.rentalcars.com/SearchResults.do?country=${encodeURIComponent(destination.country)}`}
                    target="_blank" rel="noopener noreferrer"
                    className="bg-sky-600 text-white text-xs font-semibold px-3 py-1.5 rounded-full hover:opacity-90 transition">
                    Rentalcars.com
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* AI info */}
          <div className="border-t pt-4">
            {!requested ? (
              <button
                onClick={askAI}
                className="w-full py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold rounded-xl transition"
              >
                🤖 {t('askAI')}
              </button>
            ) : (
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase mb-2">{t('aiTips')}</p>
                {loading && !aiInfo && (
                  <span className="inline-flex gap-1 text-teal-400">
                    <span className="animate-bounce">·</span>
                    <span className="animate-bounce [animation-delay:100ms]">·</span>
                    <span className="animate-bounce [animation-delay:200ms]">·</span>
                  </span>
                )}
                {aiInfo && renderMarkdown(aiInfo)}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

interface Props {
  userId: string
}

export default function DestinationGrid({ userId }: Props) {
  const t = useTranslations('destinations')
  const tD = useTranslations('disabilities')
  const locale = useLocale()

  const [search, setSearch] = useState('')
  const [activeDisability, setActiveDisability] = useState<DisabilityType[]>([])
  const [activeAttraction, setActiveAttraction] = useState<AttractionType[]>([])
  const [selected, setSelected] = useState<Destination | null>(null)

  function toggleDisability(type: DisabilityType) {
    setActiveDisability(prev =>
      prev.includes(type) ? prev.filter(f => f !== type) : [...prev, type]
    )
  }

  function toggleAttraction(type: AttractionType) {
    setActiveAttraction(prev =>
      prev.includes(type) ? prev.filter(f => f !== type) : [...prev, type]
    )
  }

  function clearAll() {
    setActiveDisability([])
    setActiveAttraction([])
  }

  const filtered = useMemo(() => {
    return DESTINATIONS.filter(d => {
      const matchSearch = search === '' ||
        d.name.toLowerCase().includes(search.toLowerCase()) ||
        d.country.toLowerCase().includes(search.toLowerCase())
      const matchDisability = activeDisability.length === 0 ||
        activeDisability.every(f => d.disabilityTypes.includes(f))
      const matchAttraction = activeAttraction.length === 0 ||
        activeAttraction.some(f => d.attractionTypes.includes(f))
      return matchSearch && matchDisability && matchAttraction
    })
  }, [search, activeDisability, activeAttraction])

  const hasFilters = activeDisability.length > 0 || activeAttraction.length > 0

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Search + filters */}
      <div className="bg-white rounded-2xl shadow p-5 space-y-4">
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder={t('searchPlaceholder')}
          className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
        />

        {/* Disability filter */}
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase mb-2">{t('filterBy')}</p>
          <div className="flex flex-wrap gap-2">
            {ALL_DISABILITY_FILTERS.map(type => (
              <button
                key={type}
                onClick={() => toggleDisability(type)}
                className={`inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border-2 transition
                  ${activeDisability.includes(type)
                    ? 'border-teal-500 bg-teal-50 text-teal-700 font-semibold'
                    : 'border-gray-200 text-gray-600 hover:border-teal-300'}`}
              >
                {DISABILITY_ICONS[type]} {tD(type)}
              </button>
            ))}
          </div>
        </div>

        {/* Attraction type filter */}
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase mb-2">{t('filterByAttraction')}</p>
          <div className="flex flex-wrap gap-2">
            {ALL_ATTRACTION_FILTERS.map(type => {
              const label = ATTRACTION_TYPE_LABELS[type]
              return (
                <button
                  key={type}
                  onClick={() => toggleAttraction(type)}
                  className={`inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border-2 transition
                    ${activeAttraction.includes(type)
                      ? 'border-amber-500 bg-amber-50 text-amber-700 font-semibold'
                      : 'border-gray-200 text-gray-600 hover:border-amber-300'}`}
                >
                  {label.icon} {locale === 'es' ? label.es : label.en}
                </button>
              )
            })}
            {hasFilters && (
              <button
                onClick={clearAll}
                className="text-xs text-gray-400 hover:text-gray-600 px-2 underline"
              >
                {t('clearFilters')}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Results count */}
      <p className="text-sm text-gray-500 px-1">
        {filtered.length} {t('results')}
      </p>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map(dest => {
          const features = locale === 'es' ? dest.featuresES : dest.featuresEN
          return (
            <button
              key={dest.id}
              onClick={() => setSelected(dest)}
              className="bg-white rounded-2xl shadow hover:shadow-lg transition-shadow text-left overflow-hidden group"
            >
              {/* Color header */}
              <div className={`${dest.bgColor} h-32 flex items-center justify-center relative`}>
                <span className="text-6xl group-hover:scale-110 transition-transform">{dest.flag}</span>
                {/* Attraction type pills */}
                <div className="absolute bottom-2 left-2 flex gap-1">
                  {dest.attractionTypes.slice(0, 4).map(a => (
                    <span key={a} className="text-base bg-white/20 backdrop-blur-sm rounded-full px-1.5 py-0.5" title={locale === 'es' ? ATTRACTION_TYPE_LABELS[a].es : ATTRACTION_TYPE_LABELS[a].en}>
                      {ATTRACTION_TYPE_LABELS[a].icon}
                    </span>
                  ))}
                </div>
              </div>
              <div className="p-4 space-y-3">
                <div>
                  <h3 className="font-bold text-gray-900">{dest.name}</h3>
                  <p className="text-xs text-gray-500">{dest.country}</p>
                </div>
                <StarRating rating={dest.accessibilityRating} />
                <div className="flex flex-wrap gap-1">
                  {dest.disabilityTypes.map(d => (
                    <span key={d} className="text-lg" title={tD(d)}>{DISABILITY_ICONS[d]}</span>
                  ))}
                </div>
                {/* Highlighted attractions preview */}
                <div className="space-y-1">
                  {dest.highlights.slice(0, 2).map((h, i) => (
                    <div key={i} className="flex items-start gap-1.5 text-xs text-gray-600">
                      <span className="shrink-0">{ATTRACTION_TYPE_LABELS[h.type].icon}</span>
                      <span className="line-clamp-1">{locale === 'es' ? h.nameES : h.nameEN}</span>
                    </div>
                  ))}
                </div>
                <ul className="space-y-1">
                  {features.slice(0, 2).map((f, i) => (
                    <li key={i} className="text-xs text-gray-600 flex items-start gap-1.5">
                      <span className="text-teal-500 shrink-0">✓</span> {f}
                    </li>
                  ))}
                </ul>
                <p className="text-xs text-teal-600 font-medium">{t('viewMore')} →</p>
              </div>
            </button>
          )
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-3">🔍</p>
          <p>{t('noResults')}</p>
        </div>
      )}

      {selected && (
        <DestinationModal
          destination={selected}
          userId={userId}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  )
}
