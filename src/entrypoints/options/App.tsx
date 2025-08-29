import { useMemo, useState } from "react"
import { useStorage, StorageKey } from "~/storage"
import { useVersion } from "~/hooks/useVersion"
import { FieldControl } from "~/components/ui/forms"
import { DarkModeControl } from "~/components/ui/forms"
import { ToggleField } from "~/components/ui/forms"
import { HiCog, HiColorSwatch, HiSearch, HiInformationCircle } from "react-icons/hi"

import logoUrl from "~/assets/logo.png"

import "~/assets/styles/main.css"

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
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Jira Connection</h2>
                  <div className="space-y-6">
                    <ApiConnectionStatus />
                    <JiraHostInput />
                    <ApiConfiguration />
                    <TokenGenerationGuide />
                  </div>
                </div>
                
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Access</h2>
                  <div className="space-y-6">
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
    <FieldControl
      size="lg"
      title="Jira URL"
      description="Your Jira instance URL for API access and quick navigation"
    >
      <div className="w-full space-y-2">
        <input
          type="text"
          placeholder="https://your-domain.atlassian.net"
          value={jiraHost}
          onChange={(e) => setJiraHost(e.target.value)}
          className={`input input-lg input-bordered w-full ${
            !isValid ? "input-error" : ""
          }`}
        />
        {jiraHost && !isValid && (
          <p className="text-xs text-red-500 mt-1">Please enter a valid URL starting with http</p>
        )}
        <p className="text-xs text-gray-500">
          Used for API integration and quick ticket access via omnibox:{" "}
          <kbd className="kbd kbd-sm">jira</kbd> +{" "}
          <kbd className="kbd kbd-sm">Space</kbd> + ticket ID
        </p>
      </div>
    </FieldControl>
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

