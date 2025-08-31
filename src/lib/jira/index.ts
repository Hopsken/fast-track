// Main service (facade pattern)
export { JiraApiService } from './api'

// Individual services (for advanced usage)
export { JiraClient } from './client'
export { JiraIssueService } from './issue-service'
export { JiraConnectionService } from './connection-service'

// Types
export type { JiraApiConfig, JiraConnectionTestResult } from './types'

// Utilities
export {
  extractJiraUrlFromCurrentPage,
  extractJiraInstanceName,
  isValidJiraUrl,
  normalizeJiraUrl,
  buildIssueUrl,
  extractIssueKeyFromUrl,
  isJiraIssueUrl,
  JiraUrlBuilder
} from './url-helpers'
