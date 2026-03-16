import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../../context/useAuth.ts'

export function AdminRoute() {
  const { user } = useAuth()

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (user.role !== 'Admin') {
    return <Navigate to="/dashboard" replace />
  }

  return <Outlet />
}
