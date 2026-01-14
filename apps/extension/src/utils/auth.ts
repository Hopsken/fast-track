/**
 * Auth credential helpers
 * Shared utilities for converting between AuthCredentials and API configs
 */

import type {
  AuthCredentials,
  JiraApiKeyConfig,
  JiraOAuthConfig
} from '~/types'

/**
 * Build a JiraOAuthConfig from AuthCredentials
 */
export function buildOAuthConfig(
  credentials: AuthCredentials
): JiraOAuthConfig | null {
  if (credentials.type !== 'oauth' || !credentials.oauth) return null

  return {
    type: 'oauth',
    host: credentials.host,
    instance_id: credentials.oauth.instance_id,
    access_token: credentials.oauth.access_token,
    refresh_token: credentials.oauth.refresh_token,
    expires_at: credentials.oauth.expires_at
  }
}

/**
 * Build a JiraApiKeyConfig from AuthCredentials
 */
export function buildApiKeyConfig(
  credentials: AuthCredentials
): JiraApiKeyConfig | null {
  if (credentials.type !== 'apiKey' || !credentials.apiKey) return null

  return {
    type: 'apiKey',
    host: credentials.host,
    email: credentials.apiKey.email,
    apiKey: credentials.apiKey.apiKey
  }
}
