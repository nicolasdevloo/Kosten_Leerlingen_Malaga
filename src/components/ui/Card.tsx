import type { HTMLAttributes } from 'react'
import clsx from '@/lib/clsx'

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={clsx('bg-white rounded-2xl shadow-card', className)} {...props} />
}
