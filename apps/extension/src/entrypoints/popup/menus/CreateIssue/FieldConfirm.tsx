import { Button } from '@internal/ui/components/button'

import { ActionShortcut } from '@/components/actions/ActionShortcut'
import { CommandFooterSlot } from '@/stores/command/useCommandFooterSlot'

import { WizardProgressBar } from './WizardProgressBar'

export function FieldConfirm(props: {
  text?: string
  disabled?: boolean
  onClick: () => void
}) {
  return (
    <CommandFooterSlot>
      <div className="flex items-center gap-2">
        <WizardProgressBar />
        <Button
          variant={'ghost'}
          size={'sm'}
          onClick={props.onClick}
          className="-my-1 -mr-4"
          disabled={props.disabled}>
          <span>{props.text || 'Continue'}</span>
          <ActionShortcut
            shortcut={{
              modifiers: ['cmd'],
              key: 'enter'
            }}
          />
        </Button>
      </div>
    </CommandFooterSlot>
  )
}
