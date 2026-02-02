import {
  CommandEmpty,
  CommandGroup,
  CommandList
} from '@internal/ui/components/command'
import { useMemoizedFn, useMount } from 'ahooks'

import { useCommandInput } from '@/stores/command/useCommandInputStore'

import { useFieldConfirm } from '../useFieldConfirm'

type Props = {
  title: string
  currentValue: unknown
  onConfirm: (value: string[]) => void
  placeholder?: string
}

export function ArrayFieldInput({
  title,
  currentValue,
  onConfirm,
  placeholder = 'Type comma-separated values and press Enter'
}: Props) {
  const { search, setSearch } = useCommandInput()

  // Pre-fill the search box with current value
  useMount(() => {
    if (Array.isArray(currentValue)) {
      const stringArray = currentValue.filter(
        (item) => typeof item === 'string'
      )
      if (stringArray.length > 0) {
        setSearch(stringArray.join(', '))
      }
    }
  })

  const handleConfirm = useMemoizedFn(() => {
    const parts = search
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
    onConfirm(parts)
  })

  return (
    <CommandList>
      <CommandGroup heading={title}>
        <CommandEmpty>{placeholder}</CommandEmpty>
      </CommandGroup>

      {useFieldConfirm({
        onConfirm: handleConfirm,
        keys: 'enter'
      })}
    </CommandList>
  )
}
