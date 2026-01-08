import { JiraTicket } from '@/types'

export type IssueSuggestionBuckets = {
  inProgress: string[]
  todo: string[]
  done: string[]
}

export const buildRecommendKeys = (
  historyTickets: JiraTicket[],
  excludedKeys: string[]
) => {
  const excluded = new Set(excludedKeys)
  return historyTickets
    .map((ticket) => ticket.key)
    .filter((ticketKey) => !excluded.has(ticketKey))
}

const statusCategoryKeys = new Set(['indeterminate', 'new', 'done'])

export const filterSuggestionTickets = (tickets: JiraTicket[]) =>
  tickets.filter((ticket) =>
    statusCategoryKeys.has(
      ticket.status.statusCategory?.key?.toLowerCase?.() ?? ''
    )
  )

export const bucketSuggestionTickets = (
  tickets: JiraTicket[]
): IssueSuggestionBuckets =>
  tickets.reduce<IssueSuggestionBuckets>(
    (acc, ticket) => {
      const statusKey = ticket.status.statusCategory?.key?.toLowerCase?.() ?? ''

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
