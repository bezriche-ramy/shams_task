import { CalendarDays, LogOut, Shield, UserRound } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useLocation } from 'react-router-dom'
import { useAuth } from '../../context/useAuth.ts'
import { getTeamTasksPath } from '../../lib/team-links.ts'
import { TEAM_THEME } from '../../lib/theme.ts'
import { Button } from '../ui/Button.tsx'
import { Card } from '../ui/Card.tsx'
import { Chip } from '../ui/Chip.tsx'

const pageCopy: Record<string, { title: string; subtitle: string }> = {
  '/dashboard': {
    title: 'Delivery overview',
    subtitle:
      'Track execution across product, engineering, data, docs, and design from one tactile workspace.',
  },
  '/tasks': {
    title: 'Task center',
    subtitle: 'Search, filter, and keep assigned work moving forward without losing context.',
  },
  '/admin': {
    title: 'Admin panel',
    subtitle: 'Create tasks, onboard users, and keep team coverage balanced across every lane.',
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

  return (
    <header className="mb-10">
      <Card variant="shell" padding="lg" className="relative overflow-hidden">
        <div className="absolute left-8 top-8 h-24 w-24 rounded-full bg-[#4D00EE]/15 blur-2xl" />
        <div className="absolute bottom-6 right-10 h-20 w-20 rounded-full bg-[#D8FF00]/20 blur-2xl" />
        <div className="relative grid gap-6 xl:grid-cols-[1.35fr_0.9fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#4D00EE]">
              {page.title}
            </p>
            <h2 className="display-font mt-3 text-4xl font-semibold tracking-[-0.04em] text-[#eef4ff] sm:text-[2.8rem]">
              Welcome back, {user.name}
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-[#b8c7da]">{page.subtitle}</p>

            <div className="mt-7 flex flex-wrap gap-3">
              <Chip icon={CalendarDays}>{date}</Chip>
              <Chip
                icon={user.role === 'Admin' ? Shield : UserRound}
                className={
                  user.role === 'Admin'
                    ? 'bg-[#D8FF00]/14 text-[#D8FF00] ring-[#D8FF00]/34'
                    : 'bg-[#4D00EE]/18 text-[#d5c6ff] ring-[#4D00EE]/30'
                }
              >
                {user.role}
              </Chip>
              {user.teams.map((team) => (
                <Link
                  key={team}
                  to={getTeamTasksPath(team)}
                  className="rounded-full transition duration-200 hover:-translate-y-0.5 focus-visible:ring-4 focus-visible:ring-[#4D00EE]/24"
                >
                  <Chip className={TEAM_THEME[team].chipClassName}>{team}</Chip>
                </Link>
              ))}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
            <Card variant="inset" padding="md">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#4D00EE]">
                Session
              </p>
              <p className="mt-3 text-lg font-semibold text-[#eef4ff]">{user.role} workspace</p>
              <p className="mt-2 text-sm leading-7 text-[#b8c7da]">
                Signed in for {user.teams.length} active team
                {user.teams.length === 1 ? '' : 's'}.
              </p>
            </Card>

            <Card variant="soft" padding="md">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#4D00EE]">
                Quick action
              </p>
              <p className="mt-3 text-sm leading-7 text-[#b8c7da]">
                End this session cleanly without changing any route or task state.
              </p>
              <Button onClick={logout} variant="secondary" className="mt-5 w-full">
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </Card>
          </div>
        </div>
      </Card>
    </header>
  )
}