// API Integration Components
function ApiConnectionStatus() {
  const [jiraUrl] = useStorage(StorageKey.JiraUrl, '')
  const [apiToken] = useStorage(StorageKey.JiraApiToken, '')
  const [userEmail] = useStorage(StorageKey.JiraUserEmail, '')
  const [connectionStatus, setConnectionStatus] = useState<'unknown' | 'testing' | 'success' | 'error'>('unknown')
  const [statusMessage, setStatusMessage] = useState('')

  const isConfigured = Boolean(jiraUrl && apiToken && userEmail)

  const testConnection = async () => {
    if (!isConfigured) {
      setConnectionStatus('error')
      setStatusMessage('Please configure all required fields first')
      return
    }

    setConnectionStatus('testing')
    setStatusMessage('Testing connection...')

    try {
      const { JiraApiService } = await import('~/lib/jira')
      const apiService = new JiraApiService({
        baseUrl: jiraUrl,
        apiToken,
        email: userEmail
      })

      const success = await apiService.testConnection()
      
      if (success) {
        setConnectionStatus('success')
        setStatusMessage('Connection successful! API integration is working.')
      } else {
        setConnectionStatus('error')
        setStatusMessage('Connection failed. Please check your credentials.')
      }
    } catch (error) {
      setConnectionStatus('error')
      setStatusMessage(`Connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'success': return 'text-green-600 bg-green-50 border-green-200'
      case 'error': return 'text-red-600 bg-red-50 border-red-200'
      case 'testing': return 'text-blue-600 bg-blue-50 border-blue-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getStatusIcon = () => {
    switch (connectionStatus) {
      case 'success': return '✅'
      case 'error': return '❌'
      case 'testing': return '🔄'
      default: return isConfigured ? '⚠️' : '❓'
    }
  }

  return (
    <FieldControl
      size="lg"
      title="Connection Status"
      description="Current status of your Jira API integration"
    >
      <div className="w-full space-y-3">
        <div className={`p-3 rounded-lg border text-sm ${getStatusColor()}`}>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">{getStatusIcon()}</span>
            <span className="font-medium">
              {isConfigured ? 'API Configured' : 'Not Configured'}
            </span>
          </div>
          {statusMessage && (
            <div className="text-xs opacity-80">{statusMessage}</div>
          )}
        </div>
        
        <button
          onClick={testConnection}
          disabled={!isConfigured || connectionStatus === 'testing'}
          className={`w-full px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
            isConfigured && connectionStatus !== 'testing'
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-200 text-gray-500 cursor-not-allowed'
          }`}
        >
          {connectionStatus === 'testing' ? 'Testing Connection...' : 'Test Connection'}
        </button>
      </div>
    </FieldControl>
  )
}

function ApiConfiguration() {
  const [apiToken, setApiToken] = useStorage(StorageKey.JiraApiToken, '')
  const [userEmail, setUserEmail] = useStorage(StorageKey.JiraUserEmail, '')
  
  const [showToken, setShowToken] = useState(false)
  
  const isValidEmail = useMemo(() => {
    return userEmail === '' || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userEmail)
  }, [userEmail])

  const handleClearCredentials = () => {
    if (confirm('Are you sure you want to clear your API credentials? This will disable API-based ticket collection.')) {
      setApiToken('')
      setUserEmail('')
    }
  }

  return (
    <FieldControl
      size="lg"
      title="API Authentication"
      description="Configure your Atlassian credentials for reliable ticket data collection"
    >
      <div className="w-full space-y-4">
        {/* User Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Atlassian Account Email
          </label>
          <input
            type="email"
            placeholder="your-email@example.com"
            value={userEmail}
            onChange={(e) => setUserEmail(e.target.value)}
            className={`input input-bordered w-full ${
              !isValidEmail ? 'input-error' : ''
            }`}
          />
          {userEmail && !isValidEmail && (
            <p className="text-xs text-red-500 mt-1">Please enter a valid email address</p>
          )}
        </div>

        {/* API Token */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            API Token
            {apiToken && (
              <span className="ml-2 text-xs text-green-600">
                (***{apiToken.slice(-4)})
              </span>
            )}
          </label>
          <div className="relative">
            <input
              type={showToken ? 'text' : 'password'}
              placeholder="Enter your API token"
              value={apiToken}
              onChange={(e) => setApiToken(e.target.value)}
              className="input input-bordered w-full pr-20"
            />
            <button
              type="button"
              onClick={() => setShowToken(!showToken)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm text-gray-500 hover:text-gray-700"
            >
              {showToken ? 'Hide' : 'Show'}
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Your API token is stored locally and never transmitted to external servers
          </p>
        </div>

        {/* Clear Credentials Button */}
        {(apiToken || userEmail) && (
          <button
            onClick={handleClearCredentials}
            className="w-full px-4 py-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
          >
            Clear API Credentials
          </button>
        )}
      </div>
    </FieldControl>
  )
}

function TokenGenerationGuide() {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <FieldControl
      size="lg"
      title="How to Generate API Token"
      description="Step-by-step guide to create your Atlassian API token"
    >
      <div className="w-full">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full px-4 py-2 text-sm text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors flex items-center justify-between"
        >
          <span>Show Setup Instructions</span>
          <span className={`transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
            ↓
          </span>
        </button>

        {isExpanded && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg text-sm space-y-4">
            <div className="space-y-3">
              <div className="font-medium text-gray-800">📝 Generate Your API Token:</div>
              
              <ol className="list-decimal list-inside space-y-2 text-gray-700 ml-4">
                <li>
                  Go to{' '}
                  <a 
                    href="https://id.atlassian.com/manage-profile/security/api-tokens" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 underline"
                  >
                    Atlassian Account Settings
                  </a>
                </li>
                <li>Click "Create API token"</li>
                <li>Enter a label (e.g., "Jira Boost Extension")</li>
                <li>Click "Create"</li>
                <li>Copy the token immediately (you won't see it again!)</li>
                <li>Paste it in the "API Token" field above</li>
              </ol>
            </div>

            <div className="border-t pt-3 space-y-2">
              <div className="font-medium text-gray-800">🔐 Security Best Practices:</div>
              <ul className="list-disc list-inside space-y-1 text-gray-600 ml-4 text-xs">
                <li>Store your token securely (like a password)</li>
                <li>Never share your token with others</li>
                <li>Revoke unused tokens in your Atlassian account</li>
                <li>Your token works only with your Jira instance</li>
              </ul>
            </div>

            <div className="border-t pt-3 space-y-2">
              <div className="font-medium text-gray-800">✨ Benefits of API Integration:</div>
              <ul className="list-disc list-inside space-y-1 text-gray-600 ml-4 text-xs">
                <li>More reliable than web scraping</li>
                <li>Access to all issue fields and metadata</li>
                <li>Faster data collection</li>
                <li>Works even when Jira UI changes</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </FieldControl>
  )
}

export default OptionsPage
