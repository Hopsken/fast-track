import { Github, Gitlab, GitPullRequest } from 'lucide-react'

import {
  Action,
  CommandGroup,
  CommandList,
  ActionPanel
} from '@/common/commands'
import { useIssueMergeRequests } from '@/hooks/useIssueMergeRequests'
import { JiraMergeRequest } from '@/types'
import { openInNewTab } from '@/utils/extension'

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

export function IssueMergeRequestsMenu({ ticketKey }: { ticketKey: string }) {
  const { data: mergeRequests, isLoading } = useIssueMergeRequests(ticketKey)

  return (
    <ActionPanel>
      <CommandList isLoading={isLoading} emptyPlaceholder="No merge requests">
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
      </CommandList>
    </ActionPanel>
  )
}
