import { JiraTicket } from '@/types'

export type IssueSuggestionBuckets = {
  inProgress: string[]
  todo: string[]
  done: string[]
}

/**
 * Builds a list of ticket keys from history that aren't already in the primary buckets.
 * These are "recommended" because the user recently viewed them.
 */
export const buildHistoryRecommendKeys = (
  historyTickets: JiraTicket[],
  excludedKeys: string[]
) => {
  const excluded = new Set(excludedKeys)
  return historyTickets
    .map((ticket) => ticket.key)
    .filter((ticketKey) => !excluded.has(ticketKey))
}

const statusCategoryKeys = new Set(['indeterminate', 'new', 'done'])

const getStatusCategoryKey = (ticket: JiraTicket): string => {
  const key = ticket.status.statusCategory?.key
  return typeof key === 'string' ? key.toLowerCase() : ''
}

export const filterSuggestionTickets = (tickets: JiraTicket[]) =>
  tickets.filter((ticket) =>
    statusCategoryKeys.has(getStatusCategoryKey(ticket))
  )

export const bucketSuggestionTickets = (
  tickets: JiraTicket[]
): IssueSuggestionBuckets =>
  tickets.reduce<IssueSuggestionBuckets>(
    (acc, ticket) => {
      const statusKey = getStatusCategoryKey(ticket)

      if (statusKey === 'indeterminate') {
        acc.inProgress.push(ticket.key)
      } else if (statusKey === 'new') {
        acc.todo.push(ticket.key)
      } else if (statusKey === 'done') {
        acc.done.push(ticket.key)
      }

      return acc
    },
    { inProgress: [], todo: [], done: [] }
  )
