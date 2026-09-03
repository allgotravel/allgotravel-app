'use client'

import { useState } from 'react'
import { createSupabaseBrowser } from '@/lib/supabase-browser'
import { Medication } from '@/types/profile'
import { daysUntil } from '@/lib/expiry'

interface Props {
  meds: Medication[]
  userId: string
  en?: boolean
}

export default function MedCheckIn({ meds, userId, en = false }: Props) {
  const supabase = createSupabaseBrowser()
  const [taken, setTaken] = useState<Record<string, string>>({})

  const list = meds.filter(m => m.name)
  if (list.length === 0) return null

  async function markTaken(name: string) {
    const now = new Date()
    const hhmm = now.toLocaleTimeString(en ? 'en-US' : 'es-ES', { hour: '2-digit', minute: '2-digit' })
    setTaken(prev => ({ ...prev, [name]: hhmm }))
    await supabase.from('med_log').insert({ user_id: userId, med_name: name, taken_at: now.toISOString() })
  }

  return (
    <div className="bg-white rounded-2xl shadow p-6">
      <h2 className="text-base font-bold text-gray-800 mb-3">
        <span className="allgo-pill">💊</span> {en ? "Today's medications" : 'Medicamentos de hoy'}
      </h2>
      <div className="space-y-2">
        {list.map((m, i) => {
          const refillDays = m.refill_date ? daysUntil(m.refill_date) : null
          const lowRefill = refillDays !== null && refillDays <= 7
          return (
            <div key={i} className="flex items-center justify-between gap-3 border border-gray-100 rounded-xl p-3">
              <div className="min-w-0">
                <p className="font-semibold text-gray-800 truncate">
                  {m.name} {m.dose && <span className="text-gray-500 text-sm">— {m.dose}</span>}
                </p>
                {lowRefill && (
                  <p className="text-xs text-orange-600 font-semibold">
                    🔁 {en ? `Refill soon (${refillDays}d)` : `Resurte pronto (${refillDays}d)`}
                  </p>
                )}
              </div>
              {taken[m.name] ? (
                <span className="shrink-0 text-emerald-600 font-bold text-sm">✓ {taken[m.name]}</span>
              ) : (
                <button
                  type="button"
                  onClick={() => markTaken(m.name)}
                  className="shrink-0 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl px-4 py-2.5 min-h-[44px]"
                >
                  {en ? 'Took it' : 'Tomé'}
                </button>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
