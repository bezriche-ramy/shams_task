import 'dotenv/config'
import { GoogleSheetsService } from '../server/services/googleSheetsService.ts'

async function main() {
  const service = new GoogleSheetsService()

  await service.ensureBaseSheets()

  const adminEmail = process.env.SEED_ADMIN_EMAIL?.trim().toLowerCase()
  const adminPassword = process.env.SEED_ADMIN_PASSWORD?.trim()
  const adminName = process.env.SEED_ADMIN_NAME?.trim() || 'Ramy Bezriche'
  const adminTeam = (process.env.SEED_ADMIN_TEAM?.trim() || 'UI/UX') as
    | 'Frontend'
    | 'Backend'
    | 'Database'
    | 'Docs'
    | 'UI/UX'

  if (!adminEmail || !adminPassword) {
    console.log('Sheets ensured. No admin user was seeded because SEED_ADMIN_EMAIL or SEED_ADMIN_PASSWORD is missing.')
    return
  }

  const user = await service.ensureUser({
    id: 'USR-001',
    name: adminName,
    email: adminEmail,
    password: adminPassword,
    role: 'Admin',
    team: adminTeam,
  })

  console.log(`Sheets are ready. Admin user ensured for ${user.email}.`)
}

void main().catch((error) => {
  console.error(error)
  process.exit(1)
})
