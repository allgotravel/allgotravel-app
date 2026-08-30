import Image from 'next/image'
import { Link } from '@/i18n/navigation'
import { getLocale } from 'next-intl/server'

export default async function NosotrosPage() {
  const locale = await getLocale()
  const en = locale === 'en'
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-gradient-to-br from-blue-950 via-blue-800 to-teal-700 text-white py-20 px-4 text-center">
        <div className="max-w-3xl mx-auto">
          <span className="inline-block bg-orange-500/20 border border-orange-400/30 text-orange-300 text-sm font-bold px-4 py-1.5 rounded-full mb-6">
            {en ? '💛 Our Story' : '💛 Nuestra Historia'}
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold mb-4">{en ? <>An act of love,<br />justice and vision</> : <>Un acto de amor,<br />justicia y visión</>}</h1>
          <p className="text-white/70 text-lg max-w-xl mx-auto">
            {en ? 'The story behind AllGo Travel App' : 'La historia detrás de AllGo Travel App'}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Sidebar */}
          <div className="flex flex-col items-center gap-6 md:sticky md:top-24 md:h-fit">
            <div className="w-64 h-80 rounded-full overflow-hidden shadow-2xl ring-4 ring-orange-100">
              <Image src="/yadira-familia.jpg" alt={en ? 'Yadira, her family and her little dog' : 'Yadira, su familia y su perrita'} width={720} height={899} className="object-cover w-full h-full" />
            </div>
            <div className="text-center">
              <p className="font-bold text-xl text-blue-700">{en ? 'Yadira and family' : 'Yadira y familia'}</p>
              <p className="text-gray-500 text-sm">{en ? 'Founder · AllGo Travel App' : 'Fundadora · AllGo Travel App'}</p>
              <p className="text-gray-400 text-xs mt-1">{en ? 'The story behind AllGo Travel App' : 'La historia detrás de AllGo Travel App'}</p>
            </div>
            <blockquote className="bg-orange-50 border-l-4 border-orange-400 rounded-r-xl px-4 py-4 w-full">
              <p className="text-orange-700 font-semibold italic text-sm leading-relaxed text-center">
                {en ? <>"Travel is for everyone.<br />We create paths that are possible."</> : <>"Viajar es para todos.<br />Creamos caminos posibles."</>}
              </p>
            </blockquote>
          </div>

          {/* Story */}
          <div className="md:col-span-2 space-y-6 text-gray-600 leading-relaxed">
            <p className="text-xl font-bold text-gray-900">
              {en ? 'AllGo Travel App was born from a personal story.' : 'AllGo Travel App nació de una historia personal.'}
            </p>

            <p className="text-lg">
              {en
                ? 'Yadira, a Cuban-American healthcare professional, has spent years traveling alongside her father, who lives with a disability. Every trip revealed the same reality: an industry that is not ready for everyone.'
                : 'Yadira, cubano-americana y profesional del área de salud, lleva años viajando junto a su padre con discapacidad. Cada viaje revelaba la misma realidad: una industria que no está preparada para todos.'}
            </p>

            <div className="bg-blue-50 rounded-2xl p-6 border border-blue-100">
              <p className="text-gray-700 text-lg">
                {en
                  ? <>Out of that experience, AllGo Travel App was born — not as one more agency, but as an <strong className="text-blue-700">act of love and justice</strong>. A place where travel is designed with inclusion in mind, so that people with disabilities and their families can explore the world with freedom, safety and dignity.</>
                  : <>De esa experiencia nació AllGo Travel App — no como una agencia más, sino como un <strong className="text-blue-700">acto de amor y justicia</strong>. Un espacio donde los viajes se diseñan desde la inclusión, para que personas con discapacidad y sus familias puedan explorar el mundo con libertad, seguridad y dignidad.</>}
              </p>
            </div>

            <p className="text-xl font-bold text-blue-700">
              {en ? 'Because everyone deserves to discover the world. 🌍' : 'Porque todos merecen descubrir el mundo. 🌍'}
            </p>

            <div className="pt-4 flex flex-col sm:flex-row gap-4">
              <Link
                href="/register"
                className="inline-flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold px-8 py-4 rounded-full text-base shadow-lg transition"
              >
                {en ? '🚀 Get started now' : '🚀 Comenzar ahora'}
              </Link>
              <Link
                href="/"
                className="inline-flex items-center justify-center gap-2 border-2 border-blue-700 text-blue-700 hover:bg-blue-50 font-semibold px-8 py-4 rounded-full text-base transition"
              >
                {en ? '← Back to home' : '← Volver al inicio'}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
