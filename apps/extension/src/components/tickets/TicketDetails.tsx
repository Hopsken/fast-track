import { Button } from '@internal/ui/components/button'
import { Separator } from '@internal/ui/components/separator'
import { useNavigate } from 'react-router-dom'

import { ActionList } from '@/common/commands'
import { useTicketDetails } from '@/hooks/useTicketDetails'

import { TicketBasicFields } from './TicketBasicFields'
import { TicketDescription } from './TicketDescription'

export function TicketDetails({ ticketKey }: { ticketKey: string }) {
  const { data: issue, isLoading } = useTicketDetails(ticketKey)
  const navigate = useNavigate()

  if (!issue && !isLoading) {
    return (
      <div className="p-8 text-center">
        <p className="mb-4">Ticket not found</p>
        <Button onClick={() => navigate(-1)} variant="secondary">
          Back
        </Button>
      </div>
    )
  }

  return (
    <ActionList className="max-h-[448px] overflow-y-auto">
      <div className="space-y-4 px-4 py-3">
        {issue && <TicketBasicFields ticket={issue} />}
        <Separator className="-mx-5" />
        <TicketDescription html={issue?.description} />
      </div>
    </ActionList>
  )
}
