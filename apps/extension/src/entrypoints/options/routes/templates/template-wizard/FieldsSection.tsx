import { useCallback, useMemo, useState } from 'react'
import { Button } from '@internal/ui/components/button'
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle
} from '@internal/ui/components/empty'
import { PlusIcon } from 'lucide-react'

import type { FieldConfig, FieldMetadata } from '~/types/template'

import { AddFieldDialog } from './AddFieldDialog'
import { useWizardContext } from './context'
import { FieldRow } from './FieldRow'

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

const EXCLUDED = new Set(['project', 'issuetype', 'attachment', 'issuelinks'])

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
/*  Fields section                                                     */
/* ------------------------------------------------------------------ */

export function FieldsSection() {
  const { state, actions, meta } = useWizardContext()
  const { availableFields, fieldsConfig, areFieldsLoading, fieldsError } = state
  const [commandOpen, setCommandOpen] = useState(false)

  const { configuredFields, unconfiguredFields } = useMemo(() => {
    const fieldMap = new Map(availableFields.map((f) => [f.fieldId, f]))

    // Iterate fieldsConfig keys (JS insertion order) so newly added fields
    // appear at the bottom of the list.
    const configured: FieldMetadata[] = []
    for (const fieldId of Object.keys(fieldsConfig)) {
      const f = fieldMap.get(fieldId)
      if (f && !EXCLUDED.has(fieldId)) configured.push(f)
    }

    const configuredIds = new Set(configured.map((f) => f.fieldId))
    const unconfigured = availableFields.filter(
      (f) => !EXCLUDED.has(f.fieldId) && !configuredIds.has(f.fieldId)
    )

    return { configuredFields: configured, unconfiguredFields: unconfigured }
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

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h3 className="text-sm font-medium">Fields</h3>
          <p className="text-muted-foreground text-xs">
            Add fields and set preset values. Required fields left unconfigured
            will be prompted during issue creation.
          </p>
        </div>
        {!areFieldsLoading && !fieldsError && (
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setCommandOpen(true)}
            disabled={unconfiguredFields.length === 0}>
            <PlusIcon className="size-3.5" />
            Add field
          </Button>
        )}
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
        <>
          {configuredFields.length === 0 ? (
            <Empty className="border py-8">
              <EmptyHeader>
                <EmptyTitle className="text-sm">
                  No fields configured
                </EmptyTitle>
                <EmptyDescription>
                  Click &ldquo;Add field&rdquo; to include fields in this
                  template. Set a value to use it as a preset, or leave it
                  empty.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <div className="space-y-2">
              {configuredFields.map((field) => (
                <FieldRow
                  key={field.fieldId}
                  field={field}
                  config={fieldsConfig[field.fieldId]!}
                  onPresetChange={(v) => handlePresetChange(field.fieldId, v)}
                  onRemove={() => actions.removeFieldConfig(field.fieldId)}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* Add field command dialog */}
      <AddFieldDialog
        open={commandOpen}
        onOpenChange={setCommandOpen}
        configuredFields={configuredFields}
        unconfiguredFields={unconfiguredFields}
        onSelect={handleAddField}
      />
    </section>
  )
}
