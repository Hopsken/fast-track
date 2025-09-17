import { useState, useEffect } from 'react'

import { oauthManager } from '@/lib/jira/oauth-manager'
import {
  ApiConfiguration,
  ApiConnectionStatus,
  JiraHostInput,
  TokenGenerationGuide
} from '~/components/api'

import { OAuthConfiguration } from '../sections/OAuthConfiguration'
import { ShortcutManagement } from '../sections/QuickAccess/ShortcutManagement'

export function GeneralTab() {
  const [authType, setAuthType] = useState<'api_key' | 'oauth' | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadAuthType()
  }, [])

  const loadAuthType = async () => {
    try {
      setIsLoading(true)
      const currentAuthType = await oauthManager.getAuthType()
      setAuthType(currentAuthType || 'oauth') // Default to OAuth
    } catch (error) {
      console.error('Failed to load auth type:', error)
      setAuthType('oauth') // Default to OAuth
    } finally {
      setIsLoading(false)
    }
  }

  const handleSwitchAuthType = async (newAuthType: 'api_key' | 'oauth') => {
    await oauthManager.setAuthType(newAuthType)
    loadAuthType()
  }

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="animate-pulse">
          <div className="mb-4 h-6 w-1/4 rounded bg-gray-200"></div>
          <div className="space-y-4">
            <div className="h-10 rounded bg-gray-200"></div>
            <div className="h-10 rounded bg-gray-200"></div>
            <div className="h-20 rounded bg-gray-200"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="mb-4 text-lg font-semibold text-gray-900">
          Jira Connection
        </h2>
        <div className="space-y-6">
          {/* Authentication Method Selector */}
          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <h3 className="mb-3 text-sm font-medium text-gray-900">
              Authentication Method
            </h3>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="authType"
                  value="oauth"
                  checked={authType === 'oauth'}
                  onChange={() => handleSwitchAuthType('oauth')}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">
                  OAuth (Recommended)
                </span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="authType"
                  value="api_key"
                  checked={authType === 'api_key'}
                  onChange={() => handleSwitchAuthType('api_key')}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">API Key</span>
              </label>
            </div>
          </div>

          <ApiConnectionStatus />
          <JiraHostInput />

          {/* Show appropriate configuration based on auth type */}
          {authType === 'oauth' ? (
            <OAuthConfiguration
              onSwitchToApiKey={() => handleSwitchAuthType('api_key')}
            />
          ) : (
            <>
              <ApiConfiguration />
              <TokenGenerationGuide />
            </>
          )}
        </div>
      </div>

      <div>
        <h2 className="mb-4 text-lg font-semibold text-gray-900">
          Quick Access
        </h2>
        <div className="space-y-6">
          <ShortcutManagement />
        </div>
      </div>
    </div>
  )
}
