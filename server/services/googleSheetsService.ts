import { JWT } from 'google-auth-library'
import { GoogleSpreadsheet } from 'google-spreadsheet'
import { nanoid } from 'nanoid'
import { hashPassword } from './security'

const TEAMS = ['Frontend', 'Backend', 'Database', 'Docs', 'UI/UX'] as const
const USER_ROLES = ['Admin', 'User'] as const
const TASK_STATUSES = ['Pending', 'In Progress', 'Completed', 'Blocked'] as const

export type Team = (typeof TEAMS)[number]
export type UserRole = (typeof USER_ROLES)[number]
export type TaskStatus = (typeof TASK_STATUSES)[number]

export type User = {
  id: string
  name: string
  email: string
  role: UserRole
  teams: Team[]
}

export type Task = {
  id: string
  title: string
  description: string
  assignedTo: string
  assignedToName: string
  team: Team
  status: TaskStatus
  createdDate: string
  dueDate: string
}

type CreateUserInput = {
  name: string
  email: string
  password: string
  role: UserRole
  teams: Team[]
}

type CreateTaskInput = {
  title: string
  description: string
  assignedTo: string
  team: Team
  dueDate: string
}

type UserRow = {
  ID: string
  Name: string
  Email: string
  Password: string
  Role: UserRole
  Team: string
}

type TaskRow = {
  TaskID: string
  Title: string
  Description: string
  AssignedTo: string
  Team: Team
  Status: TaskStatus
  CreatedDate: string
  DueDate: string
}

const USERS_HEADERS: (keyof UserRow)[] = ['ID', 'Name', 'Email', 'Password', 'Role', 'Team']
const TASKS_HEADERS: (keyof TaskRow)[] = [
  'TaskID',
  'Title',
  'Description',
  'AssignedTo',
  'Team',
  'Status',
  'CreatedDate',
  'DueDate',
]

export const usersHeaders = USERS_HEADERS
export const tasksHeaders = TASKS_HEADERS

function assertTeam(team: string): asserts team is Team {
  if (!TEAMS.includes(team as Team)) {
    throw new Error(`Invalid team: ${team}`)
  }
}

function parseTeams(rawValue: string) {
  const normalized = rawValue.trim()

  if (!normalized) {
    return ['Frontend'] as Team[]
  }

  const teams = normalized
    .split(',')
    .map((team) => team.trim())
    .filter(Boolean)

  teams.forEach(assertTeam)

  return [...new Set(teams)] as Team[]
}

function serializeTeams(teams: Team[]) {
  if (!teams.length) {
    throw new Error('At least one team is required')
  }

  teams.forEach(assertTeam)
  return [...new Set(teams)].join(', ')
}

function assertRole(role: string): asserts role is UserRole {
  if (!USER_ROLES.includes(role as UserRole)) {
    throw new Error(`Invalid role: ${role}`)
  }
}

function assertStatus(status: string): asserts status is TaskStatus {
  if (!TASK_STATUSES.includes(status as TaskStatus)) {
    throw new Error(`Invalid status: ${status}`)
  }
}

