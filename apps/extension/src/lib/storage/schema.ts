/**
 * Storage value type mapping and schema definitions
 */

import { WxtStorageItem, storage } from '#imports'

import type {
  AuthType,
  JiraApiKeyConfig,
  JiraOAuthConfig,
  JiraUserInfo,
  LicenseInfo,
  UserPreferences
} from '~/types'

type StorageItems = {
  License: LicenseInfo | null
  JiraHost: string
  AuthType: AuthType
  OAuthTokens: JiraOAuthConfig | null
  OAuthUserInfo: JiraUserInfo | null
  ApiKeyAuth: JiraApiKeyConfig | null
  DevMode: boolean
  REACT_QUERY_OFFLINE_CACHE: unknown
  UserPreferences: UserPreferences

  DeviceId: string

  // analytics
  'analytics-enabled': boolean
  ProjectClicks: Record<
    string,
    {
      count: number
      lastSelected: string
    }
  >
}

export type StorageKey = keyof StorageItems

export type StorageValue<T extends StorageKey> = StorageItems[T]

/**
 * Default values for storage items
 */
type StorageDefinition<T> = {
  area: 'local' | 'sync'
  fallback: T
  init?: () => T
}

const STORAGE_DEFINITIONS: {
  [K in StorageKey]: StorageDefinition<StorageItems[K]>
} = {
  License: { area: 'sync', fallback: null },
  JiraHost: { area: 'local', fallback: '' },
  // React Query cache
  REACT_QUERY_OFFLINE_CACHE: { area: 'local', fallback: null },
  AuthType: { area: 'local', fallback: 'oauth' },
  OAuthTokens: { area: 'local', fallback: null },
  OAuthUserInfo: { area: 'local', fallback: null },
  ApiKeyAuth: { area: 'local', fallback: null },
  DevMode: { area: 'local', fallback: false },
  UserPreferences: {
    area: 'sync',
    fallback: {
      branchNameFormat: '{key}-{summary}',
      autoCopyBranchNameOnTransition: false,
      autoAssignOnInProgress: false
    }
  },

  DeviceId: {
    area: 'local',
    fallback: '',
    init: () => crypto.randomUUID()
  },

  // analytics
  'analytics-enabled': { area: 'local', fallback: true },
  ProjectClicks: { area: 'local', fallback: {} }
}

// Enhanced storage key groups with logical organization
export const STORAGE_GROUPS = {
  // Authentication core
  AUTH_CORE: ['AuthType'],

  // OAuth authentication group
  OAUTH_AUTH: ['OAuthTokens', 'OAuthUserInfo'],

  // API key authentication group
  API_KEY_AUTH: ['ApiKeyAuth'],

  // License management
  LICENSE: ['License']
} satisfies Record<string, (keyof StorageItems)[]>

/**
 * WXT storage items with type safety and default values
 */
const storageItems: Record<
  StorageKey,
  WxtStorageItem<StorageValue<StorageKey>, Record<string, unknown>>
> = Object.entries(STORAGE_DEFINITIONS).reduce(
  (acc, [key, definition]) => {
    acc[key as StorageKey] = storage.defineItem(`${definition.area}:${key}`, {
      fallback: definition.fallback,
      init: definition.init
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
