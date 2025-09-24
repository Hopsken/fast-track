/**
 * Storage value type mapping and schema definitions
 */

import { WxtStorageItem, storage } from '#imports'

import type {
  AuthType,
  JiraOAuthConfig,
  JiraUserInfo,
  LicenseInfo
} from '~/types'

type StorageItems = {
  License: LicenseInfo | null
  JiraHost: string
  JiraApiToken: string
  JiraUserEmail: string
  AuthType: AuthType
  OAuthTokens: JiraOAuthConfig | null
  OAuthUserInfo: JiraUserInfo | null
  LastSyncAt: string | null
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
  JiraUserEmail: '',
  AuthType: 'oauth',
  OAuthTokens: null,
  OAuthUserInfo: null,
  LastSyncAt: null
}

// Enhanced storage key groups with logical organization
export const STORAGE_GROUPS = {
  // Authentication core
  AUTH_CORE: ['AuthType'],

  // API Key authentication group
  API_KEY_AUTH: ['JiraHost', 'JiraApiToken', 'JiraUserEmail'],

  // OAuth authentication group
  OAUTH_AUTH: ['OAuthTokens', 'OAuthUserInfo'],

  // Jira configuration (combined API key auth for compatibility)
  JIRA_CONFIG: ['JiraHost', 'JiraApiToken', 'JiraUserEmail'],

  // License management
  LICENSE: ['License']
} satisfies Record<string, (keyof StorageItems)[]>

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
