import { useState } from 'react'
import { Textarea } from '@internal/ui/components/textarea'

import type { GenericInputProps } from '../../types'

/**
 * Generic JSON editor fallback for unknown field types.
 * Allows manual JSON input for any field type not explicitly supported.
 */
export function GenericInput({ value, onChange, field }: GenericInputProps) {
  const [jsonError, setJsonError] = useState<string | null>(null)
  const [textValue, setTextValue] = useState(() => {
    try {
      return value !== undefined ? JSON.stringify(value, null, 2) : ''
    } catch {
      return ''
    }
  })

  const handleChange = (newText: string) => {
    setTextValue(newText)

    if (newText.trim() === '') {
      setJsonError(null)
      onChange(undefined)
      return
    }

    try {
      const parsed = JSON.parse(newText)
      setJsonError(null)
      onChange(parsed)
    } catch (e) {
      setJsonError(e instanceof Error ? e.message : 'Invalid JSON')
    }
  }

  return (
    <div className="space-y-2">
      <div className="bg-muted border-border rounded-md border p-3">
        <p className="text-muted-foreground text-sm">
          ⚠️ This field type ({field?.schema.type ?? 'unknown'}) requires manual
          JSON input. Enter a valid JSON value below.
        </p>
      </div>

      <Textarea
        placeholder='{"example": "value"}'
        value={textValue}
        onChange={(e) => handleChange(e.target.value)}
        rows={6}
        className="font-mono text-sm"
      />

      {jsonError && (
        <p className="text-destructive text-xs">JSON Error: {jsonError}</p>
      )}

      <p className="text-muted-foreground text-xs">
        Example formats:
        <br />• Text: "some value"
        <br />• Number: 42
        <br />• Object: {'{'}
        "id": "123"
        {'}'}
        <br />• Array: ["item1", "item2"]
      </p>
    </div>
  )
}
