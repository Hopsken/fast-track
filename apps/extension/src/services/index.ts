import { getJiraService } from './jira-service'
import { getTicketService } from './ticket-service'

export const ticketService = getTicketService()
export const jiraService = getJiraService()
