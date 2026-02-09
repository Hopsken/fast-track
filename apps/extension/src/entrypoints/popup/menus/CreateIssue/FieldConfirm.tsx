import { Button } from '@internal/ui/components/button'

import { CommandFooterSlot, CommandShortcut } from '@/common/commands'

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
          <CommandShortcut hotkeyId="field.confirm-complex" />
        </Button>
      </div>
    </CommandFooterSlot>
  )
}
