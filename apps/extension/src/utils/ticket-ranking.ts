import { uniqBy } from 'lodash-es'

import { JiraTicket } from '@/types'

const IN_PROGRESS_KEYS = ['indeterminate']
const IN_PROGRESS_NAMES = ['in progress']

type RankedTicket = {
  ticket: JiraTicket
  relevance: number
  inProgress: boolean
  updatedAt: number
}

const normalize = (value: string) => value.trim().toLowerCase()

const getTimestamp = (value?: string | null) => {
  if (!value) return 0

  const parsed = Date.parse(value)
  return Number.isFinite(parsed) ? parsed : 0
}

const getUpdatedAt = (ticket: JiraTicket) =>
  getTimestamp(ticket.updated) ||
  getTimestamp(ticket.lastViewed) ||
  getTimestamp(ticket.created)

const isInProgress = (ticket: JiraTicket) => {
  const statusCategoryKey =
    ticket.status?.statusCategory?.key?.toLowerCase() ?? ''
  const statusCategoryName =
    ticket.status?.statusCategory?.name?.toLowerCase() ?? ''

  if (IN_PROGRESS_KEYS.includes(statusCategoryKey)) {
    return true
  }

  return IN_PROGRESS_NAMES.some((name) => statusCategoryName.includes(name))
}

const computeRelevance = (
  ticket: JiraTicket,
  query: string,
  tokens: string[]
) => {
  if (!query) return 0

  const summary = ticket.summary.toLowerCase()
  const key = ticket.key.toLowerCase()

  let score = 0

  if (key === query) score += 200
  if (key.startsWith(query)) score += 120
  if (summary === query) score += 100
  if (summary.includes(query)) score += 60

  for (const token of tokens) {
    if (!token) continue

    if (summary.startsWith(token)) score += 24
    if (summary.includes(token)) score += 12
    if (key.includes(token)) score += 8
  }

  return score
}

export const rankTickets = (
  tickets: JiraTicket[],
  query: string,
  limit = 30
) => {
  const normalizedQuery = normalize(query)
  const tokens = normalizedQuery
    ? normalizedQuery.split(/\s+/).filter(Boolean)
    : []

  const ranked: RankedTicket[] = uniqBy(tickets, 'key').map((ticket) => ({
    ticket,
    relevance: computeRelevance(ticket, normalizedQuery, tokens),
    inProgress: isInProgress(ticket),
    updatedAt: getUpdatedAt(ticket)
  }))

  const sorter = normalizedQuery
    ? (a: RankedTicket, b: RankedTicket) => {
        if (b.relevance !== a.relevance) {
          return b.relevance - a.relevance
        }

        if (a.inProgress !== b.inProgress) {
          return a.inProgress ? -1 : 1
        }

        return b.updatedAt - a.updatedAt
      }
    : (a: RankedTicket, b: RankedTicket) => {
        if (a.inProgress !== b.inProgress) {
          return a.inProgress ? -1 : 1
        }

        return b.updatedAt - a.updatedAt
      }

  return ranked
    .sort(sorter)
    .slice(0, limit)
    .map((item) => item.ticket)
}
