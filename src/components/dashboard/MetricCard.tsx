import type { LucideIcon } from 'lucide-react'
import { Card } from '../ui/Card.tsx'

type MetricCardProps = {
  label: string
  value: number
  note: string
  icon: LucideIcon
  accentClassName: string
}

export function MetricCard({
  label,
  value,
  note,
  icon: Icon,
  accentClassName,
}: MetricCardProps) {
  return (
    <Card className="overflow-hidden p-0">
      <div className={`h-1.5 w-full ${accentClassName}`} />
      <div className="flex items-start justify-between gap-4 p-5">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-3 text-3xl font-bold tracking-tight text-slate-900">{value}</p>
          <p className="mt-2 text-sm text-slate-600">{note}</p>
        </div>
        <div className={`rounded-2xl p-3 text-white shadow-lg ${accentClassName}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </Card>
  )
}
