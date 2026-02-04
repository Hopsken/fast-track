import { useMemo } from 'react'
import {
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList
} from '@internal/ui/components/command'
import { useMount } from 'ahooks'

import { useCommandInput } from '@/stores/command/useCommandInputStore'
import type { AllowedValue } from '~/types/template'

import { asRecord, getFieldTitle } from '../utils'

import { FieldInputProps } from './types'

export function CommandSingleSelect({
  field,
  currentValue,
  onChange
}: FieldInputProps) {
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
            onSelect={() => onChange(opt)}>
            <span className="truncate">{opt.name ?? opt.value ?? opt.id}</span>
          </CommandItem>
        ))}

        {allowedOptions.length === 0 ? (
          <CommandEmpty>No options available</CommandEmpty>
        ) : null}
      </CommandGroup>
    </CommandList>
  )
}
