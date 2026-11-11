import { jsPDF } from 'jspdf'
import html2canvas from 'html2canvas'

/**
 * Rendert een al gemonteerd DOM-element (de dossierpagina, op zijn echte 8.5in-breedte) naar een
 * PDF-bestand dat rechtstreeks gedeeld kan worden — geen printdialoog, geen los JSON-bestand.
 * Lange inhoud wordt in Letter-hoge stukken gesneden zodat het dossier over meerdere pagina's werkt.
 * jsPDF/html2canvas zijn vrij zware libraries; laad deze module daarom altijd via een dynamische
 * import() op het moment dat er echt een PDF gedeeld wordt, niet statisch bij het opstarten.
 */
export async function elementToPdfFile(el: HTMLElement, filename: string): Promise<File> {
  const canvas = await html2canvas(el, { scale: 2, backgroundColor: '#ffffff', useCORS: true })

  const pageWidthIn = 8.5
  const pageHeightIn = 11
  const pxPerIn = canvas.width / pageWidthIn
  const pageHeightPx = Math.round(pageHeightIn * pxPerIn)

  const pdf = new jsPDF({ unit: 'in', format: 'letter' })
  let renderedPx = 0
  let first = true

  while (renderedPx < canvas.height) {
    const sliceHeightPx = Math.min(pageHeightPx, canvas.height - renderedPx)
    const pageCanvas = document.createElement('canvas')
    pageCanvas.width = canvas.width
    pageCanvas.height = sliceHeightPx
    const ctx = pageCanvas.getContext('2d')
    if (ctx) {
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, pageCanvas.width, pageCanvas.height)
      ctx.drawImage(canvas, 0, renderedPx, canvas.width, sliceHeightPx, 0, 0, canvas.width, sliceHeightPx)
    }
    const imgData = pageCanvas.toDataURL('image/jpeg', 0.92)
    if (!first) pdf.addPage()
    pdf.addImage(imgData, 'JPEG', 0, 0, pageWidthIn, sliceHeightPx / pxPerIn)
    renderedPx += sliceHeightPx
    first = false
  }

  const blob = pdf.output('blob')
  return new File([blob], filename, { type: 'application/pdf' })
}

export function dossierPdfFilename(naam: string): string {
  const safe = naam.trim().replace(/\s+/g, '-').replace(/[^\w-]/g, '')
  return `dossier-${safe}.pdf`
}
