// Alfabet zonder verwarrende karakters (geen 0/O, 1/I/L, geen klinkers die scheldwoorden vormen).
const ALPHABET = '23456789ABCDEFGHJKMNPQRSTUVWXYZ'

/**
 * Genereert een niet te raden linktoken, bv. "8QF2-M".
 * In productie: minstens 128 bit entropie server-side (dit is een client-side demo-generator).
 */
export function generateToken(): string {
  const chars = new Uint32Array(6)
  crypto.getRandomValues(chars)
  const part = Array.from(chars.slice(0, 4), (n) => ALPHABET[n % ALPHABET.length]).join('')
  const suffix = ALPHABET[chars[4] % ALPHABET.length]
  return `${part}-${suffix}`
}

export function generateId(prefix: string): string {
  return `${prefix}_${crypto.randomUUID().slice(0, 8)}`
}
