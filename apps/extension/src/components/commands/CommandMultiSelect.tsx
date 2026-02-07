import { useMemo } from 'react'
import {
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
  CommandLoading
} from '@internal/ui/components/command'
import { useMount } from 'ahooks'
import { Check } from 'lucide-react'

import { useCommandInput } from '@/stores/command/useCommandInputStore'

import { GeneralIcon } from '../ui'

import { getIconUrl } from './utils'

export type CommandMultiSelectProps<T> = {
  title?: React.ReactNode
  isLoading?: boolean

  value?: T[]
  onChange: (value: T[] | null) => void
  onConfirm?: () => void

  options: T[]
  getOptionValue: (option: T) => string
  getOptionLabel?: (option: T) => string
  getOptionKeywords?: (option: T) => string[]
}

export function CommandMultiSelect<T>({
  title,
  isLoading,
  value,
  onChange,
  options,
  getOptionValue,
  getOptionLabel,
  getOptionKeywords
}: CommandMultiSelectProps<T>) {
  const { setValue } = useCommandInput()
  const selected = useMemo(() => {
    if (!value) return []
    return Array.isArray(value) ? value : [value]
  }, [value])

  const selectedIds = new Set(selected.map((o) => getOptionValue(o)))

  useMount(() => {
    let timeoutId: number

    if (Array.isArray(value) && value.length > 0) {
      timeoutId = window.setTimeout(() => {
        setValue(getOptionValue(value[0]!))
      }, 0)
    }

    return () => {
      if (timeoutId) {
        window.clearTimeout(timeoutId)
      }
    }
  })

  const toggle = (opt: T) => {
    const next = selectedIds.has(getOptionValue(opt))
      ? selected.filter((o) => getOptionValue(o) !== getOptionValue(opt))
      : [...selected, opt]
    onChange(next)
  }

  return (
    <CommandList>
      {isLoading && <CommandLoading>Loading...</CommandLoading>}
      {!isLoading && <CommandEmpty>No available options</CommandEmpty>}
      <CommandGroup heading={title}>
        {options.map((opt) => {
          const value = getOptionValue(opt)
          const label = getOptionLabel?.(opt) ?? value
          const isSelected = selectedIds.has(value)
          const keywords = getOptionKeywords?.(opt)
          const iconUrl = getIconUrl(opt)
          return (
            <CommandItem
              key={value}
              value={label}
              keywords={keywords}
              onSelect={() => toggle(opt)}>
              <div className="flex w-full items-center justify-between">
                <div className="flex items-center gap-2">
                  {iconUrl ? (
                    <GeneralIcon alt={label} iconUrl={iconUrl} />
                  ) : null}
                  <span className="truncate">{label}</span>
                </div>
                {isSelected ? <Check className="size-4" /> : null}
              </div>
            </CommandItem>
          )
        })}
      </CommandGroup>
    </CommandList>
  )
}
