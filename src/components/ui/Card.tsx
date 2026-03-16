import type { ReactNode } from 'react'
import { cn } from '../../lib/cn.ts'

type CardProps = {
  children: ReactNode
  className?: string
  padding?: 'none' | 'sm' | 'md' | 'lg'
  variant?: 'elevated' | 'inset' | 'shell' | 'soft'
}

const paddingClasses: Record<NonNullable<CardProps['padding']>, string> = {
  none: 'p-0',
  sm: 'p-4 sm:p-5',
  md: 'p-5 sm:p-6',
  lg: 'p-6 sm:p-7 lg:p-8',
}

const variantClasses: Record<NonNullable<CardProps['variant']>, string> = {
  elevated: 'clay-surface',
  inset: 'clay-surface-inset',
  shell: 'clay-shell',
  soft: 'clay-surface-soft',
}

export function Card({
  children,
  className,
  padding = 'md',
  variant = 'elevated',
}: CardProps) {
  return (
    <section
      className={cn(
        'rounded-[2rem]',
        variantClasses[variant],
        paddingClasses[padding],
        className,
      )}
    >
      {children}
    </section>
  )
}
