import { useCallback, useRef, useState } from 'react'

import { useStorage } from '@/hooks'
import { getAuthService } from '@/services/auth-service'

import { JiraConnectionCard, JiraConnectionSetup } from '../auth'
import { ShortcutManagement } from '../sections/QuickAccess/ShortcutManagement'

export function GeneralTab() {
  // const [authType, setAuthType] = useStorage('AuthType')
  const [oauthUserInfo] = useStorage('OAuthUserInfo')
  const [isLoading, setIsLoading] = useState(false)

  const authService = useRef(getAuthService()).current

  const handleConnect = useCallback(async () => {
    setIsLoading(true)
    try {
      const nextUrl = await authService.connect()
      window.open(nextUrl, '_blank')
    } catch (error) {
      console.error('Error connecting to Jira:', error)
    } finally {
      setIsLoading(false)
    }
  }, [authService])

  const handleDisconnect = useCallback(() => {
    authService.disconnect()
  }, [authService])

  return (
    <div className="space-y-8">
      {oauthUserInfo ? (
        <JiraConnectionCard
          user={oauthUserInfo}
          onDisconnect={handleDisconnect}
        />
      ) : (
        <JiraConnectionSetup onConnect={handleConnect} isLoading={isLoading} />
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
