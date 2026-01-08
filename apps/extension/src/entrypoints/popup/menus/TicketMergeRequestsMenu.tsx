import {
  CommandEmpty,
  CommandGroup,
  CommandList
} from '@internal/ui/components/command'
import { Github, Gitlab, GitPullRequest } from 'lucide-react'

import { Action } from '@/components/actions'
import { JiraMergeRequest, JiraTicket } from '@/types'
import { openInNewTab } from '@/utils/extension'

type MergeRequestState = {
  mergeRequests: JiraMergeRequest[]
  ticket: JiraTicket
}

export function TicketMergeRequestsMenu({
  mergeRequests,
  ticket
}: MergeRequestState) {
  const getProviderIcon = (provider: JiraMergeRequest['provider']) => {
    if (provider === 'gitlab') return Gitlab
    if (provider === 'github') return Github
    return GitPullRequest
  }

  return (
    <CommandList>
      <CommandGroup heading={`${ticket.key} merge requests`}>
        {mergeRequests.map((mergeRequest) => (
          <Action
            key={mergeRequest.id}
            value={mergeRequest.title}
            icon={getProviderIcon(mergeRequest.provider)}
            title={mergeRequest.title}
            onSelect={() => openInNewTab(mergeRequest.url)}
          />
        ))}
      </CommandGroup>
      {mergeRequests.length === 0 && (
        <CommandEmpty>No merge requests</CommandEmpty>
      )}
    </CommandList>
  )
}
