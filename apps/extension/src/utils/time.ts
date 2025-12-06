export const minutes = (minutes: number) => minutes * 60 * 1000
export const hours = (hours: number) => hours * minutes(60)
export const days = (days: number) => days * hours(24)
export const weeks = (weeks: number) => weeks * days(7)
