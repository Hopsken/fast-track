/**
 * Jira API type definitions
 */

export interface JiraApiConfig {
  baseUrl: string
  email?: string
  apiToken?: string
  authType?: 'api_key' | 'oauth'
  accessToken?: string
}

export interface JiraOAuthConfig {
  baseUrl: string
  accessToken: string
  authType: 'oauth'
}

export interface JiraApiKeyConfig {
  baseUrl: string
  email: string
  apiToken: string
  authType: 'api_key'
}
