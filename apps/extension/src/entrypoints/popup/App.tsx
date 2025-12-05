import { useEffect, useCallback } from 'react'
import { Command } from '@internal/ui/components/command'

import { getTicketService } from '@/services/ticket-service'
import { JiraTicket } from '@/types'
import { DevOnly } from '~/components/DevOnly'
import { DevRefreshSuggestionsButton } from '~/components/DevRefreshSuggestionsButton'
import { ErrorBoundary } from '~/components/ErrorBoundary'
import { TicketSearchBox } from '~/components/search'
import { TicketList } from '~/components/tickets'
import { useTicketSearch } from '~/hooks/useTicketSearch'
import { openOptionsPage, openInNewTab } from '~/utils/extension'

function App() {
  const { searchQuery, handleSearch, error, isAuthConfigured } =
    useTicketSearch()

  const footerError = isAuthConfigured ? error : undefined

  // Initialize search orchestration
  useEffect(() => {
    getTicketService().suggestions.refresh('startup')
  }, [])

  const handleTicketClick = useCallback((ticket: JiraTicket) => {
    // Open the ticket in a new tab
    openInNewTab(ticket.url)

    // Close the popup
    window.close()
  }, [])

  const handleOpenOptionsPage = () => {
    openOptionsPage()
    window.close()
  }

  return (
    <div className="linear w-[640px]">
      <Command loop shouldFilter={false}>
        <ErrorBoundary
          onError={(commandError, errorInfo) => {
            console.error('🚨 TicketSearchBox Error:', commandError)
            console.error('🚨 Error Info:', errorInfo)
          }}>
          <TicketSearchBox value={searchQuery} onValueChange={handleSearch} />
        </ErrorBoundary>

        <ErrorBoundary>
          <TicketList
            showNotConfiguredNotice={!isAuthConfigured}
            onOpenOptionsPage={handleOpenOptionsPage}
            onTicketClick={handleTicketClick}
          />
        </ErrorBoundary>

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

export default App
