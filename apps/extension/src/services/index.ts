import { getAuthService, type AuthService } from './auth-service'
import { getJiraService, type JiraService } from './jira-service'
import {
  getSuggestionService,
  type SuggestionService
} from './suggestion-service'
import { getTemplateService, TemplateService } from './template-service'
import { getTicketService, type TicketService } from './ticket-service'

export type { SuggestionService }
export const suggestionService = getSuggestionService()

export const ticketService = getTicketService() as TicketService
export const jiraService = getJiraService() as JiraService
export const authService = getAuthService() as AuthService
export const templateService = getTemplateService() as TemplateService
