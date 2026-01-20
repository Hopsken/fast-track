import { TicketDetails } from '@/components'

export type Props = {
  ticketKey: string
}

declare global {
  interface RouteMap {
    '/ticket/details': Props
  }
}

export function TicketDetailsMenu({ ticketKey }: Props) {
  return <TicketDetails ticketKey={ticketKey} />
}
