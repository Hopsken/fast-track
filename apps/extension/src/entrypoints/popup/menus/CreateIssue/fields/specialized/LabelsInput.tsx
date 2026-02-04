import { useCallback, useMemo, useState } from 'react'
import {
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
  CommandLoading
} from '@internal/ui/components/command'
import { useMount } from 'ahooks'
import { uniq } from 'lodash-es'
import { Check } from 'lucide-react'

import { useLabels } from '@/hooks/useLabels'
import { useFieldConfirm } from '@/lib/hotkeys'
import { useCommandInput } from '@/stores/command/useCommandInputStore'

import { FieldInputProps } from '../primitive/types'
import { getFieldTitle, parseCommaSeparated, prefillArrayValue } from '../utils'

export function LabelsInput({
  field,
  currentValue,
  onConfirm
}: FieldInputProps) {
  const { search, setSearch } = useCommandInput()
  const title = getFieldTitle(field)
  const { data: existingLabels, isLoading } = useLabels()
  const [newLabels, setNewLabels] = useState<string[]>([])

  // Parse current selected labels
  const selectedLabels = useMemo(() => {
    if (Array.isArray(currentValue)) {
      return currentValue.filter((item) => typeof item === 'string') as string[]
    }
    return []
  }, [currentValue])

  const selectedSet = useMemo(() => new Set(selectedLabels), [selectedLabels])

  // Combine existing and new labels
  const allOptions = useMemo(() => {
    return uniq([...(existingLabels ?? []), ...newLabels])
  }, [existingLabels, newLabels])

  // Pre-fill the search box with current value
  useMount(() => {
    prefillArrayValue(currentValue, setSearch)
  })

  // Filter options based on search
  const filteredOptions = useMemo(() => {
    const searchLower = search.toLowerCase().trim()
    if (!searchLower) return allOptions
    return allOptions.filter((label) =>
      label.toLowerCase().includes(searchLower)
    )
  }, [allOptions, search])

  const toggle = useCallback(
    (label: string) => {
      const next = selectedSet.has(label)
        ? selectedLabels.filter((l) => l !== label)
        : [...selectedLabels, label]
      onConfirm(next)
    },
    [selectedLabels, selectedSet, onConfirm]
  )

  const handleCreateNew = useCallback(() => {
    const trimmed = search.trim()
    if (!trimmed) return

    // Parse comma-separated input
    const labels = parseCommaSeparated(trimmed)
    const validLabels = labels.filter((l) => l.length > 0)

    if (validLabels.length === 0) return

    // Add new labels to the list
    setNewLabels((prev) => uniq([...prev, ...validLabels]))

    // Add to selected
    const next = uniq([...selectedLabels, ...validLabels])
    onConfirm(next)
    setSearch('')
  }, [search, selectedLabels, onConfirm, setSearch])

  const handleConfirm = useCallback(() => {
    // If there's text in search, create new labels first
    if (search.trim()) {
      handleCreateNew()
    } else {
      onConfirm(selectedLabels)
    }
  }, [search, selectedLabels, onConfirm, handleCreateNew])

  return (
    <CommandList>
      <CommandGroup heading={title}>
        {isLoading ? <CommandLoading>Loading...</CommandLoading> : null}

        {filteredOptions.map((label) => {
          const isSelected = selectedSet.has(label)
          return (
            <CommandItem
              key={label}
              value={label}
              onSelect={() => toggle(label)}>
              <div className="flex w-full items-center justify-between">
                <span className="truncate">{label}</span>
                {isSelected ? <Check className="size-4" /> : null}
              </div>
            </CommandItem>
          )
        })}

        {!isLoading &&
        filteredOptions.length === 0 &&
        search.trim().length > 0 ? (
          <CommandEmpty>
            Press Cmd+Enter to create "{search.trim()}"
          </CommandEmpty>
        ) : null}

        {!isLoading &&
        filteredOptions.length === 0 &&
        search.trim().length === 0 ? (
          <CommandEmpty>Type to search or create labels</CommandEmpty>
        ) : null}
      </CommandGroup>

      {useFieldConfirm({
        onConfirm: handleConfirm,
        keys: 'meta+enter'
      })}
    </CommandList>
  )
}
