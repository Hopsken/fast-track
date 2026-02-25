'use client'

import * as React from 'react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList
} from '@internal/ui/components/combobox'
import { InputGroupAddon } from '@internal/ui/components/input-group'
import { isEqual } from 'lodash-es'

export interface SearchOption<T = unknown> {
  /** Unique identifier for the option */
  value: string
  /** Display label for the option */
  label: string
  /** Optional description shown below the label */
  description?: string
  /** Original data associated with this option */
  data: T
  /** Whether this option is disabled */
  disabled?: boolean
}

type ComboboxChangeEventDetails = {
  reason?: string
}

export interface InputSearchProps<T = unknown> {
  /** Placeholder text for the search input */
  placeholder?: string
  /** Text to show when no results are found */
  emptyText?: string
  /** Text to show while loading */
  loadingText?: string

  /**
   * Query value (what the user typed while the list is open).
   *
   * - If provided, the component is in **controlled** query mode.
   * - If omitted, the component manages query state internally (**uncontrolled**).
   */
  query?: string
  /** Called when the query changes (called in both controlled and uncontrolled modes). */
  onQueryChange?: (query: string) => void

  /** Options to show for the current query (recommendations or search results) */
  options: SearchOption<T>[]
  /** Whether options are currently loading */
  isLoading?: boolean

  /**
   * Optional Base UI filter function; defaults to `null` (no filtering).
   * Base UI calls this with the item's `value` (string) and the current query.
   */
  filter?: boolean

  /** Currently selected value (SearchOption.value) */
  value?: T
  /** Callback when selection changes */
  onSelect?: (option: T | null) => void

  isSameValue?: (a: T, b: T) => boolean

  /** Whether the search input is disabled */
  disabled?: boolean
  /** Additional className for the input */
  className?: string

  /** Input id */
  id?: string
  /** Input name (for autofill) */
  name?: string
  /** Autocomplete hint */
  autoComplete?: string
  /** `aria-label` for the input */
  ariaLabel?: string
  /** `aria-labelledby` for the input */
  ariaLabelledBy?: string

  /** Render custom option content */
  renderOption?: (
    option: SearchOption<T>,
    isSelected: boolean
  ) => React.ReactNode
  renderOptionIcon?: (option: SearchOption<T>) => React.ReactNode
  /** Allow clearing the selection */
  clearable?: boolean
}

