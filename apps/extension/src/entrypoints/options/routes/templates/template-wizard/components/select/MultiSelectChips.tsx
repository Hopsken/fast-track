import { useMemo } from 'react'

import type { FieldMetadata } from '~/types/template'

interface MultiSelectChipsProps {
  allowedValues: NonNullable<FieldMetadata['allowedValues']>
  value: unknown
  onChange: (v: unknown) => void
}

/**
 * Multi-select input displayed as toggleable chips.
 * Allows selecting multiple values from a predefined list with visual feedback.
 * Selected chips are highlighted and can be toggled on/off. Includes a clear all button.
 *
 * @component
 * @example
 * ```tsx
 * <MultiSelectChips
 *   allowedValues={[
 *     { id: '1', name: 'Frontend' },
 *     { id: '2', name: 'Backend' },
 *     { id: '3', name: 'Database' }
 *   ]}
 *   value={[
 *     { id: '1', name: 'Frontend' },
 *     { id: '2', name: 'Backend' }
 *   ]}
 *   onChange={setComponents}
 * />
 * ```
 *
 * @param {MultiSelectChipsProps} props - Component props
 * @param {NonNullable<FieldMetadata['allowedValues']>} props.allowedValues - Array of allowed values from field metadata
 * @param {unknown} props.value - Currently selected values (array of objects)
 * @param {(v: unknown) => void} props.onChange - Callback when selection changes, returns array of selected values
 * @returns {JSX.Element} Multi-select chip component with clear button
 */
export function MultiSelectChips({
  allowedValues,
  value,
  onChange
}: MultiSelectChipsProps) {
  const options = useMemo(
    () =>
      allowedValues.map((av) => ({
        value: String(av.id ?? av.value ?? av.name),
        label: av.name ?? av.value ?? av.id ?? 'Unknown',
        data: av as Record<string, unknown>
      })),
    [allowedValues]
  )

  const selectedIds = useMemo(
    () =>
      new Set(
        Array.isArray(value)
          ? (value as Array<Record<string, unknown>>).map((v) =>
              String(v.id ?? v.value ?? v)
            )
          : []
      ),
    [value]
  )

  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((opt) => {
        const selected = selectedIds.has(opt.value)
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => {
              const current = Array.isArray(value)
                ? (value as Array<Record<string, unknown>>)
                : []
              const next = selected
                ? current.filter(
                    (v) => String(v.id ?? v.value ?? v) !== opt.value
                  )
                : [...current, opt.data]
              onChange(next)
            }}
            className={`rounded-full border px-2.5 py-1 text-xs transition-colors ${
              selected
                ? 'border-primary bg-primary/10 text-primary'
                : 'text-muted-foreground hover:border-foreground/30 border-transparent bg-transparent'
            }`}>
            {opt.label}
          </button>
        )
      })}
      {selectedIds.size > 0 && (
        <button
          type="button"
          onClick={() => onChange([])}
          className="text-muted-foreground hover:text-foreground px-1 text-xs underline-offset-2 transition-colors hover:underline">
          Clear
        </button>
      )}
    </div>
  )
}
