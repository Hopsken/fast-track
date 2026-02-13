import { useMemo, useState } from 'react'
import { useMemoizedFn } from 'ahooks'
import { first } from 'lodash-es'
import { Check } from 'lucide-react'
import { isHotkeyPressed } from 'react-hotkeys-hook'

import {
  ActionPanel,
  ActionGroup,
  ActionItem,
  ActionList
} from '@/common/commands'

import { GeneralIcon } from '../ui'

import { getIconUrl } from './utils'

export type CommandMultiSelectProps<T> = {
  title?: React.ReactNode
  isLoading?: boolean

  value?: T[]
  onChange: (value: T[] | null) => void
  onConfirm?: () => void

  search?: string
  onSearchChange?: (search: string) => void

  options: T[]
  shouldFilter?: boolean
  getOptionValue: (option: T) => string
  getOptionLabel?: (option: T) => string
  getOptionKeywords?: (option: T) => string[]
}

export function CommandMultiSelect<T>({
  title,
  isLoading,
  value,
  onChange,
  onConfirm,
  search,
  onSearchChange,
  options,
  shouldFilter,
  getOptionValue,
  getOptionLabel,
  getOptionKeywords
}: CommandMultiSelectProps<T>) {
  const [defaultValue] = useState(() => {
    if (!Array.isArray(value)) return ''
    const firstOpt = first(value)
    if (!firstOpt) return ''
    return getOptionValue(firstOpt)
  })

  const selected = useMemo(() => {
    if (!value) return []
    return Array.isArray(value) ? value : [value]
  }, [value])

  const selectedIds = new Set(selected.map((o) => getOptionValue(o)))

  const toggle = useMemoizedFn((opt: T) => {
    const next = selectedIds.has(getOptionValue(opt))
      ? selected.filter((o) => getOptionValue(o) !== getOptionValue(opt))
      : [...selected, opt]
    onChange(next)
  })

  const onSelect = useMemoizedFn((opt: T) => {
    if (isHotkeyPressed('meta')) {
      onConfirm?.()
    } else {
      toggle(opt)
    }
  })

  return (
    <ActionPanel
      defaultValue={defaultValue}
      search={search}
      onSearchChange={onSearchChange}
      shouldFilter={shouldFilter}
      searchPlaceholder="Type to search...">
      <ActionList isLoading={isLoading} emptyPlaceholder="No available options">
        <ActionGroup heading={title}>
          {options.map((opt) => {
            const value = getOptionValue(opt)
            const label = getOptionLabel?.(opt) ?? value
            const isSelected = selectedIds.has(value)
            const keywords = getOptionKeywords?.(opt)
            const iconUrl = getIconUrl(opt)
            return (
              <ActionItem
                key={value}
                value={label}
                keywords={keywords}
                onSelect={() => onSelect(opt)}>
                <div className="flex w-full items-center justify-between">
                  <div className="flex items-center gap-2">
                    {iconUrl ? (
                      <GeneralIcon alt={label} iconUrl={iconUrl} />
                    ) : null}
                    <span className="truncate">{label}</span>
                  </div>
                  {isSelected ? <Check className="size-4" /> : null}
                </div>
              </ActionItem>
            )
          })}
        </ActionGroup>
      </ActionList>
    </ActionPanel>
  )
}
