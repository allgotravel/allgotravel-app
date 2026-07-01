'use client'

import { useEffect, useState } from 'react'
import { useLocale } from 'next-intl'

export default function OfflineBanner() {
  const [offline, setOffline] = useState(false)
  const locale = useLocale()

  useEffect(() => {
    const onOffline = () => setOffline(true)
    const onOnline = () => setOffline(false)

    setOffline(!navigator.onLine)
    window.addEventListener('offline', onOffline)
    window.addEventListener('online', onOnline)
    return () => {
      window.removeEventListener('offline', onOffline)
      window.removeEventListener('online', onOnline)
    }
  }, [])

  if (!offline) return null

  return (
    <div className="fixed top-0 inset-x-0 z-50 bg-amber-500 text-white text-center text-sm py-2 px-4 flex items-center justify-center gap-2">
      <span>📵</span>
      <span>
        {locale === 'es'
          ? 'Estás en modo offline — mostrando contenido guardado'
          : 'You\'re offline — showing saved content'}
      </span>
    </div>
  )
}
