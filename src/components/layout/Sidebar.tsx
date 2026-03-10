import {
  LayoutDashboard,
  PanelLeftOpen,
  ShieldCheck,
  Sparkles,
  UsersRound,
} from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.tsx'
import { TEAMS } from '../../types/models.ts'
import { cn } from '../../lib/cn.ts'

const teamClasses: Record<(typeof TEAMS)[number], string> = {
  Frontend: 'bg-sky-500/10 text-sky-200 ring-sky-400/20',
  Backend: 'bg-emerald-500/10 text-emerald-200 ring-emerald-400/20',
  Database: 'bg-amber-500/10 text-amber-200 ring-amber-400/20',
  Docs: 'bg-slate-500/20 text-slate-200 ring-slate-400/20',
  'UI/UX': 'bg-cyan-500/10 text-cyan-200 ring-cyan-400/20',
}

export function Sidebar() {
  const { user } = useAuth()

  const links = [
    {
      to: '/dashboard',
      label: 'Dashboard',
      hint: 'Metrics, charts, and recent work',
      icon: LayoutDashboard,
    },
    {
      to: '/tasks',
      label: 'Task Center',
      hint: 'Assignments, filters, and updates',
      icon: PanelLeftOpen,
    },
  ]

  if (user?.role === 'Admin') {
    links.push({
      to: '/admin',
      label: 'Admin Panel',
      hint: 'Create tasks and add teammates',
      icon: ShieldCheck,
    })
  }

  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 flex-col border-r border-slate-800 bg-slate-900 px-6 py-8 text-slate-100 lg:flex">
      <div className="rounded-3xl border border-slate-800 bg-slate-950/50 p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-sky-500 text-slate-950 shadow-lg shadow-emerald-500/20">
            <Sparkles className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Shams Ops</p>
            <h1 className="mt-1 text-xl font-bold text-white">Task Dashboard</h1>
          </div>
        </div>
      </div>

      <nav className="mt-8 space-y-3">
        {links.map((item) => {
          const Icon = item.icon

          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  'group flex items-start gap-4 rounded-2xl border border-transparent px-4 py-3 transition',
                  isActive
                    ? 'border-slate-700 bg-slate-800 text-white shadow-lg shadow-slate-950/20'
                    : 'text-slate-300 hover:border-slate-800 hover:bg-slate-800/70 hover:text-white',
                )
              }
            >
              <span className="mt-0.5 rounded-xl bg-white/5 p-2 text-slate-300 transition group-hover:text-white">
                <Icon className="h-5 w-5" />
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-semibold">{item.label}</span>
                <span className="mt-1 block text-xs text-slate-400">{item.hint}</span>
              </span>
            </NavLink>
          )
        })}
      </nav>

      <div className="mt-auto space-y-4 rounded-3xl border border-slate-800 bg-slate-950/60 p-5">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-slate-800 p-2 text-emerald-300">
            <UsersRound className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Teams</p>
            <p className="text-sm text-slate-300">Coverage across delivery lanes</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {TEAMS.map((team) => (
            <span
              key={team}
              className={cn(
                'rounded-full px-3 py-1 text-xs font-medium ring-1 ring-inset',
                teamClasses[team],
              )}
            >
              {team}
            </span>
          ))}
        </div>
      </div>
    </aside>
  )
}
