import { useCallback, useEffect, useState } from 'react'
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
  const [credentials] = useStorage('AuthCredentials')

  // Track selected tab locally - initialized from credentials if available
  const [selectedAuthType, setSelectedAuthType] = useState<AuthType>('oauth')

  // Sync tab selection when credentials load asynchronously
  useEffect(() => {
    if (credentials?.type) {
      setSelectedAuthType(credentials.type)
    }
  }, [credentials?.type])

  const [error, setError] = useState<string | null>(null)
  const [connectingMethod, setConnectingMethod] = useState<AuthType | null>(
    null
  )

  const handleSelectAuthType = useCallback((next: string) => {
    setError(null)
    setSelectedAuthType(next as AuthType)
  }, [])

  const handleConnect = useMemoizedFn(async () => {
    trackEvent('connect_attempt', { method: 'oauth' })

    setConnectingMethod('oauth')
    setError(null)

    try {
      const nextUrl = await authService.connect()
      window.open(nextUrl, '_blank')
    } catch (err) {
      logger.error('Error connecting to Jira:', err)
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to initiate OAuth connection. Please try again.'
      )
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
    <Tabs value={selectedAuthType} onValueChange={handleSelectAuthType}>
      <TabsList className="w-full">
        <TabsTrigger value={'oauth'}>Sign in with Atlassian</TabsTrigger>
        <TabsTrigger value="apiKey">API key</TabsTrigger>
      </TabsList>

      <TabsContent value="oauth">
        <JiraOAuthSetup
          onConnect={handleConnect}
          isLoading={connectingMethod === 'oauth'}
          error={selectedAuthType === 'oauth' ? error : null}
        />
      </TabsContent>

      <TabsContent value="apiKey">
        <JiraApiKeySetup
          onConnect={handleApiKeyConnect}
          isLoading={connectingMethod === 'apiKey'}
          error={selectedAuthType === 'apiKey' ? error : null}
          defaultValues={apiKeyDefaults}
        />
      </TabsContent>
    </Tabs>
  )
}
