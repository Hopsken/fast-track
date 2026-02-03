import {
  CommandEmpty,
  CommandGroup,
  CommandList,
  CommandLoading,
  CommandItem
} from '@internal/ui/components/command'

import { TicketActionHeading } from '@/components/tickets/TicketActionHeading'
import { AssigneeAvatar } from '@/components/ui/jira/AssigneeAvatar'
import { useIssueComments } from '@/hooks/useIssueComments'
import { useTicketDetails } from '@/hooks/useTicketDetails'
import { JiraComment } from '@/types'

type Props = {
  ticketKey: string
}

declare global {
  interface RouteMap {
    '/ticket/comments': Props
  }
}

function formatShortDate(value: string) {
  if (!value) return ''

  try {
    return new Intl.DateTimeFormat(undefined, {
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(value))
  } catch {
    return value
  }
}

function CommentListItem({ comment }: { comment: JiraComment }) {
  const authorName = comment.author?.displayName || 'Anonymous'
  const preview = comment.text?.trim() || '(empty comment)'

  return (
    <CommandItem
      value={`${authorName} ${preview}`}
      className="items-start gap-3 py-2">
      <AssigneeAvatar
        size="1.25rem"
        className="mt-0.5"
        assignee={comment.author}
      />

      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-2">
          <div className="truncate text-sm font-medium">{authorName}</div>
          <div className="text-muted-foreground shrink-0 text-xs">
            {formatShortDate(comment.created)}
          </div>
        </div>

        <div className="text-muted-foreground mt-0.5 line-clamp-3 whitespace-pre-wrap text-xs">
          {preview}
        </div>
      </div>
    </CommandItem>
  )
}

export function TicketCommentsMenu({ ticketKey }: Props) {
  const { data: ticket } = useTicketDetails(ticketKey)
  const { data: comments, isLoading } = useIssueComments(ticketKey)

  return (
    <CommandList>
      {ticket && <TicketActionHeading ticket={ticket} />}

      <CommandGroup heading="Comments">
        {isLoading && <CommandLoading>Loading...</CommandLoading>}
        {comments?.map((comment) => (
          <CommentListItem key={comment.id} comment={comment} />
        ))}
      </CommandGroup>

      {!isLoading && (comments?.length ?? 0) === 0 && (
        <CommandEmpty>No comments</CommandEmpty>
      )}
    </CommandList>
  )
}
