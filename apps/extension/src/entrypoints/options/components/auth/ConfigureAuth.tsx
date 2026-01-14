import { useCallback, useMemo, useState } from 'react'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@internal/ui/components/tabs'
import { useMemoizedFn } from 'ahooks'

import { useStorage } from '@/hooks'
import { authService } from '@/services'
import { trackEvent } from '@/services/analytics'
import { AuthType } from '@/types'
import { logger } from '@/utils'

import { JiraApiKeySetup } from './JiraApiKeySetup'
import { JiraOAuthSetup } from './JiraOAuthSetup'

export function ConfigureAuth() {
  const [credentials, setCredentials] = useStorage('AuthCredentials')
  const authType = useMemo(() => credentials?.type ?? 'oauth', [credentials])

  const [error, setError] = useState<string | null>(null)
  const [connectingMethod, setConnectingMethod] = useState<AuthType | null>(
    null
  )

  const handleSelectAuthType = useCallback(
    (next: string) => {
      setError(null)
      // Update auth type in credentials if they exist, otherwise just track selection
      if (credentials) {
        setCredentials({
          ...credentials,
          type: next as AuthType
        })
      }
    },
    [credentials, setCredentials]
  )

  const handleConnect = useMemoizedFn(async () => {
    trackEvent('connect_attempt', { method: 'oauth' })

    setConnectingMethod('oauth')
    setError(null)

    try {
      const nextUrl = await authService.connect()
      window.open(nextUrl, '_blank')
    } catch (error) {
      logger.error('Error connecting to Jira:', error)
    } finally {
      setConnectingMethod(null)
    }
  })

  const handleApiKeyConnect = useCallback(
    async (payload: { host: string; email: string; apiKey: string }) => {
      trackEvent('connect_attempt', { method: 'apiKey' })

      setConnectingMethod('apiKey')
      setError(null)

      try {
        await authService.connectWithApiKey(payload)
        trackEvent('connect_success', { method: 'apiKey' })
      } catch (err) {
        logger.error('Error connecting with API key:', err)
        setError(
          err instanceof Error
            ? err.message
            : 'Failed to connect with API key. Please try again.'
        )
      } finally {
        setConnectingMethod(null)
      }
    },
    []
  )

  const apiKeyDefaults = credentials?.apiKey
    ? {
        host: credentials.host,
        email: credentials.apiKey.email,
        apiKey: credentials.apiKey.apiKey
      }
    : undefined

  return (
    <Tabs value={authType} onValueChange={handleSelectAuthType}>
      <TabsList className="w-full">
        <TabsTrigger value={'oauth'}>Sign in with Atlassian</TabsTrigger>
        <TabsTrigger value="apiKey">API key</TabsTrigger>
      </TabsList>

      <TabsContent value="oauth">
        <JiraOAuthSetup
          onConnect={handleConnect}
          isLoading={connectingMethod === 'oauth'}
        />
      </TabsContent>

      <TabsContent value="apiKey">
        <JiraApiKeySetup
          onConnect={handleApiKeyConnect}
          isLoading={connectingMethod === 'apiKey'}
          error={error}
          defaultValues={apiKeyDefaults}
        />
      </TabsContent>
    </Tabs>
  )
}
