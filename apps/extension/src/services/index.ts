import { AuthService, getAuthService } from './auth-service'
import { getJiraService, JiraService } from './jira-service'
import {
  getSuggestionService,
  type SuggestionService
} from './suggestion-service'
import { getTemplateService, TemplateService } from './template-service'

export type { AuthService, JiraService, SuggestionService, TemplateService }

export const suggestionService = getSuggestionService()
export const jiraService = getJiraService()
export const authService = getAuthService()
export const templateService = getTemplateService()
