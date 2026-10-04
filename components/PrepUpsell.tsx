// Panel que reemplaza los bloqueos "solo miembros": lleva a las guías y al Pack (no al Club).
// Sin hooks, así sirve tanto en componentes de servidor como de cliente.

export type PrepTema = 'perro' | 'movilidad'

const LINKS = {
  perro: 'https://www.allgotravel.app/perro.html?src=app',
  turismo: 'https://www.allgotravel.app/turismo.html?src=app',
  pack: 'https://www.allgotravel.app/perro.html?src=app-pack#pack',
}

export default function PrepUpsell({ en, tema = 'perro', className = '' }: { en: boolean; tema?: PrepTema; className?: string }) {
  const perro = (
    <a key="perro" href={LINKS.perro} className="flex items-center justify-between gap-3 rounded-xl border-2 border-blue-100 bg-white px-4 py-3 hover:border-blue-400">
      <span className="min-w-0 text-sm font-semibold text-gray-800">🐕‍🦺 {en ? 'Travel With Your Service Dog guide' : 'Guía Viaja con tu Perro de Servicio'}</span>
      <span className="shrink-0 text-sm font-bold text-blue-700">$37</span>
    </a>
  )
  const turismo = (
    <a key="turismo" href={LINKS.turismo} className="flex items-center justify-between gap-3 rounded-xl border-2 border-blue-100 bg-white px-4 py-3 hover:border-blue-400">
      <span className="min-w-0 text-sm font-semibold text-gray-800">♿ Turismo Sin Fronteras{en ? ' (in Spanish)' : ''}</span>
      <span className="shrink-0 text-sm font-bold text-blue-700">$37</span>
    </a>
  )
  const guides = tema === 'movilidad' ? [turismo, perro] : [perro, turismo]

  return (
    <div className={`rounded-2xl border-2 border-orange-200 bg-orange-50 p-5 ${className}`}>
      <p className="text-base font-bold text-gray-900">{en ? 'This is part of your complete preparation' : 'Esto es parte de tu preparación completa'}</p>
      <p className="mt-1 mb-4 text-sm text-gray-600">
        {en ? 'Choose the guide for your trip:' : 'Elige la guía que corresponde a tu viaje:'}
      </p>
      <div className="space-y-2">
        {guides}
        <a href={LINKS.pack} className="flex items-center justify-between gap-3 rounded-xl border-2 border-orange-400 bg-white px-4 py-3 hover:bg-orange-100/40">
          <span className="min-w-0 text-sm font-bold text-gray-900">⭐ {en ? 'Complete Traveler Pack' : 'Pack Viajero Completo'}</span>
          <span className="shrink-0 text-right text-sm font-bold text-orange-600">$59<span className="block text-[11px] font-semibold text-orange-500">{en ? 'save $15' : 'ahorras $15'}</span></span>
        </a>
      </div>
    </div>
  )
}
