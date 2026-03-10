import { AlertTriangle } from 'lucide-react'
import { TASK_STATUSES, type Task, type TaskStatus } from '../../types/models.ts'
import { StatusBadge } from './StatusBadge.tsx'

type TaskTableProps = {
  tasks: Task[]
  canUpdate?: boolean
  compact?: boolean
  updatingTaskId?: string | null
  onStatusChange?: (taskId: string, status: TaskStatus) => Promise<void> | void
  emptyCopy?: string
}

function formatDate(dateString: string) {
  if (!dateString) {
    return 'No deadline'
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(dateString))
}

function isOverdue(task: Task) {
  return task.status !== 'Completed' && new Date(task.dueDate) < new Date()
}

export function TaskTable({
  tasks,
  canUpdate = false,
  compact = false,
  updatingTaskId,
  onStatusChange,
  emptyCopy = 'No tasks match the current filters.',
}: TaskTableProps) {
  if (!tasks.length) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-10 text-center text-sm text-slate-500">
        {emptyCopy}
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-slate-200 text-left">
        <thead>
          <tr className="text-xs uppercase tracking-[0.18em] text-slate-500">
            <th className="pb-4 pr-4 font-medium">Task</th>
            {!compact && <th className="pb-4 pr-4 font-medium">Description</th>}
            <th className="pb-4 pr-4 font-medium">Owner</th>
            <th className="pb-4 pr-4 font-medium">Team</th>
            <th className="pb-4 pr-4 font-medium">Deadline</th>
            <th className="pb-4 pr-4 font-medium">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {tasks.map((task) => {
            const overdue = isOverdue(task)

            return (
              <tr key={task.id} className="align-top">
                <td className="py-4 pr-4">
                  <div className="min-w-[220px]">
                    <p className="font-semibold text-slate-900">{task.title}</p>
                    <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-400">{task.id}</p>
                  </div>
                </td>
                {!compact && (
                  <td className="py-4 pr-4 text-sm leading-6 text-slate-600">
                    <div className="max-w-md">{task.description || 'No description provided.'}</div>
                  </td>
                )}
                <td className="py-4 pr-4 text-sm text-slate-700">
                  <div className="min-w-[150px]">
                    <p className="font-medium">{task.assignedToName}</p>
                    <p className="text-slate-500">{task.assignedTo}</p>
                  </div>
                </td>
                <td className="py-4 pr-4">
                  <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                    {task.team}
                  </span>
                </td>
                <td className="py-4 pr-4 text-sm text-slate-600">
                  <div className="min-w-[140px]">
                    <span>{formatDate(task.dueDate)}</span>
                    {overdue && (
                      <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-1 text-xs font-medium text-rose-600">
                        <AlertTriangle className="h-3.5 w-3.5" />
                        Overdue
                      </div>
                    )}
                  </div>
                </td>
                <td className="py-4 pr-0">
                  <div className="min-w-[180px]">
                    {canUpdate && onStatusChange ? (
                      <select
                        value={task.status}
                        disabled={updatingTaskId === task.id}
                        onChange={(event) => onStatusChange(task.id, event.target.value as TaskStatus)}
                        className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none ring-0 transition focus:border-slate-400"
                      >
                        {TASK_STATUSES.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <StatusBadge status={task.status} />
                    )}
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
