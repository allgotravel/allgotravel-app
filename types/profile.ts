export type DisabilityType =
  | 'motriz'
  | 'visual'
  | 'auditiva'
  | 'autismo'
  | 'cognitiva'
  | 'cronica_invisible'
  | 'mixta'

export interface Medication {
  name: string
  dose: string
  times: string[] // "08:00", "20:00"
}

export interface GroupMember {
  name: string
  age?: number
  disability_types: DisabilityType[]
}

export interface Profile {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  disability_types: DisabilityType[]
  chronic_conditions: string | null
  invisible_needs: string | null
  medications: Medication[]
  timezone: string
  is_group_profile: boolean
  group_members: GroupMember[]
  preferred_language: 'es' | 'en'
  created_at: string
  updated_at: string
}

export const DISABILITY_LABELS: Record<DisabilityType, string> = {
  motriz: 'Motriz / Movilidad reducida',
  visual: 'Visual',
  auditiva: 'Auditiva',
  autismo: 'Autismo / TEA',
  cognitiva: 'Cognitiva',
  cronica_invisible: 'Enfermedad crónica o invisible',
  mixta: 'Mixta (grupo familiar)',
}

export const DISABILITY_ICONS: Record<DisabilityType, string> = {
  motriz: '♿',
  visual: '👁️',
  auditiva: '👂',
  autismo: '🧩',
  cognitiva: '🧠',
  cronica_invisible: '🫀',
  mixta: '👨‍👩‍👧',
}

export const TIMEZONES = [
  { value: 'America/Mexico_City', label: 'Ciudad de México (GMT-6)' },
  { value: 'America/Bogota', label: 'Colombia (GMT-5)' },
  { value: 'America/Lima', label: 'Perú (GMT-5)' },
  { value: 'America/Santiago', label: 'Chile (GMT-3)' },
  { value: 'America/Argentina/Buenos_Aires', label: 'Argentina (GMT-3)' },
  { value: 'America/New_York', label: 'Este EE.UU. (GMT-4)' },
  { value: 'America/Los_Angeles', label: 'Oeste EE.UU. (GMT-7)' },
  { value: 'Europe/Madrid', label: 'España (GMT+2)' },
]
