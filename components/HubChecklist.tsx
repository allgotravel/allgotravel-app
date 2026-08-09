'use client'

import { useEffect, useState } from 'react'

const BLUE = '#1B6FB5'
const ORANGE = '#F97316'

type Section = { title: string; items: string[] }

const SECTIONS: Section[] = [
  {
    title: 'Antes de reservar',
    items: [
      'Revisa la política de tu aerolínea (módulo «Requisitos por Aerolínea»)',
      'Revisa la ley del país de destino (módulo «Requisitos por País»)',
      'Elige asiento: no en fila de salida; tu perro va a tus pies',
    ],
  },
  {
    title: '2–3 semanas antes',
    items: [
      'Veterinario: vacunas al día (rabia) y certificado de salud reciente',
      'Descarga y llena el formulario DOT (módulo «Formularios»)',
      'Si viajas a EE.UU., llena el CDC Dog Import Form y guarda el QR',
      'Confirma con la aerolínea con la anticipación que pide (48–72 h)',
    ],
  },
  {
    title: 'El día del viaje',
    items: [
      'Lleva todos los documentos impresos y en el celular',
      'Alimenta y dale agua a tu perro con tiempo',
      'Usa el área de alivio antes de abordar (módulo «Áreas de Alivio»)',
      'Llega temprano: 3 h en vuelos internacionales, 2 h en nacionales',
    ],
  },
  {
    title: 'A bordo',
    items: [
      'Tu perro va a tus pies, sin invadir el pasillo',
      'Lleva agua y un tapete o manta pequeña',
      'Mantén a mano la identificación y los formularios',
    ],
  },
]

const ALL = SECTIONS.flatMap((s) => s.items)

export default function HubChecklist({ storageKey = 'allgo-hub-checklist' }: { storageKey?: string }) {
  const [checked, setChecked] = useState<Record<string, boolean>>({})
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey)
      if (raw) setChecked(JSON.parse(raw))
    } catch {}
    setLoaded(true)
  }, [storageKey])

  useEffect(() => {
    if (!loaded) return
    try {
      localStorage.setItem(storageKey, JSON.stringify(checked))
    } catch {}
  }, [checked, loaded, storageKey])

  const doneCount = ALL.filter((i) => checked[i]).length
  const pct = Math.round((doneCount / ALL.length) * 100)

  function toggle(item: string) {
    setChecked((prev) => ({ ...prev, [item]: !prev[item] }))
  }

  return (
    <div className="space-y-6">
      {/* Progress */}
      <div className="rounded-2xl bg-white p-5 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-bold text-gray-700">Tu progreso</span>
          <span className="text-sm font-bold" style={{ color: BLUE }}>{pct}%</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-2.5">
          <div
            className="h-2.5 rounded-full transition-all duration-500"
            style={{ width: `${pct}%`, background: pct === 100 ? '#0D9488' : ORANGE }}
          />
        </div>
        {pct === 100 && (
          <p className="mt-2 text-xs font-semibold text-teal-600">✅ ¡Todo listo! Buen viaje 🐾✈️</p>
        )}
      </div>

      {SECTIONS.map((section) => (
        <div key={section.title} className="rounded-2xl bg-white p-5 shadow-sm border border-gray-100">
          <h3 className="font-extrabold mb-3" style={{ color: BLUE }}>{section.title}</h3>
          <ul className="space-y-2.5">
            {section.items.map((item) => {
              const on = !!checked[item]
              return (
                <li key={item}>
                  <button
                    onClick={() => toggle(item)}
                    className="flex items-start gap-3 text-left w-full group"
                  >
                    <span
                      className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 text-xs font-bold text-white transition"
                      style={{
                        borderColor: on ? '#0D9488' : '#cbd5e1',
                        background: on ? '#0D9488' : 'transparent',
                      }}
                    >
                      {on ? '✓' : ''}
                    </span>
                    <span className={`text-sm ${on ? 'text-gray-400 line-through' : 'text-gray-700'}`}>
                      {item}
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
        </div>
      ))}

      <p className="text-center text-xs text-gray-400">
        Tu progreso se guarda en este dispositivo. Es una guía general de preparación — revisa siempre los
        requisitos específicos de tu aerolínea y destino.
      </p>
    </div>
  )
}
