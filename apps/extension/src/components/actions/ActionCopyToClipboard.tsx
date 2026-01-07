import { showToast } from '@/stores/useToastStore'

import { Action, ActionProps } from './Action'

export interface ActionCopyToClipboardProps
  extends Omit<ActionProps, 'onSelect'> {
  content: string
  onCopy?: () => void
}

export function ActionCopyToClipboard({
  content,
  onCopy,
  ...restProps
}: ActionCopyToClipboardProps) {
  const onSelect = () => {
    navigator.clipboard.writeText(content)
    onCopy?.()
    showToast({
      title: `Copied: ${content}`,
      style: 'success'
    })
    window.close()
  }
  return <Action {...restProps} onSelect={onSelect} exitOnSelect={false} />
}
