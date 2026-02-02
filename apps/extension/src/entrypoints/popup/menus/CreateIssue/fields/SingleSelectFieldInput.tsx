import {
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
  useCommandState
} from '@internal/ui/components/command'
import { useMount } from 'ahooks'

import { useCommandInput } from '@/stores/command/useCommandInputStore'
import type { AllowedValue } from '~/types/template'

import { useFieldConfirm } from '../useFieldConfirm'

export type Props = {
  title: string
  selected?: AllowedValue
  allowedOptions: AllowedValue[]
  onConfirm: (value: AllowedValue) => void
}

export function SingleSelectFieldInput({
  title,
  selected,
  allowedOptions,
  onConfirm
}: Props) {
  const value = useCommandState((state) => state.value)
  const { setValue } = useCommandInput()

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
