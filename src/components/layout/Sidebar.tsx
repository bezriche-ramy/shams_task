import { Sparkles, UsersRound } from 'lucide-react'
import { Link, NavLink } from 'react-router-dom'
import { useAuth } from '../../context/useAuth.ts'
import { TEAMS } from '../../types/models.ts'
import { cn } from '../../lib/cn.ts'
import { getTeamTasksPath } from '../../lib/team-links.ts'
import { TEAM_THEME } from '../../lib/theme.ts'
import { Card } from '../ui/Card.tsx'
import { Chip } from '../ui/Chip.tsx'
import { getNavigationItems } from './navigation.ts'

export function Sidebar() {
  const { user } = useAuth()
  const links = getNavigationItems(user?.role)

  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-[20.5rem] px-4 py-5 lg:block">
      <div className="clay-shell h-full overflow-hidden rounded-[2.4rem]">
        <div className="clay-scroll flex h-full min-h-0 flex-col overflow-y-auto px-5 pb-5 pt-4">
          <div className="flex items-start gap-3.5">
            <div className="flex h-13 w-13 shrink-0 items-center justify-center rounded-[1.5rem] bg-[linear-gradient(145deg,#26126a,#13253d)] text-[#D8FF00] shadow-[0_16px_24px_rgba(0,0,0,0.28)]">
              <Sparkles className="h-6 w-6" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#4D00EE]">
                Shams Ops
              </p>
              <h1 className="display-font mt-1 text-[1.9rem] leading-[0.94] font-semibold tracking-[-0.03em] text-[#eef4ff]">
                Clay workspace
              </h1>
            </div>
          </div>

          <Card variant="inset" padding="sm" className="mt-5">
            <p className="text-sm font-semibold text-[#eef4ff]">Shared command center</p>
            <p className="mt-2 max-w-[15rem] text-sm leading-7 text-[#b8c7da]">
              Navigate between delivery health, assignments, and admin controls.
            </p>
          </Card>

          <nav className="mt-5 space-y-3">
            {links.map((item) => {
              const Icon = item.icon

              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    cn(
                      'group block rounded-[1.7rem] p-1 transition duration-200',
                      isActive ? 'clay-surface' : 'clay-surface-soft hover:translate-x-1',
                    )
                  }
                >
                  <div className="flex items-start gap-3.5 rounded-[1.45rem] px-4 py-3">
                    <span className="flex h-11 w-11 items-center justify-center rounded-[1.25rem] bg-[#122F45]/44 text-[#d5c6ff] shadow-[0_10px_18px_rgba(0,0,0,0.26)] transition group-hover:bg-[#4D00EE]/20">
                      <Icon className="h-5 w-5" />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-semibold text-[#eef4ff]">{item.label}</span>
                      <span className="mt-1 block text-xs leading-5 text-[#8fa4bf]">{item.hint}</span>
                    </span>
                  </div>
                </NavLink>
              )
            })}
          </nav>

          <Card variant="soft" padding="sm" className="mt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-[1.25rem] bg-[#122F45]/44 text-[#d5c6ff] shadow-[0_12px_18px_rgba(0,0,0,0.26)]">
                <UsersRound className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#4D00EE]">
                  Teams
                </p>
                <p className="text-sm text-[#b8c7da]">Coverage across every delivery lane</p>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {TEAMS.map((team) => (
                <Link
                  key={team}
                  to={getTeamTasksPath(team)}
                  className="rounded-full transition duration-200 hover:-translate-y-0.5 focus-visible:ring-4 focus-visible:ring-[#4D00EE]/24"
                >
                  <Chip className={TEAM_THEME[team].chipClassName}>{team}</Chip>
                </Link>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </aside>
  )
}
