import { useParams } from 'react-router-dom'
import { useStore, classStudents, primaryStage, studentReceipts } from '@/data/store'
import { DossierContent } from '@/pages/dossier/DossierContent'
import type { KlasCode } from '@/types'

export function DossierKlas() {
  const { klas } = useParams<{ klas: string }>()
  const stage = useStore(primaryStage)
  const state = useStore((s) => s)
  const students = useStore((s) =>
    stage ? classStudents(s, stage.id, klas === 'alle' ? 'alle' : (klas as KlasCode)) : []
  )

  if (!stage) return <div className="p-10 text-center text-black/50">Geen stage gevonden.</div>

  return (
    <div className="bg-[#EFEDE8] min-h-screen py-8 print:bg-white print:py-0">
      <div className="no-print max-w-[8.5in] mx-auto mb-4 flex justify-between items-center">
        <div className="text-sm text-black/60">
          {students.length} dossiers · {klas === 'alle' ? 'alle klassen' : klas}
        </div>
        <button onClick={() => window.print()} className="bg-ink text-white rounded-lg px-5 py-2.5 text-sm font-bold">
          Afdrukken / opslaan als PDF
        </button>
      </div>
      {students.map((student, i) => (
        <div key={student.id} className={i > 0 ? 'break-before-page' : ''}>
          <DossierContent student={student} stage={stage} receipts={studentReceipts(state, student.id)} />
        </div>
      ))}
      {students.length === 0 && <div className="text-center text-black/50 py-10">Geen leerlingen in deze klas.</div>}
    </div>
  )
}
