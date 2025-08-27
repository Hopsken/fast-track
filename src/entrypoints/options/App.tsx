import { useMemo, useState } from "react"
import { useStorage, StorageKey } from "~/storage"
import { useVersion } from "~/hooks/useVersion"
import { FieldControl } from "~/components/FieldControl"
import { DarkModeControl } from "~/components/DarkModeControl"
import { ToggleField } from "~/components/ToggleField"
import { HiCog, HiColorSwatch, HiSearch, HiInformationCircle } from "react-icons/hi"

import logoUrl from "~/assets/logo.png"

import "~/styles/style.css"

function OptionsPage() {
  const version = useVersion()
  const [activeTab, setActiveTab] = useState('general')
  const [ticketsData] = useStorage(StorageKey.TicketsData, [])

  const tabs = [
    { id: 'general', label: 'General', icon: HiCog },
    { id: 'display', label: 'Display', icon: HiColorSwatch },
    { id: 'search', label: 'Search & Data', icon: HiSearch },
    { id: 'about', label: 'About', icon: HiInformationCircle },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-8 px-6">
        {/* Header */}
        <header className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <img src={logoUrl} className="w-12 h-12" alt="Jira Boost" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Jira Boost</h1>
              <p className="text-gray-600">v{version} Settings</p>
            </div>
          </div>
        </header>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                )
              })}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'general' && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Connection Settings</h2>
                  <div className="space-y-6">
                    <JiraHostInput />
                    <PrimaryIssueKey />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'display' && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Theme & Display</h2>
                  <div className="space-y-6">
                    <DarkModeControl />
                    <ToggleField
                      title="Highlight issue color"
                      description="Highlight background color of issues in Jira boards"
                      storageKey={StorageKey.ColorCard}
                    />
                    <ToggleField
                      title="Enable browser fullscreen"
                      description="Enter browser-level fullscreen when clicking the fullscreen button"
                      storageKey={StorageKey.AutoFullScreen}
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'search' && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Search & Data Management</h2>
                  <div className="space-y-6">
                    <SearchDataOverview ticketCount={ticketsData.length} />
                    <SearchDataActions />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'about' && (
              <div className="space-y-8">
                <AboutSection version={version} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function PrimaryIssueKey() {
  const [issueKey, setIssueKey] = useStorage(
    StorageKey.PrimaryIssueKeyPrefix,
    ""
  )

  return (
    <FieldControl
      size="lg"
      title="Primary Issue Prefix"
      description="This key will be used when you omit issue prefix by just typing issue number using quick jump.">
      <input
        type="text"
        placeholder="TICKET-"
        value={issueKey}
        onChange={(e) => setIssueKey(e.target.value)}
        className={`input input-lg input-bordered w-full min-w-`}
      />
    </FieldControl>
  )
}

function JiraHostInput() {
  const [jiraHost, setJiraHost] = useStorage(StorageKey.JiraUrl, "")

  const isValid = useMemo(() => jiraHost.startsWith("http"), [jiraHost])

  return (
    <div className="flex flex-col space-y-2">
      <div className="field flex items-center">
        <div className="flex flex-1 flex-col space-y-1">
          <div className={"text-lg"}>Jira URL</div>
          <div className={`text-base `}>
            Example: https://acme.atlassian.net
          </div>
        </div>
      </div>
      <input
        type="text"
        placeholder="Example: https://acme.atlassian.net/jira"
        value={jiraHost}
        onChange={(e) => setJiraHost(e.target.value)}
        className={`input input-lg input-bordered w-full ${
          !isValid ? "input-error" : ""
        }`}
      />
      <span className="text-sm text-gray-500">
        You can quickly jump to a ticket by typing the keyword{" "}
        <kbd className="kbd kbd-sm">jira</kbd> +{" "}
        <kbd className="kbd kbd-sm">Space</kbd> + ticket ID in the address bar.
      </span>
    </div>
  )
}

function SearchDataOverview({ ticketCount }: { ticketCount: number }) {
  const [searchHistory] = useStorage(StorageKey.SearchHistory, [])
  const [viewHistory] = useStorage(StorageKey.TicketViewHistory, [])

  return (
    <FieldControl
      size="lg"
      title="Data Overview"
      description="Current status of your ticket data collection"
    >
      <div className="grid grid-cols-3 gap-4 text-center">
        <div className="p-3 bg-blue-50 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">{ticketCount}</div>
          <div className="text-sm text-gray-600">Collected Tickets</div>
        </div>
        <div className="p-3 bg-green-50 rounded-lg">
          <div className="text-2xl font-bold text-green-600">{searchHistory.length}</div>
          <div className="text-sm text-gray-600">Search History</div>
        </div>
        <div className="p-3 bg-purple-50 rounded-lg">
          <div className="text-2xl font-bold text-purple-600">{viewHistory.length}</div>
          <div className="text-sm text-gray-600">View Records</div>
        </div>
      </div>
    </FieldControl>
  )
}

function SearchDataActions() {
  const [, setTicketsData] = useStorage(StorageKey.TicketsData, [])
  const [, setSearchHistory] = useStorage(StorageKey.SearchHistory, [])
  const [, setViewHistory] = useStorage(StorageKey.TicketViewHistory, [])

  const clearAllData = async () => {
    if (confirm('Are you sure you want to clear all collected ticket data? This cannot be undone.')) {
      await setTicketsData([])
      await setSearchHistory([])
      await setViewHistory([])
    }
  }

  const clearSearchHistory = async () => {
    if (confirm('Clear search history?')) {
      await setSearchHistory([])
    }
  }

  return (
    <div className="space-y-4">
      <FieldControl
        size="lg"
        title="Data Management"
        description="Manage your collected ticket data and search history"
      >
        <div className="space-y-2">
          <button
            onClick={clearSearchHistory}
            className="w-full px-4 py-2 text-sm text-orange-700 bg-orange-50 border border-orange-200 rounded-lg hover:bg-orange-100 transition-colors"
          >
            Clear Search History
          </button>
          <button
            onClick={clearAllData}
            className="w-full px-4 py-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
          >
            Clear All Data
          </button>
        </div>
      </FieldControl>

      <FieldControl
        size="lg"
        title="Data Collection"
        description="Ticket data is automatically collected when you visit Jira boards and issues"
      >
        <div className="text-sm text-gray-600 space-y-2">
          <p>• Data is collected from board views, issue details, and search results</p>
          <p>• Up to 1,000 most recent tickets are stored</p>
          <p>• View counts and timestamps are tracked for relevance scoring</p>
          <p>• All data is stored locally in your browser</p>
        </div>
      </FieldControl>
    </div>
  )
}

function AboutSection({ version }: { version: string }) {
  return (
    <div className="space-y-6">
      <FieldControl
        size="lg"
        title="About Jira Boost v2"
        description="Enhanced Jira experience with quick ticket search"
      >
        <div className="text-sm text-gray-600 space-y-4">
          <p className="leading-relaxed">
            Version 2 introduces a completely redesigned popup focused on quick ticket search. 
            Now you can instantly find and access any Jira ticket you've recently viewed.
          </p>
          <div>
            <h4 className="font-medium text-gray-800 mb-3">New Features:</h4>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-1">•</span>
                <span>Lightning-fast ticket search with fuzzy matching</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-1">•</span>
                <span>Automatic data collection from Jira pages</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-1">•</span>
                <span>Keyboard navigation and shortcuts</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-1">•</span>
                <span>Relevance-based search results</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-1">•</span>
                <span>Clean, distraction-free interface</span>
              </li>
            </ul>
          </div>
        </div>
      </FieldControl>

      <FieldControl
        size="lg"
        title="Keyboard Shortcuts"
        description="Master the extension with these shortcuts"
      >
        <div className="space-y-3 text-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-6">
            <div className="flex justify-between items-center">
              <span className="text-gray-700">Open popup</span>
              <kbd className="kbd kbd-sm">Alt+J</kbd>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-700">Clear search</span>
              <kbd className="kbd kbd-sm">Esc</kbd>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-700">Navigate results</span>
              <kbd className="kbd kbd-sm">↑ ↓</kbd>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-700">Quick jump</span>
              <div className="flex gap-1">
                <kbd className="kbd kbd-sm text-xs">jira</kbd>
                <span className="text-gray-400">+</span>
                <kbd className="kbd kbd-sm">Space</kbd>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-700">Open ticket</span>
              <kbd className="kbd kbd-sm">Enter</kbd>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-700">Open settings</span>
              <kbd className="kbd kbd-sm">⚙️</kbd>
            </div>
          </div>
        </div>
      </FieldControl>

      <FieldControl
        size="lg"
        title="Version"
        description="Current extension version and build information"
      >
        <div className="flex items-center justify-between">
          <span className="text-sm font-mono text-gray-600">v{version}</span>
          <span className="text-xs text-gray-500">WXT Framework</span>
        </div>
      </FieldControl>
    </div>
  )
}

export default OptionsPage
