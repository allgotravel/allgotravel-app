import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { routing } from '@/i18n/routing'
import { createSupabaseServer } from '@/lib/supabase-server'
import ChatWidget from '@/components/ChatWidget'
import OfflineBanner from '@/components/OfflineBanner'
import ServiceWorkerRegister from '@/components/ServiceWorkerRegister'
import MetaPixel from '@/components/MetaPixel'
import '../globals.css'

const geist = Geist({ subsets: ['latin'], variable: '--font-geist-sans' })

export const metadata: Metadata = {
  title: 'AllGo Travel App',
  description: 'Membresías de turismo accesible / Accessible travel memberships',
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

  return (
    <html lang={locale} className={`${geist.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <MetaPixel />
        <NextIntlClientProvider messages={messages}>
          <ServiceWorkerRegister />
          <OfflineBanner />
          {children}
          <ChatWidget userId={user?.id} />
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
