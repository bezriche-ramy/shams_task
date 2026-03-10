import type { ReactNode } from 'react'
import { cn } from '../../lib/cn.ts'

type CardProps = {
  children: ReactNode
  className?: string
}

export function Card({ children, className }: CardProps) {
  return (
    <section
      className={cn(
        'surface-ring rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm shadow-slate-200/60',
        className,
      )}
    >
      {children}
    </section>
  )
}
