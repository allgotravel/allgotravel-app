/** Utilidades de hora de medicamento. Guardamos "HH:MM" (24h) y mostramos 12h. */

/** 8 -> { big: "8:00", small: "a.m." } */
export function pretty(h: number): { big: string; small: string } {
  const am = h < 12
  let hr = h % 12
  if (hr === 0) hr = 12
  return { big: `${hr}:00`, small: am ? 'a.m.' : 'p.m.' }
}

/** "08:00" -> "8:00 a.m."  ·  valores viejos raros se dejan igual */
export function formatMedTime(value: string): string {
  const m = /^(\d{1,2}):(\d{2})$/.exec(String(value).trim())
  if (!m) return String(value).trim()
  const h = Number(m[1])
  if (h < 0 || h > 23) return String(value).trim()
  const p = pretty(h)
  return `${p.big} ${p.small}`
}

/** Lista de horas -> "8:00 a.m., 8:00 p.m." (sin valores vacíos) */
export function formatMedTimes(times: string[] | null | undefined): string {
  if (!times || times.length === 0) return ''
  return times.map(formatMedTime).filter(Boolean).join(', ')
}
