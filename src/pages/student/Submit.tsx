import { Link } from 'react-router-dom'
import { useSession } from '@/hooks/useSession'
import { useStore, studentReceipts } from '@/data/store'
import { incompleteReceipts, totalSpent } from '@/data/selectors'
import { formatCents } from '@/lib/money'
import { buildDossierExport, dossierExportFilename } from '@/lib/dossierExport'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import type { Student, Stage, Bonnetje } from '@/types'

async function shareDossierFile(student: Student, stage: Stage, receipts: Bonnetje[]) {
  const json = JSON.stringify(buildDossierExport(student, stage, receipts), null, 2)
  const filename = dossierExportFilename(student.naam)
  const file = new File([json], filename, { type: 'application/json' })

  const nav = navigator as Navigator & { canShare?: (data: { files: File[] }) => boolean }
  if (nav.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: `Stagekosten — ${student.naam}` })
      return
    } catch {
      // Leerling annuleerde het deelvenster: val terug op downloaden.
    }
  }
  const url = URL.createObjectURL(file)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

function CheckDot({ done = true }: { done?: boolean }) {
  return done ? (
    <div className="w-5 h-5 rounded-full bg-good-bar flex-none" />
  ) : (
    <div className="w-5 h-5 rounded-full border-2 border-warn-bar box-border flex-none" />
  )
}

export function Submit() {
  const { student, stage } = useSession()
  const receipts = useStore((s) => (student ? studentReceipts(s, student.id) : []))
  const submitDossier = useStore((s) => s.submitDossier)
  if (!student || !stage) return null

  const gaps = incompleteReceipts(receipts)
  const hasGaps = gaps.length > 0

  return (
    <div className="px-5 pt-14 pb-4 flex flex-col gap-[15px]">
      <div>
        <h1 className="text-[22px] font-bold tracking-[-0.4px]">Indienen</h1>
        <div className="text-[13px] text-black/50">Eén keer, aan het einde van de stage · {stage.begeleider}</div>
      </div>

      <Card className="p-[18px] flex flex-col gap-3.5">
        <div className="flex justify-between items-baseline">
          <div className="text-[13.5px] font-semibold">Wat je meestuurt</div>
          <div className="text-[13px] text-black/50 tabular-nums">
            {receipts.length} bonnetjes · {formatCents(totalSpent(receipts))}
          </div>
        </div>
        <div className="flex flex-col gap-[11px]">
          <div className="flex items-center gap-[11px]">
            <CheckDot />
            <div className="text-[13.5px]">Foto's in hoge resolutie</div>
          </div>
          <div className="flex items-center gap-[11px]">
            <CheckDot />
            <div className="text-[13.5px]">Bedrag, datum en categorie per bon</div>
          </div>
          <div className="flex items-center gap-[11px]">
            <CheckDot />
            <div className="text-[13.5px]">PDF-overzicht per dag, klaar voor Erasmus+</div>
          </div>
          <div className="flex items-center gap-[11px]">
            <CheckDot />
            <div className="text-[13.5px]">Jouw naam op elk bonnetje: {student.naam}</div>
          </div>
        </div>
      </Card>

      {hasGaps && (
        <>
          <Link to="/app/bonnetjes?filter=Onvolledig" className="bg-warn-soft rounded-xl px-[18px] py-4 flex gap-3 items-center">
            <div className="w-[22px] h-[22px] rounded-full border-2 border-warn-bar box-border flex-none" />
            <div className="flex-1 text-[13.5px] leading-[1.45] text-warn-text">
              {gaps.length === 1 ? '1 bonnetje mist nog een categorie.' : `${gaps.length} bonnetjes missen nog een categorie.`}{' '}
              Zonder categorie kan je niet indienen.
            </div>
            <div className="text-lg text-warn-bar">›</div>
          </Link>
          <div className="bg-black/[.07] rounded-full py-[17px] text-center text-base font-bold text-black/35">Dossier versturen</div>
        </>
      )}

      {!hasGaps && (
        <>
          <div className="bg-good-soft rounded-xl px-[18px] py-4 text-[13.5px] leading-[1.5] text-good-text">
            Alles is compleet. Stuur je dossier door naar {stage.begeleider} — dat mag je zo vaak doen als nodig, bv. als je nog een
            bonnetje toevoegt. {stage.begeleider} gebruikt gewoon de laatste versie die binnenkomt als definitief.
          </div>
          <div className="bg-white rounded-2xl p-[18px] flex flex-col gap-3">
            <div className="text-[13.5px] font-semibold">Bezorg je dossier aan {stage.begeleider}</div>
            <div className="text-[12.5px] leading-[1.5] text-black/50">
              Er is geen automatische verzending — jij stuurt dit zelf door, bv. via WhatsApp of e-mail.
            </div>
            <Link
              to={`/dossier/${student.id}`}
              target="_blank"
              rel="noreferrer"
              className="border border-black/[.15] rounded-full py-3.5 text-center text-sm font-bold"
            >
              PDF bekijken en opslaan
            </Link>
            <Button
              variant="dark"
              full
              onClick={() => {
                submitDossier(student.id)
                shareDossierFile(student, stage, receipts)
              }}
              className="!py-3.5 rounded-full"
            >
              {student.ingediend ? 'Dossierbestand opnieuw delen' : 'Dossierbestand delen'}
            </Button>
            <div className="text-[11.5px] leading-[1.45] text-black/40">
              De PDF is voor de Erasmus+-papieren. Het dossierbestand laat {stage.begeleider} jouw bonnetjes ook in zijn dashboard
              importeren.
            </div>
          </div>
        </>
      )}
    </div>
  )
}
