export type BadgeTone = 'good' | 'warn' | 'neutral' | 'danger'

const TONES: Record<BadgeTone, string> = {
  good: 'bg-good-soft text-good-text',
  warn: 'bg-warn-soft text-warn-text',
  neutral: 'bg-black/[.06] text-black/50',
  danger: 'bg-red-50 text-red-600'
}

export function Badge({ tone, children }: { tone: BadgeTone; children: React.ReactNode }) {
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-[11.5px] font-bold whitespace-nowrap ${TONES[tone]}`}>
      {children}
    </span>
  )
}
