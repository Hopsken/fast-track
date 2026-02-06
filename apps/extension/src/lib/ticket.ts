import { keyBy, merge } from 'lodash-es'

import { JiraIssue } from '@/types'

/**
 * Merges previous search results with new results, updating existing tickets
 * and adding new ones from the next array.
 */
export const mergeTickets = (
  prev: JiraIssue[],
  next: JiraIssue[]
): JiraIssue[] => {
  const prevByKey = keyBy(prev, 'key')
  const nextByKey = keyBy(next, 'key')

  const mergedNextFirst = next.map((ticket) =>
    merge({}, prevByKey[ticket.key], ticket)
  )

  const prevOnly = prev.filter((ticket) => !nextByKey[ticket.key])

  return [...mergedNextFirst, ...prevOnly]
}
