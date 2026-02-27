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
  onSearchConfirm?: () => void

  /**
   * When true, and the initial search value is non-empty, auto-select the whole
   * input on mount. Intended for the "back" navigation case.
   */
  autoSelectSearchOnMount?: boolean

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
      onSearchConfirm,
      autoSelectSearchOnMount,
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
          onSearchConfirm={onSearchConfirm}
          placeholder={searchPlaceholder}
          readonly={searchReadonly}
          isLoading={isLoading}
          autoSelectOnMount={autoSelectSearchOnMount}
        />
        {children}
      </Command>
    )
  }
)
