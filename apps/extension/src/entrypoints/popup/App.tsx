import { useState, useEffect, useCallback } from 'react'
import { HiCog } from 'react-icons/hi'

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

import '~/assets/styles/main.css'

function App() {
  const { searchQuery, handleSearch, error, isAuthConfigured } =
    useTicketSearch()

  const [shortcutText, setShortcutText] = useState('Alt+J to search')
  const footerError = isAuthConfigured ? error : undefined

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
    <div className="animate-in fade-in zoom-in-95 max-h-[600px] w-[36rem] bg-white shadow-lg duration-200 ease-out">
      {/* Search Section */}
      <div className="animate-in slide-in-from-top border-b border-gray-100 p-3 delay-75 duration-300">
        <ErrorBoundary
          onError={(error, errorInfo) => {
            console.error('🚨 TicketSearchBox Error:', error)
            console.error('🚨 Error Info:', errorInfo)
          }}>
          <TicketSearchBox
            value={searchQuery}
            onChange={handleInputChange}
            onClear={handleClearSearch}
            onTicketClick={handleTicketClick}
            placeholder="Search tickets..."
          />
        </ErrorBoundary>
      </div>

      {/* Results Section */}
      <div className="animate-in fade-in overflow-hidden delay-150 duration-400">
        <ErrorBoundary>
          <TicketList
            showNotConfiguredNotice={!isAuthConfigured}
            onOpenOptionsPage={handleOpenOptionsPage}
            onTicketClick={handleTicketClick}
          />
        </ErrorBoundary>
      </div>

      {/* Quick Actions Footer */}
      <div className="animate-in slide-in-from-bottom border-t border-gray-100 bg-gray-50 px-4 py-3 delay-200 duration-300">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-2 truncate">
            {footerError ? (
              <>
                <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-amber-100 text-amber-600">
                  !
                </span>
                <span className="truncate font-semibold text-amber-700">
                  {footerError}
                </span>
              </>
            ) : (
              <span className="font-medium transition-colors duration-200">
                {shortcutText}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <DevOnly>
              <DevRefreshSuggestionsButton />
            </DevOnly>
            <button
              onClick={handleOpenOptionsPage}
              className="rounded-md p-2 text-gray-400 transition-all duration-200 ease-out hover:scale-105 hover:bg-gray-200 hover:text-gray-600 active:scale-95"
              title="Settings">
              <HiCog className="h-4 w-4 transition-transform duration-200" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
