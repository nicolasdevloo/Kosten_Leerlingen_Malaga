import { Link } from 'react-router-dom'
import { useSession } from '@/hooks/useSession'
import { useStore, studentReceipts } from '@/data/store'
import {
  currentStageDay,
  incompleteReceipts,
  pendingReceipts,
  todaySpent,
  totalSpent
} from '@/data/selectors'
import { formatCents } from '@/lib/money'
import { formatRelative } from '@/lib/date'
import { Card } from '@/components/ui/Card'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { ReceiptThumb } from '@/components/ui/ReceiptThumb'

export function Dashboard() {
  const { student, stage } = useSession()
  const receipts = useStore((s) => (student ? studentReceipts(s, student.id) : []))
  const syncPending = useStore((s) => s.syncPending)
  if (!student || !stage) return null

  const dayNum = currentStageDay(stage)
  const spentToday = todaySpent(receipts)
  const spentTotal = totalSpent(receipts)
  const dayLeft = stage.dagToelageCents - spentToday
  const totalLeft = stage.totaalBudgetCents - spentTotal
  const over = dayLeft < 0
  const dayPct = Math.min(100, (spentToday / stage.dagToelageCents) * 100)
  const totalPct = Math.min(100, (spentTotal / stage.totaalBudgetCents) * 100)
  const pending = pendingReceipts(receipts)
  const gaps = incompleteReceipts(receipts)
  const daysLeft = dayNum ? Math.max(0, stage.aantalDagen - dayNum) : stage.aantalDagen

  const coach = over
    ? 'Je toelage van vandaag is op. Wat je nu nog uitgeeft, gaat rechtstreeks van je totaalbudget af.'
    : `Je hebt vandaag nog ${formatCents(dayLeft)} van je toelage. Voor de laatste ${daysLeft} dagen blijft er ${formatCents(totalLeft)} over.`

  return (
    <div className="px-5 pt-14 pb-4 flex flex-col gap-4">
      <div className="flex flex-col gap-0.5">
        <h1 className="text-[22px] font-bold tracking-[-0.4px]">Hoi {student.naam.split(' ')[0]}</h1>
        <div className="text-[13px] text-black/50">
          {dayNum ? `Dag ${dayNum} van ${stage.aantalDagen}` : 'Periode nog niet vastgelegd'} · {stage.bestemming}
        </div>
      </div>

      {pending.length > 0 && (
        <button
          onClick={() => student && syncPending(student.id)}
          className="text-left bg-ink rounded-xl px-4 py-3.5 flex gap-3 items-center"
        >
          <div className="w-2.5 h-2.5 rounded-full bg-warn-bar flex-none" />
          <div className="flex-1 text-[12.5px] leading-[1.45] text-white/80">
            {pending.length === 1
              ? '1 bonnetje wacht tot je weer verbinding hebt. Het staat veilig op je toestel.'
              : `${pending.length} bonnetjes wachten tot je weer verbinding hebt. Ze staan veilig op je toestel.`}
          </div>
          <div className="text-xs font-bold text-white">Nu versturen</div>
        </button>
      )}

      <Card className="p-5 flex flex-col gap-3.5">
        <div className="flex justify-between items-end">
          <div className="flex flex-col gap-0.5">
            <div className="text-xs font-semibold tracking-[.5px] uppercase text-black/45">nog vandaag</div>
            <div
              className="text-[34px] font-extrabold tracking-[-1.3px] tabular-nums"
              style={{ color: over ? 'oklch(0.55 0.14 62)' : '#14151A' }}
            >
              {formatCents(dayLeft)}
            </div>
          </div>
          <div className="text-right text-[12.5px] leading-[1.45] text-black/50 whitespace-pre-line">
            {over ? `over je toelage\nvan €30` : `van €30,00\ntoelage`}
          </div>
        </div>
        <ProgressBar pct={dayPct} color={over ? 'oklch(0.70 0.15 62)' : 'oklch(0.55 0.15 255)'} height={10} />
        <div className="text-[13.5px] leading-[1.5] text-black/60">{coach}</div>
      </Card>

      <Card className="p-[18px] flex flex-col gap-3">
        <div className="flex justify-between items-baseline">
          <div className="text-[13.5px] font-semibold">Totaalbudget · harde grens</div>
          <div className="text-[13px] text-black/50 tabular-nums">
            {formatCents(spentTotal)} van {formatCents(stage.totaalBudgetCents)}
          </div>
        </div>
        <ProgressBar pct={totalPct} color="oklch(0.62 0.15 152)" height={10} />
        <div className="text-[12.5px] text-black/50">
          Nog {formatCents(totalLeft)} beschikbaar tot het einde van de stage.
        </div>
      </Card>

      {gaps.length > 0 && (
        <Link
          to="/app/bonnetjes?filter=Onvolledig"
          className="bg-warn-soft rounded-xl px-[18px] py-4 flex gap-3 items-center"
        >
          <div className="w-[22px] h-[22px] rounded-full border-2 border-warn-bar flex-none box-border" />
          <div className="flex-1 text-[13.5px] leading-[1.45] text-warn-text">
            {gaps.length === 1 ? '1 bonnetje mist nog een categorie.' : `${gaps.length} bonnetjes missen nog een categorie.`}{' '}
            Maak ze af voor je indient.
          </div>
          <div className="text-lg text-warn-bar">›</div>
        </Link>
      )}

      <div className="flex justify-between items-center px-1 pt-1">
        <div className="text-xs font-semibold tracking-[.3px] uppercase text-black/45">Laatste bonnetjes</div>
        <Link to="/app/bonnetjes" className="text-xs font-semibold text-accent-dark">
          alle {receipts.length}
        </Link>
      </div>
      <Card className="overflow-hidden">
        {receipts.slice(0, 3).map((r) => (
          <Link
            key={r.id}
            to={r.categorie === null ? `/app/bonnetjes/${r.id}` : '/app/bonnetjes'}
            className="flex items-center gap-3 px-4 py-[13px] border-b border-black/[.06] last:border-0"
          >
            <ReceiptThumb src={r.fotoDataUrl} width={36} height={44} />
            <div className="flex-1 flex flex-col gap-0.5 min-w-0">
              <div className="text-sm font-semibold truncate">{r.titel}</div>
              <div className="text-xs text-black/50">
                {r.categorie ?? 'categorie ontbreekt'} · {formatRelative(r.tijdstip)}
              </div>
            </div>
            <div className="text-[14.5px] font-bold tabular-nums">{formatCents(r.bedragCents)}</div>
          </Link>
        ))}
        {receipts.length === 0 && (
          <div className="px-4 py-6 text-sm text-black/45 text-center">Nog geen bonnetjes toegevoegd.</div>
        )}
      </Card>
    </div>
  )
}
