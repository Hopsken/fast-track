/**
 * Jira API type definitions
 */

export interface JiraApiConfig {
  baseUrl: string
  email?: string
  apiToken?: string
}

export interface JiraConnectionTestResult {
  success: boolean
  user?: {
    accountId: string
    displayName: string
    emailAddress: string
  }
  error?: string
}
