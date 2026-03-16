import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { cn } from '../../lib/cn.ts'

type ChipProps = {
  children: ReactNode
  className?: string
  icon?: LucideIcon
  active?: boolean
}

export function Chip({ active = false, children, className, icon: Icon }: ChipProps) {
  return (
    <span
      data-active={active}
      className={cn(
        'clay-chip inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold tracking-[0.02em] text-[#d7e3f4]',
        active && 'bg-[#D8FF00]/16 text-[#D8FF00] ring-[#D8FF00]/34',
        className,
      )}
    >
      {Icon ? <Icon className="h-3.5 w-3.5" /> : null}
      {children}
    </span>
  )
}
