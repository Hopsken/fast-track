import { Button } from '@internal/ui/components/button'
import { CommandList } from '@internal/ui/components/command'
import { Separator } from '@internal/ui/components/separator'

import { useCommandNavigate } from '@/components/CommandRouter'
import { useTicketDetails } from '@/hooks/useTicketDetails'
import { IssueTypeIcon } from '~/components/ui/jira'

import { TicketBasicFields } from './TicketBasicFields'
import { TicketDescription } from './TicketDescription'
import { TicketMetadataChips } from './TicketMetadataChips'

export function TicketDetails({ issueKey }: { issueKey: string }) {
  const { data: issue, isLoading } = useTicketDetails(issueKey)
  const { pop } = useCommandNavigate()

  if (!issue) {
    return (
      <div className="p-8 text-center">
        <p className="mb-4">Ticket not found</p>
        <Button onClick={() => pop()} variant="secondary">
          Back
        </Button>
      </div>
    )
  }

  return (
    <CommandList className="max-h-[448px] overflow-y-auto">
      <div className="space-y-4 px-4 py-3">
        <TicketBasicFields ticket={issue} issueDetail={issue} />
        <Separator className="-mx-5" />
        <TicketDescription html={issue.description} />
      </div>
    </CommandList>
  )
}
