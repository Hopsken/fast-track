import { forwardRef, ReactNode } from 'react'
import { Command } from '@internal/ui/components/command'

import { ActionSearch } from './ActionSearch'

export interface CommandPanelProps {
  defaultValue?: string
  value?: string
  onValueChange?: (value: string) => void

  isLoading?: boolean
  searchPlaceholder?: string
  searchReadonly?: boolean

  defaultSearch?: string
  search?: string
  onSearchChange?: (search: string) => void
  searchStateKey?: string
  onSearchConfirm?: () => void

  shouldFilter?: boolean

  children?: ReactNode
}

export const ActionPanel = forwardRef<HTMLDivElement, CommandPanelProps>(
  function ActionPanel(props, ref) {
    const {
      defaultValue,
      value,
      onValueChange,
      isLoading,
      searchPlaceholder,
      searchReadonly,
      defaultSearch,
      search,
      onSearchChange,
      searchStateKey,
      onSearchConfirm,
      shouldFilter,
      children
    } = props

    return (
      <Command
        ref={ref}
        defaultValue={defaultValue}
        value={value}
        onValueChange={onValueChange}
        shouldFilter={shouldFilter}>
        <ActionSearch
          defaultSearch={defaultSearch}
          search={search}
          onSearchChange={onSearchChange}
          searchStateKey={searchStateKey}
          onSearchConfirm={onSearchConfirm}
          placeholder={searchPlaceholder}
          readonly={searchReadonly}
          isLoading={isLoading}
        />
        {children}
      </Command>
    )
  }
)
