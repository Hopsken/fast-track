/**
 * Component for API token and email configuration
 */

import { useState } from 'react'
import { HiEye, HiEyeOff, HiMail, HiKey } from 'react-icons/hi'

import { useJiraConfig } from '~/hooks/useStorageSettings'

export function ApiConfiguration() {
  const { apiToken, userEmail, updateJiraConfig } = useJiraConfig()
  const [showToken, setShowToken] = useState(false)
  const [localEmail, setLocalEmail] = useState(userEmail)
  const [localToken, setLocalToken] = useState(apiToken)

  const handleEmailSave = () => {
    if (localEmail !== userEmail) {
      updateJiraConfig({ email: localEmail })
    }
  }

  const handleTokenSave = () => {
    if (localToken !== apiToken) {
      updateJiraConfig({ token: localToken })
    }
  }

  const handleEmailKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleEmailSave()
    }
  }

  const handleTokenKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleTokenSave()
    }
  }

  return (
    <div className="space-y-6">
      {/* Email Configuration */}
      <div>
        <label
          htmlFor="user-email"
          className="mb-2 block text-sm font-medium text-gray-700">
          Email Address
        </label>
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <HiMail className="h-5 w-5 text-gray-400" />
          </div>
          <input
            id="user-email"
            type="email"
            value={localEmail}
            onChange={(e) => setLocalEmail(e.target.value)}
            onKeyPress={handleEmailKeyPress}
            onBlur={handleEmailSave}
            placeholder="your-email@company.com"
            className="block w-full rounded-md border border-gray-300 py-2 pl-10 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
        </div>
        <p className="mt-1 text-xs text-gray-500">
          The email address associated with your Jira account
        </p>
      </div>

      {/* API Token Configuration */}
      <div>
        <label
          htmlFor="api-token"
          className="mb-2 block text-sm font-medium text-gray-700">
          API Token
        </label>
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <HiKey className="h-5 w-5 text-gray-400" />
          </div>
          <input
            id="api-token"
            type={showToken ? 'text' : 'password'}
            value={localToken}
            onChange={(e) => setLocalToken(e.target.value)}
            onKeyPress={handleTokenKeyPress}
            onBlur={handleTokenSave}
            placeholder="Enter your Jira API token"
            className="block w-full rounded-md border border-gray-300 py-2 pr-10 pl-10 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
          <button
            type="button"
            onClick={() => setShowToken(!showToken)}
            className="absolute inset-y-0 right-0 flex items-center pr-3">
            {showToken ? (
              <HiEyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
            ) : (
              <HiEye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
            )}
          </button>
        </div>
        <p className="mt-1 text-xs text-gray-500">
          Your personal API token from Jira (not your password)
        </p>
      </div>

      {/* Configuration Status */}
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
        <div className="flex items-start gap-2">
          <div className="text-blue-600">
            <svg
              className="mt-0.5 h-5 w-5"
              fill="currentColor"
              viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="text-sm text-blue-700">
            <p className="mb-1 font-medium">Secure Token Storage</p>
            <p>
              Your API token is stored locally in your browser and never sent to
              external servers except Jira.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
