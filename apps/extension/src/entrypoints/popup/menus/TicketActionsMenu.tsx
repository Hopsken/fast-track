import { CommandItem, CommandList } from '@internal/ui/components/command'

import { JiraTicket } from '@/types'

export function TicketActionsMenu({ ticket }: { ticket: JiraTicket }) {
  return (
    <CommandList>
      <CommandItem>Add to board</CommandItem>
    </CommandList>
  )
}
