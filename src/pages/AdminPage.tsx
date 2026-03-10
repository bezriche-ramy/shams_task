import { startTransition, useEffect, useState } from 'react'
import { TaskForm } from '../components/tasks/TaskForm.tsx'
import { TaskTable } from '../components/tasks/TaskTable.tsx'
import { UserForm } from '../components/tasks/UserForm.tsx'
import { Card } from '../components/ui/Card.tsx'
import { useAuth } from '../context/AuthContext.tsx'
import { api } from '../services/api.ts'
import {
  TEAMS,
  type CreateTaskInput,
  type CreateUserInput,
  type Task,
  type User,
} from '../types/models.ts'

export function AdminPage() {
  const { token } = useAuth()
  const [users, setUsers] = useState<User[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

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
            setTasks(nextTasks)
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

  const handleCreateTask = async (input: CreateTaskInput) => {
    if (!token) {
      return
    }

    try {
      const task = await api.createTask(token, input)
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

  const userCountByTeam = TEAMS.map((team) => ({
    team,
    count: users.filter((user) => user.teams.includes(team)).length,
  }))

  if (isLoading) {
    return <Card className="text-sm text-slate-500">Loading admin tools...</Card>
  }

  return (
    <div className="space-y-6">
      {(error || success) && (
        <Card
          className={
            error
              ? 'border-rose-200 bg-rose-50 text-rose-600'
              : 'border-emerald-200 bg-emerald-50 text-emerald-700'
          }
        >
          <p className="text-sm font-medium">{error || success}</p>
        </Card>
      )}

      <section className="grid gap-6 xl:grid-cols-2">
        <Card>
          <div className="mb-6">
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-slate-400">Admin action</p>
            <h3 className="mt-2 text-xl font-bold text-slate-900">Create a new task</h3>
            <p className="mt-2 text-sm text-slate-600">
              Assign work to a specific teammate, map it to a team, and set a deadline.
            </p>
          </div>
          <TaskForm users={users} onSubmit={handleCreateTask} />
        </Card>

        <Card>
          <div className="mb-6">
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-slate-400">Admin action</p>
            <h3 className="mt-2 text-xl font-bold text-slate-900">Add a new user</h3>
            <p className="mt-2 text-sm text-slate-600">
              Provision an admin or standard user directly from the dashboard.
            </p>
          </div>
          <UserForm onSubmit={handleCreateUser} />
        </Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <Card>
          <div className="mb-6">
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-slate-400">Team coverage</p>
            <h3 className="mt-2 text-xl font-bold text-slate-900">Current roster</h3>
          </div>

          <div className="space-y-3">
            {userCountByTeam.map((teamSummary) => (
              <div key={teamSummary.team} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                <div className="flex items-center justify-between gap-4">
                  <span className="font-medium text-slate-800">{teamSummary.team}</span>
                  <span className="rounded-full bg-white px-3 py-1 text-sm font-semibold text-slate-700 shadow-sm">
                    {teamSummary.count}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 space-y-3">
            {users.map((user) => (
              <div key={user.id} className="rounded-2xl border border-slate-200 px-4 py-3">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold text-slate-900">{user.name}</p>
                    <p className="mt-1 text-sm text-slate-500">{user.email}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-slate-700">{user.role}</p>
                    <p className="mt-1 text-xs uppercase tracking-[0.16em] text-slate-400">
                      {user.teams.join(' / ')}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <div className="mb-6">
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-slate-400">Queue</p>
            <h3 className="mt-2 text-xl font-bold text-slate-900">Latest created tasks</h3>
          </div>
          <TaskTable tasks={tasks.slice(0, 6)} compact emptyCopy="No tasks created yet." />
        </Card>
      </section>
    </div>
  )
}
