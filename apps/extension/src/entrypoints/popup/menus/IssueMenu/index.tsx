import { Route, Routes } from 'react-router-dom'

import { CommandPanel } from '@/common/commands'

import { IssueMainMenu } from './IssueMainMenu'
import { TicketActionsMenu } from './TicketActionsMenu'
import { TicketAssignMenu } from './TicketAssignMenu'
import { TicketDetailsMenu } from './TicketDetailsMenu'
import { TicketMergeRequestsMenu } from './TicketMergeRequestsMenu'
import { TicketPriorityMenu } from './TicketPriorityMenu'
import { TicketStatusMenu } from './TicketStatusMenu'

export function IssueMenu({ ticketKey }: { ticketKey: string }) {
  return (
    <CommandPanel>
      <IssueMainMenu ticketKey={ticketKey} />
    </CommandPanel>
  )
}
