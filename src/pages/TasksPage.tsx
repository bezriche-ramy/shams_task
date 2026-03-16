import { startTransition, useDeferredValue, useEffect, useState } from 'react'
import { Archive, Filter, Search, Sparkles } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import { TaskDeleteDialog } from '../components/tasks/TaskDeleteDialog.tsx'
import { TaskEditModal } from '../components/tasks/TaskEditModal.tsx'
import { TaskTable } from '../components/tasks/TaskTable.tsx'
import { Alert } from '../components/ui/Alert.tsx'
import { Button } from '../components/ui/Button.tsx'
import { Card } from '../components/ui/Card.tsx'
import { Chip } from '../components/ui/Chip.tsx'
import { Input, Select } from '../components/ui/Field.tsx'
import { SectionHeader } from '../components/ui/SectionHeader.tsx'
import { useAuth } from '../context/useAuth.ts'
import {
  isTaskArchived,
  isTaskOverdue,
  isTaskVisibleToUser,
  sortTasksByRecentCreated,
  toUpdateTaskInput,
} from '../lib/tasks.ts'
import { api } from '../services/api.ts'
import {
  TASK_STATUSES,
  TEAMS,
  type Task,
  type TaskStatus,
  type UpdateTaskInput,
  type User,
} from '../types/models.ts'

function resolveTeamFilter(value: string | null): 'All' | (typeof TEAMS)[number] {
  return TEAMS.includes(value as (typeof TEAMS)[number]) ? (value as (typeof TEAMS)[number]) : 'All'
}

function resolveStatusFilter(value: string | null): 'All' | (typeof TASK_STATUSES)[number] {
  return TASK_STATUSES.includes(value as (typeof TASK_STATUSES)[number])
    ? (value as (typeof TASK_STATUSES)[number])
    : 'All'
}

function resolveArchivedFilter(value: string | null) {
  return value === 'show'
}

