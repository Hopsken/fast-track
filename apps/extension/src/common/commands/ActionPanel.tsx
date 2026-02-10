import { ReactNode } from 'react'
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

  shouldFilter?: boolean

  children?: ReactNode
}

export const ActionPanel = (props: CommandPanelProps) => {
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
    shouldFilter,
    children
  } = props

  return (
    <Command
      defaultValue={defaultValue}
      value={value}
      onValueChange={onValueChange}
      shouldFilter={shouldFilter}>
      <ActionSearch
        defaultSearch={defaultSearch}
        search={search}
        onSearchChange={onSearchChange}
        placeholder={searchPlaceholder}
        readonly={searchReadonly}
        isLoading={isLoading}
      />
      {children}
    </Command>
  )
}
