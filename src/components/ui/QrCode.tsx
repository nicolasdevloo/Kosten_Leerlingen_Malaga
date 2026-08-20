import { useEffect, useState } from 'react'
import QRCode from 'qrcode'

export function QrCode({ value, size = 74 }: { value: string; size?: number }) {
  const [src, setSrc] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    QRCode.toDataURL(value, { margin: 0, width: size * 4, color: { dark: '#14151A', light: '#FFFFFF00' } }).then((url) => {
      if (!cancelled) setSrc(url)
    })
    return () => {
      cancelled = true
    }
  }, [value, size])

  if (!src) return <div style={{ width: size, height: size }} className="bg-black/[.06] rounded flex-none" />
  return <img src={src} width={size} height={size} alt={`QR-code voor ${value}`} className="flex-none" />
}
