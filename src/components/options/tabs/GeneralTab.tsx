import {
  ApiConfiguration,
  ApiConnectionStatus,
  JiraHostInput,
  TokenGenerationGuide
} from '~/components/api'

import { PrimaryIssueKey } from '../sections/QuickAccess/PrimaryIssueKey'
import { ShortcutManagement } from '../sections/QuickAccess/ShortcutManagement'

export function GeneralTab() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="mb-4 text-lg font-semibold text-gray-900">
          Jira Connection
        </h2>
        <div className="space-y-6">
          <ApiConnectionStatus />
          <JiraHostInput />
          <ApiConfiguration />
          <TokenGenerationGuide />
        </div>
      </div>

      <div>
        <h2 className="mb-4 text-lg font-semibold text-gray-900">
          Quick Access
        </h2>
        <div className="space-y-6">
          <ShortcutManagement />
          <PrimaryIssueKey />
        </div>
      </div>
    </div>
  )
}