function getRequiredEnv(name: string) {
  const value = process.env[name]

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`)
  }

  return value
}

function getPrivateKey() {
  const encoded = process.env.GOOGLE_PRIVATE_KEY_BASE64

  if (encoded) {
    return Buffer.from(encoded, 'base64').toString('utf8')
  }

  return getRequiredEnv('GOOGLE_PRIVATE_KEY').replace(/\\n/g, '\n')
}

function normalizeValue(value: unknown) {
  return String(value ?? '').trim()
}

export class GoogleSheetsService {
  private document: GoogleSpreadsheet | null = null
  private documentPromise: Promise<GoogleSpreadsheet> | null = null

  private async getDocument() {
    if (this.document) {
      return this.document
    }

    if (!this.documentPromise) {
      this.documentPromise = (async () => {
        const auth = new JWT({
          email: getRequiredEnv('GOOGLE_SERVICE_ACCOUNT_EMAIL'),
          key: getPrivateKey(),
          scopes: ['https://www.googleapis.com/auth/spreadsheets'],
        })

        const document = new GoogleSpreadsheet(getRequiredEnv('GOOGLE_SHEET_ID'), auth)
        await document.loadInfo()
        this.document = document
        return document
      })()
    }

    return this.documentPromise
  }

  async ensureSheet<T extends UserRow | TaskRow>(title: 'Users' | 'Tasks', headers: (keyof T)[]) {
    const document = await this.getDocument()
    let sheet = document.sheetsByTitle[title]

    if (!sheet) {
      sheet = await document.addSheet({
        title,
        headerValues: headers as string[],
      })
    } else {
      let currentHeaders: string[] = []

      try {
        await sheet.loadHeaderRow()
        currentHeaders = sheet.headerValues
      } catch {
        currentHeaders = []
      }

      const sameHeaders =
        currentHeaders.length === headers.length &&
        currentHeaders.every((value, index) => value === headers[index])

      if (!sameHeaders) {
        await sheet.setHeaderRow(headers as string[])
      }
    }

    return sheet
  }

  async ensureBaseSheets() {
    await Promise.all([
      this.ensureSheet<UserRow>('Users', USERS_HEADERS),
      this.ensureSheet<TaskRow>('Tasks', TASKS_HEADERS),
    ])
  }

  async listUsers() {
    const sheet = await this.ensureSheet<UserRow>('Users', USERS_HEADERS)
    const rows = await sheet.getRows<UserRow>()

    return rows.map((row) => {
      const role = normalizeValue(row.get('Role')) || 'User'
      const teams = parseTeams(normalizeValue(row.get('Team')))

      assertRole(role)

      return {
        id: normalizeValue(row.get('ID')),
        name: normalizeValue(row.get('Name')),
        email: normalizeValue(row.get('Email')),
        role,
        teams,
      } satisfies User
    })
  }

  async findUserByEmail(email: string) {
    const normalizedEmail = email.trim().toLowerCase()
    const sheet = await this.ensureSheet<UserRow>('Users', USERS_HEADERS)
    const rows = await sheet.getRows<UserRow>()

    for (const row of rows) {
      const rowEmail = normalizeValue(row.get('Email')).toLowerCase()

      if (rowEmail === normalizedEmail) {
        const role = normalizeValue(row.get('Role')) || 'User'
        const teams = parseTeams(normalizeValue(row.get('Team')))

        assertRole(role)

        return {
          user: {
            id: normalizeValue(row.get('ID')),
            name: normalizeValue(row.get('Name')),
            email: normalizeValue(row.get('Email')),
            role,
            teams,
          } satisfies User,
          passwordHash: normalizeValue(row.get('Password')),
        }
      }
    }

    return null
  }

  async createUser(input: CreateUserInput) {
    assertRole(input.role)
    if (!input.teams.length) {
      throw new Error('At least one team is required')
    }

    const existingUser = await this.findUserByEmail(input.email)

    if (existingUser) {
      throw new Error('A user with this email already exists')
    }

    const sheet = await this.ensureSheet<UserRow>('Users', USERS_HEADERS)
    const id = `USR-${nanoid(8).toUpperCase()}`

    await sheet.addRow({
      ID: id,
      Name: input.name.trim(),
      Email: input.email.trim().toLowerCase(),
      Password: hashPassword(input.password),
      Role: input.role,
      Team: serializeTeams(input.teams),
    })

    return {
      id,
      name: input.name.trim(),
      email: input.email.trim().toLowerCase(),
      role: input.role,
      teams: [...new Set(input.teams)],
    } satisfies User
  }

  async ensureUser(input: CreateUserInput & { id?: string }) {
    assertRole(input.role)
    if (!input.teams.length) {
      throw new Error('At least one team is required')
    }

    const existingUser = await this.findUserByEmail(input.email)

    if (existingUser) {
      return existingUser.user
    }

    const sheet = await this.ensureSheet<UserRow>('Users', USERS_HEADERS)
    const id = input.id?.trim() || `USR-${nanoid(8).toUpperCase()}`

    await sheet.addRow({
      ID: id,
      Name: input.name.trim(),
      Email: input.email.trim().toLowerCase(),
      Password: hashPassword(input.password),
      Role: input.role,
      Team: serializeTeams(input.teams),
    })

    return {
      id,
      name: input.name.trim(),
      email: input.email.trim().toLowerCase(),
      role: input.role,
      teams: [...new Set(input.teams)],
    } satisfies User
  }

  async listTasks() {
    const [sheet, users] = await Promise.all([
      this.ensureSheet<TaskRow>('Tasks', TASKS_HEADERS),
      this.listUsers(),
    ])
    const rows = await sheet.getRows<TaskRow>()
    const userMap = new Map(users.map((user) => [user.email.toLowerCase(), user]))

    return rows.map((row) => {
      const team = normalizeValue(row.get('Team')) || 'Frontend'
      const status = normalizeValue(row.get('Status')) || 'Pending'
      const assignedTo = normalizeValue(row.get('AssignedTo')).toLowerCase()
      const assignedUser = userMap.get(assignedTo)

      assertTeam(team)
      assertStatus(status)

      return {
        id: normalizeValue(row.get('TaskID')),
        title: normalizeValue(row.get('Title')),
        description: normalizeValue(row.get('Description')),
        assignedTo,
        assignedToName: assignedUser?.name ?? assignedTo,
        team,
        status,
        createdDate: normalizeValue(row.get('CreatedDate')),
        dueDate: normalizeValue(row.get('DueDate')),
      } satisfies Task
    })
  }

  async createTask(input: CreateTaskInput) {
    assertTeam(input.team)

    const assignee = await this.findUserByEmail(input.assignedTo)

    if (!assignee) {
      throw new Error('Assigned user was not found')
    }

    const sheet = await this.ensureSheet<TaskRow>('Tasks', TASKS_HEADERS)
    const id = `TSK-${nanoid(8).toUpperCase()}`
    const createdDate = new Date().toISOString()

    await sheet.addRow({
      TaskID: id,
      Title: input.title.trim(),
      Description: input.description.trim(),
      AssignedTo: input.assignedTo.trim().toLowerCase(),
      Team: input.team,
      Status: 'Pending',
      CreatedDate: createdDate,
      DueDate: input.dueDate,
    })

    return {
      id,
      title: input.title.trim(),
      description: input.description.trim(),
      assignedTo: input.assignedTo.trim().toLowerCase(),
      assignedToName: assignee.user.name,
      team: input.team,
      status: 'Pending',
      createdDate,
      dueDate: input.dueDate,
    } satisfies Task
  }

  async updateTaskStatus(taskId: string, status: TaskStatus) {
    assertStatus(status)

    const [sheet, users] = await Promise.all([
      this.ensureSheet<TaskRow>('Tasks', TASKS_HEADERS),
      this.listUsers(),
    ])
    const rows = await sheet.getRows<TaskRow>()
    const row = rows.find((candidate) => normalizeValue(candidate.get('TaskID')) === taskId)

    if (!row) {
      throw new Error('Task not found')
    }

    row.set('Status', status)
    await row.save()

    const assignedTo = normalizeValue(row.get('AssignedTo')).toLowerCase()
    const assignedUser = users.find((user) => user.email.toLowerCase() === assignedTo)
    const team = normalizeValue(row.get('Team')) || 'Frontend'

    assertTeam(team)

    return {
      id: normalizeValue(row.get('TaskID')),
      title: normalizeValue(row.get('Title')),
      description: normalizeValue(row.get('Description')),
      assignedTo,
      assignedToName: assignedUser?.name ?? assignedTo,
      team,
      status,
      createdDate: normalizeValue(row.get('CreatedDate')),
      dueDate: normalizeValue(row.get('DueDate')),
    } satisfies Task
  }
}

export const teams = TEAMS
export const taskStatuses = TASK_STATUSES
