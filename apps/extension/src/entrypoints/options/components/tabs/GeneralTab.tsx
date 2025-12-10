import { ChangeEvent, useCallback } from 'react'

import { useStorage } from '~/hooks'
import { authService } from '~/services'

import { ConfigureAuth, JiraConnectionCard } from '../auth'
import { ShortcutManagement } from '../sections/QuickAccess/ShortcutManagement'

export function GeneralTab() {
  const [userInfo] = useStorage('OAuthUserInfo')
  const [jiraHost] = useStorage('JiraHost')
  const [analyticsEnabled, setAnalyticsEnabled] =
    useStorage('analytics-enabled')

  const handleDisconnect = useCallback(() => {
    const confirmed = window.confirm(
      'Disconnect from Jira? You will need to reconnect to use the extension.'
    )
    if (!confirmed) return
    authService.disconnect()
  }, [])

  const handleAnalyticsChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      setAnalyticsEnabled(event.target.checked)
    },
    [setAnalyticsEnabled]
  )

  return (
    <div className="space-y-8">
      {userInfo ? (
        <JiraConnectionCard
          user={userInfo}
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

      <div>
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Privacy</h2>
        <div className="space-y-6">
          <div className="rounded-lg border border-gray-200 p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-sm font-medium text-gray-900">
                  Anonymous analytics
                </h3>
                <p className="mt-1 text-sm text-gray-600">
                  Help us improve Jira Boost by sending anonymous usage data. No
                  issue content or personal data is collected.
                </p>
              </div>

              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-2 focus:ring-indigo-500"
                  checked={analyticsEnabled}
                  onChange={handleAnalyticsChange}
                />
                <span className="text-sm text-gray-700">
                  {analyticsEnabled ? 'On' : 'Off'}
                </span>
              </label>
            </div>

            <p className="mt-3 text-xs text-gray-500">
              You can change this anytime. Analytics are anonymous and help us
              prioritize improvements.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
