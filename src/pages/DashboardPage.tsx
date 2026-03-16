import { useEffect, useState } from 'react'
import { AlertTriangle, BadgeCheck, Clock3, ListTodo } from 'lucide-react'
import { Link } from 'react-router-dom'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { MetricCard } from '../components/dashboard/MetricCard.tsx'
import { TaskTable } from '../components/tasks/TaskTable.tsx'
import { Alert } from '../components/ui/Alert.tsx'
import { Card } from '../components/ui/Card.tsx'
import { Chip } from '../components/ui/Chip.tsx'
import { SectionHeader } from '../components/ui/SectionHeader.tsx'
import { useAuth } from '../context/useAuth.ts'
import { isTaskArchived, isTaskOverdue, sortTasksByRecentCreated } from '../lib/tasks.ts'
import { getTeamTasksPath } from '../lib/team-links.ts'
import { STATUS_THEME, TEAM_THEME } from '../lib/theme.ts'
import { api } from '../services/api.ts'
import { ACTIVE_TASK_STATUSES, TEAMS, type Task } from '../types/models.ts'

const tooltipContentStyle = {
  background: 'rgba(8, 17, 32, 0.96)',
  border: '1px solid rgba(77, 0, 238, 0.26)',
  borderRadius: '20px',
  boxShadow: '0 18px 30px rgba(0, 0, 0, 0.28)',
  color: '#eef4ff',
}

