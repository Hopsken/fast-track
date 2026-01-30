import { Badge } from '@internal/ui/components/badge'
import { XIcon } from 'lucide-react'

import type { FieldConfig, FieldMetadata } from '~/types/template'

import { FieldInput } from './FieldInput'

export function FieldRow({
  field,
  config,
  onPresetChange,
  onRemove
}: {
  field: FieldMetadata
  config: FieldConfig
  onPresetChange: (value: unknown) => void
  onRemove?: () => void
}) {
  const hasPreset = config.behavior === 'preset'

  return (
    <div className="bg-card flex items-start gap-3 rounded-lg border px-4 py-3">
      {/* Left: field info + input */}
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">{field.name}</span>
          {field.required && <Badge variant="secondary">Required</Badge>}
          {hasPreset && (
            <Badge variant="default" className="text-[10px]">
              Preset
            </Badge>
          )}
        </div>

        <FieldInput
          field={field}
          value={config.presetValue}
          onChange={onPresetChange}
        />
      </div>

      {/* Right: remove button (only for optional) */}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="text-muted-foreground hover:text-foreground mt-1.5 rounded-sm p-0.5 transition-colors"
          aria-label={`Remove ${field.name}`}>
          <XIcon className="size-4" />
        </button>
      )}
    </div>
  )
}
