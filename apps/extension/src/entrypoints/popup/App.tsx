import { useState, useEffect, useCallback, useRef } from 'react'
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
import { getCurrentShortcut, formatShortcut } from '~/utils/shortcuts'

function App() {
  const { searchQuery, handleSearch, error, isAuthConfigured } =
    useTicketSearch()

  const [shortcutText, setShortcutText] = useState('Alt+J to search')
  const footerError = isAuthConfigured ? error : undefined
  const searchInputRef = useRef<HTMLInputElement>(null)

  // Initialize search orchestration
  useEffect(() => {
    getTicketService().suggestions.refresh('startup')
  }, [])

  useEffect(() => {
    const loadShortcut = async () => {
      try {
        const shortcut = await getCurrentShortcut()
        setShortcutText(`${formatShortcut(shortcut)} to search`)
      } catch (error) {
        console.warn('Failed to load shortcut for popup:', error)
      }
    }

    loadShortcut()
  }, [])

  const handleTicketClick = useCallback((ticket: JiraTicket) => {
    // Open the ticket in a new tab
    openInNewTab(ticket.url)

    // Close the popup
    window.close()
  }, [])

  const handleClearSearch = useCallback(() => {
    handleSearch('')
  }, [handleSearch])

  const handleOpenOptionsPage = () => {
    openOptionsPage()
    window.close()
  }

  const handleInputChange = useCallback(
    (value: string) => {
      handleSearch(value)
    },
    [handleSearch]
  )

  return (
    <div className="linear">
      <Command
        value={searchQuery}
        onValueChange={handleInputChange}
        shouldFilter={false}>
        <ErrorBoundary
          onError={(commandError, errorInfo) => {
            console.error('🚨 TicketSearchBox Error:', commandError)
            console.error('🚨 Error Info:', errorInfo)
          }}>
          <TicketSearchBox
            value={searchQuery}
            onChange={handleInputChange}
            onClear={handleClearSearch}
            onTicketClick={handleTicketClick}
            inputRef={searchInputRef}
            placeholder="Search tickets..."
          />
        </ErrorBoundary>

        <ErrorBoundary>
          <TicketList
            showNotConfiguredNotice={!isAuthConfigured}
            onOpenOptionsPage={handleOpenOptionsPage}
            onTicketClick={handleTicketClick}
          />
        </ErrorBoundary>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '12px 16px'
          }}>
          <span data-cmdk-linear-badge aria-live="polite">
            {footerError ?? shortcutText}
          </span>
          <div data-cmdk-linear-shortcuts aria-hidden="true">
            <kbd>Enter</kbd>
            <kbd>Esc</kbd>
          </div>
          <DevOnly>
            <DevRefreshSuggestionsButton />
          </DevOnly>
        </div>
      </Command>
    </div>
  )
}

export default App
