import { useCallback, useMemo } from 'react'
import { Input } from '@internal/ui/components/input'

import { JiraIssue } from '@/types'
import { generateBranchName } from '@/utils/jira/issues'
import { useStorage } from '~/hooks'
import { getAuthService } from '~/services'
import { useUserPreferences } from '~/stores/useUserPreferences'

import { ConfigureAuth, JiraConnectionCard } from '../auth'
import { SectionLabel } from '../SectionLabel'
import { ShortcutManagement } from '../sections/QuickAccess/ShortcutManagement'
import { SwitchRow } from '../SwitchRow'

export function GeneralTab() {
  const [credentials] = useStorage('AuthCredentials')
  const userInfo = useMemo(() => credentials?.userInfo ?? null, [credentials])
  const jiraHost = useMemo(() => credentials?.host ?? '', [credentials])

  const [preferences, setPreference] = useUserPreferences()
  const [analyticsEnabled, setAnalyticsEnabled] =
    useStorage('analytics-enabled')

  const handleDisconnect = useCallback(() => {
    const confirmed = window.confirm(
      'Disconnect from Jira? You’ll need to sign in again to use Fast Track.'
    )
    if (!confirmed) return
    getAuthService().disconnect()
  }, [])

  const handleAnalyticsChange = useCallback(
    (checked: boolean) => {
      setAnalyticsEnabled(checked)
    },
    [setAnalyticsEnabled]
  )

  return (
    <div className="space-y-8">
      {/* Jira Connection — visually dominant, first thing users see */}
      <div>
        <SectionLabel>Jira Connection</SectionLabel>
        {userInfo ? (
          <JiraConnectionCard
            user={userInfo}
            jiraHost={jiraHost}
            onDisconnect={handleDisconnect}
          />
        ) : (
          <ConfigureAuth />
        )}
      </div>

      <div>
        <SectionLabel>Quick Access</SectionLabel>
        <ShortcutManagement />
      </div>

      <div>
        <SectionLabel>Workflow</SectionLabel>
        <div className="border-border rounded-lg border">
          {/* Branch name format */}
          <div className="p-4">
            <div className="space-y-2">
              <label
                className="text-foreground text-sm font-medium"
                htmlFor="branch-name-format">
                Branch name format
              </label>
              <p className="text-muted-foreground text-xs">
                Used when you copy a branch name from an issue. Available
                tokens: {`{key}, {summary}, {summaryShort}`}.
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
              <p className="text-muted-foreground text-xs">
                Example:{' '}
                {generateBranchName(
                  {
                    key: 'JIRA-123',
                    summary: 'Big feature'
                  } as JiraIssue,
                  preferences.branchNameFormat
                )}
                .
              </p>
            </div>
          </div>

          <SwitchRow
            id="auto-copy-branch-name"
            title="Copy branch name when moving to In Progress"
            description="Automatically copy a branch name when you move an issue from To Do to In Progress."
            checked={preferences.autoCopyBranchNameOnTransition}
            onCheckedChange={(checked) =>
              setPreference('autoCopyBranchNameOnTransition', checked)
            }
          />

          <SwitchRow
            id="auto-assign-on-in-progress"
            title="Assign yourself when moving to In Progress"
            description="Automatically assign unassigned issues to you when you move them from To Do to In Progress."
            checked={preferences.autoAssignOnInProgress}
            onCheckedChange={(checked) =>
              setPreference('autoAssignOnInProgress', checked)
            }
          />
        </div>
      </div>

      <div>
        <SectionLabel>Privacy</SectionLabel>
        <div className="border-border rounded-lg border">
          <SwitchRow
            id="analytics-enabled"
            title="Anonymous analytics"
            description="Help improve Fast Track by sharing anonymous usage data. We never collect issue content."
            checked={analyticsEnabled}
            onCheckedChange={handleAnalyticsChange}
            footer={
              <p className="text-muted-foreground mt-3 text-xs">
                You can turn this off anytime.
              </p>
            }
          />
        </div>
      </div>
    </div>
  )
}
