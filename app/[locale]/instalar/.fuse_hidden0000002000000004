import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import QRCodeDisplay from '@/components/QRCodeDisplay'
import InstallTabs from '@/components/InstallTabs'

export default function InstalarPage() {
  const t = useTranslations('instalar')

  const iphoneSteps = [
    t('iphoneStep1'), t('iphoneStep2'), t('iphoneStep3'), t('iphoneStep4'), t('iphoneStep5'),
  ]
  const androidSteps = [
    t('androidStep1'), t('androidStep2'), t('androidStep3'), t('androidStep4'), t('androidStep5'),
  ]

  return (
    <main className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-100 py-10 px-4">
      <div className="max-w-xl mx-auto space-y-8">

        {/* Header */}
        <div>
          <Link href="/dashboard" className="text-[#1B6FB5] hover:underline text-sm font-medium">
            {t('backToDashboard')}
          </Link>
          <h1 className="text-3xl font-bold text-[#1B6FB5] mt-2">{t('title')}</h1>
          <p className="text-gray-500 mt-1">{t('subtitle')}</p>
        </div>

        {/* QR Code section */}
        <div className="bg-white rounded-2xl shadow p-6 text-center space-y-4">
          <h2 className="text-xl font-semibold text-gray-800">{t('qrTitle')}</h2>
          <p className="text-gray-500 text-sm">{t('qrSubtitle')}</p>
          <QRCodeDisplay />
        </div>

        {/* Step-by-step instructions with tabs */}
        <InstallTabs
          tabIphone={t('tabIphone')}
          tabAndroid={t('tabAndroid')}
          stepsTitle={t('stepsTitle')}
          iphoneSteps={iphoneSteps}
          androidSteps={androidSteps}
        />

        {/* Benefits */}
        <div>
          <h2 className="text-lg font-semibold text-gray-700 mb-4">{t('benefitsTitle')}</h2>
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white rounded-2xl shadow p-4 text-center space-y-2">
              <span className="text-3xl">🚀</span>
              <p className="font-semibold text-sm text-[#1B6FB5]">{t('benefit1Title')}</p>
              <p className="text-xs text-gray-500 leading-snug">{t('benefit1Desc')}</p>
            </div>
            <div className="bg-white rounded-2xl shadow p-4 text-center space-y-2">
              <span className="text-3xl">📶</span>
              <p className="font-semibold text-sm text-[#0D9488]">{t('benefit2Title')}</p>
              <p className="text-xs text-gray-500 leading-snug">{t('benefit2Desc')}</p>
            </div>
            <div className="bg-white rounded-2xl shadow p-4 text-center space-y-2">
              <span className="text-3xl">🔔</span>
              <p className="font-semibold text-sm text-[#F97316]">{t('benefit3Title')}</p>
              <p className="text-xs text-gray-500 leading-snug">{t('benefit3Desc')}</p>
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-gray-400">
          AllGo Travel · Turismo accesible para todos 🌍
        </p>
      </div>
    </main>
  )
}
