import { AlertTriangle } from 'lucide-react'
import { Link } from 'react-router-dom'
import { cn } from '../../lib/cn.ts'
import { getTeamTasksPath } from '../../lib/team-links.ts'
import { isTaskOverdue } from '../../lib/tasks.ts'
import { TEAM_THEME } from '../../lib/theme.ts'
import { ACTIVE_TASK_STATUSES, type Task, type TaskStatus } from '../../types/models.ts'
import { Chip } from '../ui/Chip.tsx'
import { Select } from '../ui/Field.tsx'
import { StatusBadge } from './StatusBadge.tsx'
import { TaskRowActions } from './TaskRowActions.tsx'

type TaskTableProps = {
  tasks: Task[]
  canUpdate?: boolean
  canManage?: boolean
  compact?: boolean
  busyTaskId?: string | null
  onStatusChange?: (taskId: string, status: TaskStatus) => Promise<void> | void
  onEditTask?: (task: Task) => void
  onToggleArchiveTask?: (task: Task) => Promise<void> | void
  onDeleteTask?: (task: Task) => void
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

export function TaskTable({
  tasks,
  canUpdate = false,
  canManage = false,
  compact = false,
  busyTaskId,
  onStatusChange,
  onDeleteTask,
  onEditTask,
  onToggleArchiveTask,
  emptyCopy = 'No tasks match the current filters.',
}: TaskTableProps) {
  if (!tasks.length) {
    return (
      <div className="clay-surface-inset rounded-[1.65rem] px-5 py-12 text-center text-sm text-[#b8c7da]">
        {emptyCopy}
      </div>
    )
  }

  return (
    <div className="clay-surface-inset clay-scroll min-w-0 overflow-x-auto rounded-[1.75rem] p-3">
      <table className="min-w-full divide-y divide-[#4D00EE]/12 text-left">
        <thead>
          <tr className="text-xs uppercase tracking-[0.22em] text-[#8fa4bf]">
            <th className="px-4 pb-5 pt-3 font-medium">Task</th>
            {!compact && <th className="pb-5 pr-5 font-medium">Description</th>}
            <th className="pb-5 pr-5 font-medium">Owner</th>
            <th className="pb-5 pr-5 font-medium">Team</th>
            <th className="pb-5 pr-5 font-medium">Deadline</th>
            <th className="pb-5 pr-4 font-medium">Status</th>
            {canManage ? <th className="pb-5 pr-4 text-right font-medium">Actions</th> : null}
          </tr>
        </thead>
        <tbody className="divide-y divide-[#122F45]/24">
          {tasks.map((task) => {
            const overdue = isTaskOverdue(task)
            const isBusy = busyTaskId === task.id
            const canInlineStatusUpdate = canUpdate && onStatusChange && task.status !== 'Archived'

            return (
              <tr
                key={task.id}
                className="align-top text-sm text-[#c3d0e2] transition duration-200 hover:bg-[#122F45]/20"
              >
                <td className="px-4 py-5">
                  <div className="min-w-[220px]">
                    <p className="font-semibold text-[#eef4ff]">{task.title}</p>
                    <p className="mt-1 text-xs uppercase tracking-[0.18em] text-[#8fa4bf]">
                      {task.id}
                    </p>
                  </div>
                </td>
                {!compact && (
                  <td className="py-5 pr-5 leading-7 text-[#b8c7da]">
                    <div className="max-w-md">{task.description || 'No description provided.'}</div>
                  </td>
                )}
                <td className="py-5 pr-5 text-[#c3d0e2]">
                  <div className="min-w-[150px]">
                    <p className="font-medium">{task.assignedToName}</p>
                    <p className="text-[#8fa4bf]">{task.assignedTo}</p>
                  </div>
                </td>
                <td className="py-5 pr-5">
                  <Link
                    to={getTeamTasksPath(task.team)}
                    className="rounded-full transition duration-200 hover:-translate-y-0.5 focus-visible:ring-4 focus-visible:ring-[#4D00EE]/24"
                  >
                    <Chip className={TEAM_THEME[task.team].badgeClassName}>{task.team}</Chip>
                  </Link>
                </td>
                <td className="py-5 pr-5 text-[#b8c7da]">
                  <div className="min-w-[140px]">
                    <span>{formatDate(task.dueDate)}</span>
                    {overdue && (
                      <div className="mt-2">
                        <Chip className="bg-[#4D00EE]/18 text-[#d5c6ff] ring-[#4D00EE]/30 shadow-[0_6px_14px_rgba(0,0,0,0.26)]">
                          <AlertTriangle className="h-3.5 w-3.5" />
                          Overdue
                        </Chip>
                      </div>
                    )}
                  </div>
                </td>
                <td className="py-5 pr-4">
                  <div className="min-w-[185px]">
                    {canInlineStatusUpdate ? (
                      <Select
                        value={task.status}
                        fieldSize="sm"
                        disabled={isBusy}
                        onChange={(event) => onStatusChange(task.id, event.target.value as TaskStatus)}
                        className={cn(
                          'font-medium',
                          isBusy && 'cursor-wait opacity-70',
                        )}
                      >
                        {ACTIVE_TASK_STATUSES.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </Select>
                    ) : (
                      <StatusBadge status={task.status} />
                    )}
                  </div>
                </td>
                {canManage && onEditTask && onToggleArchiveTask && onDeleteTask ? (
                  <td className="py-5 pr-4">
                    <div className="flex justify-end">
                      <TaskRowActions
                        task={task}
                        disabled={isBusy}
                        onEdit={onEditTask}
                        onToggleArchive={onToggleArchiveTask}
                        onDelete={onDeleteTask}
                      />
                    </div>
                  </td>
                ) : null}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
