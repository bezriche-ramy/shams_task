import { CalendarDays, LogOut, Shield, UserRound } from 'lucide-react'
import { NavLink, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.tsx'
import { cn } from '../../lib/cn.ts'

const pageCopy: Record<string, { title: string; subtitle: string }> = {
  '/dashboard': {
    title: 'Delivery overview',
    subtitle: 'Track execution across Frontend, Backend, Database, Docs, and UI/UX.',
  },
  '/tasks': {
    title: 'Task center',
    subtitle: 'Search, filter, and keep assigned work moving forward.',
  },
  '/admin': {
    title: 'Admin panel',
    subtitle: 'Create tasks, onboard users, and keep teams balanced.',
  },
}

export function Header() {
  const location = useLocation()
  const { user, logout } = useAuth()

  if (!user) {
    return null
  }

  const page = pageCopy[location.pathname] ?? pageCopy['/dashboard']
  const date = new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date())

  const mobileLinks = [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/tasks', label: 'Tasks' },
  ]

  if (user.role === 'Admin') {
    mobileLinks.push({ to: '/admin', label: 'Admin' })
  }

  return (
    <header className="mb-8 space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-slate-500">{page.title}</p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">Welcome, {user.name}</h2>
          <p className="mt-2 max-w-2xl text-sm text-slate-600">{page.subtitle}</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm">
            <div className="flex items-center gap-2 text-slate-500">
              <CalendarDays className="h-4 w-4" />
              <span>{date}</span>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm">
            <div className="flex items-center gap-2 font-medium text-slate-700">
              {user.role === 'Admin' ? <Shield className="h-4 w-4 text-emerald-500" /> : <UserRound className="h-4 w-4 text-sky-500" />}
              <span>{user.role}</span>
              <span className="text-slate-400">|</span>
              <span>{user.teams.join(', ')}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={logout}
            className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1 lg:hidden">
        {mobileLinks.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              cn(
                'rounded-full border px-4 py-2 text-sm font-medium transition',
                isActive
                  ? 'border-slate-900 bg-slate-900 text-white'
                  : 'border-slate-200 bg-white text-slate-600',
              )
            }
          >
            {link.label}
          </NavLink>
        ))}
      </div>
    </header>
  )
}