export function InputSearch<T = unknown>({
  placeholder = 'Search...',
  emptyText = 'No results found.',
  loadingText = 'Loading...',
  query: controlledQuery,
  onQueryChange,
  options,
  isLoading = false,
  filter = true,
  value,
  onSelect,
  isSameValue = isEqual,
  disabled = false,
  className,
  id,
  name,
  autoComplete,
  ariaLabel,
  ariaLabelledBy,
  renderOption,
  renderOptionIcon,
  clearable = true
}: InputSearchProps<T>) {
  const [open, setOpen] = useState(false)
  const openRef = useRef(open)

  const isQueryControlled = controlledQuery !== undefined
  const [uncontrolledQuery, setUncontrolledQuery] = useState('')

  const query = isQueryControlled ? controlledQuery : uncontrolledQuery

  const setQuery = useCallback(
    (next: string) => {
      if (!isQueryControlled) setUncontrolledQuery(next)
      onQueryChange?.(next)
    },
    [isQueryControlled, onQueryChange]
  )

  const [selectedCache, setSelectedCache] = useState<SearchOption<T> | null>(
    null
  )

  const selectedOption = useMemo(() => {
    if (value === undefined || value === null) return null

    const fromOptions =
      options.find((opt) => isSameValue(opt.data, value)) ?? null
    if (fromOptions) return fromOptions

    // Keep showing the last selected label even if options are empty
    if (selectedCache && isSameValue(selectedCache.data, value))
      return selectedCache

    return null
  }, [options, selectedCache, value, isSameValue])

  // Keep a cache of the last selected option for display purposes.
  // Note: We intentionally set state in this effect because `selectedCache`
  // is derived from props and we want to preserve the label when `options`
  // are temporarily empty.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (value === undefined || value === null) {
      if (selectedCache) setSelectedCache(null)
      return
    }

    const fromOptions = options.find((opt) => opt.data === value) ?? null
    if (fromOptions && fromOptions !== selectedCache) {
      setSelectedCache(fromOptions)
    }
  }, [options, selectedCache, value])
  /* eslint-enable react-hooks/set-state-in-effect */

  const displayLabel = selectedOption?.label

  // When closed, show the selected label as the input value.
  // When open, show the controlled query.
  const inputValue = open ? query : (displayLabel ?? '')

  useEffect(() => {
    openRef.current = open
  }, [open])

  const handleValueChange = useCallback(
    (next: SearchOption<T> | null) => {
      setSelectedCache(next)
      onSelect?.(next?.data ?? null)
      // Clear query so next open starts from recommendations.
      setQuery('')
    },
    [onSelect, setQuery]
  )

  const defaultRenderOption = (option: SearchOption<T>) => (
    <div className="flex w-full items-center gap-2 overflow-hidden">
      {renderOptionIcon ? (
        <span className="flex shrink-0 items-center">
          {renderOptionIcon(option)}
        </span>
      ) : null}
      <div className="flex flex-1 flex-col overflow-hidden">
        <span className="truncate">{option.label}</span>
        {option.description ? (
          <span className="text-muted-foreground truncate text-xs">
            {option.description}
          </span>
        ) : null}
      </div>
    </div>
  )

  const filteredOptions = useMemo(() => {
    if (!filter || !query.trim()) return options
    const lowerQuery = query.toLowerCase()
    return options.filter((opt) => opt.label.toLowerCase().includes(lowerQuery))
  }, [filter, query, options])

  // Base UI combobox will clear the current selection if the selected value
  // is not present in `items`. Keep the selected option in the internal items
  // array so the input can continue to display the selected label even when
  // the current query yields an empty options list.
  const comboboxItems = useMemo(() => {
    if (!selectedOption) return filteredOptions
    const hasSelected = filteredOptions.some(
      (o) => o.value === selectedOption.value
    )
    return hasSelected ? filteredOptions : [selectedOption, ...filteredOptions]
  }, [filteredOptions, selectedOption])

  const optionRenderer =
    renderOption ?? ((opt: SearchOption<T>) => defaultRenderOption(opt))

  return (
    <Combobox<SearchOption<T>>
      items={comboboxItems}
      value={selectedOption}
      onValueChange={handleValueChange}
      inputValue={inputValue}
      onInputValueChange={(next, eventDetails) => {
        const details = eventDetails as unknown as ComboboxChangeEventDetails

        // Only treat actual typing/clearing as user input.
        // Base UI also fires input updates for selection/navigation; we ignore those.
        if (
          details?.reason &&
          details.reason !== 'input-change' &&
          details.reason !== 'input-clear' &&
          details.reason !== 'clear-press'
        ) {
          return
        }

        if (!openRef.current) return
        setQuery(next)
      }}
      onOpenChange={(next) => {
        const wasOpen = openRef.current

        // Some combobox implementations may fire onOpenChange(true) more than once.
        // Only run "open" initialization logic on an actual closed -> open transition.
        if (next && !wasOpen) {
          setQuery('')
        }

        openRef.current = next
        setOpen(next)
      }}
      // Always open on input click.
      openOnInputClick
      disabled={disabled}>
      <ComboboxInput
        id={id}
        name={name}
        autoComplete={autoComplete}
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy}
        placeholder={placeholder}
        className={className}
        disabled={disabled}
        showClear={clearable && Boolean(value)}
        showTrigger={!clearable || !value}>
        {renderOptionIcon && selectedOption ? (
          <InputGroupAddon align="inline-start">
            {renderOptionIcon(selectedOption)}
          </InputGroupAddon>
        ) : null}
      </ComboboxInput>

      <ComboboxContent>
        <ComboboxEmpty>{isLoading ? loadingText : emptyText}</ComboboxEmpty>

        <ComboboxList>
          {filteredOptions.map((option) => (
            <ComboboxItem
              key={option.value}
              value={option}
              disabled={option.disabled}>
              {optionRenderer(option, option.data === value)}
            </ComboboxItem>
          ))}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  )
}
