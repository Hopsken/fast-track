import { z } from 'zod'

import { CommandList, CommandPanel, useCommandSearch } from '@/common/commands'
import { useHotkey } from '@/lib/hotkeys'

export type CommandNumberInputProps = {
  title?: string
  value?: number
  onChange: (value: number | null) => void

  onConfirm: () => void
}

function CommandNumberInputInner({
  onChange,
  onConfirm
}: CommandNumberInputProps) {
  const search = useCommandSearch()

  useHotkey('field.confirm-simple', () => {
    const trimmed = search?.trim()
    if (!trimmed) return onChange(null)

    const num = z.number().safeParse(trimmed).data
    if (num === undefined) {
      return
    }

    onChange(num)
    onConfirm()
  })

  return <CommandList emptyPlaceholder="Type a number and press Enter" />
}

export function CommandNumberInput(props: CommandNumberInputProps) {
  return (
    <CommandPanel
      search={props.value != null ? String(props.value) : undefined}>
      <CommandNumberInputInner {...props} />
    </CommandPanel>
  )
}
