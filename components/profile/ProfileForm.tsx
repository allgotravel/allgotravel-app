'use client'
import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { createSupabaseBrowser } from '@/lib/supabase-browser'
import {
  Profile, DisabilityType, Medication, GroupMember,
  DISABILITY_ICONS, TIMEZONES,
} from '@/types/profile'

const ALL_DISABILITIES: DisabilityType[] = [
  'motriz', 'visual', 'auditiva', 'autismo', 'cognitiva', 'cronica_invisible', 'mixta',
]

interface Props {
  profile: Profile
}

export default function ProfileForm({ profile }: Props) {
  const supabase = createSupabaseBrowser()
  const t = useTranslations('profile')
  const tD = useTranslations('disabilities')
  const [form, setForm] = useState<Profile>(profile)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  function toggleDisability(type: DisabilityType) {
    setForm(prev => ({
      ...prev,
      disability_types: prev.disability_types.includes(type)
        ? prev.disability_types.filter(d => d !== type)
        : [...prev.disability_types, type],
      is_group_profile: type === 'mixta' ? !prev.disability_types.includes('mixta') : prev.is_group_profile,
    }))
  }

  function updateMedication(index: number, field: keyof Medication, value: string) {
    setForm(prev => {
      const meds = [...prev.medications]
      if (field === 'times') {
        meds[index] = { ...meds[index], times: value.split(',').map(t => t.trim()) }
      } else {
        meds[index] = { ...meds[index], [field]: value }
      }
      return { ...prev, medications: meds }
    })
  }

  function addMedication() {
    setForm(prev => ({
      ...prev,
      medications: [...prev.medications, { name: '', dose: '', times: ['08:00'] }],
    }))
  }

  function removeMedication(index: number) {
    setForm(prev => ({
      ...prev,
      medications: prev.medications.filter((_, i) => i !== index),
    }))
  }

  function updateGroupMember(index: number, field: keyof GroupMember, value: string | number | DisabilityType[]) {
    setForm(prev => {
      const members = [...prev.group_members]
      members[index] = { ...members[index], [field]: value }
      return { ...prev, group_members: members }
    })
  }

  function addGroupMember() {
    setForm(prev => ({
      ...prev,
      group_members: [...prev.group_members, { name: '', disability_types: [] }],
    }))
  }

  function removeGroupMember(index: number) {
    setForm(prev => ({
      ...prev,
      group_members: prev.group_members.filter((_, i) => i !== index),
    }))
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    await supabase.from('profiles').upsert({
      ...form,
      updated_at: new Date().toISOString(),
    })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const s = t('sections') as unknown as Record<string, string>

  return (
    <form onSubmit={handleSave} className="space-y-8 max-w-2xl mx-auto">

      {/* Datos básicos */}
      <section className="bg-white rounded-2xl shadow p-6 space-y-4">
        <h2 className="text-lg font-semibold text-teal-700">{t('sections.personal')}</h2>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('sections.personal')}</label>
          <input
            type="text"
            value={form.full_name ?? ''}
            onChange={e => setForm(p => ({ ...p, full_name: e.target.value }))}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-400"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('language')}</label>
          <select
            value={form.preferred_language}
            onChange={e => setForm(p => ({ ...p, preferred_language: e.target.value as 'es' | 'en' }))}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-400"
          >
            <option value="es">Español</option>
            <option value="en">English</option>
          </select>
        </div>
      </section>

      {/* Tipos de discapacidad */}
      <section className="bg-white rounded-2xl shadow p-6 space-y-4">
        <h2 className="text-lg font-semibold text-teal-700">{t('sections.disabilities')}</h2>
        <p className="text-sm text-gray-500">{t('sections.disabilitiesHint')}</p>
        <div className="grid grid-cols-2 gap-3">
          {ALL_DISABILITIES.map(type => {
            const selected = form.disability_types.includes(type)
            return (
              <button
                key={type}
                type="button"
                onClick={() => toggleDisability(type)}
                className={`flex items-center gap-2 p-3 rounded-xl border-2 text-left transition
                  ${selected
                    ? 'border-teal-500 bg-teal-50 text-teal-800 font-medium'
                    : 'border-gray-200 text-gray-600 hover:border-teal-300'}`}
              >
                <span className="text-xl">{DISABILITY_ICONS[type]}</span>
                <span className="text-sm">{tD(type)}</span>
              </button>
            )
          })}
        </div>
      </section>

      {/* Enfermedades crónicas */}
      {form.disability_types.includes('cronica_invisible') && (
        <section className="bg-white rounded-2xl shadow p-6 space-y-4">
          <h2 className="text-lg font-semibold text-teal-700">{t('sections.chronic')}</h2>
          <p className="text-sm text-gray-500">{t('sections.chronicHint')}</p>
          <textarea
            value={form.chronic_conditions ?? ''}
            onChange={e => setForm(p => ({ ...p, chronic_conditions: e.target.value }))}
            rows={3}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-400"
            placeholder={t('sections.chronicPlaceholder')}
          />
        </section>
      )}

      {/* Necesidades invisibles */}
      <section className="bg-white rounded-2xl shadow p-6 space-y-4">
        <h2 className="text-lg font-semibold text-teal-700">{t('sections.invisible')}</h2>
        <p className="text-sm text-gray-500">{t('sections.invisibleHint')}</p>
        <textarea
          value={form.invisible_needs ?? ''}
          onChange={e => setForm(p => ({ ...p, invisible_needs: e.target.value }))}
          rows={4}
          className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-400"
          placeholder={t('sections.invisiblePlaceholder')}
        />
      </section>

      {/* Alergias (crítico en emergencias) */}
      <section className="bg-white rounded-2xl shadow p-6 space-y-4">
        <h2 className="text-lg font-semibold text-teal-700">⚠️ Alergias / Allergies</h2>
        <p className="text-sm text-gray-500">
          Muy importante en una emergencia: medicamentos, alimentos, materiales (látex), etc.
        </p>
        <textarea
          value={form.allergies ?? ''}
          onChange={e => setForm(p => ({ ...p, allergies: e.target.value }))}
          rows={3}
          className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-400"
          placeholder="Ej: Penicilina, maní, látex…"
        />
      </section>

      {/* Medicamentos */}
      <section className="bg-white rounded-2xl shadow p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-teal-700">{t('sections.medications')}</h2>
            <p className="text-sm text-gray-500 mt-1">{t('sections.medicationsHint')}</p>
          </div>
          <button
            type="button"
            onClick={addMedication}
            className="text-sm bg-teal-100 text-teal-700 hover:bg-teal-200 px-3 py-1.5 rounded-lg font-medium transition"
          >
            {t('sections.addMedication')}
          </button>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('sections.timezone')}</label>
          <select
            value={form.timezone}
            onChange={e => setForm(p => ({ ...p, timezone: e.target.value }))}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-400"
          >
            {TIMEZONES.map(tz => (
              <option key={tz.value} value={tz.value}>{tz.label}</option>
            ))}
          </select>
        </div>

        {form.medications.map((med, i) => (
          <div key={i} className="border border-gray-200 rounded-xl p-4 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-600">{t('sections.medication')} {i + 1}</span>
              <button type="button" onClick={() => removeMedication(i)} className="text-red-400 hover:text-red-600 text-sm">
                {t('sections.medRemove')}
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">{t('sections.medName')}</label>
                <input
                  type="text"
                  value={med.name}
                  onChange={e => updateMedication(i, 'name', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">{t('sections.medDose')}</label>
                <input
                  type="text"
                  value={med.dose}
                  onChange={e => updateMedication(i, 'dose', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">{t('sections.medTimes')}</label>
              <input
                type="text"
                value={med.times.join(', ')}
                onChange={e => updateMedication(i, 'times', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
                placeholder={t('sections.medTimesPlaceholder')}
              />
            </div>
          </div>
        ))}

        {form.medications.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-4">{t('sections.noMedications')}</p>
        )}
      </section>

      {/* Grupo familiar */}
      {form.disability_types.includes('mixta') && (
        <section className="bg-white rounded-2xl shadow p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-teal-700">{t('sections.group')}</h2>
              <p className="text-sm text-gray-500 mt-1">{t('sections.groupHint')}</p>
            </div>
            <button
              type="button"
              onClick={addGroupMember}
              className="text-sm bg-teal-100 text-teal-700 hover:bg-teal-200 px-3 py-1.5 rounded-lg font-medium transition"
            >
              {t('sections.addMember')}
            </button>
          </div>
          {form.group_members.map((member, i) => (
            <div key={i} className="border border-gray-200 rounded-xl p-4 space-y-3">
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-600">Miembro {i + 1}</span>
                <button type="button" onClick={() => removeGroupMember(i)} className="text-red-400 hover:text-red-600 text-sm">
                  {t('sections.memberRemove')}
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">{t('sections.memberName')}</label>
                  <input
                    type="text"
                    value={member.name}
                    onChange={e => updateGroupMember(i, 'name', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">{t('sections.memberAge')}</label>
                  <input
                    type="number"
                    value={member.age ?? ''}
                    onChange={e => updateGroupMember(i, 'age', parseInt(e.target.value) || 0)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-2">{t('sections.memberNeeds')}</label>
                <div className="flex flex-wrap gap-2">
                  {ALL_DISABILITIES.filter(d => d !== 'mixta').map(type => {
                    const selected = member.disability_types.includes(type)
                    return (
                      <button
                        key={type}
                        type="button"
                        onClick={() => {
                          const updated = selected
                            ? member.disability_types.filter(d => d !== type)
                            : [...member.disability_types, type]
                          updateGroupMember(i, 'disability_types', updated)
                        }}
                        className={`text-xs px-2 py-1 rounded-lg border transition
                          ${selected ? 'border-teal-500 bg-teal-50 text-teal-700' : 'border-gray-200 text-gray-500'}`}
                      >
                        {DISABILITY_ICONS[type]} {tD(type)}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          ))}
        </section>
      )}

      {/* Guardar */}
      <div className="flex justify-end pb-8">
        <button
          type="submit"
          disabled={saving}
          className="bg-teal-600 hover:bg-teal-700 text-white font-semibold px-8 py-3 rounded-xl transition disabled:opacity-50 text-base"
        >
          {saving ? t('saving') : saved ? t('saved') : t('save')}
        </button>
      </div>
    </form>
  )
}
