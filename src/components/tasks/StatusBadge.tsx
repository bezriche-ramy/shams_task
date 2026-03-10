import { cn } from '../../lib/cn.ts'
import type { TaskStatus } from '../../types/models.ts'

const badgeClasses: Record<TaskStatus, string> = {
  Pending: 'bg-amber-100 text-amber-700 ring-amber-200',
  'In Progress': 'bg-sky-100 text-sky-700 ring-sky-200',
  Completed: 'bg-emerald-100 text-emerald-700 ring-emerald-200',
  Blocked: 'bg-rose-100 text-rose-700 ring-rose-200',
}

export function StatusBadge({ status }: { status: TaskStatus }) {
  return (
    <span
      className={cn(
        'inline-flex rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset',
        badgeClasses[status],
      )}
    >
      {status}
    </span>
  )
}
