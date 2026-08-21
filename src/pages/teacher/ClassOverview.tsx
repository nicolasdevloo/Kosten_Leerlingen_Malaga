import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useStore, classStudents, primaryStage } from '@/data/store'
import { currentStageDay, groupByDay, incompleteReceipts, totalSpent } from '@/data/selectors'
import { formatCents } from '@/lib/money'
import { formatShortDate } from '@/lib/date'
import { KLASSEN } from '@/types'
import type { KlasCode, Student } from '@/types'
import { Chip } from '@/components/ui/Chip'
import { Badge } from '@/components/ui/Badge'
import { ReceiptThumb } from '@/components/ui/ReceiptThumb'

type StatusFilter = 'Alle' | 'Ingediend' | 'Nog niet ingediend' | 'Onvolledig'

function studentStatus(student: Student, gapCount: number): { label: string; tone: 'good' | 'warn' | 'neutral' } {
  if (gapCount > 0) return { label: `${gapCount} onvolledig`, tone: 'warn' }
  if (student.ingediend) return { label: 'ingediend', tone: 'good' }
  return { label: 'nog niet ingediend', tone: 'neutral' }
}

export function ClassOverview() {
  const stage = useStore(primaryStage)
  const students = useStore((s) => s.students)
  const receipts = useStore((s) => s.receipts)
  const [klas, setKlas] = useState<KlasCode | 'alle'>('alle')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('Alle')
  const [openId, setOpenId] = useState<string | null>(null)

  const allInStage = useStore((s) => classStudents(s, stage?.id ?? ''))
  const byKlas = klas === 'alle' ? allInStage : allInStage.filter((s) => s.klas === klas)

  const rows = useMemo(
    () =>
      byKlas.map((s) => {
        const rec = Object.values(receipts).filter((r) => r.studentId === s.id)
        const spent = totalSpent(rec)
        const gaps = incompleteReceipts(rec).length
        return { student: s, spent, count: rec.length, gaps, status: studentStatus(s, gaps) }
      }),
    [byKlas, receipts]
  )

  const open = openId ? students[openId] ?? null : null
  const openReceipts = useMemo(() => (open ? Object.values(receipts).filter((r) => r.studentId === open.id) : []), [open, receipts])
  const openDays = open && stage ? groupByDay(openReceipts, stage) : []
  const openSpent = totalSpent(openReceipts)

  if (!stage) return null

  const filteredRows = rows.filter((r) => {
    if (statusFilter === 'Alle') return true
    if (statusFilter === 'Ingediend') return r.student.ingediend
    if (statusFilter === 'Nog niet ingediend') return !r.student.ingediend && r.gaps === 0
    if (statusFilter === 'Onvolledig') return r.gaps > 0
    return true
  })

  const stageStudents = allInStage
  const totalSpentAll = stageStudents.reduce((sum, s) => sum + totalSpent(Object.values(receipts).filter((r) => r.studentId === s.id)), 0)
  const sentCount = stageStudents.filter((s) => s.ingediend).length
  const gapsCount = stageStudents.reduce((sum, s) => sum + incompleteReceipts(Object.values(receipts).filter((r) => r.studentId === s.id)).length, 0)

  const klasCounts = KLASSEN.map((k) => ({ k, n: allInStage.filter((s) => s.klas === k).length }))
  const dayNum = currentStageDay(stage)

  return (
    <>
      <div className="px-7 pt-6 pb-[18px] border-b border-black/[.08] flex flex-col gap-[18px]">
        <div className="flex justify-between items-end">
          <div className="flex flex-col gap-[3px]">
            <div className="text-[22px] font-bold tracking-[-0.4px]">{stage.naam}</div>
            <div className="text-[13px] text-black/50">
              {klas === 'alle' ? 'Alle klassen' : klas} · {dayNum ? `dag ${dayNum} van ${stage.aantalDagen}` : 'periode niet vastgelegd'} ·{' '}
              {formatCents(stage.totaalBudgetCents)} per leerling
            </div>
          </div>
          <div className="flex gap-[22px]">
            <Stat label="totaal uitgegeven" value={formatCents(totalSpentAll)} />
            <Stat label="ingediend" value={`${sentCount} / ${stageStudents.length}`} />
            <Stat label="onvolledig" value={String(gapsCount)} warn />
          </div>
        </div>
        <div className="flex gap-[7px] flex-wrap">
          <Chip active={klas === 'alle'} onClick={() => setKlas('alle')}>
            Alle klassen ({allInStage.length})
          </Chip>
          {klasCounts.map(({ k, n }) => (
            <Chip key={k} active={klas === k} onClick={() => setKlas(k)}>
              {k} ({n})
            </Chip>
          ))}
        </div>
        <div className="flex gap-[7px]">
          {(['Alle', 'Ingediend', 'Nog niet ingediend', 'Onvolledig'] as StatusFilter[]).map((f) => (
            <Chip key={f} active={statusFilter === f} onClick={() => setStatusFilter(f)}>
              {f}
            </Chip>
          ))}
        </div>
      </div>

      <div className="flex-1 flex min-h-0">
        <div className="flex-1 min-w-0 overflow-auto px-7 py-3.5">
          <div className="flex px-3.5 pb-2.5 text-xs font-semibold tracking-[.4px] uppercase text-black/40">
            <div className="flex-[2] min-w-[150px] pr-4">Leerling en klas</div>
            <div className="flex-[1.2] min-w-[110px] pr-4">Budget gebruikt</div>
            <div className="w-[100px] text-right pr-4">Uitgegeven</div>
            <div className="w-[140px] text-right">Status</div>
          </div>
          <div className="flex flex-col gap-1.5">
            {filteredRows.map(({ student, spent, count, status }) => {
              const pct = Math.min(100, (spent / stage.totaalBudgetCents) * 100)
              const over = spent > stage.totaalBudgetCents * 0.95
              return (
                <button
                  key={student.id}
                  onClick={() => setOpenId(student.id)}
                  className={`text-left bg-white rounded-xl px-[14px] py-[13px] flex items-center shadow-card hover:shadow-none transition-shadow ${
                    openId === student.id ? 'ring-2 ring-accent' : ''
                  }`}
                >
                  <div className="flex-[2] min-w-[150px] pr-4 flex flex-col gap-0.5">
                    <div className="text-sm font-semibold truncate">{student.naam}</div>
                    <div className="text-xs text-black/50">
                      {student.klas} · {count} bonnetjes
                    </div>
                  </div>
                  <div className="flex-[1.2] min-w-[110px] pr-4 flex flex-col gap-1.5">
                    <div className="h-2 rounded-full bg-black/[.08] overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${pct}%`, background: over ? 'oklch(0.70 0.15 62)' : 'oklch(0.62 0.15 152)' }}
                      />
                    </div>
                    <div className="text-[11.5px] text-black/45">{Math.round(pct)}% van {formatCents(stage.totaalBudgetCents)}</div>
                  </div>
                  <div className="w-[100px] text-right pr-4 text-[14.5px] font-bold tabular-nums">{formatCents(spent)}</div>
                  <div className="w-[140px] flex justify-end">
                    <Badge tone={status.tone}>{status.label}</Badge>
                  </div>
                </button>
              )
            })}
            {filteredRows.length === 0 && <div className="text-sm text-black/40 text-center py-10">Geen leerlingen in dit filter.</div>}
          </div>
        </div>

        {open && stage ? (
          <div className="w-[380px] flex-none bg-white border-l border-black/[.08] p-[22px] flex flex-col gap-[18px] overflow-auto">
            <div className="flex justify-between items-start">
              <div className="flex flex-col gap-[3px]">
                <div className="text-[17px] font-bold">{open.naam}</div>
                <div className="text-[12.5px] text-black/50">{open.klas}</div>
                <div className="text-[12.5px] text-black/50">
                  {open.ingediend ? 'ingediend' : incompleteReceipts(openReceipts).length > 0 ? `${incompleteReceipts(openReceipts).length} onvolledig` : 'nog niet ingediend'}
                </div>
              </div>
              <button onClick={() => setOpenId(null)} className="text-lg text-black/40 px-1">
                ×
              </button>
            </div>
            <div className="flex flex-col gap-2.5">
              <div className="flex justify-between items-baseline">
                <div className="text-[30px] font-extrabold tracking-[-1px] tabular-nums">{formatCents(openSpent)}</div>
                <div className="text-[12.5px] text-black/50">van {formatCents(stage.totaalBudgetCents)}</div>
              </div>
              <div className="h-[9px] rounded-full bg-black/[.08] overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${Math.min(100, (openSpent / stage.totaalBudgetCents) * 100)}%`, background: 'oklch(0.62 0.15 152)' }}
                />
              </div>
              <div className="text-[12.5px] text-black/50">
                Nog {formatCents(stage.totaalBudgetCents - openSpent)} beschikbaar · {openReceipts.length} bonnetjes
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <div className="text-xs font-semibold tracking-[.4px] uppercase text-black/40">per dag</div>
              {openDays.map((d) => (
                <div key={d.datum} className="flex flex-col gap-[7px]">
                  <div className="flex justify-between items-baseline border-b border-black/[.08] pb-[5px]">
                    <div className="text-[12.5px] font-bold">
                      {d.dagNummer ? `Dag ${d.dagNummer} · ` : ''}
                      {formatShortDate(d.datum)}
                    </div>
                    <div
                      className="text-[13px] font-bold tabular-nums"
                      style={{ color: d.overToelageCents > 0 ? 'oklch(0.55 0.14 62)' : 'inherit' }}
                    >
                      {formatCents(d.totaalCents)}
                    </div>
                  </div>
                  {d.receipts.map((r) => (
                    <div key={r.id} className="flex gap-2.5 items-center">
                      <ReceiptThumb src={r.fotoDataUrl} width={26} height={33} />
                      <div className="flex-1 min-w-0 flex flex-col gap-px">
                        <div className="text-[13px] font-semibold">{r.titel}</div>
                        <div className="text-[11.5px]" style={{ color: r.categorie ? 'rgba(20,21,26,.5)' : 'oklch(0.52 0.16 62)' }}>
                          {r.categorie ?? 'categorie ontbreekt'} · {r.tijdstip.slice(11, 16)}
                        </div>
                      </div>
                      <div className="text-[13px] font-bold tabular-nums">{formatCents(r.bedragCents)}</div>
                    </div>
                  ))}
                  <div className="text-[11px] text-black/40">
                    {d.overToelageCents > 0
                      ? `€${(d.overToelageCents / 100).toFixed(2).replace('.', ',')} boven de dagtoelage`
                      : `€${(-d.overToelageCents / 100).toFixed(2).replace('.', ',')} onder de dagtoelage`}
                  </div>
                </div>
              ))}
              {openDays.length === 0 && <div className="text-[12.5px] text-black/40">Nog geen bonnetjes.</div>}
            </div>
            <div className="flex flex-col gap-2 mt-auto">
              <Link
                to={`/dossier/${open.id}`}
                target="_blank"
                rel="noreferrer"
                className="bg-ink rounded-[10px] py-3 text-center text-[13.5px] font-bold text-white"
              >
                Dossier exporteren als PDF
              </Link>
              <div className="text-[11.5px] leading-[1.45] text-black/45">
                {open.ingediend
                  ? 'Al ingediend — een leerling kan zijn dossierbestand gerust nog eens opnieuw doorsturen. Gebruik gewoon de laatste versie die je ontvangt als definitief.'
                  : 'Leerlingen zien enkel hun eigen bonnetjes. Deze weergave is alleen voor begeleiders.'}
              </div>
            </div>
          </div>
        ) : (
          <div className="w-[330px] flex-none border-l border-black/[.08] p-[26px] flex items-center justify-center text-center text-[13px] leading-[1.6] text-black/40">
            Klik een leerling om per dag de bonnetjes en bedragen te zien.
          </div>
        )}
      </div>
    </>
  )
}

function Stat({ label, value, warn }: { label: string; value: string; warn?: boolean }) {
  return (
    <div className="flex flex-col gap-0.5">
      <div className="text-[11.5px] font-semibold tracking-[.4px] uppercase text-black/[.42]">{label}</div>
      <div className="text-xl font-extrabold tabular-nums" style={{ color: warn ? 'oklch(0.55 0.14 62)' : undefined }}>
        {value}
      </div>
    </div>
  )
}
