'use client'

import * as React from 'react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList
} from '@internal/ui/components/combobox'
import { InputGroupAddon } from '@internal/ui/components/input-group'

/**
 * Internal option type that wraps user data with UI-required fields
 */
interface InternalOption<T> {
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

export interface AutoCompleteProps<T, Multiple extends boolean = false> {
  /** Placeholder text for the search input */
  placeholder?: string
  /** Text to show when no results are found */
  emptyText?: string
  /** Text to show while loading */
  loadingText?: string

  /**
   * Search query value.
   * If provided, the component is in controlled query mode.
   * If omitted, the component manages query state internally.
   */
  query?: string
  /** Called when the query changes */
  onQueryChange?: (query: string) => void

  /** Options to display based on current query */
  options: T[]
  /** Whether options are currently loading */
  isLoading?: boolean

  /**
   * Function to extract unique value from option.
   * Used as the key and for option comparison.
   */
  getOptionValue: (option: T) => string
  /**
   * Function to extract display label from option
   */
  getOptionLabel: (option: T) => string
  /**
   * Optional function to extract description from option
   */
  getOptionDescription?: (option: T) => string

  /**
   * Currently selected value(s).
   * - Single mode: T | null | undefined
   * - Multiple mode: T[]
   */
  value: Multiple extends true ? T[] : T | null | undefined
  /**
   * Called when selection changes.
   * - Single mode: receives T | null
   * - Multiple mode: receives T[]
   */
  onValueChange: (value: Multiple extends true ? T[] : T | null) => void

  /** Whether the input is disabled */
  disabled?: boolean
  /** Additional className for the root element */
  className?: string

  /** Input id */
  id?: string
  /** Input name (for forms) */
  name?: string
  /** Autocomplete hint */
  autoComplete?: string
  /** aria-label for accessibility */
  ariaLabel?: string
  /** aria-labelledby for accessibility */
  ariaLabelledBy?: string

  /** Custom renderer for option content */
  renderOption?: (option: T, isSelected: boolean) => React.ReactNode
  /** Custom renderer for option icon */
  renderOptionIcon?: (option: T) => React.ReactNode

