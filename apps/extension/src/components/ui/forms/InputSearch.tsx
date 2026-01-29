'use client'

import * as React from 'react'
import { useCallback, useEffect, useRef, useState } from 'react'
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxInput,
  ComboboxItem,
  ComboboxLabel,
  ComboboxList
} from '@internal/ui/components/combobox'

export interface SearchOption<T = unknown> {
  /** Unique identifier for the option */
  value: string
  /** Display label for the option */
  label: string
  /** Optional description shown below the label */
  description?: string
  /** Optional icon to display */
  icon?: React.ReactNode
  /** Original data associated with this option */
  data?: T
  /** Whether this option is disabled */
  disabled?: boolean
}

export interface InputSearchProps<T = unknown> {
  /** Placeholder text for the search input */
  placeholder?: string
  /** Text to show when no results are found */
  emptyText?: string
  /** Text to show while loading */
  loadingText?: string
  /** Currently selected value */
  value?: string
  /** Callback when selection changes */
  onSelect?: (option: SearchOption<T> | null) => void
  /** Async function to fetch search results */
  onSearch?: (query: string) => Promise<SearchOption<T>[]>
  /** Static options to use when not searching (recommendations) */
  recommendations?: SearchOption<T>[]
  /** Debounce delay in ms for search (default: 300) */
  debounceMs?: number
  /** Minimum characters before triggering search (default: 1) */
  minSearchLength?: number
  /** Whether the search input is disabled */
  disabled?: boolean
  /** Additional className for the input */
  className?: string
  /** Label for recommendations group */
  recommendationsLabel?: string
  /** Label for search results group */
  resultsLabel?: string
  /** Render custom option content */
  renderOption?: (
    option: SearchOption<T>,
    isSelected: boolean
  ) => React.ReactNode
  /** Allow clearing the selection */
  clearable?: boolean
}

export function InputSearch<T = unknown>({
  placeholder = 'Search...',
  emptyText = 'No results found.',
  loadingText = 'Searching...',
  value,
  onSelect,
  onSearch,
  recommendations = [],
  debounceMs = 300,
  minSearchLength = 1,
  disabled = false,
  className,
  recommendationsLabel = 'Recommendations',
  resultsLabel = 'Results',
  renderOption,
  clearable = true
}: InputSearchProps<T>) {
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [searchResults, setSearchResults] = useState<SearchOption<T>[]>([])
  const [hasSearched, setHasSearched] = useState(false)

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  // Combine all options for combobox
  const allOptions = React.useMemo(() => {
    const optionsMap = new Map<string, SearchOption<T>>()

    // Add recommendations first
    recommendations.forEach((opt) => optionsMap.set(opt.value, opt))

    // Add search results (may override recommendations with same value)
    searchResults.forEach((opt) => optionsMap.set(opt.value, opt))

    return Array.from(optionsMap.values())
  }, [recommendations, searchResults])

  // Find the selected option
  const selectedOption = React.useMemo(() => {
    if (!value) return null
    return allOptions.find((opt) => opt.value === value) || null
  }, [value, allOptions])

  // Perform async search with debouncing
  const performSearch = useCallback(
    async (query: string) => {
      // Cancel previous request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }

      if (!onSearch || query.length < minSearchLength) {
        setSearchResults([])
        setHasSearched(false)
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      setHasSearched(true)

      abortControllerRef.current = new AbortController()

      try {
        const results = await onSearch(query)
        setSearchResults(results)
      } catch (error) {
        // Ignore abort errors
        if (error instanceof Error && error.name === 'AbortError') {
          return
        }
        console.error('Search failed:', error)
        setSearchResults([])
      } finally {
        setIsLoading(false)
      }
    },
    [onSearch, minSearchLength]
  )

  // Handle input changes with debouncing
  const handleInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = event.target.value
      setInputValue(newValue)

      // Clear previous debounce
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }

      // Schedule new search
      debounceRef.current = setTimeout(() => {
        performSearch(newValue)
      }, debounceMs)
    },
    [debounceMs, performSearch]
  )

  // Handle value change from combobox
  const handleValueChange = useCallback(
    (newValue: string | null) => {
      if (!newValue && clearable) {
        onSelect?.(null)
        return
      }

      if (!newValue) return

      const option = allOptions.find((opt) => opt.value === newValue)
      if (option) {
        onSelect?.(option)
      }
    },
    [allOptions, onSelect, clearable]
  )

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [])

  // Default option renderer
  const defaultRenderOption = (
    option: SearchOption<T>,
    _isSelected: boolean
  ) => (
    <div className="flex w-full items-center gap-2 overflow-hidden">
      {option.icon && (
        <span className="flex shrink-0 items-center">{option.icon}</span>
      )}
      <div className="flex flex-1 flex-col overflow-hidden">
        <span className="truncate">{option.label}</span>
        {option.description && (
          <span className="text-muted-foreground truncate text-xs">
            {option.description}
          </span>
        )}
      </div>
    </div>
  )

  const optionRenderer = renderOption || defaultRenderOption

  // Determine what to show
  const showRecommendations =
    recommendations.length > 0 && inputValue.length < minSearchLength
  const showResults = hasSearched && searchResults.length > 0
  const showEmpty =
    hasSearched &&
    !isLoading &&
    searchResults.length === 0 &&
    !showRecommendations
  const showLoading = isLoading

  return (
    <Combobox
      value={value || ''}
      onValueChange={handleValueChange}
      disabled={disabled}>
      <ComboboxInput
        placeholder={selectedOption?.label || placeholder}
        className={className}
        disabled={disabled}
        showClear={clearable && !!value}
        showTrigger={!clearable || !value}
        onChange={handleInputChange}
        value={inputValue}
      />
      <ComboboxContent>
        <ComboboxList>
          {showLoading && (
            <div className="text-muted-foreground py-6 text-center text-sm">
              {loadingText}
            </div>
          )}

          {showEmpty && <ComboboxEmpty>{emptyText}</ComboboxEmpty>}

          {showRecommendations && (
            <ComboboxGroup>
              <ComboboxLabel>{recommendationsLabel}</ComboboxLabel>
              {recommendations.map((option) => (
                <ComboboxItem
                  key={option.value}
                  value={option.value}
                  disabled={option.disabled}>
                  {optionRenderer(option, option.value === value)}
                </ComboboxItem>
              ))}
            </ComboboxGroup>
          )}

          {showResults && (
            <ComboboxGroup>
              <ComboboxLabel>{resultsLabel}</ComboboxLabel>
              {searchResults.map((option) => (
                <ComboboxItem
                  key={option.value}
                  value={option.value}
                  disabled={option.disabled}>
                  {optionRenderer(option, option.value === value)}
                </ComboboxItem>
              ))}
            </ComboboxGroup>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  )
}
