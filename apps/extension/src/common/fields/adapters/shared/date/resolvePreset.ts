import {
  format,
  getYear,
  isToday,
  isTomorrow,
  isValid,
  isYesterday,
  parseISO
} from 'date-fns'

import { formatDateInput, formatDateTimeInput } from '@/utils/date-format'

import { parseJiraDate, toJiraDate, toJiraDateTime } from './dateParsing'
import {
  getDatePreset,
  getDatetimePreset,
  isPresetKey
} from './temporalPresets'

type ResolveOk = {
  ok: true
  date: Date
  iso: string
  label: string
}

export type ResolveResult = ResolveOk | { ok: false }

export function resolveTemporalValue(
  value: string,
  mode: 'date' | 'datetime',
  ref?: Date
): ResolveResult {
  if (!value) return { ok: false }

  const referenceDate = ref ?? new Date()

  if (isPresetKey(value)) {
    const preset =
      mode === 'date' ? getDatePreset(value) : getDatetimePreset(value)
    if (!preset) return { ok: false }
    const date = preset.resolve(referenceDate)
    const iso = mode === 'date' ? toJiraDate(date) : toJiraDateTime(date)
    return { ok: true, date, iso, label: preset.label }
  }

  if (mode === 'date') {
    const parsed = parseJiraDate(value)
    if (!parsed) return { ok: false }
    return {
      ok: true,
      date: parsed,
      iso: toJiraDate(parsed),
      label: formatDateInput(parsed)
    }
  }

  // datetime: try ISO parse
  const parsed = parseISO(value)
  if (!isValid(parsed)) return { ok: false }
  return {
    ok: true,
    date: parsed,
    iso: toJiraDateTime(parsed),
    label: formatDateTimeInput(parsed)
  }
}

export function getSemanticTemporalLabel(
  value: string,
  mode: 'date' | 'datetime',
  now?: Date
): string {
  if (!value) return value
  if (isPresetKey(value)) return getTemporalLabel(value, mode)

  const result = resolveTemporalValue(value, mode)
  if (!result.ok) return value

  const { date } = result
  const currentYear = getYear(now ?? new Date())

  if (mode === 'date') {
    if (isToday(date)) return 'Today'
    if (isTomorrow(date)) return `Tomorrow, ${format(date, 'MMM d')}`
    if (isYesterday(date)) return `Yesterday, ${format(date, 'MMM d')}`
    if (getYear(date) === currentYear) return format(date, 'MMM d')
    return format(date, 'MMM d, yyyy')
  }

  // datetime
  const time = format(date, 'h:mm a')
  if (isToday(date)) return `Today at ${time}`
  if (isTomorrow(date)) return `Tomorrow at ${time}`
  if (isYesterday(date)) return `Yesterday at ${time}`
  if (getYear(date) === currentYear) return format(date, "MMM d 'at' h:mm a")
  return format(date, "MMM d, yyyy 'at' h:mm a")
}

export function getTemporalLabel(
  value: string,
  mode: 'date' | 'datetime'
): string {
  const result = resolveTemporalValue(value, mode)
  return result.ok ? result.label : value
}
