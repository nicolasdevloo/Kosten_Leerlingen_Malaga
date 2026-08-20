import { Link } from 'react-router-dom'
import { useSession } from '@/hooks/useSession'
import { useStore, studentReceipts } from '@/data/store'
import { incompleteReceipts, totalSpent } from '@/data/selectors'
import { formatCents } from '@/lib/money'
import { capitalizeFirst } from '@/lib/text'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

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

      {!hasGaps && !student.ingediend && (
        <>
          <div className="bg-good-soft rounded-xl px-[18px] py-4 text-[13.5px] leading-[1.5] text-good-text">
            Alles is compleet. Je kan je dossier nu doorsturen naar {stage.begeleider}.
          </div>
          <Button variant="dark" full onClick={() => submitDossier(student.id)} className="!py-4 rounded-full">
            Dossier versturen
          </Button>
        </>
      )}

      {student.ingediend && (
        <div className="bg-good-soft rounded-2xl p-5 flex flex-col gap-2 animate-pop">
          <div className="text-base font-bold text-good-text">Verstuurd</div>
          <div className="text-[13.5px] leading-[1.5] text-good-text">
            {capitalizeFirst(stage.begeleider)} ziet je dossier in zijn dashboard. Je kan niets meer wijzigen — vraag hem om iets te
            heropenen.
          </div>
        </div>
      )}
    </div>
  )
}
