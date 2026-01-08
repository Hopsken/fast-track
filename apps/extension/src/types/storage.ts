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

export interface UserPreferences {
  branchNameFormat: string
  autoCopyBranchNameOnTransition: boolean
  autoAssignOnInProgress: boolean
}
