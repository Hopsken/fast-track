// Main service (facade pattern)
import { combineLatest, firstValueFrom } from 'rxjs'

import { fromStorage$ } from '../storage'
import { getStorageItem } from '../storage/schema'

import { JiraAPI } from './api'
import { oauthManager } from './oauth-manager'

export type { JiraAPI }

export type { JiraApiConfig } from './types'

/**
 * Get Jira API with intelligent authentication flow
 * Respects user's preferred authentication method, with smart fallback
 */
export async function getJiraApi() {
  const baseUrl = await getStorageItem('JiraHost').getValue()
  if (!baseUrl) {
    throw new Error('Jira host URL is required')
  }

  // Try OAuth first (preferred method)
  const oauthAPI = await tryOAuthAuthentication(baseUrl)
  if (oauthAPI) {
    return oauthAPI
  }

  // Try API key authentication as fallback
  const apiKeyAPI = await tryApiKeyAuthentication()
  if (apiKeyAPI) {
    return apiKeyAPI
  }

  // Return API key client with OAuth as default auth type
  return new JiraAPI({
    baseUrl,
    authType: 'oauth'
  })
}

/**
 * Try OAuth authentication
 */
async function tryOAuthAuthentication(
  baseUrl: string
): Promise<JiraAPI | null> {
  try {
    const tokens = await oauthManager.getTokens()
    if (!tokens) {
      return null
    }

    const accessToken = await oauthManager.getValidAccessToken()
    if (!accessToken) {
      return null
    }

    console.log('🔐 Using OAuth authentication')
    const jiraAPI = new JiraAPI({
      baseUrl,
      authType: 'oauth',
      accessToken
    })

    // Set up OAuth token refresh subscription
    setupOAuthSubscription(jiraAPI, baseUrl)

    // Update current auth type
    await oauthManager.setAuthType('oauth')

    return jiraAPI
  } catch (error) {
    console.warn('OAuth authentication failed:', error)
    return null
  }
}

/**
 * Try API key authentication
 */
async function tryApiKeyAuthentication(): Promise<JiraAPI | null> {
  try {
    const jiraAPIConfig = combineLatest([
      fromStorage$('JiraHost'),
      fromStorage$('JiraUserEmail'),
      fromStorage$('JiraApiToken')
    ])

    const [baseUrl, email, apiToken] = await firstValueFrom(jiraAPIConfig)

    // Check if we have valid API key credentials
    if (!baseUrl || !email || !apiToken) {
      return null
    }

    console.log('🔑 Using API key authentication')
    const jiraAPI = new JiraAPI({
      baseUrl,
      email,
      apiToken,
      authType: 'api_key'
    })

    // Set up API key configuration subscription
    jiraAPIConfig.subscribe(([baseUrl, email, apiToken]) => {
      jiraAPI.updateConfig({ baseUrl, email, apiToken, authType: 'api_key' })
    })

    // Update current auth type
    await oauthManager.setAuthType('api_key')

    return jiraAPI
  } catch (error) {
    console.warn('API key authentication failed:', error)
    return null
  }
}

/**
 * Set up OAuth token refresh subscription
 */
function setupOAuthSubscription(jiraAPI: JiraAPI, baseUrl: string) {
  // Listen for OAuth token changes and update the client
  // Clean up subscription when needed (this could be enhanced with proper cleanup)
  return combineLatest([
    fromStorage$('OAuthTokens'),
    fromStorage$('AuthType')
  ]).subscribe(async ([tokens, authType]) => {
    if (authType === 'oauth' && tokens?.access_token) {
      jiraAPI.updateConfig({
        baseUrl,
        authType: 'oauth',
        accessToken: tokens.access_token
      })
    }
  })
}
