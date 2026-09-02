'use client'

/**
 * MedTimePicker — selector de horas de medicamento pensado para adultos mayores
 * con cero conocimientos de tecnología y limitaciones motoras/visuales.
 *
 * - Sin escribir: se toca la hora y listo.
 * - Botones GRANDES (mín. 64px), letra grande, mucho contraste, mucho espacio.
 * - Horas agrupadas por momento del día con icono (madrugada/mañana/tarde/noche).
 * - Guarda siempre en formato "HH:MM" 24h (ej. "08:00", "20:00") para que la
 *   tarjeta de emergencia lo muestre limpio.
 */

import { pretty } from '@/lib/medtime'

interface Props {
  value: string[]
  onChange: (times: string[]) => void
  en?: boolean
}

const GROUPS: { icon: string; es: string; en: string; hours: number[] }[] = [
  { icon: '🌅', es: 'Mañana', en: 'Morning', hours: [6, 7, 8, 9, 10, 11] },
  { icon: '☀️', es: 'Tarde', en: 'Afternoon', hours: [12, 13, 14, 15, 16, 17] },
  { icon: '🌆', es: 'Noche', en: 'Evening', hours: [18, 19, 20, 21, 22, 23] },
  { icon: '🌙', es: 'Madrugada', en: 'Late night', hours: [0, 1, 2, 3, 4, 5] },
]

function hhmm(h: number): string {
  return String(h).padStart(2, '0') + ':00'
}

export default function MedTimePicker({ value, onChange, en = false }: Props) {
  const selected = new Set(value)

  function toggle(h: number) {
    const key = hhmm(h)
    const next = new Set(selected)
    if (next.has(key)) next.delete(key)
    else next.add(key)
    // ordenar por hora
    onChange(Array.from(next).sort())
  }

  return (
    <div>
      <p className="text-base text-gray-700 mb-3 font-medium">
        <span className="allgo-alarm mr-1">⏰</span>
        {en
          ? 'Tap the times you take this medicine'
          : 'Toca las horas en que tomas este medicamento'}
      </p>

      {/* Resumen de horas elegidas */}
      {value.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-2" aria-live="polite">
          {value.map(v => {
            const h = Number(v.split(':')[0])
            const p = Number.isFinite(h) ? pretty(h) : { big: v, small: '' }
            return (
              <span
                key={v}
                className="inline-flex items-center gap-2 bg-teal-600 text-white rounded-full pl-4 pr-2 py-2 text-lg font-bold"
              >
                {p.big} {p.small}
                <button
                  type="button"
                  onClick={() => toggle(Number(v.split(':')[0]))}
                  aria-label={en ? `Remove ${p.big} ${p.small}` : `Quitar ${p.big} ${p.small}`}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-white/25 hover:bg-white/40 text-xl leading-none"
                >
                  ×
                </button>
              </span>
            )
          })}
        </div>
      )}

      {/* Grupos de horas */}
      <div className="space-y-4">
        {GROUPS.map(g => (
          <div key={g.es}>
            <p className="text-base font-bold text-gray-700 mb-2 flex items-center gap-2">
              <span className="text-2xl" aria-hidden>{g.icon}</span>
              {en ? g.en : g.es}
            </p>
            <div className="grid grid-cols-3 gap-3">
              {g.hours.map(h => {
                const key = hhmm(h)
                const isOn = selected.has(key)
                const p = pretty(h)
                return (
                  <button
                    key={h}
                    type="button"
                    onClick={() => toggle(h)}
                    aria-pressed={isOn}
                    aria-label={`${p.big} ${p.small}${isOn ? (en ? ' selected' : ' seleccionada') : ''}`}
                    className={
                      'min-h-[64px] rounded-2xl border-2 flex flex-col items-center justify-center transition ' +
                      (isOn
                        ? 'bg-teal-600 border-teal-600 text-white shadow-md'
                        : 'bg-white border-gray-300 text-gray-800 hover:border-teal-400 active:bg-teal-50')
                    }
                  >
                    <span className="text-2xl font-extrabold leading-none">
                      {isOn ? '✓ ' : ''}{p.big}
                    </span>
                    <span className={'text-sm mt-0.5 ' + (isOn ? 'text-white/90' : 'text-gray-500')}>
                      {p.small}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
