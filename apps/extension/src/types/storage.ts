export type AuthType = 'oauth'

export interface JiraOAuthConfig {
  type: 'oauth'
  host: string
  instance_id: string
  access_token: string
  refresh_token: string
  expires_at: string // ISO timestamp
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
