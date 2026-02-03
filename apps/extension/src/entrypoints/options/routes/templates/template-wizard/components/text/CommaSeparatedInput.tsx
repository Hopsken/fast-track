import { Input } from '@internal/ui/components/input'

interface CommaSeparatedInputProps {
  value: unknown
  onChange: (v: unknown) => void
}

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
