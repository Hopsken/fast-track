import React from 'react'
import {
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
  CommandLoading
} from '@internal/ui/components/command'

import { GeneralIcon } from '../ui'

import { getIconUrl } from './utils'

export type CommandSingleSelectProps<T> = {
  title?: React.ReactNode
  isLoading?: boolean

  value?: T
  onChange: (value: T | null) => void
  onConfirm?: () => void

  options: T[]
  getOptionValue: (option: T) => string
  getOptionLabel?: (option: T) => string
  getOptionKeywords?: (option: T) => string[]
}

export function CommandSingleSelect<T>({
  title,
  isLoading,
  onChange,
  onConfirm,
  options,
  getOptionValue,
  getOptionLabel,
  getOptionKeywords
}: CommandSingleSelectProps<T>) {
  // Extract selected option from currentValue to sync with command state
  // const selected = useMemo(() => {
  //   const rec = asRecord(currentValue)
  //   if (!rec || typeof rec.id !== 'string') return undefined
  //   return allowedOptions.find((opt) => opt.id === rec.id)
  // }, [currentValue, allowedOptions])

  // useMount(() => {
  //   if (selected) {
  //     setValue(selected.id)
  //   }
  // })

  const onSelect = (opt: T) => {
    onChange(opt)
    onConfirm?.()
  }

  return (
    <CommandList>
      {isLoading ? (
        <CommandLoading>Loading...</CommandLoading>
      ) : (
        <CommandEmpty>No options available</CommandEmpty>
      )}

      <CommandGroup heading={title}>
        {options.map((opt) => {
          const value = getOptionValue(opt)
          const label = getOptionLabel?.(opt) ?? value
          const iconUrl = getIconUrl(opt)
          return (
            <CommandItem
              key={value}
              value={value}
              keywords={getOptionKeywords?.(opt)}
              onSelect={() => onSelect(opt)}>
              <div className="flex items-center gap-2">
                {iconUrl ? <GeneralIcon alt={label} iconUrl={iconUrl} /> : null}
                <span className="truncate">{label}</span>
              </div>
            </CommandItem>
          )
        })}
      </CommandGroup>
    </CommandList>
  )
}
