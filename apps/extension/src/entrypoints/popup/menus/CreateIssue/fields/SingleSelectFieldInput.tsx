import {
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList
} from '@internal/ui/components/command'

import type { AllowedValue } from '~/types/template'

export type Props = {
  title: string
  allowedOptions: AllowedValue[]
  onConfirm: (value: AllowedValue) => void
}

export function SingleSelectFieldInput({
  title,
  allowedOptions,
  onConfirm
}: Props) {
  return (
    <CommandList>
      <CommandGroup heading={title}>
        {allowedOptions.map((opt) => (
          <CommandItem
            key={opt.id}
            value={opt.name ?? opt.value ?? opt.id}
            onSelect={() => onConfirm(opt)}>
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
