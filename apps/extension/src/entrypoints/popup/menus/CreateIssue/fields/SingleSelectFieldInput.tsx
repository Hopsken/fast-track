import {
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList
} from '@internal/ui/components/command'

import type { AllowedValue } from '~/types/template'

type Props = {
  title: string
  allowedOptions: AllowedValue[]
  onSelect: (value: AllowedValue) => void
}

export function SingleSelectFieldInput({
  title,
  allowedOptions,
  onSelect
}: Props) {
  return (
    <CommandList>
      <CommandGroup heading={title}>
        {allowedOptions.map((opt) => (
          <CommandItem
            key={opt.id}
            value={opt.name ?? opt.value ?? opt.id}
            onSelect={() => onSelect(opt)}>
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
