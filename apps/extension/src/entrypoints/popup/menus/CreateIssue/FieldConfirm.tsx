import { Button } from '@internal/ui/components/button'

import { ActionShortcut } from '@/components/actions/ActionShortcut'
import { CommandFooterSlot } from '@/stores/command/useCommandFooterSlot'

export function FieldConfirm(props: {
  text?: string
  disabled?: boolean
  onClick: () => void
}) {
  return (
    <CommandFooterSlot>
      <Button
        variant={'ghost'}
        onClick={props.onClick}
        className="-mr-4"
        disabled={props.disabled}>
        <span>{props.text || 'Continue'}</span>
        <ActionShortcut
          shortcut={{
            modifiers: ['cmd'],
            key: 'enter'
          }}
        />
      </Button>
    </CommandFooterSlot>
  )
}
