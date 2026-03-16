import { CalendarDays, ClipboardList, Layers3, UserRound } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Button } from '../ui/Button.tsx'
import { FieldLabel, Input, Select, Textarea } from '../ui/Field.tsx'
import { TASK_STATUSES, TEAMS, type UpdateTaskInput, type User } from '../../types/models.ts'

type TaskFormProps = {
  users: User[]
  onSubmit: (input: UpdateTaskInput) => Promise<void>
  initialValues?: UpdateTaskInput
  submitLabel?: string
  submittingLabel?: string
  allowStatusField?: boolean
  onCancel?: () => void
  resetOnSubmit?: boolean
}

function createInitialState(): UpdateTaskInput {
  return {
    title: '',
    description: '',
    assignedTo: '',
    team: 'Frontend',
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    status: 'Pending',
  }
}

export function TaskForm({
  users,
  onSubmit,
  initialValues,
  submitLabel = 'Create task',
  submittingLabel = 'Saving task...',
  allowStatusField = false,
  onCancel,
  resetOnSubmit = true,
}: TaskFormProps) {
  const [formState, setFormState] = useState<UpdateTaskInput>(() => initialValues ?? createInitialState())
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSubmitting(true)

    try {
      await onSubmit(formState)
      if (resetOnSubmit) {
        setFormState(createInitialState())
      }
    } catch {
      return
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <div>
        <FieldLabel htmlFor="task-title">Task title</FieldLabel>
        <Input
          id="task-title"
          icon={ClipboardList}
          required
          value={formState.title}
          onChange={(event) => setFormState((current) => ({ ...current, title: event.target.value }))}
          placeholder="Launch onboarding dashboard"
        />
      </div>

      <div>
        <FieldLabel htmlFor="task-description">Description</FieldLabel>
        <Textarea
          id="task-description"
          rows={4}
          value={formState.description}
          onChange={(event) => setFormState((current) => ({ ...current, description: event.target.value }))}
          placeholder="Outline the scope, dependencies, and expected deliverables."
        />
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <FieldLabel htmlFor="task-assignee">Assign to</FieldLabel>
          <Select
            id="task-assignee"
            icon={UserRound}
            required
            value={formState.assignedTo}
            onChange={(event) => setFormState((current) => ({ ...current, assignedTo: event.target.value }))}
          >
            <option value="">Select a teammate</option>
            {users.map((user) => (
              <option key={user.id} value={user.email}>
                {user.name} ({user.teams.join(', ')})
              </option>
            ))}
          </Select>
        </div>

        <div>
          <FieldLabel htmlFor="task-team">Team</FieldLabel>
          <Select
            id="task-team"
            icon={Layers3}
            required
            value={formState.team}
            onChange={(event) =>
              setFormState((current) => ({
                ...current,
                team: event.target.value as UpdateTaskInput['team'],
              }))
            }
          >
            {TEAMS.map((team) => (
              <option key={team} value={team}>
                {team}
              </option>
            ))}
          </Select>
        </div>
      </div>

      {allowStatusField ? (
        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <FieldLabel htmlFor="task-deadline">Due date</FieldLabel>
            <Input
              id="task-deadline"
              icon={CalendarDays}
              type="date"
              required
              value={formState.dueDate}
              onChange={(event) =>
                setFormState((current) => ({ ...current, dueDate: event.target.value }))
              }
            />
          </div>

          <div>
            <FieldLabel htmlFor="task-status">Status</FieldLabel>
            <Select
              id="task-status"
              required
              value={formState.status}
              onChange={(event) =>
                setFormState((current) => ({
                  ...current,
                  status: event.target.value as UpdateTaskInput['status'],
                }))
              }
            >
              {TASK_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </Select>
          </div>
        </div>
      ) : (
        <div>
          <FieldLabel htmlFor="task-deadline">Due date</FieldLabel>
          <Input
            id="task-deadline"
            icon={CalendarDays}
            type="date"
            required
            value={formState.dueDate}
            onChange={(event) => setFormState((current) => ({ ...current, dueDate: event.target.value }))}
          />
        </div>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
          {isSubmitting ? submittingLabel : submitLabel}
        </Button>
        {onCancel ? (
          <Button
            type="button"
            variant="ghost"
            disabled={isSubmitting}
            onClick={onCancel}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
        ) : null}
      </div>
    </form>
  )
}
