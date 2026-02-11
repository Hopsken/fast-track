import { useEffect, useMemo, useState } from 'react'
import { compact, uniqBy } from 'lodash-es'

import { ActionItem, ActionList } from '@/common/commands'
import { TicketList } from '@/components/tickets'
import { useFrequentProjects } from '@/hooks/useFrequentProjects'
import { useTicketSearch } from '@/hooks/useTicketSearch'
import { IssueSuggestion } from '@/services/suggestion-service'
import { filterTicketsByQuery } from '@/utils/ticket-ranking'

export function SearchResultMenu(props: {
  searchQuery: string
  suggestions?: IssueSuggestion
}) {
  const { suggestions, searchQuery } = props

  const [showAllProjects, setShowAllProjects] = useState(false)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setShowAllProjects(false)
  }, [searchQuery])

  const filteredSuggestions = useMemo(() => {
    if (!suggestions) return []

    const allTickets = [
      ...suggestions.inProgress,
      ...suggestions.todo,
      ...suggestions.done,
      ...suggestions.recommend
    ].map((ticketKey) => suggestions.tickets[ticketKey])

    return filterTicketsByQuery(compact(allTickets), searchQuery)
  }, [suggestions, searchQuery])

  const { data: frequentProjects = [] } = useFrequentProjects()

  const useScopedProjects =
    frequentProjects.length > 0 && searchQuery.trim().length > 0

  const { data: scopedResults = [], isFetching: isScopedSearching } =
    useTicketSearch({
      searchQuery,
      enabled: useScopedProjects && !showAllProjects,
      projectKeys: frequentProjects,
      limit: 6
    })

  const { data: allResults = [], isFetching: isAllSearching } = useTicketSearch(
    {
      searchQuery,
      enabled: !useScopedProjects || showAllProjects,
      limit: 10
    }
  )

  const searchResults = useMemo(() => {
    return uniqBy(
      [...filteredSuggestions, ...scopedResults, ...allResults],
      'key'
    )
  }, [filteredSuggestions, scopedResults, allResults])
  const isSearching = isScopedSearching || isAllSearching

  const shouldShowMore =
    useScopedProjects && !showAllProjects && Boolean(searchQuery.trim())

  return (
    <ActionList isLoading={isSearching} aria-label="Ticket search results">
      <TicketList
        searchQuery={searchQuery}
        tickets={searchResults}
        showEmptyNotice={!shouldShowMore}
      />
      {shouldShowMore ? (
        <ActionItem
          value="show-all-projects"
          onSelect={() => setShowAllProjects(true)}>
          Show more results
        </ActionItem>
      ) : null}
    </ActionList>
  )
}
