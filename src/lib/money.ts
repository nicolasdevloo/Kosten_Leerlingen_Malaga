/** Alle bedragen worden in centen bewaard; format() zet ze om naar "€12,30". */
export function formatCents(cents: number): string {
  const sign = cents < 0 ? '-' : ''
  const abs = Math.abs(Math.round(cents))
  const euros = Math.floor(abs / 100)
  const rest = String(abs % 100).padStart(2, '0')
  const euroStr = euros.toLocaleString('nl-BE')
  return `${sign}€${euroStr},${rest}`
}

/** Zoals formatCents maar zonder €-teken, voor tabelcellen die al een "Bedrag"-kolomkop hebben. */
export function formatCentsPlain(cents: number): string {
  return formatCents(cents).replace('€', '')
}

/** Parseert Belgische/gebruikersinvoer ("8,40", "8.40", "840" bedoeld als 8,40) naar centen. */
export function parseCentsInput(raw: string): number {
  const cleaned = raw.replace(/[^\d,.-]/g, '').trim()
  if (!cleaned) return 0
  const normalized = cleaned.replace(/\.(?=\d{3}(?:\D|$))/g, '').replace(',', '.')
  const value = parseFloat(normalized)
  if (Number.isNaN(value)) return 0
  return Math.round(value * 100)
}
