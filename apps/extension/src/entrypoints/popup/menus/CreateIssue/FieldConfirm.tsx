import { Button } from '@internal/ui/components/button'

import { ActionShortcut, ActionPanelSlot } from '@/common/commands'

export function FieldConfirm(props: {
  text?: string
  disabled?: boolean
  onClick: () => void
}) {
  return (
    <ActionPanelSlot>
      <Button
        variant={'ghost'}
        size={'sm'}
        onClick={props.onClick}
        className="-my-1 -mr-4"
        disabled={props.disabled}>
        <span>{props.text || 'Continue'}</span>
        <ActionShortcut
          hotkeyId="field.confirm-complex"
          onSelect={props.onClick}
        />
      </Button>
    </ActionPanelSlot>
  )
}
