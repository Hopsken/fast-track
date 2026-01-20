import { JiraTicket } from '@/types'

export function TicketActionHeading(props: { ticket: JiraTicket }) {
  return (
    <div className="flex h-[30px] items-center justify-between px-[13px]">
      <div className="select-none overflow-hidden text-ellipsis whitespace-nowrap rounded bg-gray-100 px-1.5 py-0.5 text-xs">
        <span className="text-muted-foreground">{props.ticket.key} ⋅ </span>
        {props.ticket.summary}
      </div>
    </div>
  )
}
