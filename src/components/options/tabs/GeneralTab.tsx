import { ApiConnectionStatus } from "../sections/JiraConnection/ApiConnectionStatus"
import { JiraHostInput } from "../sections/JiraConnection/JiraHostInput"
import { ApiConfiguration } from "../sections/JiraConnection/ApiConfiguration"
import { TokenGenerationGuide } from "../sections/JiraConnection/TokenGenerationGuide"
import { PrimaryIssueKey } from "../sections/QuickAccess/PrimaryIssueKey"

export function GeneralTab() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Jira Connection</h2>
        <div className="space-y-6">
          <ApiConnectionStatus />
          <JiraHostInput />
          <ApiConfiguration />
          <TokenGenerationGuide />
        </div>
      </div>
      
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Access</h2>
        <div className="space-y-6">
          <PrimaryIssueKey />
        </div>
      </div>
    </div>
  )
}