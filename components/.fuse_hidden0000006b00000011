'use client'

import { useEffect, useState } from 'react'
import { useLocale } from 'next-intl'

const BLUE = '#1B6FB5'
const ORANGE = '#F97316'

type Item = { id: string; label: string }
type Section = { title: string; items: Item[] }

function getSections(en: boolean): Section[] {
  return [
    {
      title: en ? 'Before you book' : 'Antes de reservar',
      items: [
        {
          id: 'Revisa la política de tu aerolínea (módulo «Requisitos por Aerolínea»)',
          label: en
            ? 'Check your airline’s policy («Airline Requirements» module)'
            : 'Revisa la política de tu aerolínea (módulo «Requisitos por Aerolínea»)',
        },
        {
          id: 'Revisa la ley del país de destino (módulo «Requisitos por País»)',
          label: en
            ? 'Check the law of your destination country («Country Requirements» module)'
            : 'Revisa la ley del país de destino (módulo «Requisitos por País»)',
        },
        {
          id: 'Elige asiento: no en fila de salida; tu perro va a tus pies',
          label: en
            ? 'Pick your seat: not in an exit row; your dog rides at your feet'
            : 'Elige asiento: no en fila de salida; tu perro va a tus pies',
        },
      ],
    },
    {
      title: en ? '2–3 weeks before' : '2–3 semanas antes',
      items: [
        {
          id: 'Veterinario: vacunas al día (rabia) y certificado de salud reciente',
          label: en
            ? 'Vet visit: vaccines up to date (rabies) and a recent health certificate'
            : 'Veterinario: vacunas al día (rabia) y certificado de salud reciente',
        },
        {
          id: 'Descarga y llena el formulario DOT (módulo «Formularios»)',
          label: en
            ? 'Download and fill out the DOT form («Forms» module)'
            : 'Descarga y llena el formulario DOT (módulo «Formularios»)',
        },
        {
          id: 'Si viajas a EE.UU., llena el CDC Dog Import Form y guarda el QR',
          label: en
            ? 'Traveling to the U.S.? Complete the CDC Dog Import Form and save the QR code'
            : 'Si viajas a EE.UU., llena el CDC Dog Import Form y guarda el QR',
        },
        {
          id: 'Confirma con la aerolínea con la anticipación que pide (48–72 h)',
          label: en
            ? 'Confirm with the airline as far ahead as they require (48–72 h)'
            : 'Confirma con la aerolínea con la anticipación que pide (48–72 h)',
        },
      ],
    },
    {
      title: en ? 'Travel day' : 'El día del viaje',
      items: [
        {
          id: 'Lleva todos los documentos impresos y en el celular',
          label: en
            ? 'Bring every document printed and on your phone'
            : 'Lleva todos los documentos impresos y en el celular',
        },
        {
          id: 'Alimenta y dale agua a tu perro con tiempo',
          label: en
            ? 'Feed and water your dog well ahead of time'
            : 'Alimenta y dale agua a tu perro con tiempo',
        },
        {
          id: 'Usa el área de alivio antes de abordar (módulo «Áreas de Alivio»)',
          label: en
            ? 'Use the relief area before boarding («Relief Areas» module)'
            : 'Usa el área de alivio antes de abordar (módulo «Áreas de Alivio»)',
        },
        {
          id: 'Llega temprano: 3 h en vuelos internacionales, 2 h en nacionales',
          label: en
            ? 'Arrive early: 3 h for international flights, 2 h for domestic'
            : 'Llega temprano: 3 h en vuelos internacionales, 2 h en nacionales',
        },
      ],
    },
    {
      title: en ? 'On board' : 'A bordo',
      items: [
        {
          id: 'Tu perro va a tus pies, sin invadir el pasillo',
          label: en
            ? 'Your dog stays at your feet, clear of the aisle'
            : 'Tu perro va a tus pies, sin invadir el pasillo',
        },
        {
          id: 'Lleva agua y un tapete o manta pequeña',
          label: en
            ? 'Pack water and a small mat or blanket'
            : 'Lleva agua y un tapete o manta pequeña',
        },
        {
          id: 'Mantén a mano la identificación y los formularios',
          label: en
            ? 'Keep ID and forms within easy reach'
            : 'Mantén a mano la identificación y los formularios',
        },
      ],
    },
  ]
}

export default function HubChecklist({ storageKey = 'allgo-hub-checklist' }: { storageKey?: string }) {
  const en = useLocale() === 'en'
  const SECTIONS = getSections(en)
  const ALL = SECTIONS.flatMap((s) => s.items)
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

  const doneCount = ALL.filter((i) => checked[i.id]).length
  const pct = Math.round((doneCount / ALL.length) * 100)

  function toggle(id: string) {
    setChecked((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  return (
    <div className="space-y-6">
      {/* Progress */}
      <div className="rounded-2xl bg-white p-5 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-bold text-gray-700">{en ? 'Your progress' : 'Tu progreso'}</span>
          <span className="text-sm font-bold" style={{ color: BLUE }}>{pct}%</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-2.5">
          <div
            className="h-2.5 rounded-full transition-all duration-500"
            style={{ width: `${pct}%`, background: pct === 100 ? '#0D9488' : ORANGE }}
          />
        </div>
        {pct === 100 && (
          <p className="mt-2 text-xs font-semibold text-teal-600">{en ? '✅ All set! Safe travels 🐾✈️' : '✅ ¡Todo listo! Buen viaje 🐾✈️'}</p>
        )}
      </div>

      {SECTIONS.map((section) => (
        <div key={section.title} className="rounded-2xl bg-white p-5 shadow-sm border border-gray-100">
          <h3 className="font-extrabold mb-3" style={{ color: BLUE }}>{section.title}</h3>
          <ul className="space-y-2.5">
            {section.items.map((item) => {
              const on = !!checked[item.id]
              return (
                <li key={item.id}>
                  <button
                    onClick={() => toggle(item.id)}
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
                      {item.label}
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
        </div>
      ))}

      <p className="text-center text-xs text-gray-400">
        {en
          ? 'Your progress is saved on this device. This is a general preparation guide — always check the specific requirements of your airline and destination.'
          : 'Tu progreso se guarda en este dispositivo. Es una guía general de preparación — revisa siempre los requisitos específicos de tu aerolínea y destino.'}
      </p>
    </div>
  )
}
