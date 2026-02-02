import {
  CommandEmpty,
  CommandGroup,
  CommandList
} from '@internal/ui/components/command'
import { useMount } from 'ahooks'

import { useCommandInput } from '@/stores/command/useCommandInputStore'

import { useFieldConfirm } from '../useFieldConfirm'

type Props = {
  title: string
  currentValue: unknown
  onConfirm: (value: string) => void
  placeholder?: string
}

export function StringFieldInput({
  title,
  currentValue,
  onConfirm,
  placeholder = 'Type a value and press Enter'
}: Props) {
  const { search, setSearch } = useCommandInput()

  // Pre-fill the search box with current value
  useMount(() => {
    if (currentValue && typeof currentValue === 'string') {
      setSearch(currentValue)
    }
  })

  useFieldConfirm<string>({
    getValue: () => search,
    onConfirm,
    keys: 'enter'
  })

  return (
    <CommandList>
      <CommandGroup heading={title}>
        <CommandEmpty>{placeholder}</CommandEmpty>
      </CommandGroup>
    </CommandList>
  )
}
