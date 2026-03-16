import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/useAuth.ts'
import { Card } from '../ui/Card.tsx'
import { Chip } from '../ui/Chip.tsx'

export function ProtectedRoute() {
  const { isAuthenticated, isHydrating } = useAuth()
  const location = useLocation()

  if (isHydrating) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <Card variant="shell" padding="lg" className="max-w-md text-center">
          <Chip active>Session</Chip>
          <p className="display-font mt-5 text-3xl font-semibold tracking-[-0.03em] text-[#eef4ff]">
            Loading your workspace
          </p>
          <p className="mt-3 text-sm leading-7 text-[#b8c7da]">
            Restoring your session and checking access before we open the dashboard.
          </p>
        </Card>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return <Outlet />
}
