import type { KlasCode, Stage } from '@/types'
import { encodeBase64Url, decodeBase64Url } from '@/lib/base64url'

/**
 * Alles wat een vers toestel nodig heeft om de persoonlijke link te openen zonder ooit met de
 * leerkracht z'n toestel gepraat te hebben: wie de leerling is, en de stage-instellingen op het
 * moment dat de link werd aangemaakt. Er is geen server — de link zelf is de enige "database".
 */
export interface LinkPayload {
  v: 1
  token: string
  naam: string
  klas: KlasCode
  stage: Stage
}

export function encodeLinkPayload(payload: LinkPayload): string {
  return encodeBase64Url(JSON.stringify(payload))
}

export function decodeLinkPayload(raw: string): LinkPayload | null {
  try {
    const data = JSON.parse(decodeBase64Url(raw))
    if (data && data.v === 1 && typeof data.token === 'string' && typeof data.naam === 'string' && data.stage) {
      return data as LinkPayload
    }
    return null
  } catch {
    return null
  }
}

/** Bouwt de echte, klikbare link naar deze app (werkt op elk toestel, ongeacht waar de app gehost staat). */
export function buildStudentLink(token: string, naam: string, klas: KlasCode, stage: Stage): string {
  const payload = encodeLinkPayload({ v: 1, token, naam, klas, stage })
  const base = `${window.location.origin}${import.meta.env.BASE_URL}`
  return `${base}#/y/${payload}`
}

/**
 * Link die de leerkracht naar de leerling stuurt om een ingediend dossier te heropenen.
 * De leerkracht kan het niet rechtstreeks op het toestel van de leerling zetten (geen server),
 * dus de leerling opent zelf deze link — op hetzelfde toestel waar hij ook indiende.
 */
export function buildReopenLink(token: string): string {
  const base = `${window.location.origin}${import.meta.env.BASE_URL}`
  return `${base}#/heropen/${token}`
}
