import { useCallback, useMemo, useState } from 'react'
import { Button } from '@internal/ui/components/button'
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle
} from '@internal/ui/components/empty'
import { Label } from '@internal/ui/components/label'
import { Separator } from '@internal/ui/components/separator'
import { PlusIcon } from 'lucide-react'

import type { FieldConfig, FieldMetadata } from '~/types/template'

import { AddFieldDialog } from './AddFieldDialog'
import { useWizardContext } from './context'
import { FieldRow } from './FieldRow'

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

const EXCLUDED = new Set(['project', 'issuetype', 'attachment', 'issuelinks'])

/** Stable default config for fields not yet in fieldsConfig. */
const DEFAULT_VISIBLE_CONFIG: FieldConfig = { behavior: 'visible' }

/** Determine if a preset value is effectively empty. */
function isPresetEmpty(value: unknown): boolean {
  if (value == null) return true
  if (typeof value === 'string') return value.trim() === ''
  if (Array.isArray(value)) return value.length === 0
  if (typeof value === 'object') {
    const obj = value as Record<string, unknown>
    if ('accountId' in obj) return !obj.accountId
    return Object.keys(obj).length === 0
  }
  return false
}

/** Return a normalized FieldConfig based on whether a preset value is filled. */
function normalizePreset(presetValue: unknown): FieldConfig {
  return isPresetEmpty(presetValue)
    ? { behavior: 'visible', presetValue: undefined }
    : { behavior: 'preset', presetValue }
}

/* ------------------------------------------------------------------ */
/*  Main step                                                          */
/* ------------------------------------------------------------------ */

export function TemplateWizardFieldsStep() {
  const { state, actions } = useWizardContext()
  const { availableFields, fieldsConfig, areFieldsLoading, fieldsError } = state
  const [commandOpen, setCommandOpen] = useState(false)

  const { requiredFields, optionalSelected, optionalUnselected } =
    useMemo(() => {
      const required: FieldMetadata[] = []
      const selected: FieldMetadata[] = []
      const unselected: FieldMetadata[] = []

      for (const f of availableFields) {
        if (EXCLUDED.has(f.fieldId)) continue
        if (f.required) {
          required.push(f)
          continue
        }
        const cfg = fieldsConfig[f.fieldId]
        if (cfg && cfg.behavior !== 'ignore') {
          selected.push(f)
        } else {
          unselected.push(f)
        }
      }

      return {
        requiredFields: required,
        optionalSelected: selected,
        optionalUnselected: unselected
      }
    }, [availableFields, fieldsConfig])

  const handleAddField = useCallback(
    (fieldId: string) => {
      actions.setFieldConfig(fieldId, { behavior: 'visible' })
      setCommandOpen(false)
    },
    [actions]
  )

  const handlePresetChange = useCallback(
    (fieldId: string, value: unknown) => {
      actions.setFieldConfig(fieldId, normalizePreset(value))
    },
    [actions]
  )

  if (state.step !== 2) return null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <h3 className="text-base font-medium">Configure fields</h3>
        <p className="text-muted-foreground text-sm">
          Add fields to your template. Fill a value to use it as a preset, or
          leave it empty to prompt for input when creating a ticket.
        </p>
      </div>

      {areFieldsLoading && (
        <div className="text-muted-foreground py-8 text-center text-sm">
          Loading fields…
        </div>
      )}

      {!areFieldsLoading && fieldsError && (
        <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          Failed to load fields: {fieldsError}
        </div>
      )}

      {!areFieldsLoading && !fieldsError && (
        <div className="space-y-6">
          {/* Required fields */}
          {requiredFields.length > 0 && (
            <section className="space-y-3">
              <div className="flex items-center gap-2">
                <Label className="text-xs font-medium uppercase tracking-wide">
                  Required
                </Label>
                <Separator className="flex-1" />
              </div>
              <div className="space-y-2">
                {requiredFields.map((field) => (
                  <FieldRow
                    key={field.fieldId}
                    field={field}
                    config={
                      fieldsConfig[field.fieldId] ?? DEFAULT_VISIBLE_CONFIG
                    }
                    onPresetChange={(v) => handlePresetChange(field.fieldId, v)}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Optional fields */}
          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <Label className="text-xs font-medium uppercase tracking-wide">
                Optional
              </Label>
              <Separator className="flex-1" />
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setCommandOpen(true)}
                disabled={optionalUnselected.length === 0}>
                <PlusIcon className="size-3.5" />
                Add field
              </Button>
            </div>

            {optionalSelected.length === 0 ? (
              <Empty className="border py-8">
                <EmptyHeader>
                  <EmptyTitle className="text-sm">
                    No optional fields
                  </EmptyTitle>
                  <EmptyDescription>
                    Click &ldquo;Add field&rdquo; to include additional fields
                    in this template.
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            ) : (
              <div className="space-y-2">
                {optionalSelected.map((field) => (
                  <FieldRow
                    key={field.fieldId}
                    field={field}
                    config={
                      fieldsConfig[field.fieldId] ?? DEFAULT_VISIBLE_CONFIG
                    }
                    onPresetChange={(v) => handlePresetChange(field.fieldId, v)}
                    onRemove={() => actions.removeFieldConfig(field.fieldId)}
                  />
                ))}
              </div>
            )}
          </section>
        </div>
      )}

      {/* Add field command dialog */}
      <AddFieldDialog
        open={commandOpen}
        onOpenChange={setCommandOpen}
        requiredFields={requiredFields}
        optionalSelected={optionalSelected}
        optionalUnselected={optionalUnselected}
        onSelect={handleAddField}
      />

      {/* Navigation */}
      <div className="flex items-center justify-between gap-3 border-t pt-4">
        <Button variant="secondary" onClick={() => actions.goToStep(1)}>
          Back
        </Button>
        <Button onClick={() => actions.goToStep(3)}>Next: Basics</Button>
      </div>
    </div>
  )
}
