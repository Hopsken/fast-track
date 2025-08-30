import { useState, useEffect, useCallback } from "react"
import { HiCog, HiCollection } from "react-icons/hi"
import { useTicketSearch } from "~/hooks/useTicketSearch"
import { TicketSearchBox } from "~/components/search"
import { TicketList } from "~/components/tickets"
import { ErrorBoundary } from "~/components/ErrorBoundary"
import { JiraTicket } from "~/storage"
import { openOptionsPage, openInNewTab } from "~/utils/extension"
import { getCurrentShortcut, formatShortcut } from "~/utils/shortcuts"
import "~/assets/styles/main.css"

function App() {
  const { searchQuery, searchHistory, handleSearch, setSearchQuery } =
    useTicketSearch()

  const [showHistory, setShowHistory] = useState(false)
  const [shortcutText, setShortcutText] = useState("Alt+J to search")

  useEffect(() => {
    const loadShortcut = async () => {
      try {
        const shortcut = await getCurrentShortcut()
        setShortcutText(`${formatShortcut(shortcut)} to search`)
      } catch (error) {
        console.warn("Failed to load shortcut for popup:", error)
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

  const handleHistoryItemClick = (query: string) => {
    handleSearch(query)
    setShowHistory(false)
  }

  const handleClearSearch = useCallback(() => {
    setSearchQuery("")
    setShowHistory(false)
  }, [])

  const handleOpenOptionsPage = () => {
    openOptionsPage()
    window.close()
  }

  const handleInputChange = useCallback((value: string) => {
    handleSearch(value)
    setShowHistory(false)
  }, [])

  return (
    <div className="w-96 max-h-[600px] bg-white shadow-lg animate-in fade-in zoom-in-95 duration-200 ease-out">
      {/* Search Section */}
      <div className="p-3 border-b border-gray-100 animate-in slide-in-from-top duration-300 delay-75">
        <ErrorBoundary
          onError={(error, errorInfo) => {
            console.error("🚨 TicketSearchBox Error:", error)
            console.error("🚨 Error Info:", errorInfo)
          }}>
          <TicketSearchBox
            value={searchQuery}
            onChange={handleInputChange}
            onClear={handleClearSearch}
            onTicketClick={handleTicketClick}
            placeholder="Search tickets..."
            autoFocus={true}
          />
        </ErrorBoundary>
      </div>

      {/* Results Section */}
      <div className="overflow-hidden animate-in fade-in duration-400 delay-150">
        <ErrorBoundary>
          <TicketList onTicketClick={handleTicketClick} />
        </ErrorBoundary>
      </div>

      {/* Quick Actions Footer */}
      <div className="border-t border-gray-100 px-4 py-3 bg-gray-50 animate-in slide-in-from-bottom duration-300 delay-200">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span className="font-medium transition-colors duration-200">
            {shortcutText}
          </span>
          <button
            onClick={handleOpenOptionsPage}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-md transition-all duration-200 ease-out hover:scale-105 active:scale-95"
            title="Settings">
            <HiCog className="w-4 h-4 transition-transform duration-200" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default App
