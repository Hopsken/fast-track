/**
 * Converts a date string (YYYY-MM-DD) to Jira API format.
 * Jira expects dates in YYYY-MM-DD format.
 */
export function formatDateForJira(
  date: string | undefined
): string | undefined {
  if (!date) return undefined
  // HTML5 date input already returns YYYY-MM-DD
  return date
}

/**
 * Converts a datetime-local string to Jira API format (ISO 8601).
 * @param datetime - String from datetime-local input (YYYY-MM-DDTHH:mm)
 * @returns ISO 8601 string (YYYY-MM-DDTHH:mm:ss.sss+0000)
 */
export function formatDateTimeForJira(
  datetime: string | undefined
): string | undefined {
  if (!datetime) return undefined

  try {
    // datetime-local returns "YYYY-MM-DDTHH:mm"
    // Convert to ISO 8601 with timezone
    const date = new Date(datetime)
    if (isNaN(date.getTime())) return undefined

    // Format as ISO 8601 with UTC timezone
    return date.toISOString().replace(/\.\d{3}Z$/, '.000+0000')
  } catch {
    return undefined
  }
}

/**
 * Validates a date string (YYYY-MM-DD).
 */
export function isValidDate(date: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(date)
}

/**
 * Validates a datetime string (ISO 8601).
 */
export function isValidDateTime(datetime: string): boolean {
  try {
    const date = new Date(datetime)
    return !isNaN(date.getTime())
  } catch {
    return false
  }
}

/**
 * Converts Jira datetime to datetime-local format for input.
 * @param jiraDateTime - ISO 8601 string from Jira
 * @returns YYYY-MM-DDTHH:mm for datetime-local input
 */
export function parseDateTimeFromJira(
  jiraDateTime: string | undefined
): string | undefined {
  if (!jiraDateTime) return undefined

  try {
    const date = new Date(jiraDateTime)
    if (isNaN(date.getTime())) return undefined

    // Format as YYYY-MM-DDTHH:mm for datetime-local input
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')

    return `${year}-${month}-${day}T${hours}:${minutes}`
  } catch {
    return undefined
  }
}
