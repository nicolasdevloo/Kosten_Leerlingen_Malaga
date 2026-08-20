import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useSession } from '@/hooks/useSession'
import { useStore, studentReceipts } from '@/data/store'
import { totalSpent } from '@/data/selectors'
import { formatCents } from '@/lib/money'
import { formatRelative } from '@/lib/date'
import type { Categorie } from '@/types'
import { CATEGORIEEN } from '@/types'
import { Chip } from '@/components/ui/Chip'
import { ReceiptThumb } from '@/components/ui/ReceiptThumb'
import { Badge, type BadgeTone } from '@/components/ui/Badge'

type Filter = 'Alles' | 'Onvolledig' | Categorie

const FILTERS: Filter[] = ['Alles', 'Onvolledig', ...CATEGORIEEN]

function statusFor(pending: boolean, categorie: Categorie | null): { label: string; tone: BadgeTone } {
  if (categorie === null) return { label: 'categorie ontbreekt', tone: 'warn' }
  if (pending) return { label: 'wacht op upload', tone: 'neutral' }
  return { label: 'bewaard', tone: 'good' }
}

export function ReceiptList() {
  const { student } = useSession()
  const receipts = useStore((s) => (student ? studentReceipts(s, student.id) : []))
  const [params] = useSearchParams()
  const initial = (params.get('filter') as Filter) ?? 'Alles'
  const [filter, setFilter] = useState<Filter>(FILTERS.includes(initial) ? initial : 'Alles')

  if (!student) return null

  const filtered = receipts.filter((r) => {
    if (filter === 'Alles') return true
    if (filter === 'Onvolledig') return r.categorie === null
    return r.categorie === filter
  })

  return (
    <div className="px-5 pt-14 pb-4 flex flex-col gap-3.5">
      <div>
        <h1 className="text-[22px] font-bold tracking-[-0.4px]">Bonnetjes</h1>
        <div className="text-[13px] text-black/50">
          {receipts.length} stuks · {formatCents(totalSpent(receipts))}
        </div>
      </div>
      <div className="flex flex-wrap gap-[7px]">
        {FILTERS.map((f) => (
          <Chip key={f} active={filter === f} onClick={() => setFilter(f)}>
            {f}
          </Chip>
        ))}
      </div>
      <div className="flex flex-col gap-[9px]">
        {filtered.map((r) => {
          const status = statusFor(r.pending, r.categorie)
          return (
            <Link
              key={r.id}
              to={`/app/bonnetjes/${r.id}`}
              className="bg-white rounded-xl px-[15px] py-[13px] flex gap-[13px] items-center shadow-card"
            >
              <ReceiptThumb src={r.fotoDataUrl} />
              <div className="flex-1 flex flex-col gap-1 min-w-0">
                <div className="text-[14.5px] font-semibold truncate">{r.titel}</div>
                <div className="text-xs text-black/50">{formatRelative(r.tijdstip)}</div>
                <div>
                  <Badge tone={status.tone}>{status.label}</Badge>
                </div>
              </div>
              <div className="text-[15px] font-bold tabular-nums">{formatCents(r.bedragCents)}</div>
            </Link>
          )
        })}
        {filtered.length === 0 && (
          <div className="text-sm text-black/45 text-center py-10">Geen bonnetjes in dit filter.</div>
        )}
      </div>
    </div>
  )
}
