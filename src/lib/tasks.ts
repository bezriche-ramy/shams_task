import type { Task, UpdateTaskInput, User } from '../types/models.ts'

export function sortTasksByRecentCreated(tasks: Task[]) {
  return [...tasks].sort(
    (left, right) => new Date(right.createdDate).getTime() - new Date(left.createdDate).getTime(),
  )
}

export function isTaskArchived(task: Pick<Task, 'status'>) {
  return task.status === 'Archived'
}

export function isTaskOverdue(task: Pick<Task, 'dueDate' | 'status'>) {
  return task.status !== 'Completed' && task.status !== 'Archived' && new Date(task.dueDate) < new Date()
}

export function isTaskVisibleToUser(task: Pick<Task, 'assignedTo'>, user: User | null) {
  if (!user) {
    return false
  }

  if (user.role === 'Admin') {
    return true
  }

  return task.assignedTo.toLowerCase() === user.email.toLowerCase()
}

export function toUpdateTaskInput(task: Task): UpdateTaskInput {
  return {
    title: task.title,
    description: task.description,
    assignedTo: task.assignedTo,
    team: task.team,
    dueDate: task.dueDate,
    status: task.status,
  }
}
