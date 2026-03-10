import { ArrowRight, LockKeyhole, Mail, ShieldCheck, Sparkles } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.tsx'
import { TEAMS } from '../types/models.ts'

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

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  const locationState = location.state as LocationState | null
  const destination = locationState?.from?.pathname ?? '/dashboard'

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

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto grid min-h-[calc(100vh-5rem)] max-w-6xl overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-xl shadow-slate-200/80 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="relative overflow-hidden bg-slate-900 px-8 py-10 text-white sm:px-10 lg:px-12">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(34,197,94,0.18),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.18),transparent_30%)]" />
          <div className="relative z-10 flex h-full flex-col">
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200">
              <Sparkles className="h-4 w-4 text-emerald-300" />
              Task delivery control center
            </div>

            <div className="mt-10 max-w-xl">
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Keep every team aligned from one dashboard.</h1>
              <p className="mt-4 text-base leading-7 text-slate-300">
                A Google Sheets-powered workspace for admins and contributors to manage delivery across product, engineering, database work, docs, and UI/UX.
              </p>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="h-5 w-5 text-emerald-300" />
                  <h2 className="font-semibold">Role-aware access</h2>
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-300">Admins can create users and tasks. Standard users only see relevant work and status controls.</p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
                <div className="flex items-center gap-3">
                  <ArrowRight className="h-5 w-5 text-sky-300" />
                  <h2 className="font-semibold">Live team visibility</h2>
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-300">Metrics, charts, and recent tasks stay aligned with your Google Sheet as the source of truth.</p>
              </div>
            </div>

            <div className="mt-auto pt-10">
              <p className="mb-4 text-xs uppercase tracking-[0.24em] text-slate-500">Teams covered</p>
              <div className="flex flex-wrap gap-2">
                {TEAMS.map((team) => (
                  <span key={team} className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-slate-200">
                    {team}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="flex items-center px-6 py-10 sm:px-10">
          <div className="mx-auto w-full max-w-md">
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-slate-400">Sign in</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900">Access your workspace</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Enter the email and password stored in the <span className="font-semibold text-slate-900">Users</span> sheet.
            </p>

            <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="email">
                  Email
                </label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 outline-none transition focus:border-slate-400 focus:bg-white"
                    placeholder="you@company.com"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="password">
                  Password
                </label>
                <div className="relative">
                  <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    id="password"
                    type="password"
                    required
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 outline-none transition focus:border-slate-400 focus:bg-white"
                    placeholder="Your password"
                  />
                </div>
              </div>

              {error && (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSubmitting ? 'Signing in...' : 'Login'}
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          </div>
        </section>
      </div>
    </div>
  )
}
