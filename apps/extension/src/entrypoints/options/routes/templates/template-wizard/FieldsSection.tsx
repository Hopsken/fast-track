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

/* ------------------------------------------------------------------ */
/*  Fields section                                                     */
/* ------------------------------------------------------------------ */

export function FieldsSection() {
  const { state, actions } = useWizardContext()
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
      actions.setFieldConfig(fieldId, {
        behavior: 'preset',
        presetValue: undefined
      })
      setCommandOpen(false)
    },
    [actions]
  )

  const handleConfigChange = useCallback(
    (fieldId: string, config: FieldConfig) => {
      actions.setFieldConfig(fieldId, config)
    },
    [actions]
  )

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h3 className="text-sm font-medium">Fields</h3>
          <p className="text-muted-foreground text-xs">
            Add fields and configure how they behave during issue creation.
            Required fields left unconfigured will be prompted automatically.
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
                  template. Choose preset to auto-fill, restrict to limit
                  options, or show to display all choices.
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
                  onConfigChange={(config) =>
                    handleConfigChange(field.fieldId, config)
                  }
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
