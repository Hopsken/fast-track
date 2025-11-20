import { getStorageItem } from '../storage'

import { JiraAPI } from './api'

export { JiraAPI }

export type { JiraApiConfig } from './types'

let cachedJira: { client: JiraAPI; signature: string } | null = null

/**
 * Get Jira API with intelligent authentication flow
 * Respects user's preferred authentication method, with smart fallback
 */
export async function getJiraApi() {
  const oauthTokens = await getStorageItem('OAuthTokens').getValue()
  if (!oauthTokens) {
    return null
  }

  const signature = `${oauthTokens.instance_id}:${oauthTokens.access_token}:${oauthTokens.refresh_token}`

  if (!cachedJira || cachedJira.signature !== signature) {
    cachedJira = {
      client: new JiraAPI(oauthTokens),
      signature
    }
  }

  return cachedJira.client
}
