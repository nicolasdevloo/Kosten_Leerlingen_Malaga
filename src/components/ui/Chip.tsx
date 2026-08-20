import type { ReactNode } from 'react'

export function Chip({
  active,
  onClick,
  children
}: {
  active: boolean
  onClick: () => void
  children: ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        'rounded-full px-3.5 py-[7px] text-[12.5px] font-semibold border-[1.5px] cursor-pointer transition-colors ' +
        (active
          ? 'bg-accent border-accent text-white'
          : 'bg-white border-black/[.14] text-black/70 hover:bg-black/[.02]')
      }
    >
      {children}
    </button>
  )
}
