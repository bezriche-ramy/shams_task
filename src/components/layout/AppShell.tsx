import { Outlet } from 'react-router-dom'
import { Header } from './Header.tsx'
import { Sidebar } from './Sidebar.tsx'

export function AppShell() {
  return (
    <div className="h-screen bg-slate-50 text-slate-900">
      <Sidebar />
      <div className="flex h-full flex-col lg:pl-72">
        <main className="flex-1 overflow-y-auto px-4 pb-8 pt-5 sm:px-6 lg:px-8 lg:pt-8">
          <Header />
          <Outlet />
        </main>
      </div>
    </div>
  )
}
