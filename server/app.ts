import 'dotenv/config'
import cors from 'cors'
import express from 'express'
import helmet from 'helmet'
import { rateLimit } from 'express-rate-limit'
import {
  GoogleSheetsService,
  taskStatuses,
  teams,
  type TaskStatus,
  type User,
} from './services/googleSheetsService.js'
import { signAuthToken, verifyAuthToken, verifyPassword } from './services/security.js'

const sheetsService = new GoogleSheetsService()
const app = express()

function normalizeOrigin(origin: string) {
  return origin.trim().replace(/\/+$/, '').toLowerCase()
}

const allowedOrigins = (process.env.CLIENT_ORIGIN ?? '')
  .split(',')
  .map((origin) => normalizeOrigin(origin))
  .filter(Boolean)

app.disable('x-powered-by')
app.use(helmet())
app.use(
  cors((request, callback) => {
    const origin = request.header('origin')

    if (!origin) {
      return callback(null, { origin: true })
    }

    const requestHost = request.header('x-forwarded-host') ?? request.header('host')
    const requestProtocol = request.header('x-forwarded-proto') ?? request.protocol
    const requestOrigin = requestHost ? normalizeOrigin(`${requestProtocol}://${requestHost}`) : null
    const normalizedOrigin = normalizeOrigin(origin)

    // Same-origin browser requests should always pass, even if CLIENT_ORIGIN is misconfigured.
    if (requestOrigin && normalizedOrigin === requestOrigin) {
      return callback(null, { origin: true })
    }

    if (!allowedOrigins.length) {
      return callback(null, { origin: true })
    }

    if (allowedOrigins.includes(normalizedOrigin)) {
      return callback(null, { origin: true })
    }

    return callback(new Error('Origin not allowed by CORS'))
  }),
)
app.use(express.json({ limit: '16kb' }))

type AuthenticatedRequest = express.Request & {
  currentUser?: User
}

async function requireAuth(
  request: AuthenticatedRequest,
  response: express.Response,
  next: express.NextFunction,
) {
  const authHeader = request.headers.authorization
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null

  if (!token) {
    return response.status(401).json({ message: 'Missing authentication token' })
  }

  try {
    const payload = verifyAuthToken(token)

    if (!payload?.email) {
      return response.status(401).json({ message: 'Invalid or expired session' })
    }

    const sessionUser = await sheetsService.findUserByEmail(payload.email)

    if (!sessionUser) {
      return response.status(401).json({ message: 'User no longer exists' })
    }

    request.currentUser = sessionUser.user
    return next()
  } catch {
    return response.status(500).json({
      message: 'Unable to validate session',
    })
  }
}

function requireAdmin(
  request: AuthenticatedRequest,
  response: express.Response,
  next: express.NextFunction,
) {
  if (request.currentUser?.role !== 'Admin') {
    return response.status(403).json({ message: 'Admin access required' })
  }

  return next()
}

function sanitizeTaskVisibility(
  user: User,
  tasks: Awaited<ReturnType<GoogleSheetsService['listTasks']>>,
) {
  if (user.role === 'Admin') {
    return tasks
  }

  return tasks.filter((task) => task.assignedTo.toLowerCase() === user.email.toLowerCase())
}

app.get('/api/health', (_request, response) => {
  response.json({
    ok: true,
    supportedTeams: teams,
    supportedStatuses: taskStatuses,
  })
})

const loginRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { message: 'Too many login attempts. Please try again later.' },
})

app.post('/api/auth/login', loginRateLimit, async (request, response) => {
  try {
    const email = String(request.body?.email ?? '').trim().toLowerCase()
    const password = String(request.body?.password ?? '')

    if (!email || !password) {
      return response.status(400).json({ message: 'Email and password are required' })
    }

    const match = await sheetsService.findUserByEmail(email)

    if (!match || !verifyPassword(password, match.passwordHash)) {
      return response.status(401).json({ message: 'Invalid credentials' })
    }

    const token = signAuthToken(match.user.email)

    return response.json({
      token,
      user: match.user,
    })
  } catch (error) {
    console.error('Login error:', error)
    return response.status(500).json({
      message: 'Unable to complete login',
    })
  }
})

