/**
 * Storage value type mapping and schema definitions
 */

import { WxtStorageItem, storage } from '#imports'

import type {
  AuthType,
  JiraApiKeyConfig,
  JiraOAuthConfig,
  JiraUserInfo,
  LicenseInfo
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
const STORAGE_DEFAULTS: StorageItems = {
  License: null,
  JiraHost: '',
  // React Query cache
  REACT_QUERY_OFFLINE_CACHE: null,
  AuthType: 'oauth',
  OAuthTokens: null,
  OAuthUserInfo: null,
  ApiKeyAuth: null,
  DevMode: false,

  DeviceId: '',

  // analytics
  'analytics-enabled': true,
  ProjectClicks: {}
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
> = Object.entries(STORAGE_DEFAULTS).reduce(
  (acc, [key, value]) => {
    acc[key as StorageKey] = storage.defineItem(`local:${key}`, {
      fallback: value,
      init: () => (key === 'DeviceId' ? crypto.randomUUID() : value)
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
