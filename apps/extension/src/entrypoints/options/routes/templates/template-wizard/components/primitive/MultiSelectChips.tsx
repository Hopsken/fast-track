import { useMemo } from 'react'

import { FieldInputBaseProps, IconOption } from '../../types'

import { useFieldOptions } from './useFieldOptions'

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

 */
export function MultiSelectChips<T extends IconOption>({
  field,
  value,
  onChange
}: FieldInputBaseProps<T[]>) {
  const options = useFieldOptions<T>(field, '')

  const selectedIds = useMemo(
    () =>
      new Set(
        Array.isArray(value)
          ? (value as T[]).map((v) => String(v.id ?? v.value ?? v))
          : []
      ),
    [value]
  )

  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((opt) => {
        const selected = selectedIds.has(opt.id)
        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => {
              const current = Array.isArray(value) ? (value as T[]) : []
              const next = selected
                ? current.filter((v) => String(v.id ?? v.value ?? v) !== opt.id)
                : [...current, opt]
              onChange(next)
            }}
            className={`rounded-full border px-2.5 py-1 text-xs transition-colors ${
              selected
                ? 'border-primary bg-primary/10 text-primary'
                : 'text-muted-foreground hover:border-foreground/30 border-transparent bg-transparent'
            }`}>
            {opt.name ?? opt.value ?? opt.id}
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
