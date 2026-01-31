import {
  CommandEmpty,
  CommandGroup,
  CommandList
} from '@internal/ui/components/command'
import { Github, Gitlab, GitPullRequest } from 'lucide-react'

import { Action } from '@/components/actions'
import { useIssueMergeRequests } from '@/hooks/useIssueMergeRequests'
import { JiraMergeRequest } from '@/types'
import { openInNewTab } from '@/utils/extension'

import { useCurrentTicketKey } from './useCurrentTicket'

export const getProviderIcon = (provider: JiraMergeRequest['provider']) => {
  if (provider === 'gitlab') return Gitlab
  if (provider === 'github') return Github
  return GitPullRequest
}

export const getProviderOpenTitle = (
  provider: JiraMergeRequest['provider']
) => {
  if (provider === 'gitlab') return 'Go to merge request'
  if (provider === 'github') return 'Go to pull request'
  return 'Merge request'
}

export function TicketMergeRequestsMenu() {
  const ticketKey = useCurrentTicketKey()
  const { data: mergeRequests, isLoading } = useIssueMergeRequests(ticketKey)

  return (
    <CommandList>
      <CommandGroup heading={`${ticketKey} merge requests`}>
        {mergeRequests?.map((mergeRequest) => (
          <Action
            key={mergeRequest.id}
            value={mergeRequest.title}
            icon={getProviderIcon(mergeRequest.provider)}
            title={mergeRequest.title}
            onSelect={() => openInNewTab(mergeRequest.url)}
          />
        ))}
      </CommandGroup>
      {!isLoading && <CommandEmpty>No merge requests</CommandEmpty>}
    </CommandList>
  )
}
