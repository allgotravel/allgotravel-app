import type { Metadata } from 'next'
import HomeClient from './HomeClient'

const SITE = 'https://www.allgotravel.app'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const en = locale === 'en'
  const title = en
    ? 'AllGo Travel App — Accessible travel: service dogs, wheelchairs and more'
    : 'AllGo Travel App — Viajes accesibles en español: perro de servicio, silla de ruedas y más'
  const description = en
    ? 'Verified accessible travel information, with source and date, and Alli, your AI assistant. Guides for traveling with a service dog, a wheelchair or reduced mobility.'
    : 'Información de viaje accesible verificada, con su fuente y fecha, y Alli, tu asistente con IA. Guías para viajar con perro de servicio, silla de ruedas o movilidad reducida.'
  return {
    title,
    description,
    alternates: {
      canonical: `/${locale}`,
      languages: { es: '/es', en: '/en', 'x-default': '/es' },
    },
    openGraph: {
      title,
      description,
      url: `/${locale}`,
      siteName: 'AllGo Travel App',
      locale: en ? 'en_US' : 'es_ES',
      type: 'website',
      images: [{ url: '/og/og-home.jpg', width: 1200, height: 630, alt: 'AllGo Travel App' }],
    },
    twitter: { card: 'summary_large_image', title, description, images: ['/og/og-home.jpg'] },
    // Google Search Console: pega el código que te dé Search Console y quita el comentario.
    // verification: { google: 'PEGAR_AQUI_EL_CODIGO_DE_GOOGLE' },
  }
}

const offer = (price: string, url: string) => ({
  '@type': 'Offer',
  price,
  priceCurrency: 'USD',
  availability: 'https://schema.org/InStock',
  url,
  seller: { '@id': `${SITE}/#organization` },
})

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': `${SITE}/#organization`,
      name: 'AllGo Travel App',
      url: SITE,
      logo: `${SITE}/icon-512x512.png`,
      founder: { '@type': 'Person', name: 'Yadira Suárez' },
      sameAs: ['https://instagram.com/allgotravelapp'],
    },
    {
      '@type': 'WebSite',
      '@id': `${SITE}/#website`,
      name: 'AllGo Travel App',
      url: SITE,
      inLanguage: ['es', 'en'],
      publisher: { '@id': `${SITE}/#organization` },
    },
    {
      '@type': 'Product',
      name: 'Viaja con tu Perro de Servicio — Sistema Vuelo Seguro (español e inglés)',
      image: `${SITE}/og/og-perro.jpg`,
      url: `${SITE}/perro.html`,
      brand: { '@type': 'Brand', name: 'AllGo Travel App' },
      offers: offer('37.00', 'https://pay.hotmart.com/Q106793737G'),
    },
    {
      '@type': 'Product',
      name: 'Turismo Sin Fronteras — Sistema de viaje accesible (en español)',
      image: `${SITE}/og/og-turismo.jpg`,
      url: `${SITE}/turismo.html`,
      brand: { '@type': 'Brand', name: 'AllGo Travel App' },
      offers: offer('37.00', 'https://pay.hotmart.com/O106521584H'),
    },
    {
      '@type': 'Product',
      name: 'Pack Viajero Completo — las 2 guías de AllGo Travel App',
      image: `${SITE}/og/og-home.jpg`,
      url: `${SITE}/perro.html#pack`,
      brand: { '@type': 'Brand', name: 'AllGo Travel App' },
      offers: offer('59.00', 'https://pay.hotmart.com/A107786229V'),
    },
  ],
}

export default function HomePage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <HomeClient />
    </>
  )
}
