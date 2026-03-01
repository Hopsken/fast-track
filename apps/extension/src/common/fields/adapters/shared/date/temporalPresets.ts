import { addDays, addMonths, addWeeks, nextMonday, startOfDay } from 'date-fns'

export type TemporalPreset = {
  key: string
  label: string
  resolve: (ref: Date) => Date
}

const withTime = (date: Date, h: number, m: number): Date => {
  const d = new Date(date)
  d.setHours(h, m, 0, 0)
  return d
}

export const DATE_PRESETS: TemporalPreset[] = [
  {
    key: '@today',
    label: 'Today',
    resolve: (ref) => startOfDay(ref)
  },
  {
    key: '@tomorrow',
    label: 'Tomorrow',
    resolve: (ref) => startOfDay(addDays(ref, 1))
  },
  {
    key: '@+3d',
    label: 'In 3 days',
    resolve: (ref) => startOfDay(addDays(ref, 3))
  },
  {
    key: '@next_monday',
    label: 'Next Monday',
    resolve: (ref) => startOfDay(nextMonday(ref))
  },
  {
    key: '@+1w',
    label: 'In 1 week',
    resolve: (ref) => startOfDay(addWeeks(ref, 1))
  },
  {
    key: '@+2w',
    label: 'In 2 weeks',
    resolve: (ref) => startOfDay(addWeeks(ref, 2))
  },
  {
    key: '@+1m',
    label: 'In 1 month',
    resolve: (ref) => startOfDay(addMonths(ref, 1))
  }
]

export const DATETIME_PRESETS: TemporalPreset[] = DATE_PRESETS.map((p) => ({
  ...p,
  resolve: (ref: Date) => withTime(p.resolve(ref), 9, 0)
}))

export const isPresetKey = (value: string): boolean => value.startsWith('@')

export const getDatePreset = (key: string): TemporalPreset | undefined =>
  DATE_PRESETS.find((p) => p.key === key)

export const getDatetimePreset = (key: string): TemporalPreset | undefined =>
  DATETIME_PRESETS.find((p) => p.key === key)
