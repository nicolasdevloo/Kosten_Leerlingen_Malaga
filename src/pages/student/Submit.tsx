import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useSession } from '@/hooks/useSession'
import { useStore, studentReceipts } from '@/data/store'
import { incompleteReceipts, totalSpent } from '@/data/selectors'
import { formatCents } from '@/lib/money'
import { downloadFile } from '@/lib/shareFile'
import { DossierContent } from '@/pages/dossier/DossierContent'
import { Card } from '@/components/ui/Card'
import type { Student, Stage } from '@/types'

// Een mailto-link kan geen bijlage meesturen — dat kan geen enkele browser. We bewaren de PDF dus
// eerst rechtstreeks op het toestel en openen meteen daarna een al geadresseerde, ingevulde mail;
// de leerling hoeft dan alleen nog dat ene, net-bewaarde bestand aan te tikken als bijlage.
async function sendDossierByMail(el: HTMLElement, student: Student, stage: Stage) {
  const { elementToPdfFile, dossierPdfFilename } = await import('@/lib/pdfExport')
  const filename = dossierPdfFilename(student.naam)
  const file = await elementToPdfFile(el, filename)
  downloadFile(file)
  const subject = encodeURIComponent(`Kostendossier — ${student.naam}`)
  const body = encodeURIComponent(
    `Dag ${stage.begeleider},\n\nHierbij mijn kostendossier.\n\nHet bestand "${filename}" is net bewaard op dit toestel — voeg het hier toe als bijlage (via het paperclip-icoon) voor je verstuurt.\n\n${student.naam}`
  )
  window.location.href = `mailto:${stage.begeleiderEmail}?subject=${subject}&body=${body}`
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
  const contentRef = useRef<HTMLDivElement>(null)
  const [sharing, setSharing] = useState(false)
  if (!student || !stage) return null

  const gaps = incompleteReceipts(receipts)
  const hasGaps = gaps.length > 0

  const send = async () => {
    if (!contentRef.current || sharing) return
    setSharing(true)
    try {
      await sendDossierByMail(contentRef.current, student, stage)
      submitDossier(student.id)
    } finally {
      setSharing(false)
    }
  }

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
              De PDF wordt bewaard op je toestel en je e-mail-app opent meteen, al geadresseerd aan {stage.begeleider}. Je moet enkel
              nog dat bestand als bijlage toevoegen voor je verstuurt.
            </div>
            <button
              onClick={send}
              disabled={sharing}
              className="bg-ink rounded-full py-3.5 text-center text-sm font-bold text-white disabled:opacity-60"
            >
              {sharing ? 'Dossier wordt gemaakt…' : student.ingediend ? 'Dossier opnieuw versturen' : 'Dossier versturen'}
            </button>
            <Link
              to={`/dossier/${student.id}`}
              target="_blank"
              rel="noreferrer"
              className="text-center text-[12.5px] font-semibold text-black/45 underline decoration-dotted"
            >
              Bekijk het dossier eerst
            </Link>
          </div>
        </>
      )}

      {/* Buiten beeld gerenderd: enkel om naar een PDF te rasteren bij "Dossier versturen" hierboven. */}
      <div className="fixed top-0 -left-[9999px]" aria-hidden>
        <div ref={contentRef}>
          <DossierContent student={student} stage={stage} receipts={receipts} />
        </div>
      </div>
    </div>
  )
}
