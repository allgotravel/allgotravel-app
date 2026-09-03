'use client'

import { useState } from 'react'
import { createSupabaseBrowser } from '@/lib/supabase-browser'
import {
  TravelDocument, DocOwner, DOC_TYPES, docTypeDef,
  expiryStatus, daysUntil,
} from '@/lib/expiry'
import { buildDocsIcs, downloadIcs } from '@/lib/ics'

interface Props {
  initialDocs: TravelDocument[]
  userId: string
  en?: boolean
}

export default function DocumentsVault({ initialDocs, userId, en = false }: Props) {
  const supabase = createSupabaseBrowser()
  const [docs, setDocs] = useState<TravelDocument[]>(initialDocs)
  const [adding, setAdding] = useState(false)
  const [owner, setOwner] = useState<DocOwner>('person')
  const [docType, setDocType] = useState('')
  const [label, setLabel] = useState('')
  const [expiry, setExpiry] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [saving, setSaving] = useState(false)

  async function openFile(path: string) {
    const { data } = await supabase.storage.from('vault').createSignedUrl(path, 120)
    if (data?.signedUrl) window.open(data.signedUrl, '_blank')
  }

  const sorted = [...docs].sort((a, b) => {
    const da = daysUntil(a.expiry_date)
    const db = daysUntil(b.expiry_date)
    if (da === null) return 1
    if (db === null) return -1
    return da - db
  })

  async function addDoc() {
    if (!docType) return
    setSaving(true)
    const row = {
      user_id: userId,
      owner,
      doc_type: docType,
      label: label || null,
      expiry_date: expiry || null,
      note: null,
    }
    const { data, error } = await supabase.from('documents').insert(row).select().single()
    let saved = data as TravelDocument | null
    if (!error && saved && file) {
      const ext = file.name.split('.').pop() || 'jpg'
      const path = `${userId}/${saved.id}.${ext}`
      const up = await supabase.storage.from('vault').upload(path, file, { upsert: true })
      if (!up.error) {
        await supabase.from('documents').update({ file_path: path }).eq('id', saved.id)
        saved = { ...saved, file_path: path }
      }
    }
    setSaving(false)
    if (!error && saved) {
      setDocs(prev => [saved as TravelDocument, ...prev])
      setAdding(false)
      setDocType(''); setLabel(''); setExpiry(''); setOwner('person'); setFile(null)
    }
  }

  async function removeDoc(id: string) {
    await supabase.from('documents').delete().eq('id', id)
    setDocs(prev => prev.filter(d => d.id !== id))
  }

  const typesForOwner = DOC_TYPES.filter(d => d.owner === owner)

  return (
    <div className="space-y-5">
      {/* Lista / Próximos vencimientos */}
      {sorted.length === 0 && !adding && (
        <p className="text-center text-gray-400 py-6 text-lg">
          {en ? 'No documents yet. Add your first one.' : 'Aún no hay documentos. Agrega el primero.'}
        </p>
      )}

      <div className="space-y-3">
        {sorted.map(doc => {
          const def = docTypeDef(doc.doc_type)
          const st = expiryStatus(doc.expiry_date)
          const showRenew = st.level === 'd90' || st.level === 'd60' || st.level === 'd30' || st.level === 'expired'
          return (
            <div key={doc.id} className={`border-2 rounded-2xl p-4 ${st.bg}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <span className="text-3xl" aria-hidden>{def?.icon ?? '📄'}</span>
                  <div>
                    <p className="text-lg font-bold text-gray-800">
                      {en ? def?.en : def?.es}
                      {doc.owner === 'dog' && <span className="ml-2 text-sm text-amber-700">🐕‍🦺</span>}
                    </p>
                    {doc.label && <p className="text-sm text-gray-600">{doc.label}</p>}
                    <p className={`text-base font-semibold mt-1 ${st.color}`}>
                      <span className={st.level === 'd30' || st.level === 'expired' ? 'allgo-urgent' : ''}>{st.badge}</span> {en ? st.labelEn : st.labelEs}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removeDoc(doc.id)}
                  aria-label={en ? 'Delete' : 'Borrar'}
                  className="text-gray-400 hover:text-red-600 text-2xl leading-none px-2"
                >
                  ×
                </button>
              </div>
              {doc.file_path && (
                <button
                  type="button"
                  onClick={() => openFile(doc.file_path as string)}
                  className="mt-3 inline-flex items-center gap-2 bg-white border-2 border-gray-300 rounded-xl px-4 py-2 text-sm font-semibold text-gray-700 hover:border-teal-400"
                >
                  📎 {en ? 'View document' : 'Ver documento'}
                </button>
              )}
              {showRenew && def && (
                <p className="mt-3 text-sm text-gray-700 bg-white/70 rounded-xl p-3 border border-gray-200">
                  <span className="font-semibold">{en ? 'How to renew: ' : 'Cómo renovar: '}</span>
                  {en ? def.renewEn : def.renewEs}
                </p>
              )}
            </div>
          )
        })}
      </div>

      {/* Poner recordatorios en el calendario del teléfono */}
      {docs.some(d => d.expiry_date) && (
        <button
          type="button"
          onClick={() => downloadIcs('avisos-documentos-allgo.ics', buildDocsIcs(docs, en))}
          className="w-full min-h-[56px] rounded-2xl bg-[#1B6FB5] text-white text-base font-bold shadow hover:bg-blue-700 flex items-center justify-center gap-2"
        >
          <span className="allgo-alarm">📅</span>
          {en ? 'Add reminders to my phone (90/60/30 days)' : 'Poner avisos en mi teléfono (90/60/30 días)'}
        </button>
      )}

      {/* Botón agregar */}
      {!adding && (
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="w-full min-h-[60px] rounded-2xl bg-teal-600 text-white text-lg font-bold shadow hover:bg-teal-700"
        >
          ＋ {en ? 'Add document' : 'Agregar documento'}
        </button>
      )}

      {/* Formulario agregar */}
      {adding && (
        <div className="border-2 border-teal-200 rounded-2xl p-4 space-y-4 bg-white">
          {/* ¿De quién? */}
          <div>
            <label className="block text-base font-semibold text-gray-700 mb-2">
              {en ? 'Whose document?' : '¿De quién es?'}
            </label>
            <div className="flex gap-3">
              {(['person', 'dog'] as DocOwner[]).map(o => (
                <button
                  key={o}
                  type="button"
                  aria-pressed={owner === o}
                  onClick={() => { setOwner(o); setDocType('') }}
                  className={
                    'flex-1 min-h-[56px] rounded-xl border-2 text-lg font-bold ' +
                    (owner === o ? 'bg-teal-600 border-teal-600 text-white' : 'bg-white border-gray-300 text-gray-800')
                  }
                >
                  {o === 'person' ? (en ? '🧍 Me' : '🧍 Mía') : (en ? '🐕‍🦺 My dog' : '🐕‍🦺 Mi perro')}
                </button>
              ))}
            </div>
          </div>

          {/* Tipo */}
          <div>
            <label className="block text-base font-semibold text-gray-700 mb-2">
              {en ? 'Type of document' : 'Tipo de documento'}
            </label>
            <div className="grid grid-cols-2 gap-2">
              {typesForOwner.map(d => (
                <button
                  key={d.value}
                  type="button"
                  aria-pressed={docType === d.value}
                  onClick={() => setDocType(d.value)}
                  className={
                    'min-h-[56px] rounded-xl border-2 text-base font-semibold px-2 flex items-center gap-2 justify-center text-center ' +
                    (docType === d.value ? 'bg-teal-600 border-teal-600 text-white' : 'bg-white border-gray-300 text-gray-800')
                  }
                >
                  <span className="text-xl">{d.icon}</span> {en ? d.en : d.es}
                </button>
              ))}
            </div>
          </div>

          {/* Fecha de vencimiento */}
          <div>
            <label className="block text-base font-semibold text-gray-700 mb-1">
              {en ? 'Expiry date' : 'Fecha de vencimiento'}
            </label>
            <input
              type="date"
              value={expiry}
              onChange={e => setExpiry(e.target.value)}
              className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-teal-400"
            />
          </div>

          {/* Nota / nombre opcional */}
          <div>
            <label className="block text-base font-semibold text-gray-700 mb-1">
              {en ? 'Note (optional)' : 'Nota (opcional)'}
            </label>
            <input
              type="text"
              value={label}
              onChange={e => setLabel(e.target.value)}
              className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-teal-400"
              placeholder={en ? 'E.g.: number, country…' : 'Ej: número, país…'}
            />
          </div>

          {/* Foto / escaneo del documento */}
          <div>
            <label className="block text-base font-semibold text-gray-700 mb-1">
              📎 {en ? 'Photo or scan (optional)' : 'Foto o escaneo (opcional)'}
            </label>
            <input
              type="file"
              accept="image/*,application/pdf"
              onChange={e => setFile(e.target.files?.[0] ?? null)}
              className="w-full text-base file:mr-3 file:py-3 file:px-4 file:rounded-xl file:border-0 file:bg-teal-600 file:text-white file:font-semibold"
            />
            {file && <p className="text-sm text-gray-500 mt-1">✓ {file.name}</p>}
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => { setAdding(false); setDocType(''); setLabel(''); setExpiry('') }}
              className="flex-1 min-h-[56px] rounded-xl border-2 border-gray-300 text-gray-700 text-lg font-semibold"
            >
              {en ? 'Cancel' : 'Cancelar'}
            </button>
            <button
              type="button"
              onClick={addDoc}
              disabled={!docType || saving}
              className="flex-1 min-h-[56px] rounded-xl bg-teal-600 text-white text-lg font-bold disabled:opacity-50"
            >
              {saving ? (en ? 'Saving…' : 'Guardando…') : (en ? 'Save' : 'Guardar')}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
