import { useEffect, useState } from 'react'
import { Button } from '@internal/ui/components/button'
import { CommandList } from '@internal/ui/components/command'
import { Spinner } from '@internal/ui/components/spinner'
import DOMPurify from 'dompurify'

import { useCommandNavigate } from '@/components/CommandRouter'
import { useTicketDetails } from '@/hooks/useTicketDetails'
import { processHtmlContent } from '@/utils/jira-images'

export function TicketDescriptionFull({ issueKey }: { issueKey: string }) {
  const { data: issue, isLoading } = useTicketDetails(issueKey)
  const { pop } = useCommandNavigate()
  const [processedHtml, setProcessedHtml] = useState('')

  useEffect(() => {
    let isMounted = true
    const run = async () => {
      if (!issue?.description) return
      const processed = await processHtmlContent(issue.description)
      if (isMounted) {
        setProcessedHtml(processed)
      }
    }
    run()
    return () => {
      isMounted = false
    }
  }, [issue?.description])

  if (isLoading) {
    return (
      <div className="flex h-[300px] flex-col items-center justify-center gap-4">
        <Spinner className="size-8" />
      </div>
    )
  }

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

  const cleanHtml = DOMPurify.sanitize(processedHtml || issue.description || '')

  return (
    <CommandList className="custom-scrollbar max-h-[448px] overflow-y-auto">
      <div className="space-y-4 p-4">
        <div className="bg-background/95 sticky top-0 z-10 flex items-center justify-between border-b py-2 backdrop-blur">
          <h2 className="text-sm font-semibold">Description</h2>
        </div>

        {cleanHtml ? (
          <div
            className="jira-description space-y-3 overflow-hidden break-words text-sm leading-relaxed"
            dangerouslySetInnerHTML={{ __html: cleanHtml }}
          />
        ) : (
          <p className="text-muted-foreground italic">
            No description provided.
          </p>
        )}
      </div>
    </CommandList>
  )
}
