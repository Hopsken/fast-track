import React from 'react'
import {
  HiShieldCheck as Shield,
  HiBolt as Lightning,
  HiArrowPath as Sync
} from 'react-icons/hi2'

export interface JiraConnectionSetupProps {
  onConnect: () => void
  isLoading: boolean
}

export const JiraConnectionSetup: React.FC<JiraConnectionSetupProps> = ({
  onConnect,
  isLoading = false
}) => {
  return (
    <div className="rounded-lg border bg-gray-200 p-4">
      {/* Header */}
      <div className="mb-6 text-center">
        <h2 className="mb-2 text-xl font-semibold text-gray-900">
          Connect to Jira
        </h2>
        <p className="text-sm text-gray-600">
          Get started by connecting your Jira workspace to unlock enhanced
          productivity features
        </p>
      </div>

      {/* Features */}
      <div className="mb-6 flex justify-center gap-6">
        {/* Secure Login */}
        <div className="flex flex-col items-center text-center">
          <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
            <Shield className="h-5 w-5 text-green-600" />
          </div>
          <span className="text-xs font-medium text-gray-700">
            Secure Login
          </span>
        </div>

        {/* Quick Setup */}
        <div className="flex flex-col items-center text-center">
          <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
            <Lightning className="h-5 w-5 text-blue-600" />
          </div>
          <span className="text-xs font-medium text-gray-700">Quick Setup</span>
        </div>

        {/* Stay Synced */}
        <div className="flex flex-col items-center text-center">
          <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-purple-100">
            <Sync className="h-5 w-5 text-purple-600" />
          </div>
          <span className="text-xs font-medium text-gray-700">Stay Synced</span>
        </div>
      </div>

      {/* Connect Button */}
      <div className="mb-4">
        <button
          onClick={onConnect}
          disabled={isLoading}
          className="w-full rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
          {isLoading ? (
            <div className="flex items-center justify-center gap-2">
              <svg
                className="h-4 w-4 animate-spin"
                fill="none"
                viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Connecting...
            </div>
          ) : (
            'Connect to Jira'
          )}
        </button>
      </div>

      {/* Disclaimer */}
      <p className="text-center text-xs text-gray-500">
        You&apos;ll be redirected to Atlassian to select your workspace and
        authorize the extension. No passwords are stored.
      </p>
    </div>
  )
}
