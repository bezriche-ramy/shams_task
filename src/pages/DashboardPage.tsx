import { useEffect, useState } from 'react'
import { AlertTriangle, BadgeCheck, Clock3, ListTodo } from 'lucide-react'
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
import { Card } from '../components/ui/Card.tsx'
import { useAuth } from '../context/AuthContext.tsx'
import { api } from '../services/api.ts'
import { TEAMS, TASK_STATUSES, type Task } from '../types/models.ts'

const statusColors: Record<(typeof TASK_STATUSES)[number], string> = {
  Pending: '#facc15',
  'In Progress': '#38bdf8',
  Completed: '#22c55e',
  Blocked: '#fb7185',
}

function sortByRecentCreated(tasks: Task[]) {
  return [...tasks].sort(
    (left, right) => new Date(right.createdDate).getTime() - new Date(left.createdDate).getTime(),
  )
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
          setTasks(sortByRecentCreated(nextTasks))
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

  const totalTasks = tasks.length
  const completedTasks = tasks.filter((task) => task.status === 'Completed').length
  const overdueTasks = tasks.filter(
    (task) => task.status !== 'Completed' && new Date(task.dueDate) < new Date(),
  ).length
  const pendingTasks = tasks.filter(
    (task) => task.status !== 'Completed' && new Date(task.dueDate) >= new Date(),
  ).length

  const tasksByTeam = TEAMS.map((team) => ({
    team,
    count: tasks.filter((task) => task.team === team).length,
  }))

  const statusDistribution = TASK_STATUSES.map((status) => ({
    name: status,
    value: tasks.filter((task) => task.status === status).length,
  }))

  const recentTasks = tasks.slice(0, 5)

  if (isLoading) {
    return <Card className="text-sm text-slate-500">Loading dashboard data...</Card>
  }

  if (error) {
    return <Card className="border-rose-200 bg-rose-50 text-sm text-rose-600">{error}</Card>
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Total Tasks"
          value={totalTasks}
          note="All tracked work items"
          icon={ListTodo}
          accentClassName="bg-slate-900"
        />
        <MetricCard
          label="Completed"
          value={completedTasks}
          note="Delivered and signed off"
          icon={BadgeCheck}
          accentClassName="bg-emerald-500"
        />
        <MetricCard
          label="Pending"
          value={pendingTasks}
          note="Still active and on schedule"
          icon={Clock3}
          accentClassName="bg-sky-500"
        />
        <MetricCard
          label="Overdue"
          value={overdueTasks}
          note="Needs immediate attention"
          icon={AlertTriangle}
          accentClassName="bg-amber-400"
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.5fr_0.9fr]">
        <Card>
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.18em] text-slate-400">Chart</p>
              <h3 className="mt-2 text-xl font-bold text-slate-900">Tasks by team</h3>
            </div>
            <p className="text-sm text-slate-500">Compare workload distribution</p>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={tasksByTeam}>
                <CartesianGrid stroke="#e2e8f0" strokeDasharray="4 4" vertical={false} />
                <XAxis dataKey="team" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <Tooltip cursor={{ fill: '#f8fafc' }} />
                <Bar dataKey="count" radius={[18, 18, 0, 0]} fill="#38bdf8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <div className="mb-6">
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-slate-400">Chart</p>
            <h3 className="mt-2 text-xl font-bold text-slate-900">Status distribution</h3>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusDistribution}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={78}
                  outerRadius={112}
                  paddingAngle={4}
                >
                  {statusDistribution.map((entry) => (
                    <Cell key={entry.name} fill={statusColors[entry.name as keyof typeof statusColors]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 flex flex-wrap gap-3">
            {statusDistribution.map((item) => (
              <div key={item.name} className="inline-flex items-center gap-2 text-sm text-slate-600">
                <span
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: statusColors[item.name as keyof typeof statusColors] }}
                />
                <span>{item.name}</span>
                <span className="font-semibold text-slate-900">{item.value}</span>
              </div>
            ))}
          </div>
        </Card>
      </section>

      <Card>
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-slate-400">Table</p>
            <h3 className="mt-2 text-xl font-bold text-slate-900">Recent tasks</h3>
          </div>
          <p className="text-sm text-slate-500">Latest work items from the sheet</p>
        </div>
        <TaskTable tasks={recentTasks} compact emptyCopy="No tasks have been created yet." />
      </Card>
    </div>
  )
}
