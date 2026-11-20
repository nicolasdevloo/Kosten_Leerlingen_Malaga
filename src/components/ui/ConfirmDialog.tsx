import { Button } from '@/components/ui/Button'

/**
 * Vervangt window.confirm(): die native dialoog verschijnt onbetrouwbaar (soms helemaal niet) in
 * een als app toegevoegde PWA op iPhone, waardoor verwijderen daar leek vast te hangen.
 */
export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Verwijderen',
  onConfirm,
  onCancel
}: {
  open: boolean
  title: string
  message: string
  confirmLabel?: string
  onConfirm: () => void
  onCancel: () => void
}) {
  if (!open) return null

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center p-4" onClick={onCancel}>
      <div
        className="bg-white rounded-2xl p-5 flex flex-col gap-4 w-full max-w-[360px] shadow-card"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col gap-1.5">
          <div className="text-[17px] font-bold">{title}</div>
          <div className="text-sm text-black/60 leading-[1.5]">{message}</div>
        </div>
        <div className="flex gap-2.5">
          <Button variant="outline" full onClick={onCancel} className="!py-3.5">
            Annuleren
          </Button>
          <Button variant="primary" full onClick={onConfirm} className="!py-3.5 !bg-red-600 hover:!bg-red-700">
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  )
}
