import { startTransition, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { TaskDeleteDialog } from '../components/tasks/TaskDeleteDialog.tsx'
import { TaskEditModal } from '../components/tasks/TaskEditModal.tsx'
import { TaskForm } from '../components/tasks/TaskForm.tsx'
import { TaskTable } from '../components/tasks/TaskTable.tsx'
import { UserForm } from '../components/tasks/UserForm.tsx'
import { Alert } from '../components/ui/Alert.tsx'
import { Card } from '../components/ui/Card.tsx'
import { Chip } from '../components/ui/Chip.tsx'
import { SectionHeader } from '../components/ui/SectionHeader.tsx'
import { useAuth } from '../context/useAuth.ts'
import { isTaskArchived, sortTasksByRecentCreated, toUpdateTaskInput } from '../lib/tasks.ts'
import { getTeamTasksPath } from '../lib/team-links.ts'
import { TEAM_THEME } from '../lib/theme.ts'
import { api } from '../services/api.ts'
import {
  TEAMS,
  type CreateUserInput,
  type Task,
  type UpdateTaskInput,
  type User,
} from '../types/models.ts'

export function AdminPage() {
  const { token } = useAuth()
  const [users, setUsers] = useState<User[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [busyTaskId, setBusyTaskId] = useState<string | null>(null)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [deletingTask, setDeletingTask] = useState<Task | null>(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [modalError, setModalError] = useState('')

  useEffect(() => {
    let isMounted = true

    const loadAdminData = async () => {
      if (!token) {
        return
      }

      try {
        const [nextUsers, nextTasks] = await Promise.all([api.getUsers(token), api.getTasks(token)])

        if (isMounted) {
          startTransition(() => {
            setUsers(nextUsers)
            setTasks(sortTasksByRecentCreated(nextTasks))
            setError('')
          })
        }
      } catch (loadError) {
        if (isMounted) {
          setError(loadError instanceof Error ? loadError.message : 'Unable to load admin data')
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    void loadAdminData()

    return () => {
      isMounted = false
    }
  }, [token])

  const replaceTaskInState = (updatedTask: Task) => {
    setTasks((current) =>
      sortTasksByRecentCreated(
        current.map((task) => (task.id === updatedTask.id ? updatedTask : task)),
      ),
    )
  }

  const handleCreateTask = async (input: UpdateTaskInput) => {
    if (!token) {
      return
    }

    try {
      const task = await api.createTask(token, {
        title: input.title,
        description: input.description,
        assignedTo: input.assignedTo,
        team: input.team,
        dueDate: input.dueDate,
      })
      setTasks((current) => [task, ...current])
      setSuccess(`Task "${task.title}" created successfully.`)
      setError('')
    } catch (createError) {
      const message =
        createError instanceof Error ? createError.message : 'Unable to create task'
      setSuccess('')
      setError(message)
      throw createError
    }
  }

  const handleCreateUser = async (input: CreateUserInput) => {
    if (!token) {
      return
    }

    try {
      const user = await api.createUser(token, input)
      setUsers((current) => [user, ...current])
      setSuccess(`User "${user.name}" added successfully.`)
      setError('')
    } catch (createError) {
      const message =
        createError instanceof Error ? createError.message : 'Unable to create user'
      setSuccess('')
      setError(message)
      throw createError
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

  const userCountByTeam = TEAMS.map((team) => ({
    team,
    count: users.filter((user) => user.teams.includes(team)).length,
  }))
  const activeTaskCount = tasks.filter((task) => !isTaskArchived(task)).length
  const archivedTaskCount = tasks.length - activeTaskCount
  const recentTasks = tasks.filter((task) => !isTaskArchived(task)).slice(0, 6)

  if (isLoading) {
    return (
      <Card variant="soft" className="text-sm text-[#b8c7da]">
        Loading admin tools...
      </Card>
    )
  }

  return (
    <>
      <div className="space-y-7">
      <Card variant="shell" padding="lg">
        <SectionHeader
          eyebrow="Admin Command"
          title="Shape the workspace from a single control layer"
          description="Create tasks, provision users, and audit team coverage without changing any backend contracts."
        />

        <div className="mt-7 flex flex-wrap gap-3">
          <Chip className="bg-[#D8FF00]/14 text-[#D8FF00] ring-[#D8FF00]/34">{users.length} users</Chip>
          <Chip className="bg-[#4D00EE]/16 text-[#d5c6ff] ring-[#4D00EE]/26">
            {activeTaskCount} active tasks
          </Chip>
          {archivedTaskCount ? (
            <Chip className="bg-[#122F45]/48 text-[#b8c7da] ring-[#122F45]/18">
              {archivedTaskCount} archived
            </Chip>
          ) : null}
          <Chip className="bg-[#D8FF00]/14 text-[#D8FF00] ring-[#D8FF00]/34">
            {TEAMS.length} tracked teams
          </Chip>
        </div>
      </Card>

      {error ? <Alert tone="danger">{error}</Alert> : null}
      {!error && success ? <Alert tone="success">{success}</Alert> : null}

      <section className="grid gap-7 xl:grid-cols-2">
        <Card variant="soft" padding="lg">
          <SectionHeader
            eyebrow="Admin Action"
            title="Create a new task"
            description="Assign work to a teammate, choose the responsible team, and set a deadline."
          />
          <div className="mt-7">
            <TaskForm
              users={users}
              onSubmit={handleCreateTask}
              submitLabel="Create task"
              submittingLabel="Creating task..."
            />
          </div>
        </Card>

        <Card variant="inset" padding="lg">
          <SectionHeader
            eyebrow="Admin Action"
            title="Add a new user"
            description="Provision an admin or standard user directly from the dashboard."
          />
          <div className="mt-7">
            <UserForm onSubmit={handleCreateUser} />
          </div>
        </Card>
      </section>

      <section className="grid items-start gap-7 xl:grid-cols-[minmax(22rem,0.92fr)_minmax(0,1.08fr)]">
        <Card variant="soft" padding="lg" className="min-w-0">
          <SectionHeader
            eyebrow="Team Coverage"
            title="Current roster"
            description="See how many people are available per lane, then review the full roster below."
          />

          <div className="mt-6 grid gap-3.5 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
            {userCountByTeam.map((teamSummary) => (
              <Link
                key={teamSummary.team}
                to={getTeamTasksPath(teamSummary.team)}
                className="rounded-[1.5rem] transition duration-200 hover:-translate-y-0.5 focus-visible:ring-4 focus-visible:ring-[#4D00EE]/24"
              >
                <Card variant="inset" padding="md" className="rounded-[1.5rem]">
                  <div className="flex items-center justify-between gap-3">
                    <Chip className={TEAM_THEME[teamSummary.team].chipClassName}>
                      {teamSummary.team}
                    </Chip>
                    <span className="text-lg font-bold tracking-[-0.03em] text-[#eef4ff]">
                      {teamSummary.count}
                    </span>
                  </div>
                </Card>
              </Link>
            ))}
          </div>

          <div className="mt-6 space-y-3.5">
            {users.map((user) => (
              <Card key={user.id} variant="inset" padding="md" className="rounded-[1.6rem]">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold text-[#eef4ff]">{user.name}</p>
                    <p className="mt-2 text-sm text-[#8fa4bf]">{user.email}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-[#d5c6ff]">{user.role}</p>
                    <div className="mt-2 flex flex-wrap justify-end gap-2">
                      {user.teams.map((team) => (
                        <Link
                          key={`${user.id}-${team}`}
                          to={getTeamTasksPath(team)}
                          className="rounded-full transition duration-200 hover:-translate-y-0.5 focus-visible:ring-4 focus-visible:ring-[#4D00EE]/24"
                        >
                          <Chip className={TEAM_THEME[team].chipClassName}>{team}</Chip>
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </Card>

        <Card variant="elevated" padding="lg" className="min-w-0">
          <SectionHeader
            eyebrow="Latest Queue"
            title="Newest created tasks"
            description="Quick readout of the most recent additions to the delivery queue."
            action={<Chip>{recentTasks.length} shown</Chip>}
          />
          <div className="mt-7">
            <TaskTable
              tasks={recentTasks}
              compact
              canManage
              busyTaskId={busyTaskId}
              onEditTask={handleEditTask}
              onToggleArchiveTask={handleToggleArchiveTask}
              onDeleteTask={setDeletingTask}
              emptyCopy="No active tasks created yet."
            />
          </div>
        </Card>
      </section>
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
