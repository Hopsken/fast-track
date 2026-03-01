import { useCallback, useMemo } from 'react'
import { Badge } from '@internal/ui/components/badge'
import { Button } from '@internal/ui/components/button'
import { ButtonGroup } from '@internal/ui/components/button-group'
import { ChevronDownIcon, ChevronUpIcon, Trash2Icon } from 'lucide-react'

import { useFieldAdapter } from '@/common/fields'
import { JiraFieldContext } from '@/common/fields/types'
import {
  JiraIssueType,
  JiraProject,
  JiraFieldMetadata
} from '@/repository/schema'
import type { FieldConfig } from '~/types/template'

/* ------------------------------------------------------------------ */
/*  Mode helpers                                                       */
/* ------------------------------------------------------------------ */

type FieldMode = FieldConfig['behavior']

/* ------------------------------------------------------------------ */
/*  3-way toggle                                                       */
/* ------------------------------------------------------------------ */

const MODE_META: Record<FieldMode, { label: string; title: string }> = {
  preset: {
    label: 'Fill',
    title: 'Auto-fill value with default value '
  },
  restricted: { label: 'Limit', title: 'Restrict to subset of options' }
}

function ModeToggle({
  mode,
  supportedModes,
  onModeChange
}: {
  mode: FieldMode
  supportedModes?: FieldMode[]
  onModeChange: (mode: FieldMode) => void
}) {
  const modes = supportedModes ?? ['preset', 'restricted']
  return (
    <div className="bg-muted flex gap-0.5 rounded-md p-0.5" role="radiogroup">
      {modes.map((m) => {
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
  onRemove,
  onMoveUp,
  onMoveDown
}: {
  project: JiraProject
  issueType: JiraIssueType
  field: JiraFieldMetadata
  config: FieldConfig
  onConfigChange: (config: FieldConfig) => void
  onRemove?: () => void
  onMoveUp?: () => void
  onMoveDown?: () => void
}) {
  const { fieldId } = field
  const adapter = useFieldAdapter(field)

  const currentMode = config.behavior

  const fieldContext = useMemo<JiraFieldContext>(
    () => ({
      project,
      issueType,
      metadata: field
    }),
    [field, issueType, project]
  )

  const handleModeChange = useCallback(
    (mode: FieldMode) => {
      switch (mode) {
        case 'preset':
          onConfigChange({
            fieldId,
            behavior: 'preset',
            presetValue: undefined
          })
          break
        case 'restricted':
          // Default depends on whether field has Jira-provided allowedValues
          if (field.allowedValues && field.allowedValues.length > 0) {
            // Start with all Jira options selected
            onConfigChange({
              fieldId,
              behavior: 'restricted',
              allowedOptions: field.allowedValues
            })
          } else {
            // User-defined options (number, text, user) — start empty, force user to add
            onConfigChange({
              fieldId,
              behavior: 'restricted',
              allowedOptions: []
            })
          }
          break
      }
    },
    [field.allowedValues, fieldId, onConfigChange]
  )

  const ConfigComponent = adapter.ConfigComponent

  return (
    <div className="bg-card flex items-start gap-3 rounded-lg">
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex items-center justify-between gap-2">
          {/* Left: field info */}
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-medium">{field.name}</span>
              {field.required && <Badge variant="secondary">Required</Badge>}
            </div>
          </div>

          {/* Right: mode toggle + reorder + remove */}
          <div className="flex items-center gap-2">
            {(onMoveUp || onMoveDown) && (
              <ButtonGroup>
                <Button
                  variant={'outline'}
                  size={'icon-xs'}
                  onClick={onMoveUp}
                  disabled={!onMoveUp}
                  aria-label="Move up">
                  <ChevronUpIcon className="size-3.5" />
                </Button>
                <Button
                  variant={'outline'}
                  size={'icon-xs'}
                  onClick={onMoveDown}
                  disabled={!onMoveDown}
                  aria-label="Move down">
                  <ChevronDownIcon className="size-3.5" />
                </Button>
              </ButtonGroup>
            )}

            <ModeToggle
              mode={currentMode}
              supportedModes={adapter.supportModes}
              onModeChange={handleModeChange}
            />

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

        <ConfigComponent
          adapter={adapter}
          context={fieldContext}
          config={config}
          onChangeConfig={onConfigChange}
        />
      </div>
    </div>
  )
}
