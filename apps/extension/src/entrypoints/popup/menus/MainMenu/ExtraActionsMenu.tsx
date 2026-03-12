import { Cog, FilePlus, MessageSquareWarning } from 'lucide-react'

import {
  Action,
  ActionList,
  ActionPanel,
  useNavigation
} from '@/common/commands'
import { openInNewTab, openOptionsPage } from '@/utils'

import { IssueTemplatesMenu } from './IssueTemplatesMenu'

export const openFeedback = () => {
  openInNewTab('https://fasttrack.featurebase.app')
}

export function ExtraActionsMenu() {
  const navigate = useNavigation()

  return (
    <ActionList>
      <Action
        value="/create-issue"
        icon={FilePlus}
        title="Create Issue"
        description="Type C from home to quick create"
        exitOnSelect={false}
        onSelect={() =>
          navigate.push(
            <ActionPanel>
              <IssueTemplatesMenu />
            </ActionPanel>
          )
        }
      />

      <Action
        value="/settings"
        icon={Cog}
        title="Settings"
        onSelect={openOptionsPage}
      />
      <Action
        value="/feedback"
        icon={MessageSquareWarning}
        title="Feedback"
        onSelect={openFeedback}
      />
    </ActionList>
  )
}
