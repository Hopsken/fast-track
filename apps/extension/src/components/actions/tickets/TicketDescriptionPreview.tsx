import { Button } from '@internal/ui/components/button'
import DOMPurify from 'dompurify'

export function TicketDescriptionPreview({ html }: { html?: string }) {
  if (!html) return null

  const textContent = DOMPurify.sanitize(html, { ALLOWED_TAGS: [] }).trim()

  if (!textContent) return null

  return (
    <div className="text-muted-foreground mb-4 px-1 text-sm">
      <p className="line-clamp-2 leading-relaxed">{textContent}</p>
    </div>
  )
}
