// eslint-disable-next-line import-x/no-named-as-default
import DOMPurify from 'dompurify'

export function TicketDescriptionPreview({ html }: { html?: string }) {
  if (!html) return null

  const textContent = (
    DOMPurify.sanitize(html, { RETURN_DOM: true }) as unknown as HTMLElement
  ).textContent?.trim()

  if (!textContent) return null

  return (
    <div className="text-muted-foreground mb-4 px-1 text-sm">
      <p className="line-clamp-2 leading-relaxed">{textContent}</p>
    </div>
  )
}
