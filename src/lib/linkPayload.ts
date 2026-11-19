import type { KlasCode } from '@/types'
import { encodeBase64Url, decodeBase64Url } from '@/lib/base64url'

/**
 * Alles wat een vers toestel nodig heeft om de persoonlijke link te openen zonder ooit met de
 * leerkracht z'n toestel gepraat te hebben: wie de leerling is. Er is maar één, altijd-aanwezige
 * stage (zie STAGE_ID in data/seed.ts), dus die hoeft niet in de link zelf te zitten — hoe korter
 * de link, hoe minder kans dat een onderliggend streepje of liggend streepje (_ of -) WhatsApp's
 * eigen cursief-opmaak-parsing in de war brengt en de link maar half aanklikbaar maakt.
 */
export interface LinkPayload {
  v: 1
  token: string
  naam: string
  klas: KlasCode
}

export function encodeLinkPayload(payload: LinkPayload): string {
  return encodeBase64Url(JSON.stringify(payload))
}

export function decodeLinkPayload(raw: string): LinkPayload | null {
  try {
    const data = JSON.parse(decodeBase64Url(raw))
    if (data && data.v === 1 && typeof data.token === 'string' && typeof data.naam === 'string' && typeof data.klas === 'string') {
      return data as LinkPayload
    }
    return null
  } catch {
    return null
  }
}

/** Bouwt de echte, klikbare link naar deze app (werkt op elk toestel, ongeacht waar de app gehost staat). */
export function buildStudentLink(token: string, naam: string, klas: KlasCode): string {
  const payload = encodeLinkPayload({ v: 1, token, naam, klas })
  const base = `${window.location.origin}${import.meta.env.BASE_URL}`
  return `${base}#/y/${payload}`
}
