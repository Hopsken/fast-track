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
  }
  return <Action {...restProps} onSelect={onSelect} />
}
