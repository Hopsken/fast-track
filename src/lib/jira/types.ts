/**
 * Jira API type definitions
 */

export interface JiraApiConfig {
  baseUrl: string
  email?: string
  apiToken?: string
}

export interface JiraApiIssue {
  id: string
  key: string
  fields: {
    summary: string
    status: {
      name: string
      statusCategory: {
        name: string
        colorName: string
      }
    }
    assignee?: {
      displayName: string
      emailAddress: string
      accountId: string
    }
    priority?: {
      name: string
      iconUrl: string
    }
    project: {
      key: string
      name: string
    }
    issuetype: {
      name: string
      iconUrl: string
    }
    labels: string[]
    components: Array<{
      name: string
    }>
  }
}

export interface JiraApiError {
  errorMessages: string[]
  errors: Record<string, string>
}

export interface JiraApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
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