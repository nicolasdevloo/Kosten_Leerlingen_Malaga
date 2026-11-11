export type Platform = 'ios' | 'android' | 'other'

/**
 * "Zet op beginscherm" werkt helemaal anders op iPhone (deelicoon → Zet op beginscherm) dan op
 * Android (menu met drie puntjes → App installeren). Detecteer het toestel zodat de leerling de
 * juiste stappen ziet in plaats van een vaste, iPhone-specifieke uitleg die op Android niet klopt.
 */
export function detectPlatform(): Platform {
  if (typeof navigator === 'undefined') return 'other'
  const ua = navigator.userAgent || ''
  // Een iPad meldt zich sinds iPadOS 13 als "Macintosh"; touch-ondersteuning onderscheidt hem van een echte Mac.
  const isIOS = /iPad|iPhone|iPod/.test(ua) || (ua.includes('Macintosh') && navigator.maxTouchPoints > 1)
  if (isIOS) return 'ios'
  if (/Android/.test(ua)) return 'android'
  return 'other'
}
