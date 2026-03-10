import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AdminRoute } from './components/auth/AdminRoute.tsx'
import { ProtectedRoute } from './components/auth/ProtectedRoute.tsx'
import { AppShell } from './components/layout/AppShell.tsx'
import { DashboardPage } from './pages/DashboardPage.tsx'
import { AdminPage } from './pages/AdminPage.tsx'
import { LoginPage } from './pages/LoginPage.tsx'
import { TasksPage } from './pages/TasksPage.tsx'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<AppShell />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/tasks" element={<TasksPage />} />
            <Route element={<AdminRoute />}>
              <Route path="/admin" element={<AdminPage />} />
            </Route>
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
