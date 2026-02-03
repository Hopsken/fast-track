import { Input } from '@internal/ui/components/input'

interface CommaSeparatedInputProps {
  value: unknown
  onChange: (v: unknown) => void
}

/**
 * Comma-separated input component for array values.
 * Converts between comma-separated string input and array values.
 * Automatically trims whitespace and filters empty values.
 *
 * @component
 * @example
 * ```tsx
 * <CommaSeparatedInput
 *   value={['tag1', 'tag2', 'tag3']}
 *   onChange={setTags}
 * />
 * ```
 *
 * @param {CommaSeparatedInputProps} props - Component props
 * @param {unknown} props.value - Current value (string or string array)
 * @param {(v: unknown) => void} props.onChange - Callback when value changes, returns array of trimmed non-empty strings
 * @returns {JSX.Element} Comma-separated input with helper text
 */
export function CommaSeparatedInput({
  value,
  onChange
}: CommaSeparatedInputProps) {
  const strValue = Array.isArray(value)
    ? (value as string[]).join(', ')
    : ((value as string) ?? '')

  return (
    <div className="space-y-1">
      <Input
        placeholder="tag1, tag2, …"
        value={strValue}
        onChange={(e) =>
          onChange(
            e.target.value
              .split(',')
              .map((s) => s.trim())
              .filter(Boolean)
          )
        }
      />
      <p className="text-muted-foreground text-xs">Comma-separated values</p>
    </div>
  )
}
