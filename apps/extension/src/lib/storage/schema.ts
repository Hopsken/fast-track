/**
 * Storage value type mapping and schema definitions
 * Uses WXT's built-in versioning and migration system
 */

import { WxtStorageItem, storage } from '#imports'

import type {
  AuthCredentials,
  AuthType,
  JiraApiKeyConfig,
  JiraOAuthConfig,
  JiraUserInfo,
  LicenseInfo,
  UserPreferences
} from '~/types'
import { getLogger } from '~/utils/logger'

const log = getLogger('storage-schema')

/**
 * Legacy storage keys that existed before consolidation (v0)
 * Used for migration to consolidated AuthCredentials
 */
interface LegacyAuthStorage {
  AuthType: AuthType
  OAuthTokens: JiraOAuthConfig | null
  OAuthUserInfo: JiraUserInfo | null
  ApiKeyAuth: JiraApiKeyConfig | null
  JiraHost: string
}

/**
 * Migration function to consolidate legacy auth keys into AuthCredentials
 * Runs automatically on extension update via WXT's built-in migration system
 */
async function migrateFromLegacyAuthKeys(): Promise<AuthCredentials | null> {
  log.info('Running migration: consolidating legacy auth keys')

  try {
    // Read legacy values directly from storage
    const [authType, oauthTokens, oauthUserInfo, apiKeyAuth, jiraHost] =
      await Promise.all([
        storage.getItem<LegacyAuthStorage['AuthType']>('local:AuthType'),
        storage.getItem<LegacyAuthStorage['OAuthTokens']>('local:OAuthTokens'),
        storage.getItem<LegacyAuthStorage['OAuthUserInfo']>(
          'local:OAuthUserInfo'
        ),
        storage.getItem<LegacyAuthStorage['ApiKeyAuth']>('local:ApiKeyAuth'),
        storage.getItem<LegacyAuthStorage['JiraHost']>('local:JiraHost')
      ])

    // Check if there's any auth data to migrate
    const hasOAuth = oauthTokens !== null
    const hasApiKey = apiKeyAuth !== null
    const hasAnyAuth = hasOAuth || hasApiKey

    if (!hasAnyAuth) {
      log.info('No existing auth data to migrate')
      return null
    }

    // Determine the host - prefer from the active auth method
    let host = jiraHost || ''
    if (authType === 'oauth' && oauthTokens?.host) {
      host = oauthTokens.host
    } else if (authType === 'apiKey' && apiKeyAuth?.host) {
      host = apiKeyAuth.host
    }

    // Build consolidated credentials
    const credentials: AuthCredentials = {
      type: authType || 'oauth',
      host,
      userInfo: oauthUserInfo,
      oauth: oauthTokens
        ? {
            instance_id: oauthTokens.instance_id,
            access_token: oauthTokens.access_token,
            refresh_token: oauthTokens.refresh_token,
            expires_at: oauthTokens.expires_at
          }
        : null,
      apiKey: apiKeyAuth
        ? {
            email: apiKeyAuth.email,
            apiKey: apiKeyAuth.apiKey
          }
        : null
    }

    log.info('Migration completed successfully', {
      authType: credentials.type,
      hasOAuth: !!credentials.oauth,
      hasApiKey: !!credentials.apiKey,
      hasUserInfo: !!credentials.userInfo
    })

    // Clean up legacy keys after successful migration
    await Promise.all([
      storage.removeItem('local:AuthType'),
      storage.removeItem('local:OAuthTokens'),
      storage.removeItem('local:OAuthUserInfo'),
      storage.removeItem('local:ApiKeyAuth'),
      storage.removeItem('local:JiraHost')
    ])

    log.info('Legacy auth keys cleaned up')

    return credentials
  } catch (error) {
    log.error('Migration failed:', error)
    return null
  }
}

type StorageItems = {
  License: LicenseInfo | null

  // Consolidated auth storage (v1+)
  AuthCredentials: AuthCredentials | null

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
const STORAGE_DEFAULTS: Omit<StorageItems, 'AuthCredentials'> = {
  License: null,
  REACT_QUERY_OFFLINE_CACHE: null,
  DevMode: false,
  UserPreferences: {
    branchNameFormat: '{key}-{summary}',
    autoCopyBranchNameOnTransition: false,
    autoAssignOnInProgress: false
  },
  DeviceId: '',
  'analytics-enabled': true,
  ProjectClicks: {}
}

// Enhanced storage key groups with logical organization
export const STORAGE_GROUPS = {
  // Consolidated authentication
  AUTH: ['AuthCredentials'],

  // License management
  LICENSE: ['License']
} satisfies Record<string, (keyof StorageItems)[]>

/**
 * AuthCredentials storage item with versioning and migration
 * Uses WXT's built-in migration system
 *
 * Note: WXT storage defaults to version 1, so we use version 2 to ensure
 * the migration runs for existing users upgrading from legacy storage keys.
 */
const authCredentialsItem = storage.defineItem<AuthCredentials | null>(
  'local:AuthCredentials',
  {
    fallback: null,
    version: 2,
    migrations: {
      // Migration from v1 (legacy scattered keys) to v2 (consolidated)
      2: migrateFromLegacyAuthKeys
    },
    onMigrationComplete: (value, version) => {
      log.info(`AuthCredentials migrated to version ${version}`, {
        hasCredentials: !!value
      })
    }
  }
)

/**
 * WXT storage items with type safety and default values
 */
const storageItems: Record<
  StorageKey,
  WxtStorageItem<StorageValue<StorageKey>, Record<string, unknown>>
> = {
  // Auth credentials with versioning
  AuthCredentials: authCredentialsItem as WxtStorageItem<
    StorageValue<'AuthCredentials'>,
    Record<string, unknown>
  >,

  // Other storage items without versioning
  ...Object.entries(STORAGE_DEFAULTS).reduce(
    (acc, [key, value]) => {
      acc[key as Exclude<StorageKey, 'AuthCredentials'>] = storage.defineItem(
        `local:${key}`,
        {
          fallback: value,
          init: () => (key === 'DeviceId' ? crypto.randomUUID() : value)
        }
      )
      return acc
    },
    {} as Record<
      Exclude<StorageKey, 'AuthCredentials'>,
      WxtStorageItem<StorageValue<StorageKey>, Record<string, unknown>>
    >
  )
}

export const getStorageItem = <T extends StorageKey>(
  key: T
): WxtStorageItem<StorageValue<T>, Record<string, unknown>> => {
  return storageItems[key] as WxtStorageItem<
    StorageValue<T>,
    Record<string, unknown>
  >
}
