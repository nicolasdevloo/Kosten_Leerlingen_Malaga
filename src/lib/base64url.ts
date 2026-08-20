/** Unicode-veilige, URL-veilige base64 — voor het inbedden van JSON in een link of QR-code. */
export function encodeBase64Url(text: string): string {
  const b64 = btoa(unescape(encodeURIComponent(text)))
  return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

export function decodeBase64Url(b64url: string): string {
  let b64 = b64url.replace(/-/g, '+').replace(/_/g, '/')
  while (b64.length % 4) b64 += '='
  return decodeURIComponent(escape(atob(b64)))
}
