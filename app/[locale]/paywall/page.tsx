'use client'
import Image from 'next/image'
import Link from 'next/link'

export default function PaywallPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-950 via-blue-800 to-teal-700 flex flex-col items-center justify-center px-4 py-16 text-white">
      <Image src="/logo-allgo.jpg" alt="AllGo Travel" width={80} height={80} className="rounded-full mb-6" />
      <h1 className="text-3xl font-extrabold text-center mb-2">Activa tu suscripción</h1>
      <p className="text-white/70 text-center mb-10">Accede a todo AllGo Travel — sin límites.</p>

      <div className="flex flex-col sm:flex-row gap-4 w-full max-w-lg">
        {/* Annual - Recommended */}
        <a href="https://go.hotmart.com/P106494873O?dp=1" className="flex-1 bg-orange-500 hover:bg-orange-600 rounded-2xl p-6 text-center transition">
          <div className="text-xs font-bold bg-white text-orange-500 rounded-full px-3 py-1 inline-block mb-3">⭐ RECOMENDADO</div>
          <div className="text-2xl font-extrabold">$97/año</div>
          <div className="text-white/80 text-sm mb-2">Ahorra 46% vs mensual</div>
          <div className="bg-white text-orange-500 font-bold py-2 px-4 rounded-full text-sm mb-2">Suscribirme anual →</div>
          <p className="text-white/70 text-xs">✅ Pago seguro con Hotmart</p>
        </a>
        {/* Monthly */}
        <a href="https://pay.hotmart.com/P106494873O" className="flex-1 bg-white/10 border border-white/20 rounded-2xl p-6 text-center transition hover:bg-white/20">
          <div className="text-2xl font-extrabold mt-7">$14.99/mes</div>
          <div className="text-white/80 text-sm mb-4">Facturación mensual</div>
          <div className="border border-white text-white font-bold py-2 px-4 rounded-full text-sm">Suscribirme mensual</div>
        </a>
      </div>
      <p className="text-white/50 text-xs mt-6">Cancela cuando quieras. Sin compromisos.</p>
      <Link href="/login" className="text-white/40 text-xs mt-2 hover:text-white/60">Ya tengo cuenta →</Link>
    </div>
  )
}
