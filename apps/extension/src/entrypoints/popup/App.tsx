import { useEffect, useState } from 'react'
import { Command, CommandInput } from '@internal/ui/components/command'
import { useMemoizedFn } from 'ahooks'

import {
  CommandRoute,
  CommandRouter,
  useCommandRouter
} from '@/components/CommandRouter'
import { getTicketService } from '@/services/ticket-service'
import { DevOnly } from '~/components/DevOnly'
import { DevRefreshSuggestionsButton } from '~/components/DevRefreshSuggestionsButton'
import { ErrorBoundary } from '~/components/ErrorBoundary'
import { TicketSearchBox } from '~/components/search'
import { useTicketSearch } from '~/hooks/useTicketSearch'

import { TicketActionsMenu, SearchResultMenu, CommandRoutes } from './menus'

function App() {
  const { activePage } = useCommandRouter()
  const { searchQuery, handleSearch, isSearching, error, isAuthConfigured } =
    useTicketSearch()
  const [inputValue, setInputValue] = useState('')

  const footerError = isAuthConfigured ? error : undefined

  // Initialize search orchestration
  useEffect(() => {
    getTicketService().suggestions.refresh('startup')
  }, [])

  const isSearchResultPage = activePage.path === '/'
  const shouldFilter = isSearchResultPage ? false : true

  const onCommandInputChange = useMemoizedFn((value: string) => {
    setInputValue(value)
    if (isSearchResultPage) {
      handleSearch(value)
    }
  })

  return (
    <div className="linear w-[640px]">
      <Command loop shouldFilter={shouldFilter}>
        <div className="relative flex h-[52px] items-center gap-3 border-b-2 border-gray-200 pl-5 pr-5">
          <CommandInput
            autoFocus
            value={inputValue}
            onValueChange={onCommandInputChange}
            placeholder={isSearching ? 'Searching...' : 'Search tickets...'}
            aria-label="Search tickets"
            aria-busy={isSearching}
          />
        </div>

        <CommandRoute path="/">
          <SearchResultMenu />
        </CommandRoute>

        <CommandRoute path="/actions">
          {(ticket) => <TicketActionsMenu ticket={ticket} />}
        </CommandRoute>

        <div className="flex items-center gap-2 px-4 py-2">
          <span>{footerError}</span>
          <ErrorBoundary>
            <DevOnly>
              <DevRefreshSuggestionsButton />
            </DevOnly>
          </ErrorBoundary>
        </div>
      </Command>
    </div>
  )
}

function AppWithProviders() {
  return (
    <CommandRouter<CommandRoutes> defaultPage="/">
      <App />
    </CommandRouter>
  )
}

export default AppWithProviders
