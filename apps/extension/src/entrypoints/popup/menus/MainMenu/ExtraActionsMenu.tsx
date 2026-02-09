import { Cog, MessageSquareWarning } from 'lucide-react'

import { CommandList } from '@/common/commands'
import { Action } from '@/components/actions'
import { openInNewTab, openOptionsPage } from '@/utils'

const openFeedback = () => {
  openInNewTab('https://teamusement.featurebase.app')
}

export function ExtraActionsMenu() {
  return (
    <CommandList>
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
    </CommandList>
  )
}
