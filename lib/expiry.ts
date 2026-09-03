/** Lógica de vencimiento de documentos: estados 90 / 60 / 30 días + vencido. */

export type DocOwner = 'person' | 'dog'

export interface TravelDocument {
  id: string
  user_id?: string
  owner: DocOwner
  doc_type: string
  label: string | null
  expiry_date: string | null // "YYYY-MM-DD"
  note: string | null
  file_path?: string | null // ruta en el bucket 'vault' (foto/escaneo)
}

export type ExpiryLevel = 'none' | 'ok' | 'd90' | 'd60' | 'd30' | 'expired'

export interface ExpiryStatus {
  level: ExpiryLevel
  daysLeft: number | null
  badge: string // emoji
  color: string // tailwind text color class
  bg: string // tailwind bg+border classes
  labelEs: string
  labelEn: string
}

export function daysUntil(dateStr: string | null): number | null {
  if (!dateStr) return null
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const d = new Date(dateStr + 'T00:00:00')
  if (isNaN(d.getTime())) return null
  return Math.round((d.getTime() - today.getTime()) / 86400000)
}

export function expiryStatus(dateStr: string | null): ExpiryStatus {
  const days = daysUntil(dateStr)
  if (days === null) {
    return { level: 'none', daysLeft: null, badge: '⚪', color: 'text-gray-400', bg: 'bg-gray-50 border-gray-200', labelEs: 'Sin fecha', labelEn: 'No date' }
  }
  if (days < 0) {
    return { level: 'expired', daysLeft: days, badge: '⛔', color: 'text-red-700', bg: 'bg-red-100 border-red-300', labelEs: '¡Vencido!', labelEn: 'Expired!' }
  }
  if (days <= 30) {
    return { level: 'd30', daysLeft: days, badge: '🔴', color: 'text-red-600', bg: 'bg-red-50 border-red-200', labelEs: `Urgente · vence en ${days} días`, labelEn: `Urgent · ${days} days left` }
  }
  if (days <= 60) {
    return { level: 'd60', daysLeft: days, badge: '🟠', color: 'text-orange-600', bg: 'bg-orange-50 border-orange-200', labelEs: `Vence en ${days} días`, labelEn: `${days} days left` }
  }
  if (days <= 90) {
    return { level: 'd90', daysLeft: days, badge: '🟡', color: 'text-yellow-700', bg: 'bg-yellow-50 border-yellow-200', labelEs: `Empieza a renovar · ${days} días`, labelEn: `Start renewing · ${days} days` }
  }
  return { level: 'ok', daysLeft: days, badge: '🟢', color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200', labelEs: `Al día · ${days} días`, labelEn: `OK · ${days} days` }
}

interface DocTypeDef {
  value: string
  owner: DocOwner
  es: string
  en: string
  icon: string
  renewEs: string
  renewEn: string
}

export const DOC_TYPES: DocTypeDef[] = [
  { value: 'pasaporte', owner: 'person', es: 'Pasaporte', en: 'Passport', icon: '🛂', renewEs: 'Renuévalo en la oficina o el sitio oficial de pasaportes de tu país. Puede tardar semanas.', renewEn: 'Renew at your country’s official passport office/site. Can take weeks.' },
  { value: 'visa', owner: 'person', es: 'Visa', en: 'Visa', icon: '📄', renewEs: 'Consulta con el consulado o la embajada del país de destino.', renewEn: 'Check with the destination country’s consulate or embassy.' },
  { value: 'licencia', owner: 'person', es: 'Licencia / ID', en: 'License / ID', icon: '🪪', renewEs: 'Renueva en el departamento de tránsito (DMV) de tu estado.', renewEn: 'Renew at your state DMV.' },
  { value: 'seguro_viaje', owner: 'person', es: 'Seguro de viaje', en: 'Travel insurance', icon: '🛡️', renewEs: 'Renueva o compra con tu proveedor antes del próximo viaje.', renewEn: 'Renew or buy with your provider before the next trip.' },
  { value: 'seguro_medico', owner: 'person', es: 'Seguro médico', en: 'Health insurance', icon: '🏥', renewEs: 'Confirma la vigencia con tu aseguradora.', renewEn: 'Confirm coverage with your insurer.' },
  { value: 'otro_persona', owner: 'person', es: 'Otro documento', en: 'Other document', icon: '📎', renewEs: 'Renueva con la entidad que lo emitió.', renewEn: 'Renew with the issuing entity.' },
  { value: 'formulario_dot', owner: 'dog', es: 'Formulario del DOT', en: 'DOT form', icon: '📝', renewEs: 'El formulario del DOT se llena para cada vuelo; ten la versión vigente antes de viajar.', renewEn: 'The DOT form is filled per flight; have a current one before traveling.' },
  { value: 'vacuna_rabia', owner: 'dog', es: 'Vacuna antirrábica', en: 'Rabies vaccine', icon: '💉', renewEs: 'Agenda con tu veterinario; suele renovarse cada 1 a 3 años.', renewEn: 'Schedule with your vet; usually every 1–3 years.' },
  { value: 'certificado_vet', owner: 'dog', es: 'Certificado veterinario', en: 'Vet health certificate', icon: '🩺', renewEs: 'Pide a tu veterinario un certificado de salud reciente antes de viajar.', renewEn: 'Ask your vet for a recent health certificate before traveling.' },
  { value: 'otro_perro', owner: 'dog', es: 'Otro (perro)', en: 'Other (dog)', icon: '🐾', renewEs: 'Renueva con tu veterinario o la entidad que lo emitió.', renewEn: 'Renew with your vet or the issuing entity.' },
]

export function docTypeDef(value: string): DocTypeDef | undefined {
  return DOC_TYPES.find(d => d.value === value)
}
