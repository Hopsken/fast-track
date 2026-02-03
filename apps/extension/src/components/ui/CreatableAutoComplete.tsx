'use client'

import { useCallback, useMemo, useState } from 'react'

import { AutoComplete } from './AutoComplete'

/**
 * Special marker to identify create option
 */
const CREATE_OPTION_PREFIX = '__create__:'

interface CreatableAutoCompleteProps<Multiple extends boolean = false> {
  /**
   * Currently selected value(s).
   * - Single mode: string | null | undefined
   * - Multiple mode: string[]
   */
  value: Multiple extends true ? string[] : string | null | undefined
  /**
   * Called when selection changes.
   * - Single mode: receives string | null
   * - Multiple mode: receives string[]
   */
  onValueChange: (
    value: Multiple extends true ? string[] : string | null
  ) => void

  /** Available options to select from */
  options: string[]
  /** Whether options are currently loading */
  isLoading?: boolean

  /**
   * Search query value (controlled).
   * If provided, component is in controlled query mode.
   */
  query?: string
  /** Called when the query changes */
  onQueryChange?: (query: string) => void

  /**
   * Called when user creates a new option.
   * Can return a Promise for async creation.
   * If not provided, creation is handled automatically.
   */
  onCreate?: (value: string) => void | Promise<void>
  /**
   * Function to customize the "Create X" text.
   * @param query - The current search query
   * @returns The display text for the create option
   * @default (query) => `Create "${query}"`
   */
  createText?: (query: string) => string
  /**
   * Whether to allow creating new options.
   * @default true
   */
  allowCreate?: boolean

  /** Placeholder text for the search input */
  placeholder?: string
  /** Text to show when no results are found and creation is disabled */
  emptyText?: string
  /** Text to show while loading */
  loadingText?: string

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

  /** Enable multiple selection mode */
  multiple?: Multiple
  /** Allow clearing the selection */
  clearable?: boolean
  /** Enable client-side filtering (default: true) */
  filter?: boolean
}

/**
 * CreatableAutoComplete - AutoComplete with support for creating new string options.
 *
 * Extends AutoComplete to allow users to create new options when their query
 * doesn't match any existing options. Only supports string types.
 *
 * @example Single select with creation
 * ```tsx
 * const [selectedTag, setSelectedTag] = useState<string | null>(null)
 * const [tags, setTags] = useState(['React', 'TypeScript', 'Node.js'])
 *
 * <CreatableAutoComplete
 *   value={selectedTag}
 *   onValueChange={setSelectedTag}
 *   options={tags}
 *   onCreate={(newTag) => {
 *     setTags([...tags, newTag])
 *   }}
 *   placeholder="Select or create tag..."
 * />
 * ```
 *
 * @example Multiple select with async creation
 * ```tsx
 * const [selectedLabels, setSelectedLabels] = useState<string[]>([])
 * const [labels, setLabels] = useState<string[]>(['bug', 'feature', 'docs'])
 *
 * <CreatableAutoComplete
 *   multiple
 *   value={selectedLabels}
 *   onValueChange={setSelectedLabels}
 *   options={labels}
 *   onCreate={async (newLabel) => {
 *     await api.createLabel(newLabel)
 *     setLabels([...labels, newLabel])
 *   }}
 *   createText={(query) => `Add "${query}" as new label`}
 * />
 * ```
 */
