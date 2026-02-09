import {
  CommandEmpty,
  CommandGroup,
  CommandList
} from '@internal/ui/components/command'
import { useMount } from 'ahooks'

import { useHotkey } from '@/lib/hotkeys'

export type CommandStringInputProps = {
  title?: string
  value?: string
  search?: string
  setSearch?: (value: string) => void
  onChange: (value: string) => void
  onConfirm: () => void
}

export function CommandStringInput({
  title,
  value,
  search,
  setSearch,
  onChange,
  onConfirm
}: CommandStringInputProps) {
  // TODO: fix deps

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

  return (
    <CommandList>
      <CommandGroup heading={title}>
        <CommandEmpty>Type a value and press Enter</CommandEmpty>
      </CommandGroup>
    </CommandList>
  )
}
