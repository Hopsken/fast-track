import { useLayoutEffect, useMemo, useRef } from 'react'
import { Button } from '@internal/ui/components/button'
import { Label } from '@internal/ui/components/label'
import { useMemoizedFn } from 'ahooks'
import { useHotkeys } from 'react-hotkeys-hook'

import { useMutationAddComment } from '@/hooks/useMutationAddComment'
import { JiraTicket } from '@/types'
import { useCommandRouter } from '~/components/CommandRouter'

import type { CommandRoutes } from './index'

export function TicketCommentMenu({ ticket }: { ticket: JiraTicket }) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const {
    activeSearch: comment,
    pop,
    setSearch
  } = useCommandRouter<CommandRoutes>()
  const trimmedComment = useMemo(() => comment.trim(), [comment])
  const { mutateAsync: addComment, isPending } = useMutationAddComment()

  useLayoutEffect(() => {
    const textarea = textareaRef.current
    if (!textarea) return

    textarea.focus()
    textarea.select()
  }, [])

  const handleAddComment = useMemoizedFn(async () => {
    if (!trimmedComment || isPending) return

    await addComment({ ticket, comment: trimmedComment })
    setSearch('')
    pop()
  })

  useHotkeys(
    ['meta+enter', 'ctrl+enter'],
    (event) => {
      event.preventDefault()
      handleAddComment()
    },
    {
      enableOnFormTags: true
    },
    [handleAddComment]
  )

  return (
    <div className="flex h-full flex-col justify-between">
      <div className="flex flex-1 flex-col gap-3 px-5 py-4">
        <Label htmlFor="ticket-comment">Comment</Label>
        <textarea
          ref={textareaRef}
          id="ticket-comment"
          value={comment}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Leave a comment..."
          className="placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground border-input shadow-xs focus-visible:border-ring focus-visible:ring-ring/50 min-h-[200px] w-full rounded-md border bg-transparent px-3 py-2 text-sm outline-none transition-[color,box-shadow] focus-visible:ring-[3px]"
        />
      </div>

      <div className="flex justify-end border-t border-gray-200 px-5 py-3">
        <Button
          onClick={handleAddComment}
          disabled={!trimmedComment || isPending}>
          {isPending ? 'Adding comment...' : 'Add Comment'}
        </Button>
      </div>
    </div>
  )
}
