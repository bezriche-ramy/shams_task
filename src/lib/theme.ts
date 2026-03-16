import type { TaskStatus, Team } from '../types/models.ts'

export type MetricTone = 'neutral' | 'success' | 'info' | 'warning'

type ToneConfig = {
  badgeClassName: string
  chipClassName: string
  chartColor: string
}

export const TEAM_THEME: Record<Team, ToneConfig> = {
  Frontend: {
    badgeClassName:
      'bg-[#4D00EE]/18 text-[#d5c6ff] ring-[#4D00EE]/30 shadow-[0_6px_14px_rgba(0,0,0,0.26)]',
    chipClassName:
      'bg-[#4D00EE]/18 text-[#d5c6ff] ring-[#4D00EE]/30 shadow-[0_8px_20px_rgba(0,0,0,0.28)]',
    chartColor: '#8a6bff',
  },
  Backend: {
    badgeClassName:
      'bg-[#122F45]/56 text-[#dbe7f7] ring-[#D8FF00]/12 shadow-[0_6px_14px_rgba(0,0,0,0.28)]',
    chipClassName:
      'bg-[#122F45]/56 text-[#dbe7f7] ring-[#D8FF00]/12 shadow-[0_8px_20px_rgba(0,0,0,0.28)]',
    chartColor: '#7f9cbc',
  },
  Database: {
    badgeClassName:
      'bg-[#D8FF00]/14 text-[#D8FF00] ring-[#D8FF00]/34 shadow-[0_6px_14px_rgba(0,0,0,0.26)]',
    chipClassName:
      'bg-[#D8FF00]/14 text-[#D8FF00] ring-[#D8FF00]/34 shadow-[0_8px_20px_rgba(0,0,0,0.28)]',
    chartColor: '#D8FF00',
  },
  Docs: {
    badgeClassName:
      'bg-[#122F45]/48 text-[#b9c9dd] ring-[#4D00EE]/14 shadow-[0_6px_14px_rgba(0,0,0,0.24)]',
    chipClassName:
      'bg-[#122F45]/48 text-[#b9c9dd] ring-[#4D00EE]/14 shadow-[0_8px_20px_rgba(0,0,0,0.26)]',
    chartColor: '#9bb3ca',
  },
  'UI/UX': {
    badgeClassName:
      'bg-[#4D00EE]/14 text-[#bba3ff] ring-[#4D00EE]/22 shadow-[0_6px_14px_rgba(0,0,0,0.24)]',
    chipClassName:
      'bg-[#4D00EE]/14 text-[#bba3ff] ring-[#4D00EE]/22 shadow-[0_8px_20px_rgba(0,0,0,0.26)]',
    chartColor: '#a887ff',
  },
}

export const STATUS_THEME: Record<TaskStatus, ToneConfig> = {
  Pending: {
    badgeClassName:
      'bg-[#122F45]/48 text-[#b9c9dd] ring-[#122F45]/20 shadow-[0_6px_14px_rgba(0,0,0,0.24)]',
    chipClassName:
      'bg-[#122F45]/48 text-[#b9c9dd] ring-[#122F45]/20 shadow-[0_8px_20px_rgba(0,0,0,0.26)]',
    chartColor: '#7f9cbc',
  },
  'In Progress': {
    badgeClassName:
      'bg-[#4D00EE]/18 text-[#d5c6ff] ring-[#4D00EE]/30 shadow-[0_6px_14px_rgba(0,0,0,0.26)]',
    chipClassName:
      'bg-[#4D00EE]/18 text-[#d5c6ff] ring-[#4D00EE]/30 shadow-[0_8px_20px_rgba(0,0,0,0.28)]',
    chartColor: '#8a6bff',
  },
  Completed: {
    badgeClassName:
      'bg-[#D8FF00]/14 text-[#D8FF00] ring-[#D8FF00]/34 shadow-[0_6px_14px_rgba(0,0,0,0.26)]',
    chipClassName:
      'bg-[#D8FF00]/14 text-[#D8FF00] ring-[#D8FF00]/34 shadow-[0_8px_20px_rgba(0,0,0,0.28)]',
    chartColor: '#D8FF00',
  },
  Blocked: {
    badgeClassName:
      'bg-[#122F45]/56 text-[#dbe7f7] ring-[#4D00EE]/12 shadow-[0_6px_14px_rgba(0,0,0,0.28)]',
    chipClassName:
      'bg-[#122F45]/56 text-[#dbe7f7] ring-[#4D00EE]/12 shadow-[0_8px_20px_rgba(0,0,0,0.28)]',
    chartColor: '#95afca',
  },
  Archived: {
    badgeClassName:
      'bg-[#0e1524]/82 text-[#8fa4bf] ring-[#122F45]/32 shadow-[0_6px_14px_rgba(0,0,0,0.26)]',
    chipClassName:
      'bg-[#0e1524]/82 text-[#8fa4bf] ring-[#122F45]/32 shadow-[0_8px_20px_rgba(0,0,0,0.28)]',
    chartColor: '#5e728a',
  },
}

export const METRIC_TONES: Record<
  MetricTone,
  {
    iconClassName: string
    accentClassName: string
    chipClassName: string
  }
> = {
  neutral: {
    iconClassName:
      'bg-[linear-gradient(145deg,#211255,#0f2036)] text-[#d5c6ff] shadow-[0_12px_24px_rgba(0,0,0,0.3)]',
    accentClassName: 'from-[#1c1046] via-[#0f1a2f] to-[#11243b]',
    chipClassName:
      'bg-[#4D00EE]/18 text-[#d5c6ff] ring-[#4D00EE]/30 shadow-[0_8px_18px_rgba(0,0,0,0.28)]',
  },
  success: {
    iconClassName:
      'bg-[linear-gradient(145deg,#23310c,#162211)] text-[#D8FF00] shadow-[0_12px_24px_rgba(0,0,0,0.3)]',
    accentClassName: 'from-[#1c2d10] via-[#0f1820] to-[#122813]',
    chipClassName:
      'bg-[#D8FF00]/14 text-[#D8FF00] ring-[#D8FF00]/34 shadow-[0_8px_18px_rgba(0,0,0,0.28)]',
  },
  info: {
    iconClassName:
      'bg-[linear-gradient(145deg,#181f4d,#112238)] text-[#c4b0ff] shadow-[0_12px_24px_rgba(0,0,0,0.3)]',
    accentClassName: 'from-[#1c1248] via-[#101a31] to-[#16203c]',
    chipClassName:
      'bg-[#4D00EE]/18 text-[#d5c6ff] ring-[#4D00EE]/30 shadow-[0_8px_18px_rgba(0,0,0,0.28)]',
  },
  warning: {
    iconClassName:
      'bg-[linear-gradient(145deg,#17304b,#0d1726)] text-[#dbe7f7] shadow-[0_12px_24px_rgba(0,0,0,0.3)]',
    accentClassName: 'from-[#16314d] via-[#0e1626] to-[#102235]',
    chipClassName:
      'bg-[#122F45]/56 text-[#dbe7f7] ring-[#122F45]/20 shadow-[0_8px_18px_rgba(0,0,0,0.28)]',
  },
}
