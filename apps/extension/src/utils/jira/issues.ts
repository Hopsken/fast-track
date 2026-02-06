import type { IssueTransition } from 'jira.js/version3/models/issueTransition'
import type { Priority } from 'jira.js/version3/models/priority'
import type { StatusDetails } from 'jira.js/version3/models/statusDetails'
import type { UserDetails } from 'jira.js/version3/models/userDetails'

import type {
  JiraAssignee,
  JiraPriority,
  JiraStatus,
  JiraIssue,
  JiraTransition
} from '@/repository/schema'

import { slugify } from '../string'

const TICKET_KEY_PATTERN = /^[A-Z]+-\d+$/i

export const isTicketKey = (value: string) =>
  TICKET_KEY_PATTERN.test(value.trim())

export function getIssueTitleLink(ticket: JiraIssue) {
  return `[${ticket.summary}](${ticket.url})`
}

export function generateBranchName(
  issue: JiraIssue,
  nameFormat?: string
): string {
  const issueKey = issue.key
  const issueSummary = issue.summary
  const issueSummaryShort = issueSummary.split(' ').slice(0, 5).join('-')

  if (!nameFormat?.trim()) {
    nameFormat = '{key}-{summary}'
  }

  // Supported fields: key, summary, issue key, issue summary, issue summary short,
  // issue type, project key
  return nameFormat
    .replace('{key}', issueKey)
    .replace('{summary}', slugify(issueSummary))
    .replace('{summaryShort}', slugify(issueSummaryShort))
}

export function mergeTicketsByKey(tickets: JiraIssue[]) {
  const ticketsByKey = new Map<string, JiraIssue>()

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

export function mapStatus(status: StatusDetails | undefined): JiraStatus {
  return {
    id: status?.id || '',
    name: status?.name || '',
    description: status?.description || '',
    statusCategory: {
      key: status?.statusCategory?.key || '',
      colorName: status?.statusCategory?.colorName || '',
      name: status?.statusCategory?.name || ''
    }
  }
}

export function mapPriority(
  priority: Priority | JiraPriority | undefined
): JiraPriority {
  return {
    id: priority?.id,
    name: priority?.name || '',
    iconUrl: priority?.iconUrl || ''
  }
}

export function mapTransition(
  transition: IssueTransition
): JiraTransition | null {
  if (!transition.id) return null

  return {
    id: transition.id,
    name: transition.name || transition.to?.name || transition.id,
    to: mapStatus(transition.to)
  }
}
