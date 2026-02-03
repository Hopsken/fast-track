import type { IconOption } from '../../types'

/**
 * Type guard for checking if a value is a record.
 */
export function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object'
}

/**
 * Type guard for checking if a value is a date string (YYYY-MM-DD).
 */
export function isDateString(value: unknown): value is string {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)
}

/**
 * Type guard for checking if a value is an ISO 8601 datetime string.
 */
export function isDateTimeString(value: unknown): value is string {
  if (typeof value !== 'string') return false
  try {
    const date = new Date(value)
    return !isNaN(date.getTime())
  } catch {
    return false
  }
}

/**
 * Type guard for checking if a value is a time tracking object.
 */
export function isTimeTrackingValue(
  value: unknown
): value is { originalEstimate?: string; remainingEstimate?: string } {
  if (!isRecord(value)) return false
  return (
    (value.originalEstimate === undefined ||
      typeof value.originalEstimate === 'string') &&
    (value.remainingEstimate === undefined ||
      typeof value.remainingEstimate === 'string')
  )
}

/**
 * Type guard for checking if a value is an issue link object.
 */
export function isIssueLinkValue(value: unknown): value is {
  type: { id: string; name: string }
  outwardIssue?: { key: string }
} {
  if (!isRecord(value)) return false
  const typeObj = value.type
  if (!isRecord(typeObj)) return false
  if (typeof typeObj.id !== 'string' || typeof typeObj.name !== 'string') {
    return false
  }

  if (value.outwardIssue !== undefined) {
    const outwardIssue = value.outwardIssue
    if (!isRecord(outwardIssue) || typeof outwardIssue.key !== 'string') {
      return false
    }
  }

  return true
}

/**
 * Type guard for checking if a value is an IconOption.
 */
export function isIconOption(value: unknown): value is IconOption {
  if (!isRecord(value)) return false
  return typeof value.id === 'string'
}

/**
 * Type guard for checking if a value is an array of IconOptions.
 */
export function isIconOptionArray(value: unknown): value is IconOption[] {
  return Array.isArray(value) && value.every(isIconOption)
}

/**
 * Type guard for checking if a value is a user object.
 */
export function isUserValue(
  value: unknown
): value is { accountId: string; displayName?: string; avatarUrl?: string } {
  if (!isRecord(value)) return false
  return typeof value.accountId === 'string'
}

/**
 * Type guard for checking if a value is a project object.
 */
export function isProjectValue(value: unknown): value is {
  id: string
  key: string
  name: string
  avatarUrl?: string
} {
  if (!isRecord(value)) return false
  return (
    typeof value.id === 'string' &&
    typeof value.key === 'string' &&
    typeof value.name === 'string'
  )
}

/**
 * Type guard for checking if a value is a status object.
 */
export function isStatusValue(
  value: unknown
): value is { id: string; name: string; statusCategory?: string } {
  if (!isRecord(value)) return false
  return typeof value.id === 'string' && typeof value.name === 'string'
}
