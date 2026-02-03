import { useCallback } from 'react'
import { Badge } from '@internal/ui/components/badge'
import { Trash2Icon } from 'lucide-react'

import { JiraIssueType, JiraProject } from '@/repository/schema'
import type { AllowedValue, FieldConfig, FieldMetadata } from '~/types/template'

import { FieldInput } from './FieldInput'
import { RestrictedOptionsInput } from './RestrictedOptionsInput'

/* ------------------------------------------------------------------ */
/*  Mode helpers                                                       */
/* ------------------------------------------------------------------ */

type FieldMode = 'visible' | 'preset' | 'restricted'

function getModeFromConfig(config: FieldConfig): FieldMode {
  if (config.behavior === 'preset') return 'preset'
  if (config.behavior === 'restricted') return 'restricted'
  return 'visible'
}

/* ------------------------------------------------------------------ */
/*  3-way toggle                                                       */
/* ------------------------------------------------------------------ */

const MODE_META: Record<FieldMode, { label: string; title: string }> = {
  visible: { label: 'Show', title: 'Field appears with all options' },
  preset: { label: 'Fill', title: 'Auto-fill value at creation' },
  restricted: { label: 'Limit', title: 'Restrict to subset of options' }
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
      {(['visible', 'preset', 'restricted'] as const).map((m) => {
        const isActive = mode === m
        return (
          <button
            key={m}
            type="button"
            role="radio"
            aria-checked={isActive}
            title={MODE_META[m].title}
            onClick={() => onModeChange(m)}
            className={`rounded-sm px-2 py-0.5 text-xs font-medium transition-colors ${
              isActive
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}>
            {MODE_META[m].label}
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
  project,
  issueType,
  onConfigChange,
  onRemove
}: {
  project: JiraProject
  issueType: JiraIssueType
  field: FieldMetadata
  config: FieldConfig
  onConfigChange: (config: FieldConfig) => void
  onRemove?: () => void
}) {
  const currentMode = getModeFromConfig(config)

  const handleModeChange = useCallback(
    (mode: FieldMode) => {
      switch (mode) {
        case 'visible':
          onConfigChange({ behavior: 'visible' })
          break
        case 'preset':
          onConfigChange({ behavior: 'preset', presetValue: undefined })
          break
        case 'restricted':
          // Default depends on whether field has Jira-provided allowedValues
          if (field.allowedValues && field.allowedValues.length > 0) {
            // Start with all Jira options selected
            onConfigChange({
              behavior: 'restricted',
              allowedOptions: field.allowedValues
            })
          } else {
            // User-defined options (number, text, user) — start empty, force user to add
            onConfigChange({ behavior: 'restricted', allowedOptions: [] })
          }
          break
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
            <ModeToggle mode={currentMode} onModeChange={handleModeChange} />
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
            project={project}
            issueType={issueType}
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
        {/* visible: no input needed */}
      </div>
    </div>
  )
}
