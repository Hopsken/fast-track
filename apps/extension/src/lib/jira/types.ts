/**
 * Jira API type definitions
 */

import { JiraApiKeyConfig, JiraOAuthConfig } from '@/types'

export type JiraApiConfig = JiraOAuthConfig | JiraApiKeyConfig
