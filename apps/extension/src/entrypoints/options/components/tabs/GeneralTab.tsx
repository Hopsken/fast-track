import { useCallback, useRef } from 'react'

import { useStorage } from '@/hooks'
import { getAuthService } from '@/services/auth-service'

import { ConfigureAuth, JiraConnectionCard } from '../auth'
import { ShortcutManagement } from '../sections/QuickAccess/ShortcutManagement'

export function GeneralTab() {
  const [userInfo] = useStorage('OAuthUserInfo')
  const [authType] = useStorage('AuthType')
  const [jiraHost] = useStorage('JiraHost')

  const authService = useRef(getAuthService()).current

  const handleDisconnect = useCallback(() => {
    const confirmed = window.confirm(
      'Disconnect from Jira? You will need to reconnect to use the extension.'
    )
    if (!confirmed) return
    authService.disconnect()
  }, [authService])

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
        <ConfigureAuth />
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
