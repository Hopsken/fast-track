import {
  CommandEmpty,
  CommandGroup,
  CommandList
} from '@internal/ui/components/command'
import { useMount } from 'ahooks'

import { useFieldConfirm } from '@/lib/hotkeys'
import { useCommandInput } from '@/stores/command/useCommandInputStore'

import { getFieldTitle, prefillNumberValue } from '../utils'

import { FieldInputProps } from './types'

export function CommandNumberInput({
  field,
  currentValue,
  onConfirm
}: FieldInputProps) {
  const { search, setSearch } = useCommandInput()
  const title = getFieldTitle(field)

  const handleConfirm = () => {
    const trimmed = search.trim()
    if (!trimmed) return onConfirm(undefined)

    const num = Number(trimmed)
    if (!Number.isFinite(num)) {
      return
    }

    onConfirm(num)
  }

  // Pre-fill the search box with current value
  useMount(() => {
    prefillNumberValue(currentValue, setSearch)
  })

  return (
    <CommandList>
      <CommandGroup heading={title}>
        <CommandEmpty>Type a number and press Enter</CommandEmpty>
      </CommandGroup>

      {useFieldConfirm({
        onConfirm: handleConfirm,
        keys: 'enter'
      })}
    </CommandList>
  )
}
