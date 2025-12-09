import { useCallback, useState } from 'react'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@internal/ui/components/tabs'
import { useMemoizedFn } from 'ahooks'

import { useStorage } from '@/hooks'
import { authService } from '@/services'
import { AuthType } from '@/types'
import { logger } from '@/utils'

import { JiraApiKeySetup } from './JiraApiKeySetup'
import { JiraOAuthSetup } from './JiraOAuthSetup'

export function ConfigureAuth() {
  const [authType, setAuthType] = useStorage('AuthType')
  const [apiKeyAuth] = useStorage('ApiKeyAuth')

  const [error, setError] = useState<string | null>(null)
  const [connectingMethod, setConnectingMethod] = useState<AuthType | null>(
    null
  )

  const handleSelectAuthType = useCallback(
    (next: string) => {
      setError(null)
      setAuthType(next as AuthType)
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
      logger.error('Error connecting to Jira:', error)
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
    [setAuthType]
  )

  const apiKeyDefaults = apiKeyAuth
    ? {
        host: apiKeyAuth.host,
        email: apiKeyAuth.email,
        apiKey: apiKeyAuth.apiKey
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
