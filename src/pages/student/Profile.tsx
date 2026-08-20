import { useState } from 'react'
import { useSession } from '@/hooks/useSession'
import { useStore, studentReceipts } from '@/data/store'
import { categoryTotals } from '@/data/selectors'
import { formatCents } from '@/lib/money'
import { CATEGORIEEN } from '@/types'
import { Card } from '@/components/ui/Card'

function VastBadge() {
  return <span className="text-[11px] font-semibold px-[9px] py-1 rounded-full bg-black/[.06] text-black/50">vast</span>
}

function Toggle({ on, onClick }: { on: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-[46px] h-7 rounded-full p-[3px] box-border flex items-center"
      style={{ background: on ? 'oklch(0.62 0.15 152)' : 'rgba(20,21,26,.15)', justifyContent: on ? 'flex-end' : 'flex-start' }}
    >
      <div className="w-[22px] h-[22px] rounded-full bg-white" />
    </button>
  )
}

export function Profile() {
  const { student, stage } = useSession()
  const receipts = useStore((s) => (student ? studentReceipts(s, student.id) : []))
  const [reminder, setReminder] = useState(true)
  const [ocr, setOcr] = useState(true)
  if (!student || !stage) return null

  const totals = categoryTotals(receipts)

  return (
    <div className="px-5 pt-14 pb-4 flex flex-col gap-[15px]">
      <div className="flex items-center gap-3.5">
        <div className="w-[60px] h-[60px] rounded-full bg-accent-light flex-none" />
        <div className="flex flex-col gap-0.5">
          <div className="text-[19px] font-bold">{student.naam}</div>
          <div className="text-[13px] text-black/50">
            {student.klas} · {stage.naam}
          </div>
        </div>
      </div>

      <Card className="overflow-hidden">
        <div className="flex justify-between items-center gap-3 px-[18px] py-[15px] border-b border-black/[.07]">
          <div className="flex flex-col gap-0.5">
            <div className="text-[11.5px] font-semibold tracking-[.4px] uppercase text-black/45">naam</div>
            <div className="text-[15.5px] font-semibold">{student.naam}</div>
          </div>
          <VastBadge />
        </div>
        <div className="flex justify-between items-center gap-3 px-[18px] py-[15px] border-b border-black/[.07]">
          <div className="flex flex-col gap-0.5">
            <div className="text-[11.5px] font-semibold tracking-[.4px] uppercase text-black/45">klas</div>
            <div className="text-[15.5px] font-semibold">{student.klas}</div>
          </div>
          <VastBadge />
        </div>
        <div className="flex justify-between items-center gap-3 px-[18px] py-[15px]">
          <div className="flex flex-col gap-0.5">
            <div className="text-[11.5px] font-semibold tracking-[.4px] uppercase text-black/45">begeleider</div>
            <div className="text-[15.5px] font-semibold">{stage.begeleider}</div>
          </div>
        </div>
      </Card>

      <div className="bg-accent-lightest rounded-xl px-[18px] py-4 text-[13px] leading-[1.55] text-black/[.62]">
        Naam en klas komen uit je uitnodiging en kan je zelf niet aanpassen. Staat er iets fout? Zeg het tegen {stage.begeleider}, hij
        past het aan en jouw bonnetjes verhuizen mee.
      </div>

      <Card className="overflow-hidden">
        <div className="flex justify-between px-4 py-[15px] border-b border-black/[.06]">
          <div className="text-sm">Totaalbudget</div>
          <div className="text-sm font-semibold">{formatCents(stage.totaalBudgetCents)}</div>
        </div>
        <div className="flex justify-between px-4 py-[15px] border-b border-black/[.06]">
          <div className="text-sm">Dagtoelage</div>
          <div className="text-sm font-semibold">{formatCents(stage.dagToelageCents)}</div>
        </div>
        <div className="px-4 py-[13px] text-[12.5px] leading-[1.45] text-black/50 bg-black/[.03]">
          Ingesteld door de school. Je kan dit niet zelf aanpassen.
        </div>
      </Card>

      <Card className="overflow-hidden">
        <div className="flex justify-between items-center px-4 py-[15px] border-b border-black/[.06]">
          <div className="text-sm">Herinnering om 20:00</div>
          <Toggle on={reminder} onClick={() => setReminder((v) => !v)} />
        </div>
        <div className="flex justify-between items-center px-4 py-[15px]">
          <div className="text-sm">Bedrag lezen uit foto</div>
          <Toggle on={ocr} onClick={() => setOcr((v) => !v)} />
        </div>
      </Card>

      <Card className="p-[18px] flex flex-col gap-3">
        <div className="text-[13.5px] font-semibold">Per categorie</div>
        <div className="flex flex-col gap-2.5">
          {CATEGORIEEN.map((c) => (
            <div key={c} className="flex justify-between text-[13.5px]">
              <span>{c}</span>
              <span className="font-semibold tabular-nums">{formatCents(totals[c])}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
