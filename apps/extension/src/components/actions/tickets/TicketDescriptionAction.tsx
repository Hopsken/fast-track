import { CommandItem, CommandShortcut } from '@internal/ui/components/command'
import { FileText } from 'lucide-react'

import { TicketDescriptionPreview } from './TicketDescriptionPreview'

interface TicketDescriptionActionProps {
  html?: string
  onSelect: () => void
}

export function TicketDescriptionAction({
  html,
  onSelect
}: TicketDescriptionActionProps) {
  if (!html) return null

  return (
    <CommandItem
      value="description-preview"
      onSelect={onSelect}
      className="flex items-start justify-between py-2">
      <div className="min-w-0 flex-1 pr-2">
        <TicketDescriptionPreview html={html} />
      </div>

      <div className="text-muted-foreground mt-1 flex shrink-0 items-center gap-2">
        <FileText className="h-4 w-4" />
        <CommandShortcut>
          <div className="flex items-center gap-0.5">
            <span className="text-[10px]">⌘</span>
            <span className="text-[10px]">⇧</span>
            <span className="text-[10px]">D</span>
          </div>
        </CommandShortcut>
      </div>
    </CommandItem>
  )
}
