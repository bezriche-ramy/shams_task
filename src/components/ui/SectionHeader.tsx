import type { ReactNode } from 'react'
import { cn } from '../../lib/cn.ts'

type SectionHeaderProps = {
  action?: ReactNode
  className?: string
  description?: ReactNode
  eyebrow?: string
  title: ReactNode
}

export function SectionHeader({
  action,
  className,
  description,
  eyebrow,
  title,
}: SectionHeaderProps) {
  return (
    <div className={cn('flex flex-wrap items-start justify-between gap-5', className)}>
      <div className="min-w-0">
        {eyebrow ? (
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#4D00EE]">
            {eyebrow}
          </p>
        ) : null}
        <h3 className="display-font mt-3 text-2xl font-semibold tracking-[-0.03em] text-[#eef4ff] sm:text-[1.8rem]">
          {title}
        </h3>
        {description ? (
          <p className="mt-3 max-w-2xl text-sm leading-7 text-[#b8c7da]">{description}</p>
        ) : null}
      </div>
      {action ? <div className="flex flex-wrap items-center gap-2.5">{action}</div> : null}
    </div>
  )
}
