import { keyBy, merge } from 'lodash-es'

import { JiraTicket } from '@/types'

/**
 * Merges previous search results with new results, updating existing tickets
 * and adding new ones from the next array.
 */
export const mergeTickets = (
  prev: JiraTicket[],
  next: JiraTicket[]
): JiraTicket[] => {
  const nextByKey = keyBy(next, 'key')

  const mergedPrev = prev.map((ticket) =>
    merge({}, ticket, nextByKey[ticket.key])
  )

  const prevKeys = new Set(prev.map((ticket) => ticket.key))
  const onlyFromNext = next.filter((ticket) => !prevKeys.has(ticket.key))
  return [...mergedPrev, ...onlyFromNext]
}
