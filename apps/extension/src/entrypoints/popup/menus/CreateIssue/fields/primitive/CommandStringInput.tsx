import {
  CommandEmpty,
  CommandGroup,
  CommandList
} from '@internal/ui/components/command'
import { useMount } from 'ahooks'

import { useHotkey } from '@/lib/hotkeys'
import { useCommandInput } from '@/stores/command/useCommandInputStore'

import { getFieldTitle, prefillStringValue } from '../utils'

import { FieldInputProps } from './types'

export function CommandStringInput({
  field,
  currentValue,
  onChange,
  onConfirm
}: FieldInputProps) {
  const { search, setSearch } = useCommandInput()
  const title = getFieldTitle(field)

  // Pre-fill the search box with current value
  useMount(() => {
    prefillStringValue(currentValue, setSearch)
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
