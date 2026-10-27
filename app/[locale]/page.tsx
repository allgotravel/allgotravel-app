import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
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
    ? 'Accessible travel guides built on official sources: the Service Dog guide (Spanish and English, $37), Turismo Sin Fronteras (Spanish only, $37), the Complete Traveler Pack ($59) and Patitas Viajeras Sin Fronteras for traveling with your dog between the US and Mexico (Spanish only, $17).'
    : 'Guías de viaje accesible con fuentes oficiales: Guía Perro de Servicio (español e inglés, $37), Turismo Sin Fronteras (solo en español, $37), el Pack Viajero Completo ($59) y Patitas Viajeras Sin Fronteras para viajar con tu perro entre EE. UU. y México (solo en español, $17).'
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

// Garantía de 7 días (Payhip para la guía del perro; Hotmart para las demás), reembolso completo. Producto digital: sin costo de envío.
const returnPolicy = {
  '@type': 'MerchantReturnPolicy',
  applicableCountry: ['US', 'MX'],
  returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
  merchantReturnDays: 7,
  // Producto digital: se reembolsa sin devolver nada (el cliente conserva el PDF).
  returnMethod: 'https://schema.org/KeepProduct',
  returnFees: 'https://schema.org/FreeReturn',
  refundType: 'https://schema.org/FullRefund',
}

// Guía digital: llega por correo al instante y sin costo (0 días, $0).
const zeroDays = { '@type': 'QuantitativeValue', minValue: 0, maxValue: 0, unitCode: 'DAY' }
const digitalDelivery = {
  '@type': 'OfferShippingDetails',
  shippingRate: { '@type': 'MonetaryAmount', value: 0, currency: 'USD' },
  shippingDestination: [
    { '@type': 'DefinedRegion', addressCountry: 'US' },
    { '@type': 'DefinedRegion', addressCountry: 'MX' },
  ],
  deliveryTime: { '@type': 'ShippingDeliveryTime', handlingTime: zeroDays, transitTime: zeroDays },
}

const offer = (price: string, url: string) => ({
  '@type': 'Offer',
  price,
  priceCurrency: 'USD',
  availability: 'https://schema.org/InStock',
  url,
  seller: { '@id': `${SITE}/#organization` },
  shippingDetails: digitalDelivery,
  hasMerchantReturnPolicy: returnPolicy,
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
      email: 'hola@allgotravel.app',
      telephone: '+1-954-546-4344',
      legalName: 'All Go Travel LLC',
      address: { '@type': 'PostalAddress', addressLocality: 'Weston', addressRegion: 'FL', addressCountry: 'US' },
      sameAs: ['https://instagram.com/allgotravelapp'],
      hasMerchantReturnPolicy: returnPolicy,
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
      description: 'Sistema Vuelo Seguro, en español e inglés, para volar con tu perro de servicio: formulario DOT paso a paso, requisitos de aerolíneas y países, y la tarjeta Modo Mostrador. $37.',
      image: `${SITE}/og/og-perro.jpg`,
      url: `${SITE}/perro.html`,
      brand: { '@type': 'Brand', name: 'AllGo Travel App' },
      offers: offer('37.00', `${SITE}/perro.html`),
    },
    {
      '@type': 'Product',
      name: 'Turismo Sin Fronteras — Sistema de viaje accesible (en español)',
      description: 'Sistema Turismo Sin Fronteras, en español, para organizar el viaje de tu mamá o tu papá con movilidad reducida u otra necesidad especial: qué pedir, qué confirmar y qué hacer si algo falla. $37.',
      image: `${SITE}/og/og-turismo.jpg`,
      url: `${SITE}/turismo.html`,
      brand: { '@type': 'Brand', name: 'AllGo Travel App' },
      offers: offer('37.00', `${SITE}/turismo.html`),
    },
    {
      '@type': 'Product',
      name: 'Pack Viajero Completo — las 2 guías de AllGo Travel App',
      description: 'Viaja con tu Perro de Servicio (español e inglés) y Turismo Sin Fronteras (en español) en un solo pago.',
      image: `${SITE}/og/og-home.jpg`,
      url: `${SITE}/perro.html#pack`,
      brand: { '@type': 'Brand', name: 'AllGo Travel App' },
      offers: offer('59.00', `${SITE}/perro.html#pack`),
    },
    {
      '@type': 'Product',
      name: 'Patitas Viajeras Sin Fronteras · Sistema Ida y Regreso — Guía 2026 para viajar con tu perro entre Estados Unidos y México',
      description: 'Guía digital en español: las 2 reglas nuevas de ida y regreso entre EE. UU. y México, calendario día por día, checklists, guion para el veterinario y qué hacer si algo sale mal.',
      image: `${SITE}/img/mexico/portada.jpg`,
      url: `${SITE}/mexico.html`,
      brand: { '@type': 'Brand', name: 'AllGo Travel App' },
      offers: offer('17.00', `${SITE}/mexico.html`),
    },
  ],
}

// Mismas 6 preguntas que se ven en la sección #faq de la home (messages/*.json → landing.h3FaqQ/A).
const FAQ_COUNT = 6

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'landing' })
  const faqLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    inLanguage: locale,
    mainEntity: Array.from({ length: FAQ_COUNT }, (_, i) => ({
      '@type': 'Question',
      name: t(`h3FaqQ${i + 1}`),
      acceptedAnswer: { '@type': 'Answer', text: t(`h3FaqA${i + 1}`) },
    })),
  }
  const ld = (data: object) => ({ __html: JSON.stringify(data).replace(/</g, '\\u003c') })
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={ld(jsonLd)} />
      <script type="application/ld+json" dangerouslySetInnerHTML={ld(faqLd)} />
      <HomeClient />
    </>
  )
}
