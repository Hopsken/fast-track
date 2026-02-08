import { format } from 'date-fns'

type DateLike = Date | string | number

/**
 * Standardized date formatting utilities for consistent display across the application
 */

/**
 * Format date for input fields (compact, readable)
 * Example: "Feb 9, 2026"
 */
export const formatDateInput = (date: DateLike): string => {
  return format(date, 'MMM d, yyyy')
}

/**
 * Format date for display/preview (full, human-readable)
 * Example: "Saturday, February 9, 2026"
 */
export const formatDateDisplay = (date: DateLike): string => {
  return format(date, 'EEEE, MMMM d, yyyy')
}

/**
 * Format datetime for input fields (compact, readable)
 * Example: "Feb 9, 2026 3:00 PM"
 */
export const formatDateTimeInput = (date: DateLike): string => {
  return format(date, 'MMM d, yyyy h:mm a')
}

/**
 * Format datetime for display/preview (full, human-readable)
 * Example: "Saturday, February 9, 2026 at 3:00 PM"
 */
export const formatDateTimeDisplay = (date: DateLike): string => {
  return format(date, "EEEE, MMMM d, yyyy 'at' h:mm a")
}

/**
 * Format datetime for technical display (ISO-like, no timezone)
 * Example: "2026-02-09 15:00:00"
 */
export const formatDateTimeISO = (date: DateLike): string => {
  return format(date, 'yyyy-MM-dd HH:mm:ss')
}
