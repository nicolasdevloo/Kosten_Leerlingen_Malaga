import { useState } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { useStore } from '@/data/store'
import { formatCents } from '@/lib/money'
import { formatRelative } from '@/lib/date'
import type { Categorie } from '@/types'
import { CATEGORIEEN } from '@/types'
import { Chip } from '@/components/ui/Chip'
import { Button } from '@/components/ui/Button'

export function ReceiptFix() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const receipt = useStore((s) => (id ? s.receipts[id] : undefined))
  const setReceiptCategory = useStore((s) => s.setReceiptCategory)
  const [pick, setPick] = useState<Categorie | null>(receipt?.categorie ?? null)

  if (!receipt) return <Navigate to="/app/bonnetjes" replace />

  const save = () => {
    if (!pick) return
    setReceiptCategory(receipt.id, pick)
    navigate('/app/bonnetjes')
  }

  return (
    <div className="px-5 pt-14 pb-4 flex flex-col gap-4">
      <Link to="/app/bonnetjes" className="text-sm font-semibold text-accent-dark py-1.5 self-start">
        ‹ Bonnetjes
      </Link>
      <div className="bg-white rounded-2xl p-[18px] flex flex-col gap-4 shadow-card">
        <div
          className="rounded-md h-[230px] flex items-center justify-center border border-black/[.12]"
          style={{ backgroundImage: 'repeating-linear-gradient(135deg, rgba(20,21,26,.09) 0 5px, transparent 5px 10px)' }}
        >
          <div className="font-mono text-[11.5px] text-black/45 text-center">
            foto van het bonnetje
            <br />
            tik om te vergroten
          </div>
        </div>
        <div className="flex justify-between items-end">
          <div className="flex flex-col gap-[3px]">
            <div className="text-[17px] font-bold">{receipt.titel}</div>
            <div className="text-[12.5px] text-black/50">{formatRelative(receipt.tijdstip)}</div>
          </div>
          <div className="text-[26px] font-extrabold tracking-[-0.8px] tabular-nums">
            {formatCents(receipt.bedragCents)}
          </div>
        </div>
        <div className="flex flex-col gap-2.5 border-t border-black/[.07] pt-4">
          <div className="text-[13.5px] font-semibold">Kies een categorie om dit bonnetje af te maken</div>
          <div className="flex flex-wrap gap-2">
            {CATEGORIEEN.map((c) => (
              <Chip key={c} active={pick === c} onClick={() => setPick(c)}>
                {c}
              </Chip>
            ))}
          </div>
        </div>
      </div>
      {pick && (
        <Button variant="primary" full onClick={save} className="!py-4 rounded-full">
          Bonnetje afmaken
        </Button>
      )}
    </div>
  )
}
