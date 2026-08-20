export function ProgressBar({
  pct,
  color,
  height = 8
}: {
  pct: number
  color: string
  height?: number
}) {
  const clamped = Math.max(0, Math.min(100, pct))
  return (
    <div
      className="rounded-full bg-black/[.08] overflow-hidden"
      style={{ height }}
    >
      <div
        className="h-full rounded-full transition-[width]"
        style={{ width: `${clamped}%`, background: color }}
      />
    </div>
  )
}
