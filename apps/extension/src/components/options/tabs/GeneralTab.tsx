import { useCallback, useState } from 'react'

import { JiraConnectionCard, JiraConnectionSetup } from '@/components/auth'
import { useStorage } from '@/hooks'
import { oauthManager } from '@/lib/jira/oauth-manager'

import { ShortcutManagement } from '../sections/QuickAccess/ShortcutManagement'

export function GeneralTab() {
  // const [authType, setAuthType] = useStorage('AuthType')
  const [oauthUserInfo] = useStorage('OAuthUserInfo')
  const [isLoading, setIsLoading] = useState(false)

  const handleConnect = useCallback(async () => {
    setIsLoading(true)
    try {
      await oauthManager.initiateFlow()
    } catch (error) {
      console.error('Error connecting to Jira:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  return (
    <div className="space-y-8">
      {oauthUserInfo ? (
        <JiraConnectionCard user={oauthUserInfo} />
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
