import type { Metadata } from 'next'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { routing } from '@/i18n/routing'
import { createSupabaseServer } from '@/lib/supabase-server'
import ChatWidget from '@/components/ChatWidget'
import OfflineBanner from '@/components/OfflineBanner'
import ServiceWorkerRegister from '@/components/ServiceWorkerRegister'
import '../globals.css'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const en = locale === 'en'
  return {
    title: en ? 'AllGo Travel App — Travel is for everyone' : 'AllGo Travel App — Viajar es para todos',
    description: en
      ? 'Travel is for everyone. Verified info, Alli your AI assistant, guides and a community — so anyone can travel without fear.'
      : 'Viajar es para todos. Información verificada, Alli tu asistente con IA, guías y comunidad — para que cualquier persona viaje sin miedo.',
    openGraph: {
      siteName: 'AllGo Travel App',
      locale: en ? 'en_US' : 'es_ES',
      type: 'website',
      images: [{ url: '/og/og-home.jpg', width: 1200, height: 630, alt: 'AllGo Travel App' }],
    },
    twitter: { card: 'summary_large_image', images: ['/og/og-home.jpg'] },
  }
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params

  if (!routing.locales.includes(locale as 'es' | 'en')) {
    notFound()
  }

  const messages = await getMessages()

  let user = null
  try {
    const supabase = await createSupabaseServer()
    const { data } = await supabase.auth.getUser()
    user = data.user
  } catch {
    // If Supabase fails, continue without user (ChatWidget won't have userId)
  }

  // <html>/<body> come from the root layout (app/layout.tsx), so there is only one <html lang>
  return (
    <NextIntlClientProvider messages={messages}>
      <ServiceWorkerRegister />
      <OfflineBanner />
      {children}
      <ChatWidget userId={user?.id} />
    </NextIntlClientProvider>
  )
}
