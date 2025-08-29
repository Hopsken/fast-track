import { useState } from 'react'
import { HiCog, HiCollection } from 'react-icons/hi'
import { useTicketSearch } from '~/hooks/useTicketSearch'
import { TicketSearchBox } from '~/components/search'
import { TicketList } from '~/components/tickets'
import { JiraTicket } from '~/storage'
import { openOptionsPage, openInNewTab } from '~/utils/extension'
import '~/assets/styles/main.css'

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
      <div className="p-1 border-b border-gray-100">
        <TicketSearchBox
          value={searchQuery}
          onChange={handleInputChange}
          onClear={handleClearSearch}
          placeholder="Search tickets..."
          autoFocus={true}
        />
      </div>

      {/* Results Section */}
      <div className="py-1">
        <TicketList
          tickets={searchResults}
          searchQuery={searchQuery}
          isLoading={isLoading}
          onTicketClick={handleTicketClick}
        />
      </div>

      {/* Quick Actions Footer */}
      <div className="border-t border-gray-100 px-3 py-2 bg-gray-50">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>⌘K to search</span>
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