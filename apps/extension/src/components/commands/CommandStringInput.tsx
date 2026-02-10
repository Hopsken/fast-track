import { ActionPanel } from '@/common/commands'
import { useHotkey } from '@/lib/hotkeys'

export type CommandStringInputProps = {
  title?: string
  value?: string
  onChange: (value: string) => void
  onConfirm: () => void
}

export function CommandStringInput({
  value,
  onChange,
  onConfirm
}: CommandStringInputProps) {
  useHotkey('field.confirm-simple', () => {
    onChange(value ?? '')
    onConfirm()
  })

  return (
    <ActionPanel
      search={value ?? ''}
      onSearchChange={onChange}
      searchPlaceholder="Type a value and press Enter"
    />
  )
}
