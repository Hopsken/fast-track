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

  // Get user's preferred authentication method (defaults to OAuth)
  const preferredAuthType = await getStorageItem('PreferredAuthType').getValue()
  const currentAuthType = await oauthManager.getAuthType()
  
  // Try preferred method first
  if (preferredAuthType === 'oauth') {
    const oauthResult = await tryOAuthAuthentication(baseUrl)
    if (oauthResult) {
      return oauthResult
    }
    
    // OAuth preferred but failed, try API key as fallback
    console.log('🔄 OAuth preferred but not available, trying API key fallback')
    const apiKeyResult = await tryApiKeyAuthentication()
    if (apiKeyResult) {
      return apiKeyResult
    }
  } else {
    // API key preferred
    const apiKeyResult = await tryApiKeyAuthentication()
    if (apiKeyResult) {
      return apiKeyResult
    }
    
    // API key preferred but failed, try OAuth as fallback
    console.log('🔄 API key preferred but not available, trying OAuth fallback')
    const oauthResult = await tryOAuthAuthentication(baseUrl)
    if (oauthResult) {
      return oauthResult
    }
  }

  // If both methods fail, create a basic client for configuration
  console.warn('⚠️ No valid authentication method available, creating basic client')
  return new JiraAPI({
    baseUrl,
    authType: preferredAuthType || 'oauth'
  })
}

/**
 * Try OAuth authentication
 */
async function tryOAuthAuthentication(baseUrl: string): Promise<JiraAPI | null> {
  try {
    const hasOAuthTokens = await oauthManager.hasValidTokens()
    if (!hasOAuthTokens) {
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
  const oauthSubscription = combineLatest([
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

  // Clean up subscription when needed (this could be enhanced with proper cleanup)
  return oauthSubscription
}
