import { uniqBy } from 'lodash-es'

import { JiraTicket } from '@/types'

import { isNonNullable } from './assert'

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
  const status = ticket.status?.name?.toLowerCase?.() ?? ''
  const issueType = ticket.issueType?.name?.toLowerCase?.() ?? ''
  const assignee = ticket.assignee?.displayName?.toLowerCase?.() ?? ''
  const priority = ticket.priority?.name?.toLowerCase?.() ?? ''

  const scoreField = (
    value: string,
    weights: { exact?: number; starts?: number; includes?: number },
    subject: string
  ) => {
    if (!value) return 0

    let subtotal = 0

    if (weights.exact && value === subject) subtotal += weights.exact
    if (weights.starts && value.startsWith(subject)) subtotal += weights.starts
    if (weights.includes && value.includes(subject))
      subtotal += weights.includes

    return subtotal
  }

  const baseScore = [
    { value: key, weights: { exact: 200, starts: 120 } },
    { value: summary, weights: { exact: 100, includes: 60 } },
    { value: status, weights: { exact: 80, includes: 45 } },
    { value: issueType, weights: { exact: 70, includes: 40 } },
    { value: assignee, weights: { exact: 60, includes: 35 } },
    { value: priority, weights: { exact: 55, includes: 30 } }
  ].reduce(
    (total, field) => total + scoreField(field.value, field.weights, query),
    0
  )

  const tokenWeights = [
    { value: summary, weights: { starts: 24, includes: 12 } },
    { value: key, weights: { includes: 8 } },
    { value: status, weights: { starts: 10, includes: 8 } },
    { value: issueType, weights: { starts: 9, includes: 8 } },
    { value: assignee, weights: { includes: 6 } },
    { value: priority, weights: { includes: 6 } }
  ]

  const tokenScore = tokens.reduce((total, token) => {
    if (!token) return total

    return (
      total +
      tokenWeights.reduce(
        (subtotal, field) =>
          subtotal + scoreField(field.value, field.weights, token),
        0
      )
    )
  }, 0)

  return baseScore + tokenScore
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

export const filterTicketsByQuery = (tickets: JiraTicket[], query: string) => {
  const normalizedQuery = normalize(query)
  if (!normalizedQuery) return tickets

  const tokens = normalizedQuery.split(/\s+/).filter(Boolean)
  if (!tokens.length) return tickets

  const matches = (ticket: JiraTicket) => {
    const haystack = [ticket.key, ticket.summary, ticket.assignee?.displayName]
      .filter(isNonNullable)
      .map((value) => value.toLowerCase())
      .join(' ')

    return tokens.every((token) => haystack.includes(token))
  }

  return tickets.filter(matches)
}
