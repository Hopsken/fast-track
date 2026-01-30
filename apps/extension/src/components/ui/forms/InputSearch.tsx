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
  id,
  name,
  autoComplete,
  ariaLabel,
  ariaLabelledBy,
  renderOption,
  clearable = true
}: InputSearchProps<T>) {
  const [open, setOpen] = useState(false)
  const openRef = useRef(open)

  const [inputValue, setInputValue] = useState('')
  const [selectedLabel, setSelectedLabel] = useState('')

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

  const displayLabel = selectedOption?.label ?? selectedLabel

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
        setSelectedLabel('')
        setSearchResults([])
        setHasSearched(false)
        setIsSearching(false)
        return
      }

      const option = allOptions.find((opt) => opt.value === next)
      const resolved = option ?? { value: next, label: next }

      onSelect?.(resolved)

      // Cache the label so the input can still show the selection even if it's
      // not present in recommendations/search results.
      setSelectedLabel(resolved.label)

      // Reset search state; we want the selected label to be shown as the input value.
      setSearchResults([])
      setHasSearched(false)
      setIsSearching(false)
      setInputValue(resolved.label)
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

  useEffect(() => {
    openRef.current = open
  }, [open])

  // Keep cached label in sync when we can resolve it from option lists.
  useEffect(() => {
    if (!value) return
    if (!selectedOption?.label) return
    setSelectedLabel(selectedOption.label)
  }, [selectedOption?.label, value])

  // When closed, show the selected label as the input value.
  useEffect(() => {
    if (open) return
    setInputValue(displayLabel ?? '')
  }, [displayLabel, open])

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

  const visibleOptions = useMemo(() => {
    if (shouldShowRecommendations) return recommendations
    if (shouldShowResults) return searchResults
    return []
  }, [
    recommendations,
    searchResults,
    shouldShowRecommendations,
    shouldShowResults
  ])

  const showEmptyState = useMemo(() => {
    if (isLoading) return false

    if (shouldShowRecommendations) {
      return hasLoadedRecommendations && recommendations.length === 0
    }

    if (shouldShowResults) {
      return searchResults.length === 0
    }

    return false
  }, [
    hasLoadedRecommendations,
    isLoading,
    recommendations,
    searchResults,
    shouldShowRecommendations,
    shouldShowResults
  ])

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
      onOpenChange={(next) => {
        const wasOpen = openRef.current

        // Some combobox implementations may fire onOpenChange(true) more than once.
        // Only run "open" initialization logic on an actual closed -> open transition.
        if (next && !wasOpen) {
          setInputValue('')
          setSearchResults([])
          setHasSearched(false)
          setIsSearching(false)

          if (searchDebounceRef.current) {
            clearTimeout(searchDebounceRef.current)
            searchDebounceRef.current = null
          }

          if (searchAbortRef.current) searchAbortRef.current.abort()
        }

        openRef.current = next
        setOpen(next)
      }}
      // Always open on input click (requested behavior).
      openOnInputClick
      // We control results externally (async search / recommendations).
      filter={null}
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
        showTrigger={!clearable || !value}
        onMouseDown={() => {
          ensureRecommendationsLoaded()
        }}
      />

      <ComboboxContent>
        {isLoading ? <ComboboxEmpty>{loadingText}</ComboboxEmpty> : null}

        {!isLoading && showEmptyState ? (
          <ComboboxEmpty>{emptyText}</ComboboxEmpty>
        ) : null}

        <ComboboxList>
          {!isLoading
            ? visibleOptions.map((option) => (
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
