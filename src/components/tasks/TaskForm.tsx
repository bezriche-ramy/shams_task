import { useState, type FormEvent } from 'react'
import { TEAMS, type CreateTaskInput, type User } from '../../types/models.ts'

type TaskFormProps = {
  users: User[]
  onSubmit: (input: CreateTaskInput) => Promise<void>
}

const initialState: CreateTaskInput = {
  title: '',
  description: '',
  assignedTo: '',
  team: 'Frontend',
  dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
}

export function TaskForm({ users, onSubmit }: TaskFormProps) {
  const [formState, setFormState] = useState<CreateTaskInput>(initialState)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSubmitting(true)

    try {
      await onSubmit(formState)
      setFormState({
        ...initialState,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="task-title">
          Task title
        </label>
        <input
          id="task-title"
          required
          value={formState.title}
          onChange={(event) => setFormState((current) => ({ ...current, title: event.target.value }))}
          className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-slate-400 focus:bg-white"
          placeholder="Launch onboarding dashboard"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="task-description">
          Description
        </label>
        <textarea
          id="task-description"
          rows={4}
          value={formState.description}
          onChange={(event) => setFormState((current) => ({ ...current, description: event.target.value }))}
          className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-slate-400 focus:bg-white"
          placeholder="Outline the scope, dependencies, and expected deliverables."
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="task-assignee">
            Assign to
          </label>
          <select
            id="task-assignee"
            required
            value={formState.assignedTo}
            onChange={(event) => setFormState((current) => ({ ...current, assignedTo: event.target.value }))}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-slate-400 focus:bg-white"
          >
            <option value="">Select a teammate</option>
            {users.map((user) => (
              <option key={user.id} value={user.email}>
                {user.name} ({user.team})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="task-team">
            Team
          </label>
          <select
            id="task-team"
            required
            value={formState.team}
            onChange={(event) =>
              setFormState((current) => ({
                ...current,
                team: event.target.value as CreateTaskInput['team'],
              }))
            }
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-slate-400 focus:bg-white"
          >
            {TEAMS.map((team) => (
              <option key={team} value={team}>
                {team}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="task-deadline">
          Due date
        </label>
        <input
          id="task-deadline"
          type="date"
          required
          value={formState.dueDate}
          onChange={(event) => setFormState((current) => ({ ...current, dueDate: event.target.value }))}
          className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-slate-400 focus:bg-white"
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="inline-flex items-center justify-center rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isSubmitting ? 'Creating task...' : 'Create task'}
      </button>
    </form>
  )
}
