import { Button } from '@internal/ui/components/button'

import { ActionShortcut, ActionPanelSlot } from '@/common/commands'

import { WizardProgressBar } from './WizardProgressBar'

export function FieldConfirm(props: {
  text?: string
  disabled?: boolean
  onClick: () => void
}) {
  return (
    <ActionPanelSlot>
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
            hotkeyId="field.confirm-complex"
            onSelect={props.onClick}
          />
        </Button>
      </div>
    </ActionPanelSlot>
  )
}
