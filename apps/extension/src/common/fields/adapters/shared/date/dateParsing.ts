import * as chrono from 'chrono-node'
import { format, isValid, parseISO } from 'date-fns'

export const toJiraDate = (date: Date) => format(date, 'yyyy-MM-dd')

export const parseJiraDate = (raw: string) => {
  const parsed = parseISO(raw)
  return isValid(parsed) ? parsed : null
}

export const parseNaturalDate = (raw: string) => {
  const input = raw.trim()
  if (!input) return null

  const parsed = chrono.parseDate(input, new Date(), { forwardDate: true })
  if (parsed != null && isValid(parsed)) return parsed

  return parseJiraDate(input)
}

export const parseNaturalDateTime = (raw: string) => {
  const input = raw.trim()
  if (!input) return null

  const parsed = chrono.parseDate(input, new Date(), { forwardDate: true })
  if (parsed != null && isValid(parsed)) return parsed

  const isoParsed = parseISO(input)
  return isValid(isoParsed) ? isoParsed : null
}

export function toJiraDateTime(d: Date): string {
  return format(d, "yyyy-MM-dd'T'HH:mm:ss.SSSxxx")
}
