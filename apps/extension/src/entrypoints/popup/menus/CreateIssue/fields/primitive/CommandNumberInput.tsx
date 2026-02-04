import {
  CommandEmpty,
  CommandGroup,
  CommandList
} from '@internal/ui/components/command'
import { useMount } from 'ahooks'

import { useHotkey } from '@/lib/hotkeys'
import { useCommandInput } from '@/stores/command/useCommandInputStore'

import { getFieldTitle, prefillNumberValue } from '../utils'

import { FieldInputProps } from './types'

export function CommandNumberInput({
  field,
  currentValue,
  onChange,
  onConfirm
}: FieldInputProps) {
  const { search, setSearch } = useCommandInput()
  const title = getFieldTitle(field)

  // Pre-fill the search box with current value
  useMount(() => {
    prefillNumberValue(currentValue, setSearch)
  })

  useHotkey('field.confirm-simple', () => {
    const trimmed = search.trim()
    if (!trimmed) return onChange(undefined)

    const num = Number(trimmed)
    if (!Number.isFinite(num)) {
      return
    }

    onChange(num)
    onConfirm()
  })

  return (
    <CommandList>
      <CommandGroup heading={title}>
        <CommandEmpty>Type a number and press Enter</CommandEmpty>
      </CommandGroup>
    </CommandList>
  )
}
