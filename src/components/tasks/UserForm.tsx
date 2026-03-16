import { KeyRound, Mail, Shield, UserRound } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { cn } from '../../lib/cn.ts'
import { TEAM_THEME } from '../../lib/theme.ts'
import { Button } from '../ui/Button.tsx'
import { Chip } from '../ui/Chip.tsx'
import { FieldLabel, Input, Select } from '../ui/Field.tsx'
import { TEAMS, USER_ROLES, type CreateUserInput } from '../../types/models.ts'

const initialState: CreateUserInput = {
  name: '',
  email: '',
  password: '',
  role: 'User',
  teams: ['Frontend'],
}

type UserFormProps = {
  onSubmit: (input: CreateUserInput) => Promise<void>
}

export function UserForm({ onSubmit }: UserFormProps) {
  const [formState, setFormState] = useState<CreateUserInput>(initialState)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectionError, setSelectionError] = useState('')

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!formState.teams.length) {
      setSelectionError('Select at least one team.')
      return
    }

    setSelectionError('')
    setIsSubmitting(true)

    try {
      await onSubmit(formState)
      setFormState(initialState)
    } finally {
      setIsSubmitting(false)
    }
  }

  const toggleTeam = (team: CreateUserInput['teams'][number]) => {
    setSelectionError('')
    setFormState((current) => ({
      ...current,
      teams: current.teams.includes(team)
        ? current.teams.filter((currentTeam) => currentTeam !== team)
        : [...current.teams, team],
    }))
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <FieldLabel htmlFor="user-name">Full name</FieldLabel>
          <Input
            id="user-name"
            icon={UserRound}
            required
            value={formState.name}
            onChange={(event) => setFormState((current) => ({ ...current, name: event.target.value }))}
            placeholder="Amina Rahman"
          />
        </div>
        <div>
          <FieldLabel htmlFor="user-email">Email</FieldLabel>
          <Input
            id="user-email"
            icon={Mail}
            type="email"
            required
            value={formState.email}
            onChange={(event) => setFormState((current) => ({ ...current, email: event.target.value }))}
            placeholder="amina@shams.app"
          />
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <FieldLabel htmlFor="user-password">Password</FieldLabel>
          <Input
            id="user-password"
            icon={KeyRound}
            type="password"
            required
            value={formState.password}
            onChange={(event) => setFormState((current) => ({ ...current, password: event.target.value }))}
            placeholder="Temporary password"
          />
        </div>

        <div>
          <FieldLabel htmlFor="user-role">Role</FieldLabel>
          <Select
            id="user-role"
            icon={Shield}
            required
            value={formState.role}
            onChange={(event) =>
              setFormState((current) => ({
                ...current,
                role: event.target.value as CreateUserInput['role'],
              }))
            }
          >
            {USER_ROLES.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <div>
        <FieldLabel className="mb-3">Teams</FieldLabel>
        <div className="grid gap-3 sm:grid-cols-2">
          {TEAMS.map((team) => (
            <button
              key={team}
              type="button"
              aria-pressed={formState.teams.includes(team)}
              onClick={() => toggleTeam(team)}
              className={cn(
                'w-full cursor-pointer rounded-[1.35rem] px-4 py-3.5 text-left transition duration-200 select-none focus-visible:ring-4 focus-visible:ring-[#4D00EE]/24',
                formState.teams.includes(team)
                  ? 'clay-surface border border-[#4D00EE]/20'
                  : 'clay-surface-soft border border-[#122F45]/26',
              )}
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <Chip
                    active={formState.teams.includes(team)}
                    className={TEAM_THEME[team].chipClassName}
                  >
                    {team}
                  </Chip>
                  <p className="mt-2 text-sm font-medium text-[#b8c7da]">
                    Assign this delivery lane
                  </p>
                </div>
                <span
                  className={cn(
                    'h-4 w-4 rounded-full border border-[#4D00EE]/22',
                    formState.teams.includes(team)
                      ? 'bg-[#4D00EE] shadow-[0_0_0_4px_rgba(216,255,0,0.32)]'
                      : 'bg-[#122F45]/40',
                  )}
                />
              </div>
            </button>
          ))}
        </div>
        {selectionError && <p className="mt-3 text-sm text-[#d5c6ff]">{selectionError}</p>}
      </div>

      <Button type="submit" disabled={isSubmitting} variant="accent" className="w-full sm:w-auto">
        {isSubmitting ? 'Adding user...' : 'Add user'}
      </Button>
    </form>
  )
}
