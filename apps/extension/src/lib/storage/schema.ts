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
import type {
  CachedFieldMetadata,
  FieldConflict,
  IssueTemplate
} from '~/types/template'
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

  const readLegacy = async () => {
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

    return { authType, oauthTokens, oauthUserInfo, apiKeyAuth, jiraHost }
  }

  const cleanupLegacy = async () => {
    await Promise.all([
      storage.removeItem('local:AuthType'),
      storage.removeItem('local:OAuthTokens'),
      storage.removeItem('local:OAuthUserInfo'),
      storage.removeItem('local:ApiKeyAuth'),
      storage.removeItem('local:JiraHost')
    ])
  }

  const computeHost = (input: {
    authType: LegacyAuthStorage['AuthType'] | null
    oauthTokens: LegacyAuthStorage['OAuthTokens']
    apiKeyAuth: LegacyAuthStorage['ApiKeyAuth']
    jiraHost: LegacyAuthStorage['JiraHost'] | null
  }) => {
    const { authType, oauthTokens, apiKeyAuth, jiraHost } = input

    if (authType === 'oauth' && oauthTokens?.host) return oauthTokens.host
    if (authType === 'apiKey' && apiKeyAuth?.host) return apiKeyAuth.host

    return jiraHost || ''
  }

  try {
    const { authType, oauthTokens, oauthUserInfo, apiKeyAuth, jiraHost } =
      await readLegacy()

    // Check if there's any auth data to migrate
    const hasOAuth = oauthTokens !== null
    const hasApiKey = apiKeyAuth !== null

    if (!hasOAuth && !hasApiKey) {
      log.info('No existing auth data to migrate')
      return null
    }

    // Warn about type/data mismatches
    if (authType === 'oauth' && !oauthTokens) {
      log.warn('authType is oauth but no tokens found, data may be corrupted')
    } else if (authType === 'apiKey' && !apiKeyAuth) {
      log.warn(
        'authType is apiKey but no API key config found, data may be corrupted'
      )
    }

    // Build consolidated credentials
    const credentials: AuthCredentials = {
      type: authType || 'oauth',
      host: computeHost({ authType, oauthTokens, apiKeyAuth, jiraHost }),
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

    // Validate credentials before cleanup - ensure we have usable auth data
    const hasValidOAuth =
      credentials.type === 'oauth' && credentials.oauth && credentials.host
    const hasValidApiKey =
      credentials.type === 'apiKey' && credentials.apiKey && credentials.host

    if (!hasValidOAuth && !hasValidApiKey) {
      log.error(
        'Migration produced invalid credentials: missing required data',
        {
          type: credentials.type,
          hasHost: !!credentials.host,
          hasOAuth: !!credentials.oauth,
          hasApiKey: !!credentials.apiKey
        }
      )
      // Don't clean up legacy keys - user can try again or manually fix
      return null
    }

    log.info('Migration completed successfully', {
      authType: credentials.type,
      hasOAuth: !!credentials.oauth,
      hasApiKey: !!credentials.apiKey,
      hasUserInfo: !!credentials.userInfo
    })

    await cleanupLegacy()
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

  // ===== SYNC STORAGE =====
  IssueTemplates: IssueTemplate[]

  // ===== LOCAL STORAGE =====
  FieldMetadataCache: Record<string, CachedFieldMetadata>
  TemplateConflicts: Record<string, FieldConflict[]>
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
  ProjectClicks: {},

  // templates
  IssueTemplates: [],
  FieldMetadataCache: {},
  TemplateConflicts: {}
}

// Enhanced storage key groups with logical organization
export const STORAGE_GROUPS = {
  // Consolidated authentication
  AUTH: ['AuthCredentials'],

  // License management
  LICENSE: ['License']
} satisfies Record<string, (keyof StorageItems)[]>

/**
 * AuthCredentials storage item with init-based migration
 *
 * Uses `init` to migrate from legacy scattered auth keys when AuthCredentials
 * doesn't exist yet. This handles both fresh installs (returns null) and
 * upgrades from legacy storage (consolidates and returns credentials).
 */
const authCredentialsItem = storage.defineItem<AuthCredentials | null>(
  'local:AuthCredentials',
  {
    fallback: null,
    init: migrateFromLegacyAuthKeys
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
      const storageArea = key === 'IssueTemplates' ? 'sync' : 'local'

      acc[key as Exclude<StorageKey, 'AuthCredentials'>] = storage.defineItem(
        `${storageArea}:${key}`,
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
