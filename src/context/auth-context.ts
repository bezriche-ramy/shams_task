import { createContext } from 'react'
import type { User } from '../types/models.ts'

export type SessionState = {
  token: string
  user: User
}

export type AuthContextValue = {
  token: string | null
  user: User | null
  isAuthenticated: boolean
  isHydrating: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
}

export const STORAGE_KEY = 'task-dashboard-session'

export const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function readStoredSession(): SessionState | null {
  const raw = localStorage.getItem(STORAGE_KEY)

  if (!raw) {
    return null
  }

  try {
    return JSON.parse(raw) as SessionState
  } catch {
    localStorage.removeItem(STORAGE_KEY)
    return null
  }
}
