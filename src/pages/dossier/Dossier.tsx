import { useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useStore, studentReceipts } from '@/data/store'
import { DossierContent } from '@/pages/dossier/DossierContent'
import { shareOrDownloadFile } from '@/lib/shareFile'

export function Dossier() {
  const { studentId } = useParams<{ studentId: string }>()
  const student = useStore((s) => (studentId ? s.students[studentId] : undefined))
  const stage = useStore((s) => (student ? s.stages[student.stageId] : undefined))
  const receipts = useStore((s) => (studentId ? studentReceipts(s, studentId) : []))
  const contentRef = useRef<HTMLDivElement>(null)
  const [sharing, setSharing] = useState(false)

  if (!student || !stage) {
    return <div className="p-10 text-center text-black/50">Dossier niet gevonden.</div>
  }

  const shareAsPdf = async () => {
    if (!contentRef.current || sharing) return
    setSharing(true)
    try {
      const { elementToPdfFile, dossierPdfFilename } = await import('@/lib/pdfExport')
      const file = await elementToPdfFile(contentRef.current, dossierPdfFilename(student.naam))
      await shareOrDownloadFile(file, `Kostendossier — ${student.naam}`)
    } finally {
      setSharing(false)
    }
  }

  return (
    <div className="bg-[#EFEDE8] min-h-screen py-8 print:bg-white print:py-0">
      <div className="no-print max-w-[8.5in] mx-auto mb-4 flex justify-end gap-2.5">
        <button
          onClick={shareAsPdf}
          disabled={sharing}
          className="bg-accent text-white rounded-lg px-5 py-2.5 text-sm font-bold disabled:opacity-60"
        >
          {sharing ? 'Dossier wordt gemaakt…' : 'Deel als PDF'}
        </button>
        <button onClick={() => window.print()} className="bg-ink text-white rounded-lg px-5 py-2.5 text-sm font-bold">
          Afdrukken / opslaan als PDF
        </button>
      </div>
      <div ref={contentRef}>
        <DossierContent student={student} stage={stage} receipts={receipts} />
      </div>
    </div>
  )
}
