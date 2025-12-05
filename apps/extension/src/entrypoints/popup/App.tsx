import { useEffect } from 'react'
import { Command } from '@internal/ui/components/command'

import { CommandRoute, CommandRouter } from '@/components/CommandRouter'
import { getTicketService } from '@/services/ticket-service'
import { DevOnly } from '~/components/DevOnly'
import { DevRefreshSuggestionsButton } from '~/components/DevRefreshSuggestionsButton'
import { ErrorBoundary } from '~/components/ErrorBoundary'
import { TicketSearchBox } from '~/components/search'
import { useTicketSearch } from '~/hooks/useTicketSearch'

import { TicketActionsMenu, SearchResultMenu, CommandRoutes } from './menus'

function App() {
  const { searchQuery, handleSearch, error, isAuthConfigured } =
    useTicketSearch()

  const footerError = isAuthConfigured ? error : undefined

  // Initialize search orchestration
  useEffect(() => {
    getTicketService().suggestions.refresh('startup')
  }, [])

  return (
    <CommandRouter<CommandRoutes> defaultPage="/">
      <div className="linear w-[640px]">
        <Command loop shouldFilter={false}>
          <TicketSearchBox value={searchQuery} onValueChange={handleSearch} />

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
    </CommandRouter>
  )
}

export default App