export function TasksPage() {
  const { token, user } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const [tasks, setTasks] = useState<Task[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [search, setSearch] = useState(() => searchParams.get('search') ?? '')
  const [teamFilter, setTeamFilter] = useState<'All' | (typeof TEAMS)[number]>(() =>
    resolveTeamFilter(searchParams.get('team')),
  )
  const [statusFilter, setStatusFilter] = useState<'All' | (typeof TASK_STATUSES)[number]>(() =>
    resolveStatusFilter(searchParams.get('status')),
  )
  const [showArchived, setShowArchived] = useState(() =>
    resolveArchivedFilter(searchParams.get('archived')),
  )
  const [isLoading, setIsLoading] = useState(true)
  const [busyTaskId, setBusyTaskId] = useState<string | null>(null)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [deletingTask, setDeletingTask] = useState<Task | null>(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [modalError, setModalError] = useState('')

  const deferredSearch = useDeferredValue(search)

  useEffect(() => {
    const nextSearch = searchParams.get('search') ?? ''
    const nextTeam = resolveTeamFilter(searchParams.get('team'))
    const nextStatus = resolveStatusFilter(searchParams.get('status'))
    const nextShowArchived = resolveArchivedFilter(searchParams.get('archived'))

    setSearch((current) => (current === nextSearch ? current : nextSearch))
    setTeamFilter((current) => (current === nextTeam ? current : nextTeam))
    setStatusFilter((current) => (current === nextStatus ? current : nextStatus))
    setShowArchived((current) => (current === nextShowArchived ? current : nextShowArchived))
  }, [searchParams])

  useEffect(() => {
    const nextParams = new URLSearchParams()

    if (search.trim()) {
      nextParams.set('search', search.trim())
    }

    if (teamFilter !== 'All') {
      nextParams.set('team', teamFilter)
    }

    if (statusFilter !== 'All') {
      nextParams.set('status', statusFilter)
    }

    if (showArchived) {
      nextParams.set('archived', 'show')
    }

    if (nextParams.toString() !== searchParams.toString()) {
      setSearchParams(nextParams, { replace: true })
    }
  }, [search, searchParams, setSearchParams, showArchived, statusFilter, teamFilter])

  useEffect(() => {
    if (statusFilter === 'Archived' && !showArchived) {
      setShowArchived(true)
    }
  }, [showArchived, statusFilter])

  useEffect(() => {
    let isMounted = true

    const loadTasks = async () => {
      if (!token) {
        return
      }

      try {
        const [nextTasks, nextUsers] = await Promise.all([
          api.getTasks(token),
          api.getAssignableUsers(token),
        ])

        if (isMounted) {
          startTransition(() => {
            setTasks(sortTasksByRecentCreated(nextTasks))
            setUsers(nextUsers)
            setError('')
            setSuccess('')
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
    const matchesArchive = showArchived || !isTaskArchived(task)

    return matchesSearch && matchesTeam && matchesStatus && matchesArchive
  })

  const replaceTaskInState = (updatedTask: Task) => {
    setTasks((current) => {
      if (!isTaskVisibleToUser(updatedTask, user)) {
        return current.filter((task) => task.id !== updatedTask.id)
      }

      const alreadyExists = current.some((task) => task.id === updatedTask.id)
      const nextTasks = alreadyExists
        ? current.map((task) => (task.id === updatedTask.id ? updatedTask : task))
        : [updatedTask, ...current]

      return sortTasksByRecentCreated(nextTasks)
    })
  }

  const handleStatusChange = async (taskId: string, status: TaskStatus) => {
    if (!token) {
      return
    }

    setBusyTaskId(taskId)

    try {
      const updatedTask = await api.updateTaskStatus(token, taskId, status)
      replaceTaskInState(updatedTask)
      setSuccess(`Task "${updatedTask.title}" moved to ${updatedTask.status}.`)
      setError('')
    } catch (statusError) {
      setSuccess('')
      setError(statusError instanceof Error ? statusError.message : 'Unable to update task status')
    } finally {
      setBusyTaskId(null)
    }
  }

  const handleEditTask = (task: Task) => {
    setEditingTask(task)
    setModalError('')
  }

  const handleUpdateTask = async (input: UpdateTaskInput) => {
    if (!token || !editingTask) {
      return
    }

    setBusyTaskId(editingTask.id)
    setModalError('')

    try {
      const updatedTask = await api.updateTask(token, editingTask.id, input)
      replaceTaskInState(updatedTask)
      setEditingTask(null)
      setSuccess(`Task "${updatedTask.title}" updated successfully.`)
      setError('')
    } catch (updateError) {
      const message = updateError instanceof Error ? updateError.message : 'Unable to update task'
      setModalError(message)
      setSuccess('')
    } finally {
      setBusyTaskId(null)
    }
  }

  const handleToggleArchiveTask = async (task: Task) => {
    if (!token) {
      return
    }

    setBusyTaskId(task.id)

    try {
      if (task.status === 'Archived') {
        const restoredTask = await api.updateTask(token, task.id, {
          ...toUpdateTaskInput(task),
          status: 'Pending',
        })
        replaceTaskInState(restoredTask)
        setSuccess(`Task "${restoredTask.title}" restored to Pending.`)
      } else {
        const result = await api.deleteTask(token, task.id, 'archive')

        if (result.task) {
          replaceTaskInState(result.task)
        }

        setSuccess(`Task "${task.title}" archived successfully.`)
      }

      setError('')
    } catch (archiveError) {
      setSuccess('')
      setError(archiveError instanceof Error ? archiveError.message : 'Unable to archive task')
    } finally {
      setBusyTaskId(null)
    }
  }

  const handleDeleteTask = async () => {
    if (!token || !deletingTask) {
      return
    }

    setBusyTaskId(deletingTask.id)

    try {
      await api.deleteTask(token, deletingTask.id, 'permanent')
      setTasks((current) => current.filter((task) => task.id !== deletingTask.id))
      setSuccess(`Task "${deletingTask.title}" deleted permanently.`)
      setError('')
      setDeletingTask(null)

      if (editingTask?.id === deletingTask.id) {
        setEditingTask(null)
      }
    } catch (deleteError) {
      setSuccess('')
      setError(deleteError instanceof Error ? deleteError.message : 'Unable to delete task')
    } finally {
      setBusyTaskId(null)
    }
  }

  const overdueTasks = filteredTasks.filter((task) => isTaskOverdue(task)).length
  const completedTasks = filteredTasks.filter((task) => task.status === 'Completed').length

  if (isLoading) {
    return (
      <Card variant="soft" className="text-sm text-[#b8c7da]">
        Loading tasks...
      </Card>
    )
  }

  return (
    <>
      <div className="space-y-7">
      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Card variant="shell" padding="lg">
          <SectionHeader
            eyebrow="Task Flow"
            title="Find, filter, and update live assignments"
            description="Dense controls stay restrained with inset fields while the container keeps the broader claymorphism treatment."
          />

          <div className="mt-6 grid gap-4 xl:grid-cols-[1.35fr_0.8fr_0.8fr_auto]">
            <Input
              value={search}
              icon={Search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search tasks, descriptions, or owners"
            />

            <Select
              value={teamFilter}
              onChange={(event) => setTeamFilter(event.target.value as typeof teamFilter)}
            >
              <option value="All">All teams</option>
              {TEAMS.map((team) => (
                <option key={team} value={team}>
                  {team}
                </option>
              ))}
            </Select>

            <Select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value as typeof statusFilter)}
            >
              <option value="All">All statuses</option>
              {TASK_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </Select>

            <Button
              size="sm"
              variant={showArchived ? 'accent' : 'ghost'}
              onClick={() => setShowArchived((current) => !current)}
              className="w-full xl:min-w-[11rem]"
            >
              <Archive className="h-4 w-4" />
              {showArchived ? 'Hide archived' : 'Show archived'}
            </Button>
          </div>
        </Card>

        <Card variant="soft" padding="lg">
          <SectionHeader
            eyebrow="View Summary"
            title="Visible workload"
            description="Counts react immediately to search and filter state."
          />

          <div className="mt-5 flex flex-wrap gap-2.5">
            <Chip icon={Filter}>{filteredTasks.length} visible</Chip>
            <Chip className="bg-[#D8FF00]/14 text-[#D8FF00] ring-[#D8FF00]/34">
              {completedTasks} completed
            </Chip>
            <Chip className="bg-[#4D00EE]/18 text-[#d5c6ff] ring-[#4D00EE]/30">
              {overdueTasks} overdue
            </Chip>
            <Chip className="bg-[#4D00EE]/16 text-[#d5c6ff] ring-[#4D00EE]/26">
              {search.trim() ? 'Search active' : 'Browsing all'}
            </Chip>
            <Chip className="bg-[#122F45]/50 text-[#b8c7da] ring-[#122F45]/18">
              {showArchived ? 'Archive visible' : 'Archive hidden'}
            </Chip>
          </div>
        </Card>
      </section>

      {error ? <Alert tone="danger">{error}</Alert> : null}
      {!error && success ? <Alert tone="success">{success}</Alert> : null}

      <Card variant="elevated" padding="lg">
        <SectionHeader
          eyebrow="Task Board"
          title="Task list"
          description="Every visible task can be updated, edited, archived, restored, or permanently removed from here."
          action={
            <Chip className="bg-[#D8FF00]/14 text-[#D8FF00] ring-[#D8FF00]/34">
              <Sparkles className="h-3.5 w-3.5" />
              Live task controls
            </Chip>
          }
        />
        <div className="mt-6">
          <TaskTable
            tasks={filteredTasks}
            canUpdate
            canManage
            busyTaskId={busyTaskId}
            onStatusChange={handleStatusChange}
            onEditTask={handleEditTask}
            onToggleArchiveTask={handleToggleArchiveTask}
            onDeleteTask={setDeletingTask}
            emptyCopy="No tasks match your current search and filters."
          />
        </div>
      </Card>
      </div>

      <TaskEditModal
        task={editingTask}
        users={users}
        onClose={() => {
          setEditingTask(null)
          setModalError('')
        }}
        onSubmit={handleUpdateTask}
        error={modalError}
        isSaving={busyTaskId === editingTask?.id}
      />

      <TaskDeleteDialog
        task={deletingTask}
        onClose={() => setDeletingTask(null)}
        onConfirm={handleDeleteTask}
        isDeleting={busyTaskId === deletingTask?.id}
      />
    </>
  )
}
