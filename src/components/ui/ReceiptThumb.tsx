export function ReceiptThumb({
  src,
  width = 42,
  height = 52
}: {
  src?: string | null
  width?: number
  height?: number
}) {
  if (src) {
    return (
      <img
        src={src}
        alt=""
        style={{ width, height }}
        className="rounded-[7px] object-cover border border-black/[.12] flex-none"
      />
    )
  }
  return (
    <div
      style={{
        width,
        height,
        backgroundImage:
          'repeating-linear-gradient(135deg, rgba(20,21,26,.09) 0 4px, transparent 4px 8px)'
      }}
      className="rounded-[7px] border border-black/[.12] flex-none"
    />
  )
}
