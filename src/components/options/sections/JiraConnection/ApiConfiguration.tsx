import { useMemo, useState } from "react"
import { FieldControl } from "~/components/ui/forms"
import { useJiraConfig } from "~/hooks/useStorageSettings"

export function ApiConfiguration() {
  const { apiToken, userEmail, updateJiraConfig, clearJiraConfig } = useJiraConfig()

  const setApiToken = (value: string) => {
    updateJiraConfig({ token: value })
  }

  const setUserEmail = (value: string) => {
    updateJiraConfig({ email: value })
  }
  
  const [showToken, setShowToken] = useState(false)
  
  const isValidEmail = useMemo(() => {
    return userEmail === '' || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userEmail)
  }, [userEmail])

  const handleClearCredentials = () => {
    if (confirm('Are you sure you want to clear your API credentials? This will disable API-based ticket collection.')) {
      clearJiraConfig()
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