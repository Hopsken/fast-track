import { useMemo } from 'react'
import {
  CommandGroup,
  CommandItem,
  CommandList
} from '@internal/ui/components/command'
import { useMemoizedFn } from 'ahooks'
import { Check } from 'lucide-react'

import type { AllowedValue } from '~/types/template'

import { useFieldConfirm } from '../hooks/useFieldConfirm'
import { getFieldTitle, isArrayOfAllowedValues } from '../utils'

import { FieldInputProps } from './types'

export function CommandMultiSelect({
  field,
  currentValue,
  onConfirm
}: FieldInputProps) {
  const title = getFieldTitle(field)

  const allowedOptions = useMemo<AllowedValue[]>(
    () => field.allowedOptions ?? field.metadata?.allowedValues ?? [],
    [field]
  )

  const selected = isArrayOfAllowedValues(currentValue) ? currentValue : []
  const selectedIds = new Set(selected.map((o) => o.id))

  const toggle = (opt: AllowedValue) => {
    const next = selectedIds.has(opt.id)
      ? selected.filter((o) => o.id !== opt.id)
      : [...selected, opt]
    onConfirm(next)
  }

  const handleConfirm = useMemoizedFn(() => {
    onConfirm(selected)
  })

  return (
    <CommandList>
      <CommandGroup heading={title}>
        {allowedOptions.map((opt) => {
          const isSelected = selectedIds.has(opt.id)
          const label = opt.name ?? opt.value ?? opt.id
          return (
            <CommandItem
              key={opt.id}
              value={label}
              onSelect={() => toggle(opt)}>
              <div className="flex w-full items-center justify-between">
                <span className="truncate">{label}</span>
                {isSelected ? <Check className="size-4" /> : null}
              </div>
            </CommandItem>
          )
        })}
      </CommandGroup>

      {useFieldConfirm({
        onConfirm: handleConfirm,
        keys: 'meta+enter'
      })}
    </CommandList>
  )
}