export function CreatableAutoComplete<Multiple extends boolean = false>({
  value,
  onValueChange,
  options,
  isLoading = false,
  query: controlledQuery,
  onQueryChange,
  onCreate,
  createText = (query) => `Create "${query}"`,
  allowCreate = true,
  placeholder = 'Search...',
  emptyText = 'No results found.',
  loadingText = 'Loading...',
  disabled = false,
  className,
  id,
  name,
  autoComplete,
  ariaLabel,
  ariaLabelledBy,
  multiple = false as Multiple,
  clearable = true,
  filter = true
}: CreatableAutoCompleteProps<Multiple>) {
  const [isCreating, setIsCreating] = useState(false)

  // Internal query state management
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

  // Check if query should show create option
  const shouldShowCreateOption = useMemo(() => {
    if (!allowCreate || !query.trim() || isLoading || isCreating) {
      return false
    }

    const normalizedQuery = query.trim().toLowerCase()

    // Don't show create if query already exists in options
    const existsInOptions = options.some(
      (opt) => opt.toLowerCase() === normalizedQuery
    )
    if (existsInOptions) return false

    // Don't show create if query is already selected
    if (multiple) {
      const selectedValues = (value as string[]) ?? []
      const existsInSelected = selectedValues.some(
        (val) => val.toLowerCase() === normalizedQuery
      )
      if (existsInSelected) return false
    } else {
      const selectedValue = value as string | null | undefined
      if (selectedValue && selectedValue.toLowerCase() === normalizedQuery) {
        return false
      }
    }

    return true
  }, [allowCreate, query, isLoading, isCreating, options, value, multiple])

  // Augment options with create option
  const augmentedOptions = useMemo(() => {
    const allOptions = [...options, ...(value ?? [])]
    if (!shouldShowCreateOption) return allOptions

    const createOption = `${CREATE_OPTION_PREFIX}${query.trim()}`
    return [createOption, ...allOptions]
  }, [options, value, shouldShowCreateOption, query])

  // Handle value changes, including create option selection
  const handleValueChange = useCallback(
    async (newValue: Multiple extends true ? string[] : string | null) => {
      if (multiple) {
        const values = (newValue as string[]) ?? []
        const createOptions = values.filter((v) =>
          v.startsWith(CREATE_OPTION_PREFIX)
        )

        if (createOptions.length > 0) {
          // Extract the actual value to create
          const valueToCreate = createOptions[0]!.substring(
            CREATE_OPTION_PREFIX.length
          )

          setIsCreating(true)
          try {
            await onCreate?.(valueToCreate)

            // Add the created value to selection (remove create marker)
            const otherValues = values.filter(
              (v) => !v.startsWith(CREATE_OPTION_PREFIX)
            )
            const finalValues = [...otherValues, valueToCreate]
            ;(onValueChange as (value: string[]) => void)(finalValues)

            // Keep the dropdown open for multiple select
          } catch (error) {
            // eslint-disable-next-line no-console
            console.error('Failed to create option:', error)
          } finally {
            setIsCreating(false)
          }
        } else {
          // No create option, just pass through
          ;(onValueChange as (value: string[]) => void)(values)
        }
      } else {
        const val = newValue as string | null
        if (val && val.startsWith(CREATE_OPTION_PREFIX)) {
          // Extract the actual value to create
          const valueToCreate = val.substring(CREATE_OPTION_PREFIX.length)

          setIsCreating(true)
          try {
            await onCreate?.(valueToCreate)
            ;(onValueChange as (value: string | null) => void)(valueToCreate)
            setQuery('')
          } catch (error) {
            // eslint-disable-next-line no-console
            console.error('Failed to create option:', error)
          } finally {
            setIsCreating(false)
          }
        } else {
          // No create option, just pass through
          ;(onValueChange as (value: string | null) => void)(val)
        }
      }
    },
    [multiple, onCreate, onValueChange, setQuery]
  )

  // Custom renderer to show "Create X" text for create option
  const renderOption = useCallback(
    (option: string) => {
      if (option.startsWith(CREATE_OPTION_PREFIX)) {
        const valueToCreate = option.substring(CREATE_OPTION_PREFIX.length)
        return (
          <div className="flex items-center gap-2">
            <span className="text-primary">+</span>
            <span>{createText(valueToCreate)}</span>
          </div>
        )
      }
      return option
    },
    [createText]
  )

  return (
    <AutoComplete<string, Multiple>
      value={value}
      onValueChange={handleValueChange}
      options={augmentedOptions}
      isLoading={isLoading || isCreating}
      query={query}
      onQueryChange={setQuery}
      getOptionValue={(option) => option}
      getOptionLabel={(option) => {
        if (option.startsWith(CREATE_OPTION_PREFIX)) {
          return option.substring(CREATE_OPTION_PREFIX.length)
        }
        return option
      }}
      renderOption={renderOption}
      placeholder={placeholder}
      emptyText={emptyText}
      loadingText={isCreating ? 'Creating...' : loadingText}
      disabled={disabled}
      className={className}
      id={id}
      name={name}
      autoComplete={autoComplete}
      ariaLabel={ariaLabel}
      ariaLabelledBy={ariaLabelledBy}
      multiple={multiple}
      clearable={clearable}
      filter={filter}
    />
  )
}
