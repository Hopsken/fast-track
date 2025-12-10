import { useMemo } from 'react'
import {
  CommandEmpty,
  CommandGroup,
  CommandList,
  useCommandState
} from '@internal/ui/components/command'
import { useMemoizedFn } from 'ahooks'
import { MessageCircle } from 'lucide-react'

import { Action } from '@/components/actions'
import { useMutationAddComment } from '@/hooks/useMutationAddComment'
import { JiraTicket } from '@/types'
import { useCommandRouter } from '~/components/CommandRouter'

import type { CommandRoutes } from './index'

export function TicketCommentMenu({ ticket }: { ticket: JiraTicket }) {
  const comment = useCommandState((state) => state.search)
  const { pop, setSearch } = useCommandRouter<CommandRoutes>()
  const trimmedComment = comment.trim()
  const { mutateAsync: addComment, isPending } = useMutationAddComment()

  const title = useMemo(() => {
    if (!trimmedComment) return 'Type a comment to submit'
    if (trimmedComment.length <= 80) return trimmedComment
    return `${trimmedComment.slice(0, 77)}...`
  }, [trimmedComment])

  const handleAddComment = useMemoizedFn(async () => {
    if (!trimmedComment || isPending) return

    await addComment({ ticket, comment: trimmedComment })
    setSearch('')
    pop()
  })

  return (
    <CommandList>
      {!trimmedComment && (
        <CommandEmpty>Start typing to add a comment</CommandEmpty>
      )}
      <CommandGroup heading={`Comment on ${ticket.key}`}>
        <Action
          icon={MessageCircle}
          title={isPending ? 'Adding comment...' : title}
          onSelect={handleAddComment}
        />
      </CommandGroup>
    </CommandList>
  )
}
