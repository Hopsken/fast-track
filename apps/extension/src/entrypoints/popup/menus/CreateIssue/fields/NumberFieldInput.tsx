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
  onConfirm: (value: number | undefined) => void
  placeholder?: string
}

export function NumberFieldInput({
  title,
  currentValue,
  onConfirm,
  placeholder = 'Type a number and press Enter'
}: Props) {
  const { search, setSearch } = useCommandInput()

  // Pre-fill the search box with current value
  useMount(() => {
    if (typeof currentValue === 'number') {
      setSearch(String(currentValue))
    }
  })

  useFieldConfirm<number | undefined>({
    getValue: () => {
      const trimmed = search.trim()
      if (!trimmed) return undefined

      const num = Number(trimmed)
      if (!Number.isFinite(num)) {
        return { skip: true } // Invalid number, don't confirm
      }

      return num
    },
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
