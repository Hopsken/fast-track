import {
  CommandEmpty,
  CommandGroup,
  CommandList
} from '@internal/ui/components/command'
import { useMount } from 'ahooks'

import { useHotkey } from '@/lib/hotkeys'
import { useCommandInput } from '@/stores/command/useCommandInputStore'

import { getFieldTitle, parseCommaSeparated, prefillArrayValue } from '../utils'

import { FieldInputProps } from './types'

export function CommandArrayInput({
  field,
  currentValue,
  onChange,
  onConfirm
}: FieldInputProps) {
  const { search, setSearch } = useCommandInput()
  const title = getFieldTitle(field)

  // Pre-fill the search box with current value
  useMount(() => {
    prefillArrayValue(currentValue, setSearch)
  })

  useHotkey('field.confirm-simple', () => {
    const parts = parseCommaSeparated(search)
    onChange(parts)
    onConfirm()
  })

  return (
    <CommandList>
      <CommandGroup heading={title}>
        <CommandEmpty>Type comma-separated values and press Enter</CommandEmpty>
      </CommandGroup>
    </CommandList>
  )
}
