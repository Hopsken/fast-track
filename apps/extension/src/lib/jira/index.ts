import { getLogger } from '~/utils/logger'

import { getStorageItem, updateAuthState } from '../storage'

import { JiraAPI } from './api'
import { AuthApi } from './auth-api'

export { JiraAPI }

export type { JiraApiConfig } from './types'

let cachedJira: { client: JiraAPI; signature: string } | null = null

const TOKEN_EXPIRY_BUFFER_MS = 5 * 60 * 1000
const log = getLogger('jira-auth')

async function ensureValidTokens() {
  const userInfoStorage = getStorageItem('OAuthUserInfo')
  const authStateItem = getStorageItem('AuthState')
  const authState = await authStateItem.getValue()
  const tokens = authState.oauth

  if (!tokens) return null

  const expiresAtMs = new Date(tokens.expires_at).getTime()
  const now = Date.now()

  // Refresh if expired or within buffer window
  if (
    Number.isFinite(expiresAtMs) &&
    expiresAtMs - TOKEN_EXPIRY_BUFFER_MS > now
  ) {
    return tokens
  }

  try {
    const authApi = new AuthApi()
    const refreshed = await authApi.refreshToken(tokens)
    await authStateItem.setValue({
      ...authState,
      type: 'oauth',
      oauth: refreshed
    })
    return refreshed
  } catch (error) {
    log.error('Failed to refresh Jira tokens, clearing credentials', error)
    await Promise.all([
      updateAuthState((state) => ({
        ...state,
        oauth: null
      })),
      userInfoStorage.removeValue()
    ])
    return null
  }
}

/**
 * Get Jira API with intelligent authentication flow
 * Respects user's preferred authentication method, with smart fallback
 */
export async function getJiraApi() {
  const authState = await getStorageItem('AuthState').getValue()

  if (authState.type === 'apiKey') {
    const apiKeyConfig = authState.apiKey
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

  const oauthTokens = await ensureValidTokens()
  if (!oauthTokens) return null

  const signature = `oauth:${oauthTokens.instance_id}:${oauthTokens.access_token}:${oauthTokens.refresh_token}`

  if (!cachedJira || cachedJira.signature !== signature) {
    cachedJira = {
      client: new JiraAPI(oauthTokens),
      signature
    }
  }

  return cachedJira.client
}
