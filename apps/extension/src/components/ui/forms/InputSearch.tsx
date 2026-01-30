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

type ComboboxChangeEventDetails = {
  reason?: string
}

export interface InputSearchProps<T = unknown> {
  /** Placeholder text for the search input */
  placeholder?: string
  /** Text to show when no results are found */
  emptyText?: string
  /** Text to show while loading (searching or loading recommendations) */
  loadingText?: string

  /** Currently selected value (SearchOption.value) */
  value?: string
  /** Callback when selection changes */
  onSelect?: (option: SearchOption<T> | null) => void

  /** Async function to fetch search results (query length >= minSearchLength) */
  onSearch?: (query: string) => Promise<SearchOption<T>[]>

  /**
   * Async function to fetch recommendations shown when query length < minSearchLength.
   * Loaded lazily when the list opens.
   */
  getRecommendations?: () => Promise<SearchOption<T>[]>

  /** Debounce delay in ms for search (default: 300) */
  debounceMs?: number
  /** Minimum characters before triggering search (default: 1) */
  minSearchLength?: number

  /** Whether the search input is disabled */
  disabled?: boolean
  /** Additional className for the input */
  className?: string

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
  getRecommendations,
  debounceMs = 300,
  minSearchLength = 1,
  disabled = false,
  className,
  renderOption,
  clearable = true
}: InputSearchProps<T>) {
  const [open, setOpen] = useState(false)

  const [inputValue, setInputValue] = useState('')

  const [isSearching, setIsSearching] = useState(false)
  const [searchResults, setSearchResults] = useState<SearchOption<T>[]>([])
  const [hasSearched, setHasSearched] = useState(false)

  const [isLoadingRecommendations, setIsLoadingRecommendations] =
    useState(false)
  const [recommendations, setRecommendations] = useState<SearchOption<T>[]>([])
  const [hasLoadedRecommendations, setHasLoadedRecommendations] =
    useState(false)

  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const searchAbortRef = useRef<AbortController | null>(null)
  const recommendationsAbortRef = useRef<AbortController | null>(null)

  const allOptions = useMemo(() => {
    const map = new Map<string, SearchOption<T>>()
    for (const opt of recommendations) map.set(opt.value, opt)
    for (const opt of searchResults) map.set(opt.value, opt)
    return Array.from(map.values())
  }, [recommendations, searchResults])

  const selectedOption = useMemo(() => {
    if (!value) return null
    return allOptions.find((opt) => opt.value === value) ?? null
  }, [allOptions, value])

  const shouldShowRecommendations = inputValue.length < minSearchLength
  const shouldShowResults = hasSearched && inputValue.length >= minSearchLength

  const performSearch = useCallback(
    async (query: string) => {
      if (searchAbortRef.current) searchAbortRef.current.abort()

      if (!onSearch || query.length < minSearchLength) {
        setSearchResults([])
        setHasSearched(false)
        setIsSearching(false)
        return
      }

      setHasSearched(true)
      setIsSearching(true)

      searchAbortRef.current = new AbortController()

      try {
        const results = await onSearch(query)
        setSearchResults(results)
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') return
        setSearchResults([])
      } finally {
        setIsSearching(false)
      }
    },
    [minSearchLength, onSearch]
  )

  const handleUserInputValueChange = useCallback(
    (next: string) => {
      setInputValue(next)

      if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current)
      searchDebounceRef.current = setTimeout(() => {
        void performSearch(next)
      }, debounceMs)
    },
    [debounceMs, performSearch]
  )

  const handleValueChange = useCallback(
    (next: string | null) => {
      if (!next) {
        onSelect?.(null)
        setInputValue('')
        setSearchResults([])
        setHasSearched(false)
        setIsSearching(false)
        return
      }

      const option = allOptions.find((opt) => opt.value === next)
      onSelect?.(option ?? { value: next, label: next })

      // keep the input empty so the selected value shows as placeholder
      setInputValue('')
    },
    [allOptions, onSelect]
  )

  // If recommendation loader changes, reset cached recommendations.
  useEffect(() => {
    setRecommendations([])
    setHasLoadedRecommendations(false)
    setIsLoadingRecommendations(false)
    if (recommendationsAbortRef.current) recommendationsAbortRef.current.abort()
  }, [getRecommendations])

  const ensureRecommendationsLoaded = useCallback(() => {
    if (!getRecommendations) return
    if (!shouldShowRecommendations) return
    if (hasLoadedRecommendations) return
    if (isLoadingRecommendations) return

    if (recommendationsAbortRef.current) recommendationsAbortRef.current.abort()
    recommendationsAbortRef.current = new AbortController()

    setIsLoadingRecommendations(true)

    let cancelled = false
    getRecommendations()
      .then((items) => {
        if (cancelled) return
        setRecommendations(items)
        setHasLoadedRecommendations(true)
      })
      .catch((error) => {
        if (cancelled) return
        if (error instanceof Error && error.name === 'AbortError') return
        setRecommendations([])
        setHasLoadedRecommendations(true)
      })
      .finally(() => {
        if (cancelled) return
        setIsLoadingRecommendations(false)
      })

    return () => {
      cancelled = true
    }
  }, [
    getRecommendations,
    hasLoadedRecommendations,
    isLoadingRecommendations,
    shouldShowRecommendations
  ])

  // Lazy-load recommendations when the list opens and we're in recommendation mode.
  useEffect(() => {
    if (!open) return
    ensureRecommendationsLoaded()
  }, [ensureRecommendationsLoaded, open])

  useEffect(() => {
    return () => {
      if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current)
      if (searchAbortRef.current) searchAbortRef.current.abort()
      if (recommendationsAbortRef.current)
        recommendationsAbortRef.current.abort()
    }
  }, [])

  const defaultRenderOption = (option: SearchOption<T>) => (
    <div className="flex w-full items-center gap-2 overflow-hidden">
      {option.icon ? (
        <span className="flex shrink-0 items-center">{option.icon}</span>
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

  const optionRenderer =
    renderOption ?? ((opt: SearchOption<T>) => defaultRenderOption(opt))

  const isLoading = isSearching || isLoadingRecommendations

  return (
    <Combobox<string>
      value={value ?? null}
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

        handleUserInputValueChange(next)
      }}
      onOpenChange={(next) => setOpen(next)}
      // Always open on input click (requested behavior).
      openOnInputClick
      // We control results externally (async search / recommendations).
      filter={null}
      disabled={disabled}>
      <ComboboxInput
        placeholder={selectedOption?.label ?? placeholder}
        className={className}
        disabled={disabled}
        showClear={clearable && Boolean(value)}
        showTrigger={!clearable || !value}
        onMouseDown={() => {
          ensureRecommendationsLoaded()
        }}
      />

      <ComboboxContent>
        {!isLoading ? <ComboboxEmpty>{emptyText}</ComboboxEmpty> : null}
        <ComboboxList>
          {isLoading ? (
            <div className="text-muted-foreground py-6 text-center text-sm">
              {loadingText}
            </div>
          ) : null}
          {shouldShowRecommendations
            ? recommendations.map((option) => (
                <ComboboxItem
                  key={option.value}
                  value={option.value}
                  disabled={option.disabled}>
                  {optionRenderer(option, option.value === value)}
                </ComboboxItem>
              ))
            : null}

          {shouldShowResults
            ? searchResults.map((option) => (
                <ComboboxItem
                  key={option.value}
                  value={option.value}
                  disabled={option.disabled}>
                  {optionRenderer(option, option.value === value)}
                </ComboboxItem>
              ))
            : null}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  )
}
