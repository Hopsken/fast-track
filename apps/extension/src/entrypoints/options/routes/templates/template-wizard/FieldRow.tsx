import { useCallback } from 'react'
import { Badge } from '@internal/ui/components/badge'
import { Trash2Icon } from 'lucide-react'

import type { AllowedValue, FieldConfig, FieldMetadata } from '~/types/template'

import { FieldInput } from './FieldInput'
import { RestrictedOptionsInput } from './RestrictedOptionsInput'

/* ------------------------------------------------------------------ */
/*  Mode helpers                                                       */
/* ------------------------------------------------------------------ */

type FieldMode = 'preset' | 'restricted'

/** Whether a field supports "restricted" mode (has finite allowed values). */
function supportsRestricted(field: FieldMetadata): boolean {
  // TODO(phase2): Support restricted mode for user fields (needs user search picker)
  // TODO(phase2): Support restricted mode for number fields (e.g. story points)
  return Boolean(field.allowedValues && field.allowedValues.length > 0)
}

function getModeFromConfig(config: FieldConfig): FieldMode {
  return config.behavior === 'restricted' ? 'restricted' : 'preset'
}

/* ------------------------------------------------------------------ */
/*  Mode toggle                                                        */
/* ------------------------------------------------------------------ */

const TOGGLE_META: Record<FieldMode, { label: string; title: string }> = {
  preset: { label: 'Preset', title: 'Auto-fill value at creation' },
  restricted: { label: 'Restrict', title: 'Limit to a subset of options' }
}

function ModeToggle({
  mode,
  onModeChange
}: {
  mode: FieldMode
  onModeChange: (mode: FieldMode) => void
}) {
  return (
    <div className="bg-muted flex gap-0.5 rounded-md p-0.5" role="radiogroup">
      {(['preset', 'restricted'] as const).map((m) => {
        const isActive = mode === m
        return (
          <button
            key={m}
            type="button"
            role="radio"
            aria-checked={isActive}
            title={TOGGLE_META[m].title}
            onClick={() => onModeChange(m)}
            className={`rounded-sm px-2 py-0.5 text-xs font-medium transition-colors ${
              isActive
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}>
            {TOGGLE_META[m].label}
          </button>
        )
      })}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Field row                                                          */
/* ------------------------------------------------------------------ */

export function FieldRow({
  field,
  config,
  onConfigChange,
  onRemove
}: {
  field: FieldMetadata
  config: FieldConfig
  onConfigChange: (config: FieldConfig) => void
  onRemove?: () => void
}) {
  const currentMode = getModeFromConfig(config)
  const hasRestricted = supportsRestricted(field)

  const handleModeChange = useCallback(
    (mode: FieldMode) => {
      if (mode === 'restricted') {
        // Default: all options selected — user deselects what they don't want
        onConfigChange({
          behavior: 'restricted',
          allowedOptions: field.allowedValues ?? []
        })
      } else {
        onConfigChange({ behavior: 'preset', presetValue: undefined })
      }
    },
    [field.allowedValues, onConfigChange]
  )

  const handlePresetChange = useCallback(
    (value: unknown) => {
      onConfigChange({ behavior: 'preset', presetValue: value })
    },
    [onConfigChange]
  )

  const handleRestrictedChange = useCallback(
    (options: AllowedValue[]) => {
      onConfigChange({ behavior: 'restricted', allowedOptions: options })
    },
    [onConfigChange]
  )

  return (
    <div className="bg-card flex items-start gap-3 rounded-lg">
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex items-center justify-between gap-2">
          {/* Left: field info */}
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-medium">{field.name}</span>
            {field.required && <Badge variant="secondary">Required</Badge>}
          </div>

          {/* Right: mode toggle + remove */}
          <div className="flex items-center gap-2">
            {hasRestricted && (
              <ModeToggle mode={currentMode} onModeChange={handleModeChange} />
            )}
            {onRemove && (
              <button
                type="button"
                onClick={onRemove}
                className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive flex items-center gap-1 rounded-md p-1.5 transition-colors"
                aria-label={`Remove ${field.name}`}>
                <Trash2Icon className="size-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Input area — depends on mode */}
        {currentMode === 'preset' && (
          <FieldInput
            field={field}
            value={
              config.behavior === 'preset' ? config.presetValue : undefined
            }
            onChange={handlePresetChange}
          />
        )}
        {currentMode === 'restricted' && (
          <RestrictedOptionsInput
            field={field}
            selectedOptions={
              config.behavior === 'restricted' ? config.allowedOptions : []
            }
            onChange={handleRestrictedChange}
          />
        )}
      </div>
    </div>
  )
}
