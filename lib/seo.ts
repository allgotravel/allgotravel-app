import type { Metadata } from 'next'

type Copy = { es: string; en: string }

// Per-page metadata for /es and /en pages: unique title/description, canonical, hreflang and Open Graph.
export function localizedMetadata(locale: string, path: string, title: Copy, description: Copy, image = '/og/og-home.jpg'): Metadata {
  const en = locale === 'en'
  const t = en ? title.en : title.es
  const d = en ? description.en : description.es
  return {
    title: t,
    description: d,
    alternates: {
      canonical: `/${locale}${path}`,
      languages: { es: `/es${path}`, en: `/en${path}`, 'x-default': `/es${path}` },
    },
    openGraph: {
      title: t,
      description: d,
      url: `/${locale}${path}`,
      siteName: 'AllGo Travel App',
      locale: en ? 'en_US' : 'es_ES',
      type: 'website',
      images: [{ url: image, width: 1200, height: 630, alt: 'AllGo Travel App' }],
    },
    twitter: { card: 'summary_large_image', title: t, description: d, images: [image] },
  }
}
