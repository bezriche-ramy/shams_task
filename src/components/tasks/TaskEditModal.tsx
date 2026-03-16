import { Alert } from '../ui/Alert.tsx'
import { Modal } from '../ui/Modal.tsx'
import { TaskForm } from './TaskForm.tsx'
import type { Task, UpdateTaskInput, User } from '../../types/models.ts'

type TaskEditModalProps = {
  error?: string
  isSaving?: boolean
  onClose: () => void
  onSubmit: (input: UpdateTaskInput) => Promise<void>
  task: Task | null
  users: User[]
}

export function TaskEditModal({
  error,
  isSaving = false,
  onClose,
  onSubmit,
  task,
  users,
}: TaskEditModalProps) {
  if (!task) {
    return null
  }

  return (
    <Modal
      open={Boolean(task)}
      onClose={onClose}
      closeDisabled={isSaving}
      size="lg"
      title="Edit task"
      description="Update ownership, scope, deadline, or status without leaving the board."
    >
      {error ? <Alert tone="danger">{error}</Alert> : null}
      <div className={error ? 'mt-5' : undefined}>
        <TaskForm
          key={task.id}
          users={users}
          allowStatusField
          initialValues={{
            title: task.title,
            description: task.description,
            assignedTo: task.assignedTo,
            team: task.team,
            dueDate: task.dueDate,
            status: task.status,
          }}
          onSubmit={onSubmit}
          onCancel={onClose}
          resetOnSubmit={false}
          submitLabel="Save changes"
          submittingLabel="Saving changes..."
        />
      </div>
    </Modal>
  )
}
