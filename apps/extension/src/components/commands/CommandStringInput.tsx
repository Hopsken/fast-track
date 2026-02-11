import { ActionPanel } from '@/common/commands'

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
  return (
    <ActionPanel
      search={value ?? ''}
      onSearchChange={onChange}
      onSearchConfirm={onConfirm}
      searchPlaceholder="Type a value and press Enter"
    />
  )
}
