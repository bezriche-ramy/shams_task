import type { ReactNode } from 'react'
import { cn } from '../../lib/cn.ts'

type AlertProps = {
  children: ReactNode
  className?: string
  title?: string
  tone?: 'info' | 'success' | 'warning' | 'danger'
}

const toneClasses: Record<NonNullable<AlertProps['tone']>, string> = {
  info: 'bg-[#122F45]/52 text-[#dbe7f7] ring-[#122F45]/22',
  success: 'bg-[#D8FF00]/14 text-[#D8FF00] ring-[#D8FF00]/30',
  warning: 'bg-[#D8FF00]/12 text-[#dce8f8] ring-[#D8FF00]/24',
  danger: 'bg-[#4D00EE]/18 text-[#d5c6ff] ring-[#4D00EE]/28',
}

export function Alert({
  children,
  className,
  title,
  tone = 'info',
}: AlertProps) {
  return (
    <div
      className={cn(
        'clay-alert rounded-[1.55rem] px-5 py-4 ring-1 ring-inset',
        toneClasses[tone],
        className,
      )}
    >
      {title ? <p className="text-sm font-semibold">{title}</p> : null}
      <div className={cn('text-sm leading-6', title && 'mt-1.5')}>{children}</div>
    </div>
  )
}
