import { AuthCredentials, JiraOAuthConfig } from '~/types'
import { buildApiKeyConfig, buildOAuthConfig } from '~/utils/auth'
import { getLogger } from '~/utils/logger'

import { getStorageItem } from '../storage'

import { JiraAPI } from './api'
import { AuthApi } from './auth-api'

export { JiraAPI }

export type { JiraApiConfig } from './types'

let cachedJira: { client: JiraAPI; signature: string } | null = null

const TOKEN_EXPIRY_BUFFER_MS = 5 * 60 * 1000
const log = getLogger('jira-auth')

async function ensureValidTokens(
  credentials: AuthCredentials
): Promise<JiraOAuthConfig | null> {
  const oauthConfig = buildOAuthConfig(credentials)
  if (!oauthConfig) return null

  const expiresAtMs = new Date(oauthConfig.expires_at).getTime()
  const now = Date.now()

  // Return existing tokens if not expired or within buffer window
  if (
    Number.isFinite(expiresAtMs) &&
    expiresAtMs - TOKEN_EXPIRY_BUFFER_MS > now
  ) {
    return oauthConfig
  }

  try {
    const authApi = new AuthApi()
    const refreshed = await authApi.refreshToken(oauthConfig)

    // Update credentials storage with refreshed tokens
    const credentialsStorage = getStorageItem('AuthCredentials')
    const updatedCredentials: AuthCredentials = {
      ...credentials,
      oauth: {
        instance_id: refreshed.instance_id,
        access_token: refreshed.access_token,
        refresh_token: refreshed.refresh_token,
        expires_at: refreshed.expires_at
      }
    }
    await credentialsStorage.setValue(updatedCredentials)

    return refreshed
  } catch (error) {
    log.error('Failed to refresh Jira tokens, clearing credentials', error)
    await getStorageItem('AuthCredentials').removeValue()
    return null
  }
}

/**
 * Get Jira API with intelligent authentication flow
 * Respects user's preferred authentication method, with smart fallback
 */
export async function getJiraApi() {
  const credentials = await getStorageItem('AuthCredentials').getValue()

  if (!credentials) return null

  if (credentials.type === 'apiKey') {
    const apiKeyConfig = buildApiKeyConfig(credentials)
    if (!apiKeyConfig) return null

    const signature = `apiKey:${apiKeyConfig.host}:${apiKeyConfig.email}:${apiKeyConfig.apiKey}`
    if (!cachedJira || cachedJira.signature !== signature) {
      cachedJira = {
        client: new JiraAPI(apiKeyConfig),
        signature
      }
    }

    return cachedJira.client
  }

  const oauthConfig = await ensureValidTokens(credentials)
  if (!oauthConfig) return null

  const signature = `oauth:${oauthConfig.instance_id}:${oauthConfig.access_token}:${oauthConfig.refresh_token}`

  if (!cachedJira || cachedJira.signature !== signature) {
    cachedJira = {
      client: new JiraAPI(oauthConfig),
      signature
    }
  }

  return cachedJira.client
}
