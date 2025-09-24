import { firstValueFrom, skipWhile } from 'rxjs'

import { fromStorage$ } from '../storage'

import { JiraAPI } from './api'

export { JiraAPI }

export type { JiraApiConfig } from './types'

/**
 * Get Jira API with intelligent authentication flow
 * Respects user's preferred authentication method, with smart fallback
 */
export async function getJiraApi() {
  const oauthTokens = await firstValueFrom(
    fromStorage$('OAuthTokens').pipe(skipWhile((tokens) => !tokens))
  )
  if (!oauthTokens) {
    throw new Error('Jira OAuth tokens not found')
  }
  return new JiraAPI(oauthTokens)
}
