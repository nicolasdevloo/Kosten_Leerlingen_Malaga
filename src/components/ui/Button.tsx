import type { ButtonHTMLAttributes } from 'react'
import clsx from '@/lib/clsx'

type Variant = 'primary' | 'dark' | 'ghost' | 'outline' | 'white-on-dark' | 'ghost-on-dark'

const VARIANTS: Record<Variant, string> = {
  primary: 'bg-accent text-white hover:bg-accent-dark',
  dark: 'bg-ink text-white hover:opacity-90',
  ghost: 'text-black/50 hover:bg-black/[.04]',
  outline: 'border-[1.5px] border-black/[.15] text-ink hover:bg-black/[.03]',
  'white-on-dark': 'bg-white text-[#0F1017] hover:opacity-90',
  'ghost-on-dark': 'text-white/65 hover:bg-white/[.06]'
}

export function Button({
  variant = 'primary',
  className,
  full,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; full?: boolean }) {
  return (
    <button
      className={clsx(
        'rounded-full py-[17px] px-6 text-[15.5px] font-bold text-center transition-colors disabled:opacity-40 disabled:cursor-not-allowed',
        full && 'w-full',
        VARIANTS[variant],
        className
      )}
      {...props}
    />
  )
}
