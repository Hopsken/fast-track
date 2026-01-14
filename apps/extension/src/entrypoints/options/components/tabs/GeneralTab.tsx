import { useCallback, useMemo } from 'react'
import { Input } from '@internal/ui/components/input'
import { Label } from '@internal/ui/components/label'
import { Switch } from '@internal/ui/components/switch'

import { JiraTicket } from '@/types'
import { generateBranchName } from '@/utils/jira/issues'
import { useStorage } from '~/hooks'
import { authService } from '~/services'
import { useUserPreferences } from '~/stores/useUserPreferences'

import { ConfigureAuth, JiraConnectionCard } from '../auth'
import { ShortcutManagement } from '../sections/QuickAccess/ShortcutManagement'

export function GeneralTab() {
  const [credentials] = useStorage('AuthCredentials')
  const userInfo = useMemo(() => credentials?.userInfo ?? null, [credentials])
  const jiraHost = useMemo(() => credentials?.host ?? '', [credentials])

  const [preferences, setPreference] = useUserPreferences()
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
    (checked: boolean) => {
      setAnalyticsEnabled(checked)
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
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Workflow</h2>
        <div className="space-y-6">
          <div className="rounded-lg border border-gray-200 p-4">
            <div className="space-y-2">
              <label
                className="text-sm font-medium text-gray-900"
                htmlFor="branch-name-format">
                Branch name format
              </label>
              <p className="text-xs text-gray-500">
                Copy a git branch name for issues using the{' '}
                {'Copy git branch name'} action. Formats:{' '}
                {`{key}, {summary}, {summaryShort}`}.
              </p>
              <Input
                name="branch-name-format"
                type="text"
                value={preferences.branchNameFormat}
                onChange={(event) =>
                  setPreference('branchNameFormat', event.target.value)
                }
                placeholder="{key}-{summary}"
              />
              <p className="text-xs text-gray-500">
                Preview:{' '}
                {generateBranchName(
                  {
                    key: 'JIRA-123',
                    summary: 'Big feature'
                  } as JiraTicket,
                  preferences.branchNameFormat
                )}
                .
              </p>
            </div>
          </div>
          <div className="rounded-lg border border-gray-200 p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-sm font-medium text-gray-900">
                  On move to In Progress, copy git branch name
                </h3>
                <p className="mt-1 text-sm text-gray-600">
                  Automatically copy the git branch name when moving a ticket
                  from To Do to In Progress.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <Switch
                  id="auto-copy-branch-name"
                  checked={preferences.autoCopyBranchNameOnTransition}
                  onCheckedChange={(checked) =>
                    setPreference('autoCopyBranchNameOnTransition', checked)
                  }
                />
                <Label
                  htmlFor="auto-copy-branch-name"
                  className="text-gray-700">
                  {preferences.autoCopyBranchNameOnTransition ? 'On' : 'Off'}
                </Label>
              </div>
            </div>
          </div>
          <div className="rounded-lg border border-gray-200 p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-sm font-medium text-gray-900">
                  On move to In Progress, assign to yourself
                </h3>
                <p className="mt-1 text-sm text-gray-600">
                  Automatically assign yourself when moving an unassigned ticket
                  from To Do to In Progress.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <Switch
                  id="auto-assign-on-in-progress"
                  checked={preferences.autoAssignOnInProgress}
                  onCheckedChange={(checked) =>
                    setPreference('autoAssignOnInProgress', checked)
                  }
                />
                <Label
                  htmlFor="auto-assign-on-in-progress"
                  className="text-gray-700">
                  {preferences.autoAssignOnInProgress ? 'On' : 'Off'}
                </Label>
              </div>
            </div>
          </div>
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

              <div className="flex items-center gap-3">
                <Switch
                  id="analytics-enabled"
                  checked={analyticsEnabled}
                  onCheckedChange={handleAnalyticsChange}
                />
                <Label htmlFor="analytics-enabled" className="text-gray-700">
                  {analyticsEnabled ? 'On' : 'Off'}
                </Label>
              </div>
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
