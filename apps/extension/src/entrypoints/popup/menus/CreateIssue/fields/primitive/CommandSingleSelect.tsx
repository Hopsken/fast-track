import { useMemo } from 'react'
import {
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
  useCommandState
} from '@internal/ui/components/command'
import { useMount } from 'ahooks'

import { useFieldConfirm } from '@/lib/hotkeys'
import { useCommandInput } from '@/stores/command/useCommandInputStore'
import type { AllowedValue } from '~/types/template'

import { asRecord, getFieldTitle } from '../utils'

import { FieldInputProps } from './types'

export function CommandSingleSelect({
  field,
  currentValue,
  onConfirm
}: FieldInputProps) {
  const value = useCommandState((state) => state.value)
  const { setValue } = useCommandInput()
  const title = getFieldTitle(field)

  const allowedOptions = useMemo<AllowedValue[]>(
    () => field.allowedOptions ?? field.metadata?.allowedValues ?? [],
    [field]
  )

  // Extract selected option from currentValue
  const selected = useMemo(() => {
    const rec = asRecord(currentValue)
    if (!rec || typeof rec.id !== 'string') return undefined
    return allowedOptions.find((opt) => opt.id === rec.id)
  }, [currentValue, allowedOptions])

  useMount(() => {
    if (selected) {
      setValue(selected.id)
    }
  })

  return (
    <CommandList>
      <CommandGroup heading={title}>
        {allowedOptions.map((opt) => (
          <CommandItem
            key={opt.id}
            value={opt.id}
            keywords={[opt.name ?? '', opt.value ?? '']}
            onSelect={() => onConfirm(opt)}>
            <span className="truncate">{opt.name ?? opt.value ?? opt.id}</span>
          </CommandItem>
        ))}

        {allowedOptions.length === 0 ? (
          <CommandEmpty>No options available</CommandEmpty>
        ) : null}
      </CommandGroup>

      {useFieldConfirm({
        onConfirm: () => {
          if (value) {
            const option = allowedOptions.find((opt) => opt.id === value)
            if (option) {
              onConfirm(option)
            }
          }
        },
        keys: 'meta+enter'
      })}
    </CommandList>
  )
}
