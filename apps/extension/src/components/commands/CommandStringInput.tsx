import {
  CommandEmpty,
  CommandGroup,
  CommandList
} from '@internal/ui/components/command'
import { useMount } from 'ahooks'

import { useHotkey } from '@/lib/hotkeys'
import { useCommandInput } from '@/stores/command/useCommandInputStore'

import { prefillStringValue } from './utils'

export type CommandStringInputProps = {
  title?: string
  value?: string
  onChange: (value: string) => void
  onConfirm: () => void
}

export function CommandStringInput({
  title,
  value,
  onChange,
  onConfirm
}: CommandStringInputProps) {
  // TODO: fix deps
  const { search, setSearch } = useCommandInput()

  // Pre-fill the search box with current value
  useMount(() => {
    if (value) {
      prefillStringValue(value, setSearch)
    }
  })

  useHotkey('field.confirm-simple', () => {
    onChange(search)
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
