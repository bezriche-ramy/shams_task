import type { LucideIcon } from 'lucide-react'
import { cn } from '../../lib/cn.ts'
import { METRIC_TONES, type MetricTone } from '../../lib/theme.ts'
import { Chip } from '../ui/Chip.tsx'
import { Card } from '../ui/Card.tsx'

type MetricCardProps = {
  label: string
  value: number
  note: string
  icon: LucideIcon
  tone: MetricTone
}

export function MetricCard({
  label,
  value,
  note,
  icon: Icon,
  tone,
}: MetricCardProps) {
  const theme = METRIC_TONES[tone]

  return (
    <Card padding="none" className="overflow-hidden">
      <div className={cn('relative overflow-hidden bg-gradient-to-br p-6 sm:p-7', theme.accentClassName)}>
        <div className="absolute right-0 top-0 h-24 w-24 rounded-full bg-[#D8FF00]/12 blur-2xl" />
        <div className="relative flex items-start justify-between gap-4">
          <div>
            <Chip className={theme.chipClassName}>{label}</Chip>
            <p className="mt-5 text-4xl font-extrabold tracking-[-0.04em] text-[#eef4ff]">
              {value}
            </p>
            <p className="mt-3 max-w-[16rem] text-sm leading-7 text-[#9bb0ca]">{note}</p>
          </div>
          <div
            className={cn(
              'flex h-14 w-14 items-center justify-center rounded-[1.5rem]',
              theme.iconClassName,
            )}
          >
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </div>
    </Card>
  )
}
