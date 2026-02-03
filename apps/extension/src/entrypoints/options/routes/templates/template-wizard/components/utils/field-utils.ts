import type { AllowedValue } from '~/types/template'

import type { IconOption } from '../../types'

/**
 * Extracts icon URL from an AllowedValue if present.
 */
export function getIconUrl(
  value: AllowedValue | undefined
): string | undefined {
  return value?.iconUrl
}

/**
 * Gets display name from an AllowedValue, falling back to value or id.
 */
export function getDisplayName(value: AllowedValue): string {
  return value.name ?? value.value ?? value.id
}

/**
 * Converts AllowedValue to IconOption.
 */
export function toIconOption(value: AllowedValue): IconOption {
  return {
    id: value.id,
    name: value.name,
    value: value.value,
    iconUrl: value.iconUrl
  }
}

/**
 * Finds an allowed value by id.
 */
export function findAllowedValue(
  allowedValues: AllowedValue[],
  id: string | undefined
): AllowedValue | undefined {
  if (!id) return undefined
  return allowedValues.find((v) => v.id === id)
}
