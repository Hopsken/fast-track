import { getJiraService, type JiraService } from './jira-service'
import { getTicketService, type TicketService } from './ticket-service'

export const ticketService = getTicketService() as TicketService
export const jiraService = getJiraService() as JiraService
