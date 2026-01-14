export type AuthType = 'oauth' | 'apiKey'

export interface JiraOAuthConfig {
  type: 'oauth'
  host: string
  instance_id: string
  access_token: string
  refresh_token: string
  expires_at: string // ISO timestamp
}

export interface JiraApiKeyConfig {
  type: 'apiKey'
  host: string
  email: string
  apiKey: string
}

export type ReceivedTokenPayload = Pick<
  JiraOAuthConfig,
  'access_token' | 'refresh_token' | 'expires_at'
>

export interface JiraUserInfo {
  accountId: string
  email: string
  name: string
  avatarUrl?: string
}

/**
 * Consolidated authentication credentials storage
 * This unifies all auth-related data into a single storage key
 */
export interface AuthCredentials {
  /** The authentication method being used */
  type: AuthType
  /** The Jira host URL (e.g., https://company.atlassian.net) */
  host: string
  /** User information from Jira */
  userInfo: JiraUserInfo | null
  /** OAuth tokens (when type is 'oauth') */
  oauth: {
    instance_id: string
    access_token: string
    refresh_token: string
    expires_at: string
  } | null
  /** API key credentials (when type is 'apiKey') */
  apiKey: {
    email: string
    apiKey: string
  } | null
}

export interface UserPreferences {
  branchNameFormat: string
  autoCopyBranchNameOnTransition: boolean
  autoAssignOnInProgress: boolean
}
