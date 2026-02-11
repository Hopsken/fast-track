import { Cog, MessageSquareWarning } from 'lucide-react'

import { Action, ActionList } from '@/common/commands'
import { openInNewTab, openOptionsPage } from '@/utils'

export const openFeedback = () => {
  openInNewTab('https://teamusement.featurebase.app')
}

export function ExtraActionsMenu() {
  return (
    <ActionList>
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
