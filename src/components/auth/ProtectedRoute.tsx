import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.tsx'

export function ProtectedRoute() {
  const { isAuthenticated, isHydrating } = useAuth()
  const location = useLocation()

  if (isHydrating) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="surface-ring rounded-3xl border border-slate-200 bg-white px-8 py-6 shadow-sm">
          <p className="text-sm font-medium text-slate-600">Loading your workspace...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return <Outlet />
}
