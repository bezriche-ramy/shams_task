import type { Team } from '../types/models.ts'

export function getTeamTasksPath(team: Team) {
  return `/tasks?team=${encodeURIComponent(team)}`
}
