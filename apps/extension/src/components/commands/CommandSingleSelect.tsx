import React from 'react'

import {
  ActionGroup,
  ActionItem,
  ActionList,
  ActionPanel
} from '@/common/commands'

import { GeneralIcon } from '../ui'

import { getIconUrl } from './utils'

export type CommandSingleSelectProps<T> = {
  title?: React.ReactNode
  isLoading?: boolean

  value?: T
  onChange: (value: T | null) => void
  onConfirm?: () => void

  search?: string
  onSearchChange?: (search: string) => void

  shouldFilter?: boolean

  options: T[]
  getOptionValue: (option: T) => string
  getOptionLabel?: (option: T) => string
  getOptionKeywords?: (option: T) => string[]
}

export function CommandSingleSelect<T>({
  title,
  isLoading,
  value,
  onChange,
  onConfirm,
  search,
  onSearchChange,
  shouldFilter,
  options,
  getOptionValue,
  getOptionLabel,
  getOptionKeywords
}: CommandSingleSelectProps<T>) {
  const defaultValue = value ? getOptionValue(value) : ''

  const onSelect = (opt: T) => {
    onChange(opt)
    onConfirm?.()
  }

  return (
    <ActionPanel
      defaultValue={defaultValue}
      search={search}
      onSearchChange={onSearchChange}
      shouldFilter={shouldFilter}
      searchPlaceholder="Type to search...">
      <ActionList isLoading={isLoading} emptyPlaceholder="No options available">
        <ActionGroup heading={title}>
          {options.map((opt) => {
            const value = getOptionValue(opt)
            const label = getOptionLabel?.(opt) ?? value
            const iconUrl = getIconUrl(opt)
            return (
              <ActionItem
                key={value}
                value={value}
                keywords={getOptionKeywords?.(opt)}
                onSelect={() => onSelect(opt)}>
                <div className="flex items-center gap-2">
                  {iconUrl ? (
                    <GeneralIcon alt={label} iconUrl={iconUrl} />
                  ) : null}
                  <span className="truncate">{label}</span>
                </div>
              </ActionItem>
            )
          })}
        </ActionGroup>
      </ActionList>
    </ActionPanel>
  )
}
