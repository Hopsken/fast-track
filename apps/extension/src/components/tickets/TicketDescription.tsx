import { useRequest } from 'ahooks'
// eslint-disable-next-line import-x/no-named-as-default
import DOMPurify from 'dompurify'

import { processHtmlContent } from '@/utils/jira-images'

export function TicketDescription({ html }: { html?: string }) {
  const { data: processedHtml } = useRequest(
    async () => {
      if (!html) return ''
      return processHtmlContent(html)
    },
    {
      refreshDeps: [html],
      ready: !!html
    }
  )

  const cleanHtml = DOMPurify.sanitize(processedHtml || html || '')

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
