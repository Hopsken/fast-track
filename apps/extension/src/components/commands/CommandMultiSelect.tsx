import { useMemo } from 'react'
import {
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
  CommandLoading
} from '@internal/ui/components/command'
import { Check } from 'lucide-react'

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
  const selected = useMemo(() => {
    if (!value) return []
    return Array.isArray(value) ? value : [value]
  }, [value])

  const selectedIds = new Set(selected.map((o) => getOptionValue(o)))

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
          return (
            <CommandItem
              key={value}
              value={label}
              keywords={keywords}
              onSelect={() => toggle(opt)}>
              <div className="flex w-full items-center justify-between">
                <span className="truncate">{label}</span>
                {isSelected ? <Check className="size-4" /> : null}
              </div>
            </CommandItem>
          )
        })}
      </CommandGroup>
    </CommandList>
  )
}
