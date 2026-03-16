export const TEAMS = ['Frontend', 'Backend', 'Database', 'Docs', 'UI/UX'] as const
export const USER_ROLES = ['Admin', 'User'] as const
export const ACTIVE_TASK_STATUSES = ['Pending', 'In Progress', 'Completed', 'Blocked'] as const
export const TASK_STATUSES = [...ACTIVE_TASK_STATUSES, 'Archived'] as const

export type Team = (typeof TEAMS)[number]
export type UserRole = (typeof USER_ROLES)[number]
export type ActiveTaskStatus = (typeof ACTIVE_TASK_STATUSES)[number]
export type TaskStatus = (typeof TASK_STATUSES)[number]
export type TaskDeleteMode = 'archive' | 'permanent'

export type User = {
  id: string
  name: string
  email: string
  role: UserRole
  teams: Team[]
}

export type Task = {
  id: string
  title: string
  description: string
  assignedTo: string
  assignedToName: string
  team: Team
  status: TaskStatus
  createdDate: string
  dueDate: string
}

export type AuthResponse = {
  token: string
  user: User
}

export type CreateTaskInput = {
  title: string
  description: string
  assignedTo: string
  team: Team
  dueDate: string
}

export type UpdateTaskInput = CreateTaskInput & {
  status: TaskStatus
}

export type CreateUserInput = {
  name: string
  email: string
  password: string
  role: UserRole
  teams: Team[]
}
