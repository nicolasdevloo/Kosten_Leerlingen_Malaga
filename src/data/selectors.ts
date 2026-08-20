import type { Bonnetje, Categorie, Stage } from '@/types'
import { CATEGORIEEN } from '@/types'
import { stageDayNumber, todayIso } from '@/lib/date'

export function totalSpent(receipts: Bonnetje[]): number {
  return receipts.reduce((sum, r) => sum + r.bedragCents, 0)
}

export function todaySpent(receipts: Bonnetje[]): number {
  return receipts.filter((r) => r.datum === todayIso()).reduce((sum, r) => sum + r.bedragCents, 0)
}

export function incompleteReceipts(receipts: Bonnetje[]): Bonnetje[] {
  return receipts.filter((r) => r.categorie === null)
}

export function pendingReceipts(receipts: Bonnetje[]): Bonnetje[] {
  return receipts.filter((r) => r.pending)
}

export function categoryTotals(receipts: Bonnetje[]): Record<Categorie, number> {
  const totals: Record<Categorie, number> = { Eten: 0, Vervoer: 0, Ontspanning: 0 }
  for (const r of receipts) {
    if (r.categorie) totals[r.categorie] += r.bedragCents
  }
  return totals
}

export interface DaySummary {
  datum: string
  dagNummer: number | null
  receipts: Bonnetje[]
  totaalCents: number
  overToelageCents: number
}

export function groupByDay(receipts: Bonnetje[], stage: Stage): DaySummary[] {
  const byDay = new Map<string, Bonnetje[]>()
  for (const r of receipts) {
    const list = byDay.get(r.datum) ?? []
    list.push(r)
    byDay.set(r.datum, list)
  }
  return Array.from(byDay.entries())
    .sort(([a], [b]) => (a < b ? 1 : -1))
    .map(([datum, list]) => {
      const totaalCents = totalSpent(list)
      return {
        datum,
        dagNummer: stageDayNumber(datum, stage.startDatum, stage.aantalDagen),
        receipts: list.sort((a, b) => (a.tijdstip < b.tijdstip ? 1 : -1)),
        totaalCents,
        overToelageCents: totaalCents - stage.dagToelageCents
      }
    })
}

export function currentStageDay(stage: Stage): number | null {
  return stageDayNumber(todayIso(), stage.startDatum, stage.aantalDagen)
}

export interface BudgetCheck {
  kind: 'ok' | 'warn' | 'blocked'
  dayLeftAfterCents: number
  totalLeftAfterCents: number
  overDayCents: number
}

export function checkNewReceipt(stage: Stage, receipts: Bonnetje[], newAmountCents: number): BudgetCheck {
  const spentTotal = totalSpent(receipts)
  const spentToday = todaySpent(receipts)
  const totalLeftAfterCents = stage.totaalBudgetCents - spentTotal - newAmountCents
  const dayLeftAfterCents = stage.dagToelageCents - spentToday - newAmountCents
  if (totalLeftAfterCents < 0) {
    return { kind: 'blocked', dayLeftAfterCents, totalLeftAfterCents, overDayCents: Math.max(0, -dayLeftAfterCents) }
  }
  if (dayLeftAfterCents < 0) {
    return { kind: 'warn', dayLeftAfterCents, totalLeftAfterCents, overDayCents: -dayLeftAfterCents }
  }
  return { kind: 'ok', dayLeftAfterCents, totalLeftAfterCents, overDayCents: 0 }
}

export { CATEGORIEEN }
