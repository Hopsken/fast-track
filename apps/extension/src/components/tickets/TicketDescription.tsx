import { useMemo } from '#imports'
import DOMPurify from 'dompurify'

export function TicketDescription({ html }: { html?: string }) {
  // TODO: support images
  const cleanHtml = useMemo(() => DOMPurify.sanitize(html || ''), [html])

  if (!cleanHtml) {
    return (
      <p className="text-muted-foreground italic">No description provided.</p>
    )
  }

  return (
    <div
      className="jira-description space-y-3 overflow-hidden break-words text-sm leading-relaxed"
      dangerouslySetInnerHTML={{ __html: cleanHtml }}
    />
  )
}
