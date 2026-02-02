import {
  CommandGroup,
  CommandItem,
  CommandList
} from '@internal/ui/components/command'
import { Check } from 'lucide-react'

import type { AllowedValue } from '~/types/template'

import { useCreateIssueDraftStore } from '../useCreateIssueDraftStore'
import { isArrayOfAllowedValues } from '../utils'

type Props = {
  fieldId: string
  title: string
  allowedOptions: AllowedValue[]
  onDone: () => void
}

export function MultiSelectFieldInput({
  fieldId,
  title,
  allowedOptions,
  onDone
}: Props) {
  const { values, setValue } = useCreateIssueDraftStore()
  const currentValue = values[fieldId]

  const selected = isArrayOfAllowedValues(currentValue) ? currentValue : []
  const selectedIds = new Set(selected.map((o) => o.id))

  const toggle = (opt: AllowedValue) => {
    const next = selectedIds.has(opt.id)
      ? selected.filter((o) => o.id !== opt.id)
      : [...selected, opt]
    setValue(fieldId, next)
  }

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

        <CommandItem value="done" onSelect={onDone}>
          <div className="flex w-full items-center justify-between">
            <span>Done</span>
            <span className="text-muted-foreground text-[10px]">Enter</span>
          </div>
        </CommandItem>
      </CommandGroup>
    </CommandList>
  )
}