export function DashboardPage() {
  const { token } = useAuth()
  const [tasks, setTasks] = useState<Task[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let isMounted = true

    const loadTasks = async () => {
      if (!token) {
        return
      }

      try {
        const nextTasks = await api.getTasks(token)

        if (isMounted) {
          setTasks(sortTasksByRecentCreated(nextTasks))
          setError('')
        }
      } catch (loadError) {
        if (isMounted) {
          setError(loadError instanceof Error ? loadError.message : 'Unable to load dashboard data')
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    void loadTasks()

    return () => {
      isMounted = false
    }
  }, [token])

  const visibleTasks = tasks.filter((task) => !isTaskArchived(task))
  const totalTasks = visibleTasks.length
  const completedTasks = visibleTasks.filter((task) => task.status === 'Completed').length
  const overdueTasks = visibleTasks.filter((task) => isTaskOverdue(task)).length
  const pendingTasks = visibleTasks.filter(
    (task) => task.status !== 'Completed' && new Date(task.dueDate) >= new Date(),
  ).length

  const tasksByTeam = TEAMS.map((team) => ({
    team,
    count: visibleTasks.filter((task) => task.team === team).length,
    color: TEAM_THEME[team].chartColor,
  }))

  const statusDistribution = ACTIVE_TASK_STATUSES.map((status) => ({
    name: status,
    value: visibleTasks.filter((task) => task.status === status).length,
    color: STATUS_THEME[status].chartColor,
  }))

  const recentTasks = visibleTasks.slice(0, 5)
  const activeTeams = tasksByTeam.filter((item) => item.count > 0).length
  const completionRate = totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0

  if (isLoading) {
    return (
      <Card variant="soft" className="text-sm text-[#b8c7da]">
        Loading dashboard data...
      </Card>
    )
  }

  if (error) {
    return <Alert tone="danger">{error}</Alert>
  }

  return (
    <div className="space-y-7">
      <Card variant="shell" padding="lg" className="overflow-hidden">
        <div className="grid gap-8 xl:grid-cols-[1.2fr_0.8fr]">
          <div>
            <SectionHeader
              eyebrow="Operational Pulse"
              title="The full delivery landscape in one glance"
              description="Claymorphic overview cards stay expressive while charts and tables remain readable for daily decision making."
            />

            <div className="mt-7 flex flex-wrap gap-3">
              <Chip className="bg-[#D8FF00]/14 text-[#D8FF00] ring-[#D8FF00]/34">
                Completion rate {completionRate}%
              </Chip>
              <Chip className="bg-[#4D00EE]/18 text-[#d5c6ff] ring-[#4D00EE]/30">
                {activeTeams} active team{activeTeams === 1 ? '' : 's'}
              </Chip>
              <Chip className="bg-[#4D00EE]/18 text-[#d5c6ff] ring-[#4D00EE]/30">
                {overdueTasks} overdue
              </Chip>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Card variant="inset" padding="md">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#4D00EE]">
                Workload
              </p>
              <p className="mt-3 text-3xl font-bold tracking-[-0.04em] text-[#eef4ff]">
                {pendingTasks}
              </p>
              <p className="mt-3 text-sm leading-7 text-[#b8c7da]">
                Tasks still in motion and expected to advance this cycle.
              </p>
            </Card>

            <Card variant="soft" padding="md">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#4D00EE]">
                Momentum
              </p>
              <p className="mt-3 text-3xl font-bold tracking-[-0.04em] text-[#eef4ff]">
                {completedTasks}
              </p>
              <p className="mt-3 text-sm leading-7 text-[#b8c7da]">
                Delivered items that already moved through the workflow.
              </p>
            </Card>
          </div>
        </div>
      </Card>

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Total Tasks"
          value={totalTasks}
          note="All tracked work items across the shared workspace."
          icon={ListTodo}
          tone="neutral"
        />
        <MetricCard
          label="Completed"
          value={completedTasks}
          note="Delivered and signed off by the responsible team."
          icon={BadgeCheck}
          tone="success"
        />
        <MetricCard
          label="Pending"
          value={pendingTasks}
          note="Still active and moving without missing the current deadline."
          icon={Clock3}
          tone="info"
        />
        <MetricCard
          label="Overdue"
          value={overdueTasks}
          note="Needs intervention or reprioritization from the delivery lead."
          icon={AlertTriangle}
          tone="warning"
        />
      </section>

      <section className="grid gap-7 xl:grid-cols-[1.35fr_0.95fr]">
        <Card variant="soft" padding="lg">
          <SectionHeader
            eyebrow="Analytics Board"
            title="Tasks by team"
            description="Compare workload spread across each discipline in the sheet."
          />

          <div className="mt-7 h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={tasksByTeam}>
                <CartesianGrid stroke="#9bb0c2" strokeDasharray="4 6" vertical={false} />
                <XAxis
                  dataKey="team"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#8fa4bf', fontSize: 12 }}
                />
                <YAxis
                  allowDecimals={false}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#8fa4bf', fontSize: 12 }}
                />
                <Tooltip contentStyle={tooltipContentStyle} cursor={{ fill: 'rgba(77,0,238,0.08)' }} />
                <Bar dataKey="count" radius={[18, 18, 18, 18]}>
                  {tasksByTeam.map((item) => (
                    <Cell key={item.team} fill={item.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-5 flex flex-wrap gap-2.5">
            {tasksByTeam.map((item) => (
              <Link
                key={item.team}
                to={getTeamTasksPath(item.team)}
                className="rounded-full transition duration-200 hover:-translate-y-0.5 focus-visible:ring-4 focus-visible:ring-[#4D00EE]/24"
              >
                <Chip className={TEAM_THEME[item.team].chipClassName}>
                  {item.team} {item.count}
                </Chip>
              </Link>
            ))}
          </div>
        </Card>

        <Card variant="inset" padding="lg">
          <SectionHeader
            eyebrow="Status Mix"
            title="Status distribution"
            description="Quick scan of how much work is pending, progressing, complete, or blocked."
          />

          <div className="mt-7 h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusDistribution}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={76}
                  outerRadius={112}
                  paddingAngle={4}
                >
                  {statusDistribution.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipContentStyle} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            {statusDistribution.map((item) => (
              <Chip key={item.name} className={STATUS_THEME[item.name].chipClassName}>
                {item.name} {item.value}
              </Chip>
            ))}
          </div>
        </Card>
      </section>

      <Card variant="elevated" padding="lg">
        <SectionHeader
          eyebrow="Recent Queue"
          title="Latest work items"
          description="A restrained data board for the most recently created tasks."
          action={<Chip>{recentTasks.length} shown</Chip>}
        />
        <div className="mt-7">
          <TaskTable tasks={recentTasks} compact emptyCopy="No tasks have been created yet." />
        </div>
      </Card>
    </div>
  )
}
