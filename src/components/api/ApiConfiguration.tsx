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
        <label htmlFor="user-email" className="block text-sm font-medium text-gray-700 mb-2">
          Email Address
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
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
            className="block w-full pl-10 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>
        <p className="text-xs text-gray-500 mt-1">
          The email address associated with your Jira account
        </p>
      </div>

      {/* API Token Configuration */}
      <div>
        <label htmlFor="api-token" className="block text-sm font-medium text-gray-700 mb-2">
          API Token
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <HiKey className="h-5 w-5 text-gray-400" />
          </div>
          <input
            id="api-token"
            type={showToken ? "text" : "password"}
            value={localToken}
            onChange={(e) => setLocalToken(e.target.value)}
            onKeyPress={handleTokenKeyPress}
            onBlur={handleTokenSave}
            placeholder="Enter your Jira API token"
            className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
          <button
            type="button"
            onClick={() => setShowToken(!showToken)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
          >
            {showToken ? (
              <HiEyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
            ) : (
              <HiEye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
            )}
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Your personal API token from Jira (not your password)
        </p>
      </div>

      {/* Configuration Status */}
      <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
        <div className="flex items-start gap-2">
          <div className="text-blue-600">
            <svg className="w-5 h-5 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="text-sm text-blue-700">
            <p className="font-medium mb-1">Secure Token Storage</p>
            <p>Your API token is stored locally in your browser and never sent to external servers except Jira.</p>
          </div>
        </div>
      </div>
    </div>
  )
}