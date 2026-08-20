export function todayIso(): string {
  return new Date().toISOString().slice(0, 10)
}

export function addDays(iso: string, days: number): string {
  const d = new Date(iso + 'T00:00:00')
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

/** Kort: "ma 24 aug" */
export function formatShortDate(iso: string): string {
  const d = new Date(iso + 'T00:00:00')
  return d.toLocaleDateString('nl-BE', { weekday: 'short', day: 'numeric', month: 'short' })
}

/** Met jaartal: "za 29 aug 2026" */
export function formatShortDateYear(iso: string): string {
  const d = new Date(iso + 'T00:00:00')
  return d.toLocaleDateString('nl-BE', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })
}

export function formatTime(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleTimeString('nl-BE', { hour: '2-digit', minute: '2-digit' })
}

/** "vandaag 12:40" / "gisteren 08:05" / "ma 24 aug · 12:40" */
export function formatRelative(iso: string): string {
  const d = new Date(iso)
  const day = iso.slice(0, 10)
  const today = todayIso()
  const yesterday = addDays(today, -1)
  const time = formatTime(iso)
  if (day === today) return `vandaag ${time}`
  if (day === yesterday) return `gisteren ${time}`
  return `${formatShortDate(day)} · ${time}`
}

export function stageEndDate(start: string, aantalDagen: number): string {
  return addDays(start, aantalDagen - 1)
}

/** Dagnummer (1-gebaseerd) van een datum binnen de stageperiode, of null buiten periode / zonder periode. */
export function stageDayNumber(iso: string | null, start: string | null, aantalDagen: number): number | null {
  if (!iso || !start) return null
  const startMs = new Date(start + 'T00:00:00').getTime()
  const dayMs = new Date(iso.slice(0, 10) + 'T00:00:00').getTime()
  const diff = Math.round((dayMs - startMs) / 86400000) + 1
  if (diff < 1 || diff > aantalDagen) return null
  return diff
}

export function isoDatesInRange(start: string, aantalDagen: number): string[] {
  return Array.from({ length: aantalDagen }, (_, i) => addDays(start, i))
}
