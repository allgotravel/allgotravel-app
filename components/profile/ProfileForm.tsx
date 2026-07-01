'use client'
import { useState } from 'react'
import { createSupabaseBrowser } from '@/lib/supabase-browser'
import {
  Profile, DisabilityType, Medication, GroupMember,
  DISABILITY_LABELS, DISABILITY_ICONS, TIMEZONES,
} from '@/types/profile'

const ALL_DISABILITIES: DisabilityType[] = [
  'motriz', 'visual', 'auditiva', 'autismo', 'cognitiva', 'cronica_invisible', 'mixta',
]

interface Props {
  profile: Profile
}

export default function ProfileForm({ profile }: Props) {
  const supabase = createSupabaseBrowser()
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

  return (
    <form onSubmit={handleSave} className="space-y-8 max-w-2xl mx-auto">

      {/* Datos básicos */}
      <section className="bg-white rounded-2xl shadow p-6 space-y-4">
        <h2 className="text-lg font-semibold text-teal-700">Datos personales</h2>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nombre completo</label>
          <input
            type="text"
            value={form.full_name ?? ''}
            onChange={e => setForm(p => ({ ...p, full_name: e.target.value }))}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-400"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Idioma preferido</label>
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
        <h2 className="text-lg font-semibold text-teal-700">Tipo(s) de discapacidad</h2>
        <p className="text-sm text-gray-500">Selecciona todos los que apliquen.</p>
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
                <span className="text-sm">{DISABILITY_LABELS[type]}</span>
              </button>
            )
          })}
        </div>
      </section>

      {/* Enfermedades crónicas */}
      {form.disability_types.includes('cronica_invisible') && (
        <section className="bg-white rounded-2xl shadow p-6 space-y-4">
          <h2 className="text-lg font-semibold text-teal-700">Enfermedades crónicas o invisibles</h2>
          <p className="text-sm text-gray-500">Escribe tus condiciones (ej: fibromialgia, POTS, diabetes tipo 1).</p>
          <textarea
            value={form.chronic_conditions ?? ''}
            onChange={e => setForm(p => ({ ...p, chronic_conditions: e.target.value }))}
            rows={3}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-400"
            placeholder="fibromialgia, POTS, Crohn..."
          />
        </section>
      )}

      {/* Necesidades invisibles */}
      <section className="bg-white rounded-2xl shadow p-6 space-y-4">
        <h2 className="text-lg font-semibold text-teal-700">Necesidades invisibles</h2>
        <p className="text-sm text-gray-500">
          Lo que no se ve pero importa para viajar. Esto ayuda al chatbot a darte recomendaciones personalizadas.
        </p>
        <textarea
          value={form.invisible_needs ?? ''}
          onChange={e => setForm(p => ({ ...p, invisible_needs: e.target.value }))}
          rows={4}
          className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-400"
          placeholder="Ej: necesito descansar cada 30 min, no tolero ruidos fuertes, requiero acceso a refrigeración para medicamentos..."
        />
      </section>

      {/* Medicamentos */}
      <section className="bg-white rounded-2xl shadow p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-teal-700">Recordatorio de medicamentos</h2>
            <p className="text-sm text-gray-500 mt-1">Los horarios se ajustan a tu zona horaria.</p>
          </div>
          <button
            type="button"
            onClick={addMedication}
            className="text-sm bg-teal-100 text-teal-700 hover:bg-teal-200 px-3 py-1.5 rounded-lg font-medium transition"
          >
            + Agregar
          </button>
        </div>

        {/* Zona horaria */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Zona horaria</label>
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
              <span className="text-sm font-medium text-gray-600">Medicamento {i + 1}</span>
              <button type="button" onClick={() => removeMedication(i)} className="text-red-400 hover:text-red-600 text-sm">
                Eliminar
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Nombre</label>
                <input
                  type="text"
                  value={med.name}
                  onChange={e => updateMedication(i, 'name', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
                  placeholder="Metformina"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Dosis</label>
                <input
                  type="text"
                  value={med.dose}
                  onChange={e => updateMedication(i, 'dose', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
                  placeholder="500mg"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Horarios (separados por coma)</label>
              <input
                type="text"
                value={med.times.join(', ')}
                onChange={e => updateMedication(i, 'times', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
                placeholder="08:00, 14:00, 20:00"
              />
            </div>
          </div>
        ))}

        {form.medications.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-4">No hay medicamentos registrados.</p>
        )}
      </section>

      {/* Grupo familiar */}
      {form.disability_types.includes('mixta') && (
        <section className="bg-white rounded-2xl shadow p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-teal-700">Miembros del grupo</h2>
              <p className="text-sm text-gray-500 mt-1">Agrega a las personas que viajan contigo.</p>
            </div>
            <button
              type="button"
              onClick={addGroupMember}
              className="text-sm bg-teal-100 text-teal-700 hover:bg-teal-200 px-3 py-1.5 rounded-lg font-medium transition"
            >
              + Agregar
            </button>
          </div>
          {form.group_members.map((member, i) => (
            <div key={i} className="border border-gray-200 rounded-xl p-4 space-y-3">
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-600">Miembro {i + 1}</span>
                <button type="button" onClick={() => removeGroupMember(i)} className="text-red-400 hover:text-red-600 text-sm">
                  Eliminar
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Nombre</label>
                  <input
                    type="text"
                    value={member.name}
                    onChange={e => updateGroupMember(i, 'name', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Edad (opcional)</label>
                  <input
                    type="number"
                    value={member.age ?? ''}
                    onChange={e => updateGroupMember(i, 'age', parseInt(e.target.value) || 0)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-2">Necesidades de accesibilidad</label>
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
                        {DISABILITY_ICONS[type]} {DISABILITY_LABELS[type]}
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
          {saving ? 'Guardando...' : saved ? '¡Guardado!' : 'Guardar perfil'}
        </button>
      </div>
    </form>
  )
}
