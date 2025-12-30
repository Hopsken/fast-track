import { getAuthService, type AuthService } from './auth-service'
import { getJiraService, type JiraService } from './jira-service'
import { getProjectService, type ProjectService } from './project-service'
import { getTicketService, type TicketService } from './ticket-service'

export const projectService = getProjectService() as ProjectService
export const ticketService = getTicketService() as TicketService
export const jiraService = getJiraService() as JiraService
export const authService = getAuthService() as AuthService
