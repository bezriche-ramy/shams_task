import { useState, type FormEvent } from 'react'
import { TEAMS, USER_ROLES, type CreateUserInput } from '../../types/models.ts'

const initialState: CreateUserInput = {
  name: '',
  email: '',
  password: '',
  role: 'User',
  team: 'Frontend',
}

type UserFormProps = {
  onSubmit: (input: CreateUserInput) => Promise<void>
}

export function UserForm({ onSubmit }: UserFormProps) {
  const [formState, setFormState] = useState<CreateUserInput>(initialState)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSubmitting(true)

    try {
      await onSubmit(formState)
      setFormState(initialState)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="user-name">
            Full name
          </label>
          <input
            id="user-name"
            required
            value={formState.name}
            onChange={(event) => setFormState((current) => ({ ...current, name: event.target.value }))}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-slate-400 focus:bg-white"
            placeholder="Amina Rahman"
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="user-email">
            Email
          </label>
          <input
            id="user-email"
            type="email"
            required
            value={formState.email}
            onChange={(event) => setFormState((current) => ({ ...current, email: event.target.value }))}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-slate-400 focus:bg-white"
            placeholder="amina@shams.app"
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="user-password">
            Password
          </label>
          <input
            id="user-password"
            required
            value={formState.password}
            onChange={(event) => setFormState((current) => ({ ...current, password: event.target.value }))}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-slate-400 focus:bg-white"
            placeholder="Temporary password"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="user-role">
            Role
          </label>
          <select
            id="user-role"
            required
            value={formState.role}
            onChange={(event) =>
              setFormState((current) => ({
                ...current,
                role: event.target.value as CreateUserInput['role'],
              }))
            }
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-slate-400 focus:bg-white"
          >
            {USER_ROLES.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="user-team">
            Team
          </label>
          <select
            id="user-team"
            required
            value={formState.team}
            onChange={(event) =>
              setFormState((current) => ({
                ...current,
                team: event.target.value as CreateUserInput['team'],
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

      <button
        type="submit"
        disabled={isSubmitting}
        className="inline-flex items-center justify-center rounded-2xl bg-emerald-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isSubmitting ? 'Adding user...' : 'Add user'}
      </button>
    </form>
  )
}
