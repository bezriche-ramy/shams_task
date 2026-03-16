import { NavLink } from 'react-router-dom'
import { useAuth } from '../../context/useAuth.ts'
import { cn } from '../../lib/cn.ts'
import { Card } from '../ui/Card.tsx'
import { getNavigationItems } from './navigation.ts'

export function MobileDock() {
  const { user } = useAuth()
  const items = getNavigationItems(user?.role)

  return (
    <div className="fixed inset-x-0 bottom-4 z-40 px-4 lg:hidden">
      <Card variant="shell" padding="sm" className="mx-auto max-w-md rounded-[1.8rem]">
        <nav
          className="grid gap-2.5"
          style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}
        >
          {items.map((item) => {
            const Icon = item.icon

            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    'rounded-[1.35rem] px-3 py-3 text-center transition',
                    isActive ? 'clay-surface text-[#d5c6ff]' : 'text-[#8fa4bf] hover:bg-[#122F45]/28',
                  )
                }
              >
                <Icon className="mx-auto h-4 w-4" />
                <span className="mt-1.5 block text-[11px] font-semibold uppercase tracking-[0.18em]">
                  {item.shortLabel}
                </span>
              </NavLink>
            )
          })}
        </nav>
      </Card>
    </div>
  )
}
