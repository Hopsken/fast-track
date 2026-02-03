import {
  CommandEmpty,
  CommandGroup,
  CommandList
} from '@internal/ui/components/command'
import { useMemoizedFn, useMount } from 'ahooks'

import { useCommandInput } from '@/stores/command/useCommandInputStore'

import { useFieldConfirm } from '../hooks/useFieldConfirm'
import { getFieldTitle, parseCommaSeparated, prefillArrayValue } from '../utils'

import { FieldInputProps } from './types'

export function CommandArrayInput({
  field,
  currentValue,
  onConfirm
}: FieldInputProps) {
  const { search, setSearch } = useCommandInput()
  const title = getFieldTitle(field)

  // Pre-fill the search box with current value
  useMount(() => {
    prefillArrayValue(currentValue, setSearch)
  })

  const handleConfirm = useMemoizedFn(() => {
    const parts = parseCommaSeparated(search)
    onConfirm(parts)
  })

  return (
    <CommandList>
      <CommandGroup heading={title}>
        <CommandEmpty>Type comma-separated values and press Enter</CommandEmpty>
      </CommandGroup>

      {useFieldConfirm({
        onConfirm: handleConfirm,
        keys: 'enter'
      })}
    </CommandList>
  )
}
