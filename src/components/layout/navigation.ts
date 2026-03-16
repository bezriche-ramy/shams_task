import {
  LayoutDashboard,
  PanelLeftOpen,
  ShieldCheck,
  type LucideIcon,
} from 'lucide-react'
import type { UserRole } from '../../types/models.ts'

export type NavigationItem = {
  hint: string
  icon: LucideIcon
  label: string
  shortLabel: string
  to: string
}

const baseNavigation: NavigationItem[] = [
  {
    to: '/dashboard',
    label: 'Dashboard',
    shortLabel: 'Home',
    hint: 'Metrics, charts, recent activity',
    icon: LayoutDashboard,
  },
  {
    to: '/tasks',
    label: 'Task Center',
    shortLabel: 'Tasks',
    hint: 'Search, filter, update assignments',
    icon: PanelLeftOpen,
  },
]

const adminNavigation: NavigationItem = {
  to: '/admin',
  label: 'Admin Panel',
  shortLabel: 'Admin',
  hint: 'Create tasks, users, manage coverage',
  icon: ShieldCheck,
}

export function getNavigationItems(role?: UserRole) {
  return role === 'Admin' ? [...baseNavigation, adminNavigation] : baseNavigation
}
