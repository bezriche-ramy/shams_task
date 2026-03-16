import {
  ArrowRight,
  LockKeyhole,
  Mail,
  ShieldCheck,
  Sparkles,
  Waves,
} from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { Chip } from '../components/ui/Chip.tsx'
import { Button } from '../components/ui/Button.tsx'
import { Alert } from '../components/ui/Alert.tsx'
import { Card } from '../components/ui/Card.tsx'
import { FieldLabel, Input } from '../components/ui/Field.tsx'
import { SectionHeader } from '../components/ui/SectionHeader.tsx'
import { useAuth } from '../context/useAuth.ts'
import { TEAM_THEME } from '../lib/theme.ts'
import { TEAMS, type Team } from '../types/models.ts'

type LocationState = {
  from?: {
    pathname?: string
  }
}

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { isAuthenticated, login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedTeam, setSelectedTeam] = useState<Team>(TEAMS[0])

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  const locationState = location.state as LocationState | null
  const rawDestination = locationState?.from?.pathname ?? '/dashboard'
  const destination =
    rawDestination.startsWith('/') && !rawDestination.startsWith('//')
      ? rawDestination
      : '/dashboard'

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      await login(email, password)
      navigate(destination, { replace: true })
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Unable to sign in')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleTeamPreview = (team: Team) => {
    setSelectedTeam(team)
    window.requestAnimationFrame(() => {
      const emailInput = document.getElementById('email')
      emailInput?.focus()
    })
  }

  return (
    <div className="relative min-h-screen overflow-hidden px-4 py-6 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute left-[-4rem] top-16 h-52 w-52 rounded-full bg-[#4D00EE]/14 blur-3xl" />
      <div className="pointer-events-none absolute right-[-5rem] top-32 h-64 w-64 rounded-full bg-[#D8FF00]/14 blur-3xl" />
      <div className="pointer-events-none absolute bottom-10 left-1/3 h-44 w-44 rounded-full bg-[#4D00EE]/10 blur-3xl" />

      <div className="mx-auto grid max-w-7xl items-start gap-5 lg:min-h-[calc(100vh-3rem)] lg:grid-cols-[1.08fr_0.92fr] lg:items-stretch lg:gap-6">
        <Card variant="shell" padding="lg" className="relative overflow-hidden">
          <div className="absolute right-[-3rem] top-10 h-44 w-44 rounded-full bg-[#D8FF00]/18 blur-3xl" />
          <div className="relative flex h-full flex-col">
            <Chip icon={Sparkles} className="w-fit bg-[#D8FF00]/14 text-[#D8FF00] ring-[#D8FF00]/34">
              Claymorphism command center
            </Chip>

            <div className="mt-5 max-w-[44rem] sm:mt-6">
              <h1 className="display-font text-[clamp(3.1rem,7vw,5.4rem)] font-semibold leading-[0.92] tracking-[-0.05em] text-[#eef4ff]">
                Keep every team aligned from one tactile workspace.
              </h1>
              <p className="mt-4 max-w-[42rem] text-base leading-8 text-[#b8c7da]">
                A Google Sheets-powered control surface for admins and contributors to manage
                delivery across product, engineering, database work, docs, and UI/UX.
              </p>
            </div>

            <div className="mt-6 grid gap-3.5 md:grid-cols-2 md:gap-4">
              <Card variant="soft" padding="sm" className="rounded-[1.75rem]">
                <div className="flex items-start gap-3.5">
                  <span className="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-[1.2rem] bg-[#122F45]/44 text-[#D8FF00] shadow-[0_12px_20px_rgba(0,0,0,0.26)]">
                    <ShieldCheck className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="font-semibold text-[#eef4ff]">Role-aware access</p>
                    <p className="mt-2 text-sm leading-7 text-[#b8c7da]">
                      Admins get creation controls while contributors stay focused on their own work.
                    </p>
                  </div>
                </div>
              </Card>

              <Card variant="inset" padding="sm" className="rounded-[1.75rem]">
                <div className="flex items-start gap-3.5">
                  <span className="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-[1.2rem] bg-[#122F45]/44 text-[#d5c6ff] shadow-[0_12px_20px_rgba(0,0,0,0.26)]">
                    <Waves className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="font-semibold text-[#eef4ff]">Live task visibility</p>
                    <p className="mt-2 text-sm leading-7 text-[#b8c7da]">
                      Metrics, charts, and recent tasks stay synchronized with the sheet source.
                    </p>
                  </div>
                </div>
              </Card>
            </div>

            <Card variant="inset" padding="md" className="mt-5">
              <SectionHeader
                eyebrow="Teams Covered"
                title="Every lane stays visible"
                description={`Previewing ${selectedTeam}. Sign in to jump into that team's live task flow.`}
              />

              <div className="mt-4 flex flex-wrap gap-2.5">
                {TEAMS.map((team) => (
                  <button
                    key={team}
                    type="button"
                    onClick={() => handleTeamPreview(team)}
                    className="cursor-pointer rounded-full transition duration-200 hover:-translate-y-0.5 focus-visible:ring-4 focus-visible:ring-[#4D00EE]/24"
                  >
                    <Chip
                      className={
                        selectedTeam === team
                          ? 'bg-[#D8FF00]/14 text-[#D8FF00] ring-[#D8FF00]/34'
                          : TEAM_THEME[team].chipClassName
                      }
                    >
                      {team}
                    </Chip>
                  </button>
                ))}
              </div>
            </Card>
          </div>
        </Card>

        <Card variant="shell" padding="sm" className="flex items-center">
          <div className="w-full">
            <Card variant="inset" padding="md" className="rounded-[2rem] sm:p-6 lg:p-7">
              <SectionHeader
                eyebrow="Sign In"
                title="Access your workspace"
                description={
                  <>
                    Enter the email and password stored in the{' '}
                    <span className="font-semibold text-[#eef4ff]">Users</span> sheet.
                  </>
                }
              />

              <form className="mt-6 space-y-4.5" onSubmit={handleSubmit}>
                <div>
                  <FieldLabel htmlFor="email">Email</FieldLabel>
                  <Input
                    id="email"
                    type="email"
                    required
                    icon={Mail}
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="you@company.com"
                  />
                </div>

                <div>
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                  <Input
                    id="password"
                    type="password"
                    required
                    icon={LockKeyhole}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Your password"
                  />
                </div>

                {error ? <Alert tone="danger">{error}</Alert> : null}

                <Button type="submit" disabled={isSubmitting} size="lg" className="w-full">
                  {isSubmitting ? 'Signing in...' : 'Login'}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </form>
            </Card>
          </div>
        </Card>
      </div>
    </div>
  )
}
