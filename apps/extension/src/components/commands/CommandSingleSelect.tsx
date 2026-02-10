import React from 'react'

import {
  CommandGroup,
  CommandItem,
  CommandList,
  CommandPanel
} from '@/common/commands'

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
  const onSelect = (opt: T) => {
    onChange(opt)
    onConfirm?.()
  }

  return (
    <CommandList isLoading={isLoading} emptyPlaceholder="No options available">
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
