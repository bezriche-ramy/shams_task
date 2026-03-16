import { Outlet } from 'react-router-dom'
import { Header } from './Header.tsx'
import { MobileDock } from './MobileDock.tsx'
import { Sidebar } from './Sidebar.tsx'

export function AppShell() {
  return (
    <div className="relative min-h-screen text-[#eef4ff]">
      <div className="pointer-events-none absolute left-[12%] top-24 h-36 w-36 rounded-full bg-[#4D00EE]/12 blur-3xl" />
      <div className="pointer-events-none absolute right-[10%] top-56 h-44 w-44 rounded-full bg-[#D8FF00]/14 blur-3xl" />
      <Sidebar />
      <div className="flex min-h-screen flex-col lg:pl-[20.5rem]">
        <main className="flex-1 px-4 pb-28 pt-5 sm:px-6 sm:pt-6 lg:px-8 lg:pb-12 lg:pt-8">
          <div className="mx-auto max-w-[1380px]">
            <Header />
            <Outlet />
          </div>
        </main>
      </div>
      <MobileDock />
    </div>
  )
}