app.get('/api/auth/me', requireAuth, (request: AuthenticatedRequest, response) => {
  response.json({ user: request.currentUser })
})

app.get('/api/tasks', requireAuth, async (request: AuthenticatedRequest, response) => {
  try {
    const tasks = await sheetsService.listTasks()
    response.json({ tasks: sanitizeTaskVisibility(request.currentUser!, tasks) })
  } catch {
    response.status(500).json({
      message: 'Unable to load tasks',
    })
  }
})

app.post('/api/tasks', requireAuth, requireAdmin, async (request: AuthenticatedRequest, response) => {
  try {
    const dueDate = String(request.body?.dueDate ?? '')
    const assignedTo = String(request.body?.assignedTo ?? '').trim().toLowerCase()
    const title = String(request.body?.title ?? '')
    const description = String(request.body?.description ?? '')
    const team = String(request.body?.team ?? '')

    if (!title || !assignedTo || !team || !dueDate) {
      return response
        .status(400)
        .json({ message: 'Title, assignee, team, and due date are required' })
    }

    const task = await sheetsService.createTask({
      title,
      description,
      assignedTo,
      team: team as (typeof teams)[number],
      dueDate,
    })

    return response.status(201).json({ task })
  } catch (error) {
    return response.status(400).json({
      message: error instanceof Error ? error.message : 'Unable to create task',
    })
  }
})

app.patch('/api/tasks/:taskId/status', requireAuth, async (request: AuthenticatedRequest, response) => {
  try {
    const requestedStatus = String(request.body?.status ?? '') as TaskStatus

    if (!taskStatuses.includes(requestedStatus)) {
      return response.status(400).json({ message: 'Invalid task status' })
    }

    const taskIdParam = request.params.taskId
    const taskId = Array.isArray(taskIdParam) ? taskIdParam[0] : taskIdParam

    if (!taskId) {
      return response.status(400).json({ message: 'Task ID is required' })
    }

    const visibleTasks = sanitizeTaskVisibility(request.currentUser!, await sheetsService.listTasks())
    const targetTask = visibleTasks.find((task) => task.id === taskId)

    if (!targetTask) {
      return response.status(403).json({ message: 'You do not have access to update this task' })
    }

    const task = await sheetsService.updateTaskStatus(taskId, requestedStatus)
    return response.json({ task })
  } catch (error) {
    return response.status(400).json({
      message: error instanceof Error ? error.message : 'Unable to update task',
    })
  }
})

app.get('/api/users', requireAuth, requireAdmin, async (_request, response) => {
  try {
    const users = await sheetsService.listUsers()
    response.json({ users })
  } catch {
    response.status(500).json({
      message: 'Unable to load users',
    })
  }
})

app.post('/api/users', requireAuth, requireAdmin, async (request, response) => {
  try {
    const name = String(request.body?.name ?? '')
    const email = String(request.body?.email ?? '').trim().toLowerCase()
    const password = String(request.body?.password ?? '')
    const role = String(request.body?.role ?? '')
    const teamsPayload = Array.isArray(request.body?.teams)
      ? request.body.teams
      : typeof request.body?.team === 'string'
        ? [request.body.team]
        : []
    const selectedTeams = teamsPayload
      .map((team: unknown) => String(team).trim())
      .filter(Boolean)

    if (!name || !email || !password || !role || !selectedTeams.length) {
      return response.status(400).json({ message: 'All user fields are required' })
    }

    const user = await sheetsService.createUser({
      name,
      email,
      password,
      role: role as User['role'],
      teams: selectedTeams as User['teams'],
    })

    return response.status(201).json({ user })
  } catch (error) {
    return response.status(400).json({
      message: error instanceof Error ? error.message : 'Unable to create user',
    })
  }
})

export default app
