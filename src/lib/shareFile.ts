/** Bewaart het bestand rechtstreeks op het toestel (downloads), zonder het deelvenster te tonen. */
export function downloadFile(file: File): void {
  const url = URL.createObjectURL(file)
  const a = document.createElement('a')
  a.href = url
  a.download = file.name
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

/** Deelt het bestand via het systeemdeelvenster; valt terug op downloaden als delen niet kan. */
export async function shareOrDownloadFile(file: File, title: string): Promise<void> {
  const nav = navigator as Navigator & { canShare?: (data: { files: File[] }) => boolean }
  if (nav.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title })
      return
    } catch {
      // Geannuleerd door de gebruiker: val terug op downloaden.
    }
  }
  downloadFile(file)
}
