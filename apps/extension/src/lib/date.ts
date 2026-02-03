import { formatISO } from 'date-fns'

export function toISODateString(date: Date | string): string {
  if (typeof date === 'string') {
    date = new Date(date)
  }
  return date.toISOString()
}

export function formatDateToISO(date: Date | string): string {
  return formatISO(date, { representation: 'date' })
}
