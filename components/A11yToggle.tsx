'use client'

import { useEffect, useState } from 'react'

type TextSize = 'normal' | 'large' | 'xl'

export default function A11yToggle({ en = false }: { en?: boolean }) {
  const [size, setSize] = useState<TextSize>('normal')
  const [contrast, setContrast] = useState(false)

  useEffect(() => {
    try {
      const s = (localStorage.getItem('a11y-size') as TextSize) || 'normal'
      const c = localStorage.getItem('a11y-contrast') === '1'
      setSize(s); setContrast(c)
      applySize(s); applyContrast(c)
    } catch { /* noop */ }
  }, [])

  function applySize(s: TextSize) {
    const el = document.documentElement
    el.classList.remove('a11y-large', 'a11y-large-xl')
    if (s === 'large') el.classList.add('a11y-large')
    if (s === 'xl') el.classList.add('a11y-large-xl')
  }
  function applyContrast(c: boolean) {
    document.documentElement.classList.toggle('a11y-contrast', c)
  }
  function chooseSize(s: TextSize) {
    setSize(s); applySize(s)
    try { localStorage.setItem('a11y-size', s) } catch { /* noop */ }
  }
  function toggleContrast() {
    const c = !contrast
    setContrast(c); applyContrast(c)
    try { localStorage.setItem('a11y-contrast', c ? '1' : '0') } catch { /* noop */ }
  }

  const sizes: { key: TextSize; label: string }[] = [
    { key: 'normal', label: 'A' },
    { key: 'large', label: 'A+' },
    { key: 'xl', label: 'A++' },
  ]

  return (
    <div className="bg-white rounded-2xl shadow p-5">
      <h2 className="text-base font-bold text-gray-800 mb-3">
        ♿ {en ? 'Accessibility' : 'Accesibilidad'}
      </h2>
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <p className="text-sm font-semibold text-gray-600 mb-2">{en ? 'Text size' : 'Tamaño de letra'}</p>
          <div className="flex gap-2">
            {sizes.map(s => (
              <button
                key={s.key}
                type="button"
                aria-pressed={size === s.key}
                onClick={() => chooseSize(s.key)}
                className={
                  'flex-1 min-h-[52px] rounded-xl border-2 font-extrabold ' +
                  (size === s.key ? 'bg-teal-600 border-teal-600 text-white' : 'bg-white border-gray-300 text-gray-800')
                }
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-gray-600 mb-2">{en ? 'High contrast' : 'Alto contraste'}</p>
          <button
            type="button"
            aria-pressed={contrast}
            onClick={toggleContrast}
            className={
              'w-full min-h-[52px] rounded-xl border-2 font-bold ' +
              (contrast ? 'bg-gray-900 border-gray-900 text-white' : 'bg-white border-gray-300 text-gray-800')
            }
          >
            {contrast ? (en ? '✓ On' : '✓ Activado') : (en ? 'Off' : 'Desactivado')}
          </button>
        </div>
      </div>
    </div>
  )
}
