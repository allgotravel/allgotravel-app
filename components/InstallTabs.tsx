'use client'

import { useState } from 'react'

type Props = {
  tabIphone: string
  tabAndroid: string
  stepsTitle: string
  iphoneSteps: string[]
  androidSteps: string[]
}

export default function InstallTabs({ tabIphone, tabAndroid, stepsTitle, iphoneSteps, androidSteps }: Props) {
  const [active, setActive] = useState<'iphone' | 'android'>('iphone')

  const steps = active === 'iphone' ? iphoneSteps : androidSteps

  return (
    <div className="bg-white rounded-2xl shadow p-6">
      <h2 className="text-lg font-semibold text-gray-700 mb-4">{stepsTitle}</h2>

      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActive('iphone')}
          className={`flex-1 py-2.5 px-4 rounded-xl font-semibold text-sm transition-all ${
            active === 'iphone'
              ? 'bg-[#1B6FB5] text-white shadow'
              : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
          }`}
        >
          🍎 {tabIphone}
        </button>
        <button
          onClick={() => setActive('android')}
          className={`flex-1 py-2.5 px-4 rounded-xl font-semibold text-sm transition-all ${
            active === 'android'
              ? 'bg-[#0D9488] text-white shadow'
              : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
          }`}
        >
          🤖 {tabAndroid}
        </button>
      </div>

      <ol className="space-y-3">
        {steps.map((step, i) => (
          <li key={i} className="flex items-start gap-3">
            <span className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-white text-sm font-bold ${
              active === 'iphone' ? 'bg-[#1B6FB5]' : 'bg-[#0D9488]'
            }`}>
              {i + 1}
            </span>
            <span className="text-gray-700 pt-0.5 leading-snug">{step}</span>
          </li>
        ))}
      </ol>
    </div>
  )
}
