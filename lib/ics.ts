/**
 * Generador de archivos .ics (calendario) — para que el teléfono del usuario
 * dé los avisos de forma nativa y confiable (iPhone y Android), sin backend.
 *
 * - Documentos: eventos a los 90, 60, 30 días y el día del vencimiento.
 * - Medicamentos: evento diario recurrente a cada hora elegida.
 */

import { TravelDocument, docTypeDef } from '@/lib/expiry'
import { Medication } from '@/types/profile'
import { formatMedTime } from '@/lib/medtime'

function pad(n: number): string {
  return String(n).padStart(2, '0')
}

function ymd(d: Date): string {
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}`
}

function esc(s: string): string {
  return (s || '').replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n')
}

function uid(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}@allgotravel.app`
}

function wrap(events: string[]): string {
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//AllGo Travel App//Reminders//ES',
    'CALSCALE:GREGORIAN',
    ...events,
    'END:VCALENDAR',
  ].join('\r\n')
}

const OFFSETS: { days: number; badge: string; es: (t: string) => string; en: (t: string) => string }[] = [
  { days: 90, badge: '🟡', es: t => `🟡 Empieza a renovar: ${t} (faltan 90 días)`, en: t => `🟡 Start renewing: ${t} (90 days left)` },
  { days: 60, badge: '🟠', es: t => `🟠 Renovar pronto: ${t} (faltan 60 días)`, en: t => `🟠 Renew soon: ${t} (60 days left)` },
  { days: 30, badge: '🔴', es: t => `🔴 URGENTE renovar: ${t} (faltan 30 días)`, en: t => `🔴 URGENT renew: ${t} (30 days left)` },
  { days: 0, badge: '⛔', es: t => `⛔ Vence hoy: ${t}`, en: t => `⛔ Expires today: ${t}` },
]

/** Recordatorios de vencimiento de documentos (persona y perro). */
export function buildDocsIcs(docs: TravelDocument[], en = false): string {
  const events: string[] = []
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  for (const doc of docs) {
    if (!doc.expiry_date) continue
    const def = docTypeDef(doc.doc_type)
    const name = (en ? def?.en : def?.es) || doc.doc_type
    const who = doc.owner === 'dog' ? (en ? ' (dog)' : ' (perro)') : ''
    const title = `${name}${who}${doc.label ? ' — ' + doc.label : ''}`
    const expiry = new Date(doc.expiry_date + 'T00:00:00')

    for (const off of OFFSETS) {
      const when = new Date(expiry)
      when.setDate(when.getDate() - off.days)
      if (when < today) continue // no crear avisos en el pasado
      const summary = en ? off.en(title) : off.es(title)
      const how = (en ? def?.renewEn : def?.renewEs) || ''
      events.push(
        [
          'BEGIN:VEVENT',
          `UID:${uid()}`,
          `DTSTAMP:${ymd(today)}T090000Z`,
          `DTSTART;VALUE=DATE:${ymd(when)}`,
          `SUMMARY:${esc(summary)}`,
          `DESCRIPTION:${esc(how + '  — AllGo Travel App')}`,
          'BEGIN:VALARM',
          'TRIGGER:PT0S',
          'ACTION:DISPLAY',
          `DESCRIPTION:${esc(summary)}`,
          'END:VALARM',
          'END:VEVENT',
        ].join('\r\n'),
      )
    }
  }
  return wrap(events)
}

/** Alarmas diarias de medicamentos a cada hora elegida. */
export function buildMedsIcs(meds: Medication[], en = false): string {
  const events: string[] = []
  const today = new Date()
  for (const med of meds) {
    if (!med.name || !med.times || med.times.length === 0) continue
    for (const time of med.times) {
      const m = /^(\d{1,2}):(\d{2})$/.exec(String(time).trim())
      if (!m) continue
      const hh = pad(Number(m[1]))
      const mm = pad(Number(m[2]))
      const pretty = formatMedTime(time)
      const summary = en
        ? `💊 Take ${med.name}${med.dose ? ' — ' + med.dose : ''}`
        : `💊 Tomar ${med.name}${med.dose ? ' — ' + med.dose : ''}`
      events.push(
        [
          'BEGIN:VEVENT',
          `UID:${uid()}`,
          `DTSTAMP:${ymd(today)}T000000Z`,
          `DTSTART:${ymd(today)}T${hh}${mm}00`, // hora local flotante
          'DURATION:PT10M',
          'RRULE:FREQ=DAILY',
          `SUMMARY:${esc(summary)} (${pretty})`,
          `DESCRIPTION:${esc('Recordatorio de medicamento — AllGo Travel App')}`,
          'BEGIN:VALARM',
          'TRIGGER:PT0S',
          'ACTION:DISPLAY',
          `DESCRIPTION:${esc(summary)}`,
          'END:VALARM',
          'END:VEVENT',
        ].join('\r\n'),
      )
    }
  }
  // Avisos de resurtido (7 días antes de la fecha)
  for (const med of meds) {
    if (!med.name || !med.refill_date) continue
    const d = new Date(med.refill_date + 'T00:00:00')
    if (isNaN(d.getTime())) continue
    const remind = new Date(d)
    remind.setDate(remind.getDate() - 7)
    const when = remind >= today ? remind : d
    const summary = (en ? '🔁 Refill: ' : '🔁 Resurtir: ') + med.name
    events.push(
      [
        'BEGIN:VEVENT',
        `UID:${uid()}`,
        `DTSTAMP:${ymd(today)}T000000Z`,
        `DTSTART;VALUE=DATE:${ymd(when)}`,
        `SUMMARY:${esc(summary)}`,
        'BEGIN:VALARM',
        'TRIGGER:PT0S',
        'ACTION:DISPLAY',
        `DESCRIPTION:${esc(summary)}`,
        'END:VALARM',
        'END:VEVENT',
      ].join('\r\n'),
    )
  }

  return wrap(events)
}

/** Descarga/abre un .ics en el navegador (el teléfono ofrece "Agregar a calendario"). */
export function downloadIcs(filename: string, content: string) {
  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  setTimeout(() => URL.revokeObjectURL(url), 2000)
}
