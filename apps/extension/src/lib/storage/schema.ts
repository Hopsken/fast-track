/**
 * Storage value type mapping and schema definitions
 */

import { WxtStorageItem, storage } from '#imports'

import type { LicenseInfo } from '~/types'


export type AuthType = 'oauth' | 'api_key' | null;

export interface OAuthTokens {
  access_token: string; // Encrypted
  refresh_token: string; // Encrypted
  expires_at: string; // ISO timestamp
  token_type: 'Bearer';
}

export interface OAuthUserInfo {
  account_id: string;
  email: string;
  display_name: string;
  avatar_url?: string;
}

export interface OAuthSettings {
  auto_refresh: boolean;
  notification_enabled: boolean;
  migration_completed: boolean;
}

type StorageItems = {
  License: LicenseInfo | null
  JiraHost: string
  JiraApiToken: string
  JiraUserEmail: string
  AuthType: AuthType
  PreferredAuthType: AuthType
  OAuthTokens: OAuthTokens | null
  OAuthUserInfo: OAuthUserInfo | null
  LastRefresh: string
  ClientId: string
  OAuthSettings: OAuthSettings
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
  AuthType: null,
  PreferredAuthType: 'oauth', // Default to OAuth as preferred
  OAuthTokens: null,
  OAuthUserInfo: null,
  LastRefresh: '',
  ClientId: '',
  OAuthSettings: {
    auto_refresh: true,
    notification_enabled: true,
    migration_completed: false
  }
}

export const JIRA_CONFIG = {
  HOST: 'JiraHost',
  API_TOKEN: 'JiraApiToken',
  USER_EMAIL: 'JiraUserEmail',
} as const;

export const OAUTH_CONFIG = {
  AUTH_TYPE: 'AuthType',
  PREFERRED_AUTH_TYPE: 'PreferredAuthType',
  TOKENS: 'OAuthTokens',
  USER_INFO: 'OAuthUserInfo',
  LAST_REFRESH: 'LastRefresh',
  CLIENT_ID: 'ClientId',
  SETTINGS: 'OAuthSettings',
} as const;

export const LICENSE = {
  INFO: 'License',
} as const;

// Storage key groups for organization
export const STORAGE_GROUPS = {
  JIRA_CONFIG: ['JiraHost', 'JiraApiToken', 'JiraUserEmail'] as const,
  LICENSE: ['License'] as const,
  OAUTH: ['AuthType', 'PreferredAuthType', 'OAuthTokens', 'OAuthUserInfo', 'LastRefresh', 'ClientId', 'OAuthSettings'] as const
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
