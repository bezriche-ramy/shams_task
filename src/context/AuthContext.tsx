import {
  createContext,
  startTransition,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import { api } from '../services/api.ts'
import type { User } from '../types/models.ts'

type SessionState = {
  token: string
  user: User
}

type AuthContextValue = {
  token: string | null
  user: User | null
  isAuthenticated: boolean
  isHydrating: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
}

const STORAGE_KEY = 'task-dashboard-session'

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

function readStoredSession(): SessionState | null {
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

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [isHydrating, setIsHydrating] = useState(true)

  useEffect(() => {
    let isMounted = true

    const hydrate = async () => {
      const storedSession = readStoredSession()

      if (!storedSession) {
        if (isMounted) {
          setIsHydrating(false)
        }
        return
      }

      try {
        const sessionUser = await api.getSessionUser(storedSession.token)

        if (!isMounted) {
          return
        }

        startTransition(() => {
          setToken(storedSession.token)
          setUser(sessionUser)
          setIsHydrating(false)
        })
      } catch {
        localStorage.removeItem(STORAGE_KEY)

        if (isMounted) {
          setToken(null)
          setUser(null)
          setIsHydrating(false)
        }
      }
    }

    void hydrate()

    return () => {
      isMounted = false
    }
  }, [])

  const login = async (email: string, password: string) => {
    const session = await api.login(email, password)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session))

    startTransition(() => {
      setToken(session.token)
      setUser(session.user)
    })
  }

  const logout = () => {
    localStorage.removeItem(STORAGE_KEY)
    setToken(null)
    setUser(null)
  }

  const value: AuthContextValue = {
    token,
    user,
    isAuthenticated: Boolean(token && user),
    isHydrating,
    login,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }

  return context
}
