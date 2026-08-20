import { useState } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { useSession } from '@/hooks/useSession'
import { useStore } from '@/data/store'
import { formatCents, parseCentsInput } from '@/lib/money'
import { formatRelative } from '@/lib/date'
import type { Categorie } from '@/types'
import { CATEGORIEEN } from '@/types'
import { Chip } from '@/components/ui/Chip'
import { Button } from '@/components/ui/Button'

export function ReceiptFix() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { student } = useSession()
  const receipt = useStore((s) => (id ? s.receipts[id] : undefined))
  const updateReceipt = useStore((s) => s.updateReceipt)
  const deleteReceipt = useStore((s) => s.deleteReceipt)

  const [categorie, setCategorie] = useState<Categorie | null>(receipt?.categorie ?? null)
  const [amountInput, setAmountInput] = useState(receipt ? (receipt.bedragCents / 100).toFixed(2).replace('.', ',') : '')
  const [note, setNote] = useState(receipt?.omschrijving ?? '')
  const [lightbox, setLightbox] = useState(false)

  if (!receipt) return <Navigate to="/app/bonnetjes" replace />

  const amountCents = parseCentsInput(amountInput)
  const readOnly = student?.ingediend ?? false

  const save = () => {
    if (!categorie || amountCents <= 0) return
    updateReceipt(receipt.id, {
      categorie,
      bedragCents: amountCents,
      omschrijving: note.trim(),
      titel: note.trim() || categorie
    })
    navigate('/app/bonnetjes')
  }

  const remove = () => {
    if (window.confirm('Dit bonnetje verwijderen? Dit kan niet ongedaan gemaakt worden.')) {
      deleteReceipt(receipt.id)
      navigate('/app/bonnetjes')
    }
  }

  return (
    <div className="px-5 pt-14 pb-4 flex flex-col gap-4">
      <Link to="/app/bonnetjes" className="text-sm font-semibold text-accent-dark py-1.5 self-start">
        ‹ Bonnetjes
      </Link>
      <div className="bg-white rounded-2xl p-[18px] flex flex-col gap-4 shadow-card">
        {receipt.fotoDataUrl ? (
          <button onClick={() => setLightbox(true)} className="block w-full">
            <img src={receipt.fotoDataUrl} alt="Bonnetje" className="w-full h-[230px] object-cover rounded-md" />
            <div className="text-xs text-black/40 mt-1.5">tik om te vergroten</div>
          </button>
        ) : (
          <div
            className="rounded-md h-[230px] flex items-center justify-center border border-black/[.12]"
            style={{ backgroundImage: 'repeating-linear-gradient(135deg, rgba(20,21,26,.09) 0 5px, transparent 5px 10px)' }}
          >
            <div className="font-mono text-[11.5px] text-black/45 text-center">geen foto bij dit bonnetje</div>
          </div>
        )}
        <div className="flex justify-between items-end gap-3">
          <div className="flex flex-col gap-[3px]">
            <div className="text-[12.5px] text-black/50">{formatRelative(receipt.tijdstip)}</div>
          </div>
          {readOnly ? (
            <div className="text-[26px] font-extrabold tracking-[-0.8px] tabular-nums">{formatCents(receipt.bedragCents)}</div>
          ) : (
            <div className="flex flex-col items-end gap-0.5">
              <input
                value={amountInput}
                onChange={(e) => setAmountInput(e.target.value)}
                inputMode="decimal"
                className="text-[26px] font-extrabold tracking-[-0.8px] tabular-nums text-right border-none outline-none w-[140px] bg-transparent"
              />
              <div className="text-[11px] text-black/40">{amountCents > 0 ? formatCents(amountCents) : 'bedrag'}</div>
            </div>
          )}
        </div>
        <div className="flex flex-col gap-2.5 border-t border-black/[.07] pt-4">
          <div className="text-[13.5px] font-semibold">Categorie</div>
          <div className="flex flex-wrap gap-2">
            {CATEGORIEEN.map((c) => (
              <Chip key={c} active={categorie === c} onClick={() => !readOnly && setCategorie(c)}>
                {c}
              </Chip>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <div className="text-[11.5px] font-semibold tracking-[.5px] uppercase text-black/45">omschrijving</div>
          {readOnly ? (
            <div className="text-sm text-black/75">{receipt.omschrijving || '—'}</div>
          ) : (
            <input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="bv. Café Central — koffie"
              className="rounded-md bg-black/[.05] px-[15px] py-[13px] text-sm text-black/75 outline-none"
            />
          )}
        </div>
      </div>

      {readOnly ? (
        <div className="text-[12.5px] leading-[1.5] text-black/45 text-center">
          Je dossier is ingediend. Vraag je begeleider om het te heropenen als er nog iets moet veranderen.
        </div>
      ) : (
        <>
          <Button variant="primary" full onClick={save} disabled={!categorie || amountCents <= 0} className="!py-4 rounded-full">
            Wijzigingen opslaan
          </Button>
          <button onClick={remove} className="text-sm font-semibold text-red-600 text-center py-2">
            Bonnetje verwijderen
          </button>
        </>
      )}

      {lightbox && receipt.fotoDataUrl && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setLightbox(false)}
        >
          <img src={receipt.fotoDataUrl} alt="Bonnetje groot" className="max-w-full max-h-full object-contain" />
          <button onClick={() => setLightbox(false)} className="absolute top-5 right-5 text-white text-2xl px-3 py-1">
            ×
          </button>
        </div>
      )}
    </div>
  )
}
