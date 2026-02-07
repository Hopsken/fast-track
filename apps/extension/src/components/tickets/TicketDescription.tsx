import { useMemo } from 'react'
// eslint-disable-next-line import-x/no-named-as-default
import DOMPurify from 'dompurify'

export function TicketDescription({ html }: { html?: string }) {
  // MVP: images are not supported yet
  const cleanHtml = useMemo(() => DOMPurify.sanitize(html || ''), [html])

  if (!cleanHtml) {
    return (
      <p className="text-muted-foreground italic">No description provided.</p>
    )
  }

  return (
    <div
      className="jira-description wrap-break-word space-y-3 overflow-hidden text-sm leading-relaxed"
      dangerouslySetInnerHTML={{ __html: cleanHtml }}
    />
  )
}
