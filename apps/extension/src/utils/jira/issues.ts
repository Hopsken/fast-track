import { UserDetails } from 'jira.js/version3/models/userDetails'

import { JiraAssignee, JiraTicket } from '@/types'

import { slugify } from '../string'

export function getIssueTitleLink(ticket: JiraTicket) {
  return `[${ticket.summary}](${ticket.url})`
}

export function generateBranchName(
  issue: JiraTicket,
  nameFormat?: string
): string {
  const issueKey = issue.key
  const issueSummary = issue.summary.toLowerCase()
  const issueSummaryShort = issueSummary.split(' ').slice(0, 5).join(' ')

  if (!nameFormat) {
    nameFormat = '{issueKey}-{issueSummary}'
  }

  // Supported fields in the Jira UI: issue key, issue summary, issue summary short, issue type, project key
  return nameFormat
    .replace('{issueKey}', issueKey)
    .replace('{issueSummary}', slugify(issueSummary))
    .replace('{issueSummaryShort}', slugify(issueSummaryShort))
    .replace('{issueType}', issue.issueType.name)
    .replace('{projectKey}', issue.projectKey || '')
}

export function mergeTicketsByKey(tickets: JiraTicket[]) {
  const ticketsByKey = new Map<string, JiraTicket>()

  tickets.forEach((ticket) => {
    const existing = ticketsByKey.get(ticket.key)
    if (existing) {
      // Merge fields from the new ticket into the existing one
      Object.assign(existing, ticket)
    } else {
      ticketsByKey.set(ticket.key, ticket)
    }
  })

  return Array.from(ticketsByKey.values())
}

export function mapUserToAssignee(user: UserDetails): JiraAssignee {
  return {
    displayName: user.displayName || user.name || user.emailAddress || '',
    emailAddress: user.emailAddress || '',
    avatarUrls:
      user.avatarUrls?.['48x48'] ||
      user.avatarUrls?.['32x32'] ||
      user.avatarUrls?.['24x24'] ||
      ''
  }
}
