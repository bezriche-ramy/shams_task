import type {
  AuthResponse,
  CreateTaskInput,
  CreateUserInput,
  Task,
  TaskStatus,
  User,
} from '../types/models.ts'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api'

type RequestOptions = RequestInit & {
  token?: string | null
}

type ApiErrorPayload = {
  message?: string
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { token, headers, ...rest } = options
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...rest,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
  })

  if (!response.ok) {
    let message = 'Request failed'

    try {
      const payload = (await response.json()) as ApiErrorPayload
      message = payload.message ?? message
    } catch {
      message = response.statusText || message
    }

    throw new Error(message)
  }

  return (await response.json()) as T
}

export const api = {
  login(email: string, password: string) {
    return request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
  },

  getSessionUser(token: string) {
    return request<{ user: User }>('/auth/me', { token }).then((payload) => payload.user)
  },

  getTasks(token: string) {
    return request<{ tasks: Task[] }>('/tasks', { token }).then((payload) => payload.tasks)
  },

  updateTaskStatus(token: string, taskId: string, status: TaskStatus) {
    return request<{ task: Task }>(`/tasks/${taskId}/status`, {
      method: 'PATCH',
      token,
      body: JSON.stringify({ status }),
    }).then((payload) => payload.task)
  },

  createTask(token: string, input: CreateTaskInput) {
    return request<{ task: Task }>('/tasks', {
      method: 'POST',
      token,
      body: JSON.stringify(input),
    }).then((payload) => payload.task)
  },

  getUsers(token: string) {
    return request<{ users: User[] }>('/users', { token }).then((payload) => payload.users)
  },

  createUser(token: string, input: CreateUserInput) {
    return request<{ user: User }>('/users', {
      method: 'POST',
      token,
      body: JSON.stringify(input),
    }).then((payload) => payload.user)
  },
}
