/**
 * Storage value type mapping and schema definitions
 */

import { WxtStorageItem, storage } from '#imports'

import type { LicenseInfo } from '~/types'

type StorageItems = {
  License: LicenseInfo | null
  JiraHost: string
  JiraApiToken: string
  JiraUserEmail: string
}

export type StorageKey = keyof StorageItems

export type StorageValue<T extends StorageKey> = StorageItems[T]

/**
 * Default values for storage items
 */
const STORAGE_DEFAULTS: StorageItems = {
  License: null,
  JiraHost: '',
  JiraApiToken: '',
  JiraUserEmail: ''
}

// Storage key groups for organization
export const STORAGE_GROUPS = {
  JIRA_CONFIG: ['JiraHost', 'JiraApiToken', 'JiraUserEmail'] as const,
  LICENSE: ['License'] as const
}

/**
 * WXT storage items with type safety and default values
 */
const storageItems: Record<
  StorageKey,
  WxtStorageItem<StorageValue<StorageKey>, Record<string, unknown>>
> = Object.entries(STORAGE_DEFAULTS).reduce(
  (acc, [key, value]) => {
    acc[key as StorageKey] = storage.defineItem(`local:${key}`, {
      fallback: value
    })
    return acc
  },
  {} as Record<
    StorageKey,
    WxtStorageItem<StorageValue<StorageKey>, Record<string, unknown>>
  >
)

export const getStorageItem = <T extends StorageKey>(
  key: T
): WxtStorageItem<StorageValue<T>, Record<string, unknown>> => {
  return storageItems[key] as WxtStorageItem<
    StorageValue<T>,
    Record<string, unknown>
  >
}
