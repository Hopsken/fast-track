import { useMemoizedFn } from 'ahooks'
import { useCallback, useRef, useState } from 'react'

import { useStorage } from '@/hooks'
import { getAuthService } from '@/services/auth-service'
import { AuthType } from '@/types'

import {
  JiraApiKeySetup,
  JiraConnectionCard,
  JiraConnectionSetup
} from '../auth'
import { ShortcutManagement } from '../sections/QuickAccess/ShortcutManagement'

export function GeneralTab() {
  const [authType, setAuthType] = useStorage('AuthType')
  const [userInfo] = useStorage('OAuthUserInfo')
  const [apiKeyAuth] = useStorage('ApiKeyAuth')
  const [jiraHost] = useStorage('JiraHost')
  const [connectingMethod, setConnectingMethod] = useState<AuthType | null>(
    null
  )
  const [error, setError] = useState<string | null>(null)

  const authService = useRef(getAuthService()).current

  const handleSelectAuthType = useCallback(
    (next: AuthType) => {
      setError(null)
      setAuthType(next)
    },
    [setAuthType]
  )

  const handleConnect = useMemoizedFn(async () => {
    setConnectingMethod('oauth')
    setError(null)
    try {
      setAuthType('oauth')
      const nextUrl = await authService.connect()
      window.open(nextUrl, '_blank')
    } catch (error) {
      console.error('Error connecting to Jira:', error)
    } finally {
      setConnectingMethod(null)
    }
  })

  const handleApiKeyConnect = useCallback(
    async (payload: { host: string; email: string; apiKey: string }) => {
      setConnectingMethod('apiKey')
      setError(null)
      try {
        await authService.connectWithApiKey(payload)
        setAuthType('apiKey')
      } catch (err) {
        console.error('Error connecting with API key:', err)
        setError(
          err instanceof Error
            ? err.message
            : 'Failed to connect with API key. Please try again.'
        )
      } finally {
        setConnectingMethod(null)
      }
    },
    [authService, setAuthType]
  )

  const handleDisconnect = useCallback(() => {
    // eslint-disable-next-line no-alert
    const confirmed = window.confirm(
      'Disconnect from Jira? You will need to reconnect to use the extension.'
    )
    if (!confirmed) return
    setError(null)
    authService.disconnect()
  }, [authService])

  const apiKeyDefaults = apiKeyAuth
    ? {
        host: apiKeyAuth.host,
        email: apiKeyAuth.email,
        apiKey: apiKeyAuth.apiKey
      }
    : undefined

  return (
    <div className="space-y-8">
      {userInfo ? (
        <JiraConnectionCard
          user={userInfo}
          authMethod={authType}
          jiraHost={jiraHost}
          onDisconnect={handleDisconnect}
        />
      ) : (
        <div className="space-y-4">
          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <p className="mb-2 text-sm font-medium text-gray-700">
              Authentication method
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => handleSelectAuthType('oauth')}
                className={`flex-1 rounded-md border px-4 py-2 text-sm font-medium ${
                  authType === 'oauth'
                    ? 'border-gray-900 bg-gray-900 text-white'
                    : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                }`}>
                OAuth (recommended)
              </button>
              <button
                onClick={() => handleSelectAuthType('apiKey')}
                className={`flex-1 rounded-md border px-4 py-2 text-sm font-medium ${
                  authType === 'apiKey'
                    ? 'border-gray-900 bg-gray-900 text-white'
                    : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                }`}>
                API key
              </button>
            </div>
          </div>

          {authType === 'apiKey' ? (
            <JiraApiKeySetup
              onConnect={handleApiKeyConnect}
              isLoading={connectingMethod === 'apiKey'}
              error={error}
              defaultValues={apiKeyDefaults}
            />
          ) : (
            <JiraConnectionSetup
              onConnect={handleConnect}
              isLoading={connectingMethod === 'oauth'}
            />
          )}
        </div>
      )}

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
