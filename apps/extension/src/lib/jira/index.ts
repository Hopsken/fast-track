import { getStorageItem } from '../storage'
import { AuthApi } from './auth-api'

import { JiraAPI } from './api'

export { JiraAPI }

export type { JiraApiConfig } from './types'

let cachedJira: { client: JiraAPI; signature: string } | null = null

const TOKEN_EXPIRY_BUFFER_MS = 5 * 60 * 1000

async function ensureValidTokens() {
  const tokensStorage = getStorageItem('OAuthTokens')
  const userInfoStorage = getStorageItem('OAuthUserInfo')
  const tokens = await tokensStorage.getValue()

  if (!tokens) return null

  const expiresAtMs = new Date(tokens.expires_at).getTime()
  const now = Date.now()

  // Refresh if expired or within buffer window
  if (Number.isFinite(expiresAtMs) && expiresAtMs - TOKEN_EXPIRY_BUFFER_MS > now) {
    return tokens
  }

  try {
    const authApi = new AuthApi()
    const refreshed = await authApi.refreshToken(tokens)
    await tokensStorage.setValue(refreshed)
    return refreshed
  } catch (error) {
    console.error('Failed to refresh Jira tokens, clearing credentials', error)
    await Promise.all([
      tokensStorage.removeValue(),
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
  const oauthTokens = await ensureValidTokens()
  if (!oauthTokens) return null

  const signature = `${oauthTokens.instance_id}:${oauthTokens.access_token}:${oauthTokens.refresh_token}`

  if (!cachedJira || cachedJira.signature !== signature) {
    cachedJira = {
      client: new JiraAPI(oauthTokens),
      signature
    }
  }

  return cachedJira.client
}
