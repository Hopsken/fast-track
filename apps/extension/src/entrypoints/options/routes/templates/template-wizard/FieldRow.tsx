import { Badge } from '@internal/ui/components/badge'
import { Trash2Icon } from 'lucide-react'

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
    <div className="bg-card flex items-start gap-3 rounded-lg">
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex items-center justify-between gap-2">
          {/* Left: field info */}
          <div>
            <span className="text-sm font-medium">{field.name}</span>
            {field.required && <Badge variant="secondary">Required</Badge>}
            {hasPreset && (
              <Badge variant="default" className="text-[10px]">
                Preset
              </Badge>
            )}
          </div>

          {/* Right: remove button */}
          {onRemove && (
            <button
              type="button"
              onClick={onRemove}
              className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive mt-1 flex items-center gap-1 rounded-md p-1.5 transition-colors"
              aria-label={`Remove ${field.name}`}>
              <Trash2Icon className="size-3.5" />
              <span>Remove</span>
            </button>
          )}
        </div>

        <FieldInput
          field={field}
          value={config.presetValue}
          onChange={onPresetChange}
        />
      </div>
    </div>
  )
}
