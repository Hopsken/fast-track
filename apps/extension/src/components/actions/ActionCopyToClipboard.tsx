import log from 'loglevel'

import { showToast } from '../../stores/useToastStore'

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
  const onSelect = async () => {
    try {
      await navigator.clipboard.writeText(content)
      onCopy?.()
      showToast({
        title: `Copied: ${content}`,
        style: 'success'
      })
      window.setTimeout(() => {
        window.close()
      }, 20)
    } catch (error) {
      log.error(error)
      showToast({
        title: 'Failed to copy to clipboard',
        style: 'failure'
      })
      return
    }
  }
  return <Action {...restProps} onSelect={onSelect} exitOnSelect={false} />
}
