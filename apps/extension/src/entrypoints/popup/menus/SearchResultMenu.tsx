import { useEffect, useState } from 'react'
import { CommandItem, CommandList } from '@internal/ui/components/command'
import { uniqBy } from 'lodash-es'

import { ActionLoading } from '@/components/actions'
import { TicketList } from '@/components/tickets'
import { useFrequentProjects } from '@/hooks/useFrequentProjects'
import { useSearchQuery, useTicketSearch } from '@/hooks/useTicketSearch'

export function SearchResultMenu() {
  const searchQuery = useSearchQuery()

  const [showAllProjects, setShowAllProjects] = useState(false)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setShowAllProjects(false)
  }, [searchQuery])

  const { data: frequentProjects = [] } = useFrequentProjects()

  const useScopedProjects =
    frequentProjects.length > 0 && searchQuery.trim().length > 0

  const { data: scopedResults = [], isFetching: isScopedSearching } =
    useTicketSearch({
      enabled: useScopedProjects && !showAllProjects,
      projectKeys: frequentProjects,
      limit: 6
    })

  const { data: allResults = [], isFetching: isAllSearching } = useTicketSearch(
    {
      enabled: !useScopedProjects || showAllProjects,
      limit: 10
    }
  )

  const searchResults = uniqBy(scopedResults.concat(allResults), 'key')
  const isSearching = isScopedSearching || isAllSearching

  const shouldShowMore =
    useScopedProjects && !showAllProjects && Boolean(searchQuery.trim())

  return (
    <CommandList aria-label="Ticket search results">
      <TicketList
        searchQuery={searchQuery}
        tickets={searchResults}
        showEmptyNotice={!shouldShowMore}
      />
      {shouldShowMore ? (
        <CommandItem
          forceMount
          value="show-all-projects"
          onSelect={() => setShowAllProjects(true)}>
          Show more results
        </CommandItem>
      ) : null}

      <ActionLoading isLoading={isSearching} />
    </CommandList>
  )
}
