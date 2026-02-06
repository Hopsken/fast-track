import { JiraIssue } from '@/types'

export type IssueSuggestionBuckets = {
  inProgress: string[]
  todo: string[]
  done: string[]
}

export const bucketSuggestionTickets = (
  tickets: JiraIssue[]
): IssueSuggestionBuckets =>
  tickets.reduce<IssueSuggestionBuckets>(
    (acc, ticket) => {
      const statusKey = ticket.status.statusCategory?.key?.toLowerCase() || ''

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
