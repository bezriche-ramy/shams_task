import { Button } from '../ui/Button.tsx'
import { Modal } from '../ui/Modal.tsx'
import type { Task } from '../../types/models.ts'

type TaskDeleteDialogProps = {
  isDeleting?: boolean
  onClose: () => void
  onConfirm: () => Promise<void>
  task: Task | null
}

export function TaskDeleteDialog({
  isDeleting = false,
  onClose,
  onConfirm,
  task,
}: TaskDeleteDialogProps) {
  if (!task) {
    return null
  }

  return (
    <Modal
      open={Boolean(task)}
      onClose={onClose}
      closeDisabled={isDeleting}
      title="Delete task permanently"
      description={`"${task.title}" will be removed from the workspace and the Google Sheet. This cannot be undone.`}
      footer={
        <>
          <Button type="button" variant="ghost" onClick={onClose} disabled={isDeleting}>
            Cancel
          </Button>
          <Button type="button" variant="accent" onClick={() => void onConfirm()} disabled={isDeleting}>
            {isDeleting ? 'Deleting...' : 'Delete permanently'}
          </Button>
        </>
      }
    >
      <div className="clay-surface-inset rounded-[1.5rem] px-5 py-4 text-sm leading-7 text-[#b8c7da]">
        Archived tasks can be restored, but permanent delete removes the task row completely.
      </div>
    </Modal>
  )
}