  /** Enable multiple selection mode */
  multiple?: Multiple
  /** Allow clearing the selection */
  clearable?: boolean
  /** Enable client-side filtering */
  filter?: boolean
}

/**
 * AutoComplete component supporting both single and multiple selection modes with async search.
 *
 * @example Single select with async search
 * ```tsx
 * const [query, setQuery] = useState('')
 * const [users, setUsers] = useState<User[]>([])
 * const [isLoading, setIsLoading] = useState(false)
 * const [value, setValue] = useState<User | null>(null)
 *
 * useEffect(() => {
 *   if (query) {
 *     setIsLoading(true)
 *     searchUsers(query).then(results => {
 *       setUsers(results)
 *       setIsLoading(false)
 *     })
 *   }
 * }, [query])
 *
 * <AutoComplete
 *   value={value}
 *   onValueChange={setValue}
 *   options={users}
 *   isLoading={isLoading}
 *   query={query}
 *   onQueryChange={setQuery}
 *   getOptionValue={(user) => user.id}
 *   getOptionLabel={(user) => user.name}
 * />
 * ```
 *
 * @example Multiple select
 * ```tsx
 * <AutoComplete
 *   multiple
 *   value={selectedTags}
 *   onValueChange={setSelectedTags}
 *   options={availableTags}
 *   getOptionValue={(tag) => tag.id}
 *   getOptionLabel={(tag) => tag.name}
 * />
 * ```
 */
// eslint-disable-next-line sonarjs/cognitive-complexity
export function AutoComplete<T, Multiple extends boolean = false>({
  placeholder = 'Search...',
  emptyText = 'No results found.',
  loadingText = 'Loading...',
  query: controlledQuery,
  onQueryChange,
  options,
  isLoading = false,
  getOptionValue,
  getOptionLabel,
  getOptionDescription,
  value,
  onValueChange,
  disabled = false,
  className,
  id,
  name,
  autoComplete,
  ariaLabel,
  ariaLabelledBy,
  renderOption,
  renderOptionIcon,
  multiple = false as Multiple,
  clearable = true,
  filter = true
}: AutoCompleteProps<T, Multiple>) {
  const [open, setOpen] = useState(false)
  const openRef = useRef(open)
  const [anchorElement, setAnchorElement] = useState<HTMLDivElement | null>(
    null
  )
  const anchorRef = useCallback((node: HTMLDivElement | null) => {
    setAnchorElement(node)
  }, [])

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

  // Convert user options to internal format
  const internalOptions = useMemo<InternalOption<T>[]>(
    () =>
      options.map((option) => ({
        value: getOptionValue(option),
        label: getOptionLabel(option),
        description: getOptionDescription?.(option),
        data: option,
        disabled: false
      })),
    [options, getOptionValue, getOptionLabel, getOptionDescription]
  )

  // Cache to maintain display of selected options when they temporarily disappear from options list
  const [selectedCache, setSelectedCache] = useState<
    Map<string, InternalOption<T>>
  >(new Map())

  // Compute currently selected options from internal options or cache
  const selectedOptions = useMemo(() => {
    if (multiple) {
      const values = (value as T[]) ?? []
      return values
        .map((v) => {
          const key = getOptionValue(v)
          return (
            internalOptions.find((opt) => opt.value === key) ||
            selectedCache.get(key) ||
            null
          )
        })
        .filter((opt): opt is InternalOption<T> => opt !== null)
    } else {
      const v = value as T | null | undefined
      if (v === null || v === undefined) return null
      const key = getOptionValue(v)
      return (
        internalOptions.find((opt) => opt.value === key) ||
        selectedCache.get(key) ||
        null
      )
    }
  }, [multiple, value, internalOptions, selectedCache, getOptionValue])

  // Update cache with latest selected options from internalOptions
  useEffect(() => {
    const newCacheEntries: Array<[string, InternalOption<T>]> = []

    if (multiple) {
      const values = (value as T[]) ?? []
      values.forEach((v) => {
        const key = getOptionValue(v)
        const option = internalOptions.find((opt) => opt.value === key)
        if (option) {
          newCacheEntries.push([key, option])
        }
      })
    } else {
      const v = value as T | null | undefined
      if (v) {
        const key = getOptionValue(v)
        const option = internalOptions.find((opt) => opt.value === key)
        if (option) {
          newCacheEntries.push([key, option])
        }
      }
    }

    if (newCacheEntries.length > 0) {
      setSelectedCache(new Map(newCacheEntries))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [multiple, value, internalOptions])

  useEffect(() => {
    openRef.current = open
  }, [open])

  // Handle selection changes for multiple mode
  const handleMultipleValueChange = useCallback(
    (next: InternalOption<T>[] | null) => {
      const nextArray = next ?? []
      const nextData = nextArray.map((opt) => opt.data)
      ;(onValueChange as (value: T[]) => void)(nextData)
    },
    [onValueChange]
  )

  // Handle selection changes for single mode
  const handleSingleValueChange = useCallback(
    (next: InternalOption<T> | null) => {
      ;(onValueChange as (value: T | null) => void)(next?.data ?? null)
      // Clear query so next open starts fresh
      setQuery('')
    },
    [onValueChange, setQuery]
  )

  // Handle input value changes
  const handleInputValueChange = useCallback(
    (next: string, eventDetails: unknown) => {
      const details = eventDetails as ComboboxChangeEventDetails
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
    },
    [setQuery]
  )

  // Handle open state changes
  const handleOpenChange = useCallback(
    (next: boolean) => {
      const wasOpen = openRef.current
      if (next && !wasOpen) {
        setQuery('')
      }
      openRef.current = next
      setOpen(next)
    },
    [setQuery]
  )

  // Default option renderer
  const defaultRenderOption = (option: InternalOption<T>) => (
    <div className="flex w-full items-center gap-2 overflow-hidden">
      {renderOptionIcon ? (
        <span className="flex shrink-0 items-center">
          {renderOptionIcon(option.data)}
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

  // Filter options based on query
  const filteredOptions = useMemo(() => {
    if (!filter || !query.trim()) return internalOptions
    const lowerQuery = query.toLowerCase()
    return internalOptions.filter((opt) =>
      opt.label.toLowerCase().includes(lowerQuery)
    )
  }, [filter, query, internalOptions])

  // Keep selected options in the list so combobox doesn't clear them
  const comboboxItems = useMemo(() => {
    if (multiple) {
      const selected = selectedOptions as InternalOption<T>[]
      if (selected.length === 0) return filteredOptions

      const selectedValues = new Set(selected.map((s) => s.value))
      const unselectedFiltered = filteredOptions.filter(
        (o) => !selectedValues.has(o.value)
      )
      return [...selected, ...unselectedFiltered]
    } else {
      const selected = selectedOptions as InternalOption<T> | null
      if (!selected) return filteredOptions
      const hasSelected = filteredOptions.some(
        (o) => o.value === selected.value
      )
      return hasSelected ? filteredOptions : [selected, ...filteredOptions]
    }
  }, [multiple, filteredOptions, selectedOptions])

  const optionRenderer = renderOption
    ? (opt: InternalOption<T>) => {
        const isSelected = multiple
          ? (selectedOptions as InternalOption<T>[]).some(
              (s) => s.value === opt.value
            )
          : (selectedOptions as InternalOption<T> | null)?.value === opt.value
        return renderOption(opt.data, isSelected)
      }
    : defaultRenderOption

  // Render multiple select mode
  if (multiple) {
    const selectedArray = selectedOptions as InternalOption<T>[]
    const comboboxValue = selectedArray

    return (
      <div className={className}>
        <Combobox<InternalOption<T>, true>
          items={comboboxItems}
          value={comboboxValue}
          onValueChange={handleMultipleValueChange}
          inputValue={query}
          onInputValueChange={handleInputValueChange}
          onOpenChange={handleOpenChange}
          multiple
          openOnInputClick
          disabled={disabled}>
          <ComboboxChips ref={anchorRef}>
            {selectedArray.map((option) => (
              <ComboboxChip key={option.value}>
                {renderOptionIcon ? (
                  <span className="flex shrink-0 items-center">
                    {renderOptionIcon(option.data)}
                  </span>
                ) : null}
                {option.label}
              </ComboboxChip>
            ))}
            <ComboboxChipsInput
              id={id}
              name={name}
              autoComplete={autoComplete}
              aria-label={ariaLabel}
              aria-labelledby={ariaLabelledBy}
              placeholder={selectedArray.length === 0 ? placeholder : undefined}
              disabled={disabled}
            />
          </ComboboxChips>

          <ComboboxContent anchor={anchorElement ?? undefined}>
            <ComboboxEmpty>{isLoading ? loadingText : emptyText}</ComboboxEmpty>

            <ComboboxList>
              {filteredOptions.map((option) => (
                <ComboboxItem
                  key={option.value}
                  value={option}
                  disabled={option.disabled}>
                  {optionRenderer(option)}
                </ComboboxItem>
              ))}
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
      </div>
    )
  }

  // Render single select mode
  const selectedSingle = selectedOptions as InternalOption<T> | null
  const displayLabel = selectedSingle?.label
  const inputValue = open ? query : (displayLabel ?? '')

  return (
    <div className={className}>
      <Combobox<InternalOption<T>, false>
        items={comboboxItems}
        value={selectedSingle}
        onValueChange={handleSingleValueChange}
        inputValue={inputValue}
        onInputValueChange={handleInputValueChange}
        onOpenChange={handleOpenChange}
        openOnInputClick
        disabled={disabled}>
        <ComboboxInput
          id={id}
          name={name}
          autoComplete={autoComplete}
          aria-label={ariaLabel}
          aria-labelledby={ariaLabelledBy}
          placeholder={placeholder}
          disabled={disabled}
          showClear={clearable && Boolean(selectedSingle)}
          showTrigger={!clearable || !selectedSingle}>
          {renderOptionIcon && selectedSingle ? (
            <InputGroupAddon align="inline-start">
              {renderOptionIcon(selectedSingle.data)}
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
                {optionRenderer(option)}
              </ComboboxItem>
            ))}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    </div>
  )
}
