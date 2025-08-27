import { useState } from 'react'
import { HiCog, HiCollection } from 'react-icons/hi'
import { useTicketSearch } from '~/hooks/useTicketSearch'
import { TicketSearchBox } from '~/components/TicketSearchBox'
import { TicketList } from '~/components/TicketList'
import { JiraTicket } from '~/storage'
import { openOptionsPage, openInNewTab } from '~/utils/broswer'
import '~/styles/style.css'

function App() {
  const {
    searchQuery,
    searchResults,
    searchHistory,
    isLoading,
    handleSearch,
    setSearchQuery
  } = useTicketSearch()

  const [showHistory, setShowHistory] = useState(false)

  const handleTicketClick = (ticket: JiraTicket) => {
    // Open the ticket in a new tab
    openInNewTab(ticket.url)
    
    // Close the popup
    window.close()
  }

  const handleHistoryItemClick = (query: string) => {
    handleSearch(query)
    setShowHistory(false)
  }

  const handleClearSearch = () => {
    setSearchQuery('')
    setShowHistory(false)
  }

  const handleOpenOptionsPage = () => {
    openOptionsPage()
    window.close()
  }

  const handleInputChange = (value: string) => {
    handleSearch(value)
    setShowHistory(false)
  }

  return (
    <div className="w-96 max-h-[600px] bg-white">
      {/* Search Section */}
      <div className="pl-2 py-2">
        <TicketSearchBox
          value={searchQuery}
          onChange={handleInputChange}
          onClear={handleClearSearch}
          placeholder="Search by ticket key, summary, or assignee..."
          autoFocus={true}
        />

        {/* Search History */}
        {showHistory && searchHistory.length > 0 && (
          <div className="mt-3 p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-gray-600">Recent Searches</span>
              <button
                onClick={() => setShowHistory(false)}
                className="text-xs text-gray-400 hover:text-gray-600"
              >
                Hide
              </button>
            </div>
            <div className="flex flex-wrap gap-1">
              {searchHistory.slice(0, 6).map((query, index) => (
                <button
                  key={index}
                  onClick={() => handleHistoryItemClick(query)}
                  className="px-2 py-1 text-xs text-gray-600 bg-white border border-gray-200 rounded hover:bg-gray-100 transition-colors"
                >
                  {query}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="border-t border-gray-100" />

      {/* Results Section */}
      <div className="px-4 py-3">
        {searchQuery || searchResults.length > 0 ? (
          <div>
            {searchQuery && (
              <div className="flex items-center gap-2 mb-3">
                <HiCollection className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-600">
                  {isLoading ? 'Searching...' : `${searchResults.length} results found`}
                </span>
              </div>
            )}
            
            <TicketList
              tickets={searchResults}
              searchQuery={searchQuery}
              isLoading={isLoading}
              onTicketClick={handleTicketClick}
            />
          </div>
        ) : (
          <div className="text-center py-8">
            <HiCollection className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h2 className="text-lg font-medium text-gray-800 mb-2">Find Your Tickets Fast</h2>
            <p className="text-sm text-gray-600 mb-4 max-w-xs">
              Search through your recently viewed Jira tickets by key, summary, assignee, or status.
            </p>
            <div className="text-xs text-gray-500 space-y-1">
              <p>" Visit Jira boards to collect ticket data</p>
              <p>" Use keyboard shortcuts for quick navigation</p>
              <p>" Access settings for more customization</p>
            </div>
          </div>
        )}
      </div>

      {/* Quick Actions Footer */}
      <div className="border-t border-gray-100 px-4 py-2 bg-gray-50">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>Press ⌘+K to focus search</span>
          <button
            onClick={handleOpenOptionsPage}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded transition-colors"
            title="Settings"
          >
            <HiCog className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default App