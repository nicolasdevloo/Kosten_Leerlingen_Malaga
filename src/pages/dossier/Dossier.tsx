import { useParams } from 'react-router-dom'
import { useStore, studentReceipts } from '@/data/store'
import { DossierContent } from '@/pages/dossier/DossierContent'

export function Dossier() {
  const { studentId } = useParams<{ studentId: string }>()
  const student = useStore((s) => (studentId ? s.students[studentId] : undefined))
  const stage = useStore((s) => (student ? s.stages[student.stageId] : undefined))
  const receipts = useStore((s) => (studentId ? studentReceipts(s, studentId) : []))

  if (!student || !stage) {
    return <div className="p-10 text-center text-black/50">Dossier niet gevonden.</div>
  }

  return (
    <div className="bg-[#EFEDE8] min-h-screen py-8 print:bg-white print:py-0">
      <div className="no-print max-w-[8.5in] mx-auto mb-4 flex justify-end">
        <button onClick={() => window.print()} className="bg-ink text-white rounded-lg px-5 py-2.5 text-sm font-bold">
          Afdrukken / opslaan als PDF
        </button>
      </div>
      <DossierContent student={student} stage={stage} receipts={receipts} />
    </div>
  )
}
