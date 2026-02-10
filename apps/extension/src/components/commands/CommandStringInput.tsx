import { useMount } from 'ahooks'

import {
  CommandList,
  CommandPanel,
  useCommandSearch,
  useSetCommandSearch
} from '@/common/commands'
import { useHotkey } from '@/lib/hotkeys'

export type CommandStringInputProps = {
  title?: string
  value?: string
  onChange: (value: string) => void
  onConfirm: () => void
}

function CommandStringInputInner({
  value,
  onChange,
  onConfirm
}: CommandStringInputProps) {
  const search = useCommandSearch()
  const setSearch = useSetCommandSearch()

  // Pre-fill the search box with current value
  useMount(() => {
    if (value) {
      setSearch?.(value)
    }
  })

  useHotkey('field.confirm-simple', () => {
    onChange(search ?? '')
    onConfirm()
  })

  return <CommandList emptyPlaceholder="Type a value and press Enter" />
}

export function CommandStringInput(props: CommandStringInputProps) {
  return (
    <CommandPanel search={props.value}>
      <CommandStringInputInner {...props} />
    </CommandPanel>
  )
}
