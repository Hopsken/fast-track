import { CommandShortcut } from '@internal/ui/components/command'
import { Kbd } from '@internal/ui/components/kbd'
import { Cog, FilePlus, MessageSquareWarning } from 'lucide-react'

import {
  Action,
  ActionItem,
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
      <ActionItem
        value="/new-issue"
        onSelect={() =>
          navigate.push(
            <ActionPanel>
              <IssueTemplatesMenu />
            </ActionPanel>
          )
        }>
        <span>
          <FilePlus size={16} />
        </span>
        <div className="flex-1 overflow-hidden text-ellipsis whitespace-nowrap">
          New Issue
        </div>
        <CommandShortcut>
          <Kbd>C</Kbd>
        </CommandShortcut>
      </ActionItem>

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
