import { startTransition, useDeferredValue, useEffect, useState } from 'react'
import { Filter, Search } from 'lucide-react'
import { TaskTable } from '../components/tasks/TaskTable.tsx'
import { Card } from '../components/ui/Card.tsx'
import { useAuth } from '../context/AuthContext.tsx'
import { api } from '../services/api.ts'
import { TASK_STATUSES, TEAMS, type Task, type TaskStatus } from '../types/models.ts'

export function TasksPage() {
  const { token } = useAuth()
  const [tasks, setTasks] = useState<Task[]>([])
  const [search, setSearch] = useState('')
  const [teamFilter, setTeamFilter] = useState<'All' | (typeof TEAMS)[number]>('All')
  const [statusFilter, setStatusFilter] = useState<'All' | (typeof TASK_STATUSES)[number]>('All')
  const [isLoading, setIsLoading] = useState(true)
  const [isUpdatingTaskId, setIsUpdatingTaskId] = useState<string | null>(null)
  const [error, setError] = useState('')

  const deferredSearch = useDeferredValue(search)

  useEffect(() => {
    let isMounted = true

    const loadTasks = async () => {
      if (!token) {
        return
      }

      try {
        const nextTasks = await api.getTasks(token)

        if (isMounted) {
          startTransition(() => {
            setTasks(nextTasks)
            setError('')
          })
        }
      } catch (loadError) {
        if (isMounted) {
          setError(loadError instanceof Error ? loadError.message : 'Unable to load tasks')
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    void loadTasks()

    return () => {
      isMounted = false
    }
  }, [token])

  const filteredTasks = tasks.filter((task) => {
    const normalizedSearch = deferredSearch.trim().toLowerCase()
    const matchesSearch =
      !normalizedSearch ||
      task.title.toLowerCase().includes(normalizedSearch) ||
      task.description.toLowerCase().includes(normalizedSearch) ||
      task.assignedToName.toLowerCase().includes(normalizedSearch)

    const matchesTeam = teamFilter === 'All' || task.team === teamFilter
    const matchesStatus = statusFilter === 'All' || task.status === statusFilter

    return matchesSearch && matchesTeam && matchesStatus
  })

  const handleStatusChange = async (taskId: string, status: TaskStatus) => {
    if (!token) {
      return
    }

    setIsUpdatingTaskId(taskId)

    try {
      const updatedTask = await api.updateTaskStatus(token, taskId, status)
      setTasks((current) => current.map((task) => (task.id === updatedTask.id ? updatedTask : task)))
    } catch (statusError) {
      setError(statusError instanceof Error ? statusError.message : 'Unable to update task status')
    } finally {
      setIsUpdatingTaskId(null)
    }
  }

  if (isLoading) {
    return <Card className="text-sm text-slate-500">Loading tasks...</Card>
  }

  return (
    <div className="space-y-6">
      <Card>
        <div className="grid gap-4 xl:grid-cols-[1.4fr_0.7fr_0.7fr]">
          <label className="relative block">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 outline-none transition focus:border-slate-400 focus:bg-white"
              placeholder="Search tasks, descriptions, or owners"
            />
          </label>

          <select
            value={teamFilter}
            onChange={(event) => setTeamFilter(event.target.value as typeof teamFilter)}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-slate-400 focus:bg-white"
          >
            <option value="All">All teams</option>
            {TEAMS.map((team) => (
              <option key={team} value={team}>
                {team}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as typeof statusFilter)}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-slate-400 focus:bg-white"
          >
            <option value="All">All statuses</option>
            {TASK_STATUSES.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>
        <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-sm text-slate-600">
          <Filter className="h-4 w-4" />
          {filteredTasks.length} task{filteredTasks.length === 1 ? '' : 's'} visible
        </div>
      </Card>

      {error && <Card className="border-rose-200 bg-rose-50 text-sm text-rose-600">{error}</Card>}

      <Card>
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-slate-400">Table</p>
            <h3 className="mt-2 text-xl font-bold text-slate-900">Task list</h3>
          </div>
          <p className="text-sm text-slate-500">Standard users can update status for visible tasks.</p>
        </div>
        <TaskTable
          tasks={filteredTasks}
          canUpdate
          updatingTaskId={isUpdatingTaskId}
          onStatusChange={handleStatusChange}
          emptyCopy="No tasks match your current search and filters."
        />
      </Card>
    </div>
  )
}
