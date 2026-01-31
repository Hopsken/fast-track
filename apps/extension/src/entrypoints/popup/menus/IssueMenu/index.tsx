import { Route, Routes } from 'react-router-dom'

import { IssueMainMenu } from './IssueMainMenu'
import { TicketActionsMenu } from './TicketActionsMenu'
import { TicketAssignMenu } from './TicketAssignMenu'
import { TicketDetailsMenu } from './TicketDetailsMenu'
import { TicketMergeRequestsMenu } from './TicketMergeRequestsMenu'
import { TicketPriorityMenu } from './TicketPriorityMenu'
import { TicketStatusMenu } from './TicketStatusMenu'

export function IssueMenu() {
  return (
    <Routes>
      <Route element={<IssueMainMenu />}>
        <Route index element={<TicketActionsMenu />} />
        <Route path="assign" element={<TicketAssignMenu />} />
        <Route path="details" element={<TicketDetailsMenu />} />
        <Route path="merge-requests" element={<TicketMergeRequestsMenu />} />
        <Route path="priority" element={<TicketPriorityMenu />} />
        <Route path="status" element={<TicketStatusMenu />} />
      </Route>
    </Routes>
  )
}
