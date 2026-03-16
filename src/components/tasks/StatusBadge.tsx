import { STATUS_THEME } from '../../lib/theme.ts'
import type { TaskStatus } from '../../types/models.ts'
import { Chip } from '../ui/Chip.tsx'

export function StatusBadge({ status }: { status: TaskStatus }) {
  return <Chip className={STATUS_THEME[status].chipClassName}>{status}</Chip>
}
