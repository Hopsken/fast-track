import { useMemo, useState } from 'react'

import {
  FormItem,
  FormLabel,
  FormControl,
  FormDescription
} from '~/components/ui/form'
import { FormField } from '~/components/ui/forms'
import { useJiraConfig } from '~/hooks/useStorageSettings'

export function ApiConfiguration() {
  const { apiToken, userEmail, updateJiraConfig, clearJiraConfig } =
    useJiraConfig()

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
    if (
      // eslint-disable-next-line no-alert
      confirm(
        'Are you sure you want to clear your API credentials? This will disable API-based ticket collection.'
      )
    ) {
      clearJiraConfig()
    }
  }

  return (
    <FormField
      size="lg"
      title="API Authentication"
      description="Configure your Atlassian credentials for reliable ticket data collection">
      <div className="w-full space-y-4">
        {/* User Email */}
        <FormItem>
          <FormLabel htmlFor="user-email">Atlassian Account Email</FormLabel>
          <FormControl>
            <input
              id="user-email"
              type="email"
              placeholder="your-email@example.com"
              value={userEmail}
              onChange={(e) => setUserEmail(e.target.value)}
              className={`input input-bordered w-full ${
                !isValidEmail ? 'input-error' : ''
              }`}
              aria-invalid={!isValidEmail}
              aria-describedby={!isValidEmail ? 'email-error' : undefined}
            />
          </FormControl>
          {userEmail && !isValidEmail && (
            <p
              id="email-error"
              className="mt-1 text-xs text-red-500"
              role="alert">
              Please enter a valid email address
            </p>
          )}
        </FormItem>

        {/* API Token */}
        <FormItem>
          <FormLabel htmlFor="api-token">
            API Token
            {apiToken && (
              <span className="ml-2 text-xs text-green-600">
                (***{apiToken.slice(-4)})
              </span>
            )}
          </FormLabel>
          <FormControl>
            <div className="relative">
              <input
                id="api-token"
                type={showToken ? 'text' : 'password'}
                placeholder="Enter your API token"
                value={apiToken}
                onChange={(e) => setApiToken(e.target.value)}
                className="input input-bordered w-full pr-20"
                aria-describedby="token-help"
              />
              <button
                type="button"
                onClick={() => setShowToken(!showToken)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-sm text-gray-500 hover:text-gray-700"
                aria-label={showToken ? 'Hide API token' : 'Show API token'}>
                {showToken ? 'Hide' : 'Show'}
              </button>
            </div>
          </FormControl>
          <FormDescription id="token-help">
            Your API token is stored locally and never transmitted to external
            servers
          </FormDescription>
        </FormItem>

        {/* Clear Credentials Button */}
        {(apiToken || userEmail) && (
          <button
            onClick={handleClearCredentials}
            className="w-full rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700 transition-colors hover:bg-red-100"
            aria-label="Clear all API credentials">
            Clear API Credentials
          </button>
        )}
      </div>
    </FormField>
  )
}
