import { JiraTicket } from '@/types'

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
